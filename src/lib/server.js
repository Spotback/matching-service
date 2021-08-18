/// <reference types='es4x' />
import {Router} from '@vertx/web';
import {DeploymentOptions, HttpServerOptions, PemKeyCertOptions} from '@vertx/core/options';
import * as Constants from '../utils/constants'
import {JWTAuth} from '@vertx/auth-jwt';
import {CompositeFuture, Future} from '@vertx/core';
import {ClientAuth} from '@vertx/core/enums';

const config = vertx.getOrCreateContext().config();
const PORT = config.PORT;
const System = Java.type('java.lang.System');
System.setProperty(Constants.REDIS_HOST, config.REDIS);
const fs = vertx.fileSystem();
const Runtime = Java.type('java.lang.Runtime');
const cores = Runtime.getRuntime().availableProcessors();
let JsonObject = Java.type('io.vertx.core.json.JsonObject');

//Authorization
let pub = null;
fs.readFile(Constants.PUBLIC_LOCATION, (res) => {
    if(res.succeeded()) {
        pub = res.result().toString();
    }
});
let priv = null;
fs.readFile(Constants.PRIVATE_LOCATION, (res) => {
    if(res.succeeded()) {
        priv = res.result().toString();
    }
});
let provider = JWTAuth.create(vertx, new JsonObject(JSON.stringify({
    pubSecKeys: [
        {
            algorithm: config.ALGORITHM,
            publicKey: pub,
            secretKey: priv
        }
    ]
})));

const app = Router.router(vertx);
//event bus to send request to verticles
const eb = vertx.eventBus();
//reuse object for requests
const reply = {};
app.route('/ping').handler((ctx) => {
    console.log('HEALTH CHECK SUCCEEDED')
    ctx.response().setStatusCode(200).end();
});
app.route(Constants.API_MATCH_PATH).handler((ctx) => {
    const headers = ctx.request().headers();
    if (headers.contains('bearer')) {
        provider.authenticate({jwt: headers.get('bearer')}, (authRes) => {
            if (authRes.succeeded()) {
                console.log(Constants.JWT_SUCCESS_LOG);
                ctx.request().bodyHandler((bodyBuffer) => {
                    let body = JSON.parse(bodyBuffer);
                    body.email = authRes.result().principal().email
                    // send request to matching verticle
                    eb.request(Constants.API_MATCH_HANDLER, body, (ebRes) => {
                        if (ebRes.succeeded()) {
                            ctx.response().setStatusCode(200).end(ebRes.result().body());
                        } else {
                            //need to create the error responses
                            console.log(ebRes.cause());
                            reply.message = ebRes.cause().toString();
                            reply.code = Constants.SERVER_ERROR;
                            ctx.response().setStatusCode(500).end(JSON.stringify(reply));
                        }
                    });
                });
            } else {
                // need to create the error responses
                console.log(Constants.JWT_FAILURE_LOG + authRes.cause());
                reply.message = authRes.cause().toString();
                reply.code = Constants.CLIENT_ERROR_UA;
                ctx.response().setStatusCode(401).end(JSON.stringify(reply));
            }
        });
    } else {
        //need to create the error responses
        reply.message = Constants.CLIENT_ERROR_HB_MESSAGE;
        reply.code = Constants.CLIENT_ERROR_HB;
        ctx.response().setStatusCode(400).end();
    }
});

//verticle deploy options
const deployOptions = new DeploymentOptions().setConfig(vertx.getOrCreateContext().config()).setInstances(2);
const mongoDeployOptions = new DeploymentOptions().setConfig(vertx.getOrCreateContext().config()).setInstances(1);

//server options//need to add in more options and set up ssl https// disabled till i find out how to use websocket with it.
let serverOptions = new HttpServerOptions()
    .setSsl(false)
    // .setClientAuth(ClientAuth.NONE)
    // .setClientAuthRequired(false)
    // .setWebSocketAllowServerNoContext(true)
    // .setPemKeyCertOptions(new PemKeyCertOptions()
    //     .setKeyPath(Constants.KEY_LOCATION)
    //     .setCertPath(Constants.CERT_LOCATION))
    .setLogActivity(true);

//start the main server
vertx.createHttpServer(serverOptions)
        .requestHandler(app)
        .listen(+PORT);
//start the server
let mongoFuture = Future.future((promise) => {
    vertx.deployVerticle(Constants.MONGO_VERTICLE_LOCATION, mongoDeployOptions, promise);
});

//deploy matching verticle
let matchFuture = Future.future((promise) => {
    vertx.deployVerticle(Constants.MATCHING_VERTICLE_LOCATION, deployOptions, promise);
});

//deploy realtime verticle
let realtimeFuture = Future.future((promise) => {
    vertx.deployVerticle(Constants.REALTIME_VERTICLE_LOCATION, deployOptions, promise);
});

//wait for success
CompositeFuture.all(mongoFuture, matchFuture, realtimeFuture).onComplete((cf) => {
    if (cf.succeeded()) {
        console.log(Constants.MONGO_START + ' '.concat(cf.result().resultAt(0)));
        console.log(Constants.MATCH_START + ' '.concat(cf.result().resultAt(1)));
        console.log(Constants.REALTIME_START + ' '.concat(cf.result().resultAt(2)));
        eb.send(Constants.DEPLOYID_HANDLER, cf.result().resultAt(1));
    } else {
        console.log(Constants.START_UP_FAIL_MESSAGE + cf.cause());
    }
});
