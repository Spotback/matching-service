import {CompositeFuture, Future, Message} from '@vertx/core';
import {Redis, RedisAPI} from '@vertx/redis-client';
import * as Constants from '../utils/constants';
import * as matchingUtil from '../utils/matchingUtil';
import {WebClient} from '@vertx/web-client';
import {WebClientOptions} from '@vertx/web-client/options';

/*-------------------------------init-------------------------------*/
let deploymentId = '';
const eb = vertx.eventBus();
const System = Java.type('java.lang.System');
const httpClient = WebClient.create(vertx, new WebClientOptions().setSsl(true).setTrustAll(true));
//redis setup pull from env
const redisHost = System.getProperty(Constants.REDIS_HOST);
console.log(redisHost);
// If you are getting this error:

// Could not connect to Redis at 127.0.0.1:6379: Connection refused

// You may need to daemonize the redis-server so that docker can connect to it:

// /usr/local/bin/redis-server --daemonize yes

// Then try running redis-cli ping again.


const redis = Redis.createClient(vertx, `redis://${redisHost}:6379`).connect((res) => {
    if (res.succeeded()) {
        console.log(Constants.REDIS_CONNECT_SUCCESS + res.result());
    } else {
        console.log(vertx.deploymentIDs());
        vertx.undeploy(deploymentId);
        console.log(Constants.REDIS_CONNECT_FAILED + res.cause().getMessage());
    }
});
const redisClient = RedisAPI.api(redis);
//reuse object for requests
const reply = {};

/*-----------------------------end init-----------------------------*/

/**
 * Used to call google for each destination uri containing up to 100 spots
 * @param {string[]} destUris - array of destination param uris
 * @param {Promise} promise - will contain result of the web call
 */
function etaWebCall(destUris, promise) {
    let capturedData = [];
    for (let i = 0; i < destUris.length; i++) {
        // for each uri call google
        httpClient.get(443, Constants.MAPS_API, destUris[i]).send((res) => {
            if (res.succeeded()) {
                //add all the elements to an array
                capturedData.push(...res.result().bodyAsJsonObject().rows[0].elements);
                //if we have made calls for all the uri then complete
                if (i === destUris.length - 1) {
                    promise.complete(capturedData);
                }
            } else {
                console.log(Constants.ETA_CALL_FAIL + res.cause());
                //if any fail then close the process right away by failing promise
                promise.fail(res.cause());
            }
        });
    }
}

/**
 * This will coordinate all the logic used to recommend a spot
 * @param {Object} user - user requesting the spot
 * @param {Object} cachedSpots - map of spots that are not available but not deleted yet
 * @param {Object[]} availSpots - potentially available spots(if they arent in the cached spots)
 * @param {Object} body - request body containing requesting users {desiredLocation} and {currentLocation}
 * @param {Message} msg - message to reply to
 */
function algorithm(user, cachedSpots, availSpots, body, msg) {
    //filter the unavailable and incompatible spots
    const filteredSpots = availSpots.filter(spot => matchingUtil.filterCached(cachedSpots, spot)).filter(spot => matchingUtil.filterCarType(user.car, spot));
    //if filteredSpots is empty then fail
    if (filteredSpots.length < 1) {
        msg.reply(JSON.stringify(Constants.NO_SPOTS));
        return;
    }
    //get distance from: (spots to desiredLocation ETA)
    const spotsToDesired = matchingUtil.generateDestinationUri(filteredSpots, body.desiredLocation, Constants.WALKING_MODE);
    //get distance from: (spots to client current location ETA)
    const spotsToCurrent = matchingUtil.generateDestinationUri(filteredSpots, body.currentLocation, Constants.DRIVING_MODE);
    //will contain result of gogole call with spotsToDesired uri
    const desiredFuture = Future.future((promise) => {
        etaWebCall(spotsToDesired, promise);
    });
    //will contain result of gogole call with spotsToCurrent uri
    const currentFuture = Future.future((promise) => {
        etaWebCall(spotsToCurrent, promise);
    });
    //need to merge results from each call to an array of {distances:{}, durations:{}} for spotsToCurrent and spotsToDesired
    CompositeFuture.all(desiredFuture, currentFuture).onComplete((ar) => {
        if (ar.succeeded()) {
            //eta info
            const desiredETAInfo = ar.result().resultAt(0);
            const currentETAInfo = ar.result().resultAt(1);
            //find best match
            let recommendIndex = matchingUtil.gradeSpots(desiredETAInfo, currentETAInfo, filteredSpots);
            //if the recommendIndex is less than 0 no spots were found.
            if (recommendIndex < 0) {
                msg.reply(JSON.stringify(Constants.NO_SPOTS));
                return;
            } else {
                //reply with match
                let match = filteredSpots[recommendIndex];
                msg.reply(JSON.stringify(Constants.MATCH_RESPONSE));
                //need to cache the result for 120 seconds so we dont recommend again, until the delete finishes
                redisClient.setex(match.email, Constants.CACHE_SPOT_EXPIRE, Date.now().toString(), (res) => {
                    if (res.failed()) {
                        console.log(res.cause());
                    }
                });
                let realTimeMessage = {
                    user,
                    match,
                    body
                };
                //need to send a message on event bus to real-time verticle to create tracking record
                eb.send(Constants.REALTIME_HANDLER, realTimeMessage);
                return;
            }
        } else {
            console.log(Constants.COMP_FUT_FAIL + ar.cause());
            reply.code = Constants.SERVER_ERROR;
            reply.message = ar.cause();
            msg.fail(500, JSON.stringify(reply));
        }
    });
}

