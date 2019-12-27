import { Request, Response } from "express";
import config from "../config";
import * as phin from "phin";
import * as crypto from "crypto";
import { LogService, MatrixClient } from "matrix-bot-sdk";

const SCOPE = "access_token";

export function renderIndex(req: Request, res: Response) {
    return res.render('index', {
        redirectUri: config.redirectUri,
        clientId: config.clientId,
        scope: SCOPE,
        responseType: 'code',
        authUrl: config.authorizationUrl,
    });
}

export async function renderDone(req: Request, res: Response) {
    const code = req.query['code'];
    let error = req.query['error'];
    let errorMessage = req.query['error_description'];

    if (!error && !code) {
        error = 'invalid_request';
        errorMessage = 'OAuth server did not return a code';
    }

    if (error) {
        return res.render('error', {
            errorCode: error,
            errorMessage: errorMessage || "No Message",
        });
    }

    try {
        const claimResponse = await phin({
            url: `${config.tokenUrl}`,
            method: 'POST',
            form: {
                redirect_uri: config.redirectUri,
                client_id: config.clientId,
                client_secret: config.clientSecret,
                code: code,
                grant_type: 'authorization_code',
            },
        });

        const claim = JSON.parse(claimResponse.body);
        const token = claim['access_token'];

        const buf = Buffer.from(token.substring("v1.".length), 'hex');
        const iv = buf.slice(0, 16);
        const salt = buf.slice(16, 80); // 64 bytes
        const encrypted = buf.slice(80);

        const cryptKey = crypto.pbkdf2Sync(`${config.clientId}|${config.clientSecret}`, salt, 100000, 32, 'sha512');
        const decipher = crypto.createDecipheriv('aes-256-cbc', cryptKey, iv);
        const result = decipher.update(encrypted) + decipher.final('utf-8');
        const auth = JSON.parse(result);

        const client = new MatrixClient(auth['homeserverUrl'], auth['accessToken']);
        const joinedRooms = await client.getJoinedRooms();
        await client.doRequest("POST", "/_matrix/client/r0/logout");

        return res.render('finished', {
            userId: auth['userId'],
            numRooms: joinedRooms.length,
        });
    } catch (e) {
        LogService.error("flows", e);
        return res.render('error', {
            errorCode: "500",
            errorMessage: "Internal Server Error - see logs",
        });
    }
}
