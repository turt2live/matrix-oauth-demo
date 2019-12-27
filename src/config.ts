import * as config from "config";

export interface OAuthClient {
    id: string;
    secret: string;
    redirectUris: string[];
}

interface IConfig {
    listenPort: number;
    listenAddress: string;
    templateDirectory: string;
    assetsDirectory: string;
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    authorizationUrl: string;
    tokenUrl: string;
}

export default <IConfig>config;