/**
 * Receives messages from the event bus and reply with a match, if found.
 * @param {Message} msg - vertx event bus message with the request body
 */
function matcher(msg) {
    const val = msg.body();
    //request validation
    if (!val.email || !val.desiredLocation || !val.currentLocation) {
        msg.fail(400, JSON.stringify(Constants.BAD_REQUEST));
        return;
    }
    //lookup request
    let mongoMsg = {
        collection: Constants.USER_COLLECTION,
        data: {
            email: val.email
        }
    }
    //lookup user - send message to mongo verticle
    eb.request(Constants.MONGO_FINDONE_HANDLER, mongoMsg, (findUserRes) => {
        if (findUserRes.succeeded()) {
            console.log(Constants.MATCH_REQ_LOG);
            //get all the emails of previously recommended spots up to 5m ago.
            let redisFuture = Future.future((promise) => {
                redisClient.scan(['0'], promise);
            });
            //get all the potential blocks near desired location
            let mongoFuture = Future.future((promise) => {
                //lookup request
                let mongoMsg = {
                    collection: Constants.SPOTS_COLLECTION,
                    data: matchingUtil.generateLookupQuerey(val.desiredLocation)
                }
                //lookup spots - send message to mongo verticle
                eb.request(Constants.MONGO_FIND_HANDLER, mongoMsg, promise);
            });
            //collect results when they finish
            CompositeFuture.all(redisFuture, mongoFuture).onComplete((ar) => {
                if (ar.succeeded()) {
                    //get the array of emails that have already been matched
                    const cachedSpots = matchingUtil.javaArrayToMap(ar.result().resultAt(0));
                    //merge spots into an array we can work with
                    const availSpots = matchingUtil.mergeAvailSpots(JSON.parse(ar.result().resultAt(1).body()));
                    //perform the search for a match
                    algorithm(findUserRes.result().body(), cachedSpots, availSpots, val, msg);
                } else {
                    console.log(Constants.MONGO_SPOT_OR_CACHE_LOOKUP_FAIL + ar.cause());
                    reply.code = Constants.SERVER_ERROR;
                    reply.message = ar.cause();
                    msg.fail(500, JSON.stringify(reply));
                }
            });
        } else {
            console.log(Constants.MONGO_USER_LOOKUP_FAIL + findUserRes.cause());
            reply.code = Constants.SERVER_ERROR;
            reply.message = findUserRes.cause();
            msg.fail(500, JSON.stringify(reply));
        }
    });
}

/**
 * Receives messages from the event bus and replies with a match, if found.
 * @param {Message} msg - vertx event bus message with the request body
 */
function setDeploymentId(msg) {
    console.log(Constants.SET_DEPLOY_ID + msg.body());
    deploymentId = msg.body();
}

//register the eventbus handlers with vertx
eb.consumer(Constants.API_MATCH_HANDLER, matcher);
eb.consumer(Constants.DEPLOYID_HANDLER, setDeploymentId);
