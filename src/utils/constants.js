exports.STATIC_RESOURCES = './resources'
exports.PUSH_MSG_TITLE = 'Spotback App'
exports.KEY_LOCATION = './resources/key.pem';
exports.CERT_LOCATION = './resources/cert.pem';
exports.PUBLIC_LOCATION = './resources/public.pem';
exports.PRIVATE_LOCATION = './resources/private.pem';
exports.MATCHING_VERTICLE_LOCATION = 'src/services/matchingVerticle.js';
exports.MONGO_VERTICLE_LOCATION = 'src/services/mongoVerticle.js';
exports.REALTIME_VERTICLE_LOCATION = 'src/services/realtimeVerticle.js';
exports.NOTIFY_VERTICLE_LOCATION = 'src/services/notificationVerticle.js';
exports.USER_COLLECTION = 'users';
exports.SPOTS_COLLECTION = 'spots-by-blocks';
exports.REDIS_HOST = 'REDIS';
exports.REDIS_CONNECT_FAILED = 'FAILED TO CONNECT TO REDIS ';
exports.GRADE_SPOTS_ERR = 'FAILED TO GRADE SPOTS ';
exports.PARTITION_URI_ERR = 'FAILED TO PARTITION URIS ';
exports.REDIS_SCAN_CONVERT_ERR = 'FAILED TO CONVERT REDIS SCAN ';
exports.REDIS_CONNECT_SUCCESS = 'CONNECTED TO REDIS SUCCESSFULLY: ';
exports.GOOGLE_API_KEY = vertx.getOrCreateContext().config().GOOGLE_API_KEY;
exports.WALKING_MODE = 'walking';
exports.DRIVING_MODE = 'driving';
exports.MAPS_API = 'maps.googleapis.com';
exports.CACHE_SPOT_EXPIRE = '120';
//request logging
exports.MATCH_START_FAIL = 'MATCHING VERTICLE FAILED TO DEPLOY';
exports.MATCH_START = 'MATCHING VERTICLE DEPLOYED';
exports.REALTIME_START = 'REALTIME VERTICLE DEPLOYED';
exports.NOTIFY_START = 'NOTIFY VERTICLE DEPLOYED';
exports.MONGO_START = 'MONGO VERTICLE DEPLOYED';
exports.SET_DEPLOY_ID = 'SET DEPLOY ID TO ';
exports.JWT_VERIFY_LOG = 'ATTEMPTING TO VERIFY';
exports.JWT_SUCCESS_LOG = 'VERIFICATION SUCCEEDED';
exports.JWT_FAILURE_LOG = 'VERIFICATION FAILED';
exports.COMP_FUT_FAIL = 'COMPOSITE RESULT FAILURE: ';
exports.MONGO_USER_LOOKUP_FAIL = 'MONGO USER LOOKUP FAILURE: ';
exports.MONGO_SPOT_OR_CACHE_LOOKUP_FAIL = 'MONGO SPOT OR CACHE LOOKUP FAILURE: ';
exports.ETA_CALL_FAIL = 'ETA WEB CALL FAIL: ';
exports.START_UP_MESSAGE = 'VERTX SERVER LISTENING ON PORT ';
exports.START_UP_FAIL_MESSAGE = 'FAIL: ';
exports.SUCCESS = 'SUCCESS.';
exports.MATCH_REQ_LOG = 'MATCH REQUEST.';
exports.NOTIFY_REQ_LOG = 'NOTIFY REQUEST.';
exports.REALTIME_REQ_LOG = 'REALTIME REQUEST.';
exports.REALTIME_HANDLER = '/realtimeHandler';
exports.NOTIFY_HANDLER = '/notifyHandler';
exports.MONGO_FINDONE_HANDLER = '/mongoFindOne';
exports.MONGO_FIND_HANDLER = '/mongoFind';
exports.API_MATCH_PATH = '/match';
exports.API_MATCH_HANDLER = '/matchHandler';
exports.DEPLOYID_HANDLER = '/deployId';
//client error response codes
exports.CLIENT_ERROR_UA = 'UNAUTHORIZED.';
exports.CLIENT_ERROR_UA_T = 'TOKEN UNAUTHORIZED.';
exports.CLIENT_ERROR_HB = 'BAD REQUEST.';
exports.CLIENT_ERROR_HB_MESSAGE = 'Missing auth info.';
//server error resonse codes
exports.SERVER_ERROR = "BACKEND SERVER ERROR.";
exports.SERVER_ERROR_TO = 'SERVICE TIMEOUT';
exports.DEFAULT_ERROR = {
    code: 'BAD GATEWAY.',
    message: 'DEFAULT ERROR RESPONSE.'
};
exports.BAD_REQUEST = {
    code: 'BAD REQUEST.',
    message: 'Missing required info.'
};
exports.NO_SPOTS = {
    code: 'NO SPOTS AVAILABLE.',
    message: 'There were no spots found near the location you want to go.'
};
exports.MATCH_RESPONSE = {
    code: 'SUCCESS',
    message: 'You have been matched and will receive a notification shortly.'
};

/**
 * Will generate a uuid for firebase
 */
exports.uuidv4 = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
