export const VERIFIED_HTML_LOCATION = '/verified.html';
export const WELCOME_HTML_LOCATION = './resources/welcome.html';
export const WELCOME_SUBJECT = 'Thank you for joining the Spotback community!';

export const USERS_TABLE = 'Users';
export const TRANSACTIONS_TABLE = 'Transactions_Users';

//response messages
export const ACCOUNT_EXISTS_LOG = 'An account with that email already exists.';
export const ACCOUNT_CREATION_MESSAGE = 'Account created successfully!';
export const ACCOUNT_DELETED_MESSAGE = 'Account deleted';
export const TRANSACTION_FOUND = 'Found Transaction';
export const TRANSACTION_NOT_FOUND = 'Transaction Not Found';

//request logging

export const STRIPE_ERROR = 'ERROR WITH STRIPE';
export const INVALID_PASS_MATCH = 'INVALID PASSWORD MATCH';

export const READ_REQ_LOG = 'READ REQUEST.';
export const CREATE_REQ_LOG = 'CREATE REQUEST.';
export const UPDATE_REQ_LOG = 'UPDATE REQUEST.';
export const VERIFY_REQ_LOG = 'VERIFY REQUEST.';
export const RATING_LOG = 'RATING REQUEST.';
export const DELETE_REQ_LOG = 'DELETE REQUEST.';
export const STRIPE_CREATE_CUSTOMER_ERROR = 'FAILED TO CREATE CUSTOMER.';

//client error response codes
export const CLIENT_ERROR_UA = 'UNAUTHORIZED.';
export const CLIENT_ERROR_A_NA = 'ACCOUNT NOT FOUND.';
export const CLIENT_ERROR_UA_T = 'TOKEN UNAUTHORIZED.';
export const CLIENT_ERROR_HB = 'BAD REQUEST.';
export const CLIENT_ERROR_AE = 'ACCOUNT ALREADY EXISTS.';
export const CLIENT_ERROR_RATING = 'RATING EXISTS ON TRANSACTION ALREADY.';
export const CLIENT_ERROR_TRANSACTION_NA = 'TRANSACTION NOT FOUND.';

//server error resonse codes
    export const STATIC_RESOURCES = './resources'
    export const PUSH_MSG_TITLE = 'Spotback App'
    export const KEY_LOCATION = './resources/key.pem';
    export const CERT_LOCATION = './resources/cert.pem';
    export const PUBLIC_LOCATION = './resources/public.pem';
    export const PRIVATE_LOCATION = './resources/private.pem';
    export const MATCHING_VERTICLE_LOCATION = 'src/services/matchingVerticle.js';
    export const MONGO_VERTICLE_LOCATION = 'src/services/mongoVerticle.js';
    export const REALTIME_VERTICLE_LOCATION = 'src/services/realtimeVerticle.js';
    export const NOTIFY_VERTICLE_LOCATION = 'src/services/notificationVerticle.js';
    export const USER_COLLECTION = 'users';
    export const SPOTS_COLLECTION = 'spots-by-blocks';
    export const REDIS_HOST = 'REDIS';
    export const REDIS_CONNECT_FAILED = 'FAILED TO CONNECT TO REDIS ';
    export const GRADE_SPOTS_ERR = 'FAILED TO GRADE SPOTS ';
    export const PARTITION_URI_ERR = 'FAILED TO PARTITION URIS ';
    export const REDIS_SCAN_CONVERT_ERR = 'FAILED TO CONVERT REDIS SCAN ';
    export const REDIS_CONNECT_SUCCESS = 'CONNECTED TO REDIS SUCCESSFULLY: ';
    export const WALKING_MODE = 'walking';
    export const DRIVING_MODE = 'driving';
    export const MAPS_API = 'maps.googleapis.com';
    export const GOOGLE_API_KEY = '';

    export const CACHE_SPOT_EXPIRE = '120';
    //request logging
    export const MATCH_START_FAIL = 'MATCHING VERTICLE FAILED TO DEPLOY';
    export const MATCH_START = 'MATCHING VERTICLE DEPLOYED';
    export const REALTIME_START = 'REALTIME VERTICLE DEPLOYED';
    export const NOTIFY_START = 'NOTIFY VERTICLE DEPLOYED';
    export const MONGO_START = 'MONGO VERTICLE DEPLOYED';
    export const SET_DEPLOY_ID = 'SET DEPLOY ID TO ';
    export const JWT_VERIFY_LOG = 'ATTEMPTING TO VERIFY';
    export const JWT_SUCCESS_LOG = 'VERIFICATION SUCCEEDED';
    export const JWT_FAILURE_LOG = 'VERIFICATION FAILED';
    export const COMP_FUT_FAIL = 'COMPOSITE RESULT FAILURE: ';
    export const MONGO_USER_LOOKUP_FAIL = 'MONGO USER LOOKUP FAILURE: ';
    export const MONGO_SPOT_OR_CACHE_LOOKUP_FAIL = 'MONGO SPOT OR CACHE LOOKUP FAILURE: ';
    export const ETA_CALL_FAIL = 'ETA WEB CALL FAIL: ';
    export const START_UP_MESSAGE = 'VERTX SERVER LISTENING ON PORT ';
    export const START_UP_FAIL_MESSAGE = 'FAIL: ';
    export const SUCCESS = 'SUCCESS.';
    export const MATCH_REQ_LOG = 'MATCH REQUEST.';
    export const NOTIFY_REQ_LOG = 'NOTIFY REQUEST.';
    export const REALTIME_REQ_LOG = 'REALTIME REQUEST.';
    export const REALTIME_HANDLER = '/realtimeHandler';
    export const NOTIFY_HANDLER = '/notifyHandler';
    export const MONGO_FINDONE_HANDLER = '/mongoFindOne';
    export const MONGO_FIND_HANDLER = '/mongoFind';
    export const API_MATCH_PATH = '/match';
    export const API_MATCH_HANDLER = '/matchHandler';
    export const DEPLOYID_HANDLER = '/deployId';
    //client error response codes

    export const CLIENT_ERROR_HB_MESSAGE = 'Missing auth info.';
    //server error resonse codes
    export const SERVER_ERROR = "BACKEND SERVER ERROR.";
    export const SERVER_ERROR_TO = 'SERVICE TIMEOUT';
    export const DEFAULT_ERROR = {
        code: 'BAD GATEWAY.',
        message: 'DEFAULT ERROR RESPONSE.'
    };
    export const BAD_REQUEST = {
        code: 'BAD REQUEST.',
        message: 'Missing required info.'
    };
    export const NO_SPOTS = {
        code: 'NO SPOTS AVAILABLE.',
        message: 'There were no spots found near the location you want to go.'
    };
    export const MATCH_RESPONSE = {
        code: 'SUCCESS',
        message: 'You have been matched and will receive a notification shortly.'
    };

    /**
     * Will generate a uuid for firebase
     */
    export const uuidv4 = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
