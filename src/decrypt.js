const secureEnv = require('secure-env');
const config = secureEnv({secret: process.env.CONF_ENC_UNLOCK});
config.host = process.env.HOST;
console.log(JSON.stringify(config));