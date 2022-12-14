
import * as Constants from '../utils/constants';
import * as matchingUtil from '../utils/matchingUtil';
import {eventBus, eventBusAsync } from './consumer'
import axios from 'axios'
const redis = require('redis');
const port = 6379
const  host = "localhost"

/*-------------------------------init-------------------------------*/
let deploymentId = '';

const eb = { request: eventBus,requestAsync:eventBusAsync }

const redisClient = redis.createClient(port, host);

//reuse object for requests
const reply = {};

/*-----------------------------end init-----------------------------*/

/**
 * Used to call google for each destination uri containing up to 100 spots
 * @param {string[]} destUris - array of destination param uris
 * @param {Promise} promise - will contain result of the web call
 */
async function  etaWebCall(destUris) {
    let capturedData = [];
    for (let i = 0; i < destUris.length; i++) {
        // for each uri call google
        try{
            const response = await axios.get(`https://${Constants.MAPS_API}${destUris[i]}`)
            //add all the elements to an array
            capturedData.push(...response.data.rows[0].elements);
            //if we have made calls for all the uri then complete
            if (i === destUris.length - 1) {
                return capturedData;
            }
        }catch(err){
            console.log(err);
            console.log(Constants.ETA_CALL_FAIL + err.message);
            //if any fail then close the process right away by failing promise
            throw err;
        }
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
    const loc = "ALGORITHM"
    const filteredSpots = availSpots.filter(spot => matchingUtil.filterCached(cachedSpots, spot)).filter(spot => matchingUtil.filterCarType(user.car, spot));
    //if filteredSpots is empty then fail
    console.log(loc,{filteredSpots})

    if (filteredSpots.length < 1) {
        msg.reply(Constants.NO_SPOTS);
        return;
    }
    //get distance from: (spots to desiredLocation ETA)
    const spotsToDesired = matchingUtil.generateDestinationUri(filteredSpots, body.desiredLocation, Constants.WALKING_MODE);
    //get distance from: (spots to client current location ETA)
    const spotsToCurrent = matchingUtil.generateDestinationUri(filteredSpots, body.currentLocation, Constants.DRIVING_MODE);
    //will contain result of gogole call with spotsToDesired uri
    console.log({spotsToDesired,spotsToCurrent})
    const desiredFuture = etaWebCall(spotsToDesired);
    console.log(1)

    //will contain result of gogole call with spotsToCurrent uri
    const currentFuture = etaWebCall(spotsToCurrent);
    console.log(2)

    //need to merge results from each call to an array of {distances:{}, durations:{}} for spotsToCurrent and spotsToDesired
    Promise.all([desiredFuture, currentFuture]).then((ar) => {
            //eta info
            const desiredETAInfo = ar[0]
            const currentETAInfo = ar[1];
            console.log({desiredETAInfo,currentETAInfo})
            //find best match
            let recommendIndex = matchingUtil.gradeSpots(desiredETAInfo, currentETAInfo, filteredSpots);
            console.log(filteredSpots)
            //if the recommendIndex is less than 0 no spots were found.
            if (recommendIndex < 0) {
                msg.reply(JSON.stringify(Constants.NO_SPOTS));
                return;
            } else {
                //reply with match
                let match = filteredSpots[recommendIndex];
                //need to cache the result for 120 seconds so we dont recommend again, until the delete finishes
                redisClient.setEx(match.email, Constants.CACHE_SPOT_EXPIRE, Date.now().toString())
                .then(console.log)
                .catch(console.error)
                let realTimeMessage = {
                    user,
                    match,
                    body
                };
                //need to send a message on event bus to real-time verticle to create tracking record
                // eb.requestAsync(Constants.REALTIME_HANDLER, realTimeMessage);
                msg.reply(realTimeMessage);

                return;
            }
    }).catch(err=>{
        console.log(Constants.COMP_FUT_FAIL + err.message);
        reply.code = Constants.SERVER_ERROR;
        reply.message = err.message;
        msg.fail(500, JSON.stringify(reply));
    });
}

/**
 * Receives messages from the event bus and reply with a match, if found.
 * @param {Message} msg - vertx event bus message with the request body
 */
export default function matcher(msg) {
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
            if(!redisClient.isOpen)redisClient.connect();

            // get all the emails of previously recommended spots up to 5m ago.
            let redisFuture = redisClient.scan(['0']);
            //get all the potential blocks near desired location
            //lookup spots - send message to mongo verticle
             //lookup request
            let mongoMsg = {
                collection: Constants.SPOTS_COLLECTION,
                coordinates: val.desiredLocation,
            }
            let mongoFuture = eb.requestAsync(Constants.MONGO_FIND_HANDLER, mongoMsg);

            //collect results when they finish
            Promise.all([redisFuture, mongoFuture]).then((values)=>{

                console.log(values[0],values[1])
                //get the array of emails that have already been matched
                const cachedSpots = matchingUtil.javaArrayToMap(values[0].keys);
                console.log({cachedSpots})
                //merge spots into an array we can work with
                const availSpots = matchingUtil.mergeAvailSpots(values[1]);
                console.log({ availSpots })

                //perform the search for a match
                algorithm(findUserRes, cachedSpots, availSpots, val, msg);
            }).catch(err=>{
                console.log(err)
                console.log(Constants.MONGO_SPOT_OR_CACHE_LOOKUP_FAIL + err.message);
                reply.code = Constants.SERVER_ERROR;
                reply.message = err.message;
                msg.fail(500, JSON.stringify(reply));
            })
            // CompositeFuture.all(redisFuture, mongoFuture).onComplete((ar) => {
            // });
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


// //register the eventbus handlers with vertx
// eb.consumer(Constants.API_MATCH_HANDLER, matcher);
// eb.consumer(Constants.DEPLOYID_HANDLER, setDeploymentId);
