import * as express from "express";
import { LogLevel, LogService, RichConsoleLogger } from "matrix-bot-sdk";
import config from "./config";
import { Liquid } from "liquidjs";
import { renderDone, renderIndex } from "./web/flows";

LogService.setLogger(new RichConsoleLogger());
LogService.setLevel(LogLevel.INFO);

const app = express();
app.engine('liquid', new Liquid().express());
app.set('views', config.templateDirectory); // set before view engine!
app.set('view engine', 'liquid');
app.use('/public', express.static(config.assetsDirectory));

app.get('/', renderIndex.bind(this));
app.get('/demo', renderIndex.bind(this));
app.get('/done', renderDone.bind(this));

app.listen(config.listenPort, config.listenAddress, () => LogService.info("index", "Now listening for web requests"));
