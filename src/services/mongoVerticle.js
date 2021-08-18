import {MongoClient} from '@vertx/mongo-client';
import * as Constants from '../utils/constants'
/*-------------------------------init-------------------------------*/
const config = vertx.getOrCreateContext().config();
const eb = vertx.eventBus();
const mongoConfig = {
    connection_string: config.MONGO_URL
};
const mongoClient = MongoClient.createShared(vertx, mongoConfig);

/*-----------------------------end init-----------------------------*/

/**
 * Receives messages from the event bus and replies with a record, if found.
 * @param {Message} msg - vertx event bus message with the request body {collection, data}
 */
function findOne(msg) {
    mongoClient.findOne(msg.body().collection, msg.body().data, {}, (findRes) => {
        if (findRes.succeeded()) {
            msg.reply(findRes.result())
        } else {
            msg.fail(findRes.cause());
        }
    });
}

/**
 * Receives messages from the event bus and replies with all matching records, if found.
 * @param {Message} msg - vertx event bus message with the request body {collection, data}
 */
function find(msg) {
    mongoClient.find(msg.body().collection, msg.body().data, (findRes) => {
        if (findRes.succeeded()) {
            msg.reply(JSON.stringify(findRes.result()))
        } else {
            msg.fail(findRes.cause());
        }
    });
}

eb.consumer(Constants.MONGO_FINDONE_HANDLER, findOne);
eb.consumer(Constants.MONGO_FIND_HANDLER, find);
