import * as http from 'http';
import * as Constants from '../utils/constants';
import _ from 'lodash';
  
const secureEnv = require('secure-env');
_.merge(process.env, secureEnv({secret: process.env.CONF_ENC_UNLOCK}));

import app from './app';

const PORT = process.env.PORT;
http.createServer(app).listen(PORT, () => {
    console.log(Constants.START_UP_MESSAGE + PORT);
});
