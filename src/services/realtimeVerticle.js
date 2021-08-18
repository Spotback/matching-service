import {Message} from '@vertx/core';
import * as Constants from '../utils/constants';

/*-------------------------------init-------------------------------*/
const config = vertx.getOrCreateContext().config();
const eb = vertx.eventBus();
const FirebaseOptions = Java.type('com.google.firebase.FirebaseOptions');
const GoogleCredentials = Java.type('com.google.auth.oauth2.GoogleCredentials');
const FirebaseApp = Java.type('com.google.firebase.FirebaseApp');
const FirebaseDatabase = Java.type('com.google.firebase.database.FirebaseDatabase');
const FirebaseMessaging = Java.type('com.google.firebase.messaging.FirebaseMessaging');
const FirebaseMessage = Java.type('com.google.firebase.messaging.Message');
const ApnsConfig = Java.type('com.google.firebase.messaging.ApnsConfig');
const Aps = Java.type('com.google.firebase.messaging.Aps');
const Notification = Java.type('com.google.firebase.messaging.Notification');
const AndroidConfig = Java.type('com.google.firebase.messaging.AndroidConfig');
const options = new FirebaseOptions.Builder()
    .setCredentials(GoogleCredentials.getApplicationDefault())
    .setDatabaseUrl(config.FIREBASE_URL)
    .build();
const app = FirebaseApp.initializeApp(options, Constants.uuidv4());
let database = FirebaseDatabase.getInstance(app);
const messaging = FirebaseMessaging.getInstance(app);

/*-----------------------------end init-----------------------------*/

/**
 * This will create a push message object for firebase.
 * @param {Object} user - info about the user who was matched, contains 'firstName'
 */
function formatPush(user) {
    return new Notification(Constants.PUSH_MSG_TITLE, `You matched with ${user.firstName}!`);
}

/**
 * This is will send a push notification.
 * @param {Object} jsn - user to to notify
 */
function push(trackerId, pushToken, user) {
    try {
        let push = FirebaseMessage.builder()
            .setNotification(formatPush(user))
            .putData('trackerId', trackerId)
            .setToken(pushToken)
            .setApnsConfig(ApnsConfig.builder()
                .setAps(Aps.builder().build())
                .build())
            .setAndroidConfig(AndroidConfig.builder()
                .build())
            .build();
        messaging.send(push);
    } catch (error) {
        console.log(error);
    }
}

/**
 * Receives messages from the event bus and creates send 2 push notifcations.
 * @param {Message} msg - vertx event bus message with the request body
 */
function notify(msg) {
    console.log(Constants.NOTIFY_REQ_LOG);
    const client = msg.body().client;
    const host = msg.body().host;
    push(msg.body().trackerId, client.pushToken, host);
    push(msg.body().trackerId, host.pushToken, client);
}

/**
 * This is will save an item to the tracking firebase database and send
 * a message to the notify verticle on success.
 * @param {Object} jsn - item to store in firebase
 * @param {Message} msg - vertx event bus message with the request body
 */
function create(jsn, msg, host) {
    const client = msg.body().user;
    //generate trackerId
    let id = Constants.uuidv4();
    database
        .getReference()
        .getRoot()
        .child(id)
        .setValue(jsn, (error, reference) => {
            if (error) {
                console.log(error);
            } else {
                let pushMsg = {
                    host: host,
                    client: client,
                    matchTime: jsn.matchInfo.matchTime,
                    trackerId: id
                }
                eb.send(Constants.NOTIFY_HANDLER, pushMsg);
            }
        });
    return id;
}

/**
 * Receives messages from the event bus and creates a realtime record.
 * @param {Message} msg - vertx event bus message with the request body
 */
function realtime(msg) {
    console.log(Constants.REALTIME_REQ_LOG);
    //client
    const client = msg.body().user;
    //spot of the host
    const match = msg.body().match;
    //client location info
    const body = msg.body().body;
    let mongoMsg = {
        collection: Constants.USER_COLLECTION,
        data: {
            email: match.email
        }
    };
    //need to fetch host
    eb.request(Constants.MONGO_FINDONE_HANDLER, mongoMsg, (findUserRes) => {
        if (findUserRes.succeeded()) {
            const host = findUserRes.result().body();
            let trackRecord = {
                host: {
                    id: host.email,
                    name: host.firstName,
                    profilePic: host.profilePic,
                    car: host.car
                },
                client: {
                    id: client.email,
                    name: client.firstName,
                    profilePic: client.profilePic,
                    car: client.car
                },
                matchInfo: {
                    clientDirectionCourse: "",
                    clientLocation: body.currentLocation,
                    destinationLocation: body.desiredLocation,
                    clientMinutesAway: match.etaFromClient.value,
                    matchTime: Date.now(),
                    clientLastLocationUpdate: ""
                },
                status: "INPROGRESS",
                parkingSpot: {
                    leaveTime: match.leaveTime,
                    spotType: match.spotType,
                    location: match.coordinates
                },
                fee: ""
            }
            create(trackRecord, msg, host);
        } else {
            //need to log critical error, user didnt exist but somehow matched
        }
    });
}

//register the eventbus handlers with vertx
eb.consumer(Constants.REALTIME_HANDLER, realtime);
eb.consumer(Constants.NOTIFY_HANDLER, notify);
