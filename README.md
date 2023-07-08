# Spotback User-Service backend

This is a **Node.js** & **Express** app made with **Typescript** and will handle CRUD functions. To run this app you will need to install **MongoDB** with the default settings and no authentication.

* [create function](endpoints/create.md)
* [read function](endpoints/read.md)
* [update function](endpoints/update.md)
* [delete function](endpoints/delete.md)
    

## Deploying and Running

To run/deploy this example you will need to install [Node.js](https://nodejs.org/en/)
After you are done here are the necessary commands.

## First

```sh
$ npm install
```
## Second

```sh
$ npm run start
```
## Local development

```sh
$ npm run start:dev

$ docker build -t spotback/user-service:x.x.x-TEST .

$ docker run -p 127.0.0.1:8080:3000 spotback/user-service:x.x.x-TEST
```

## Changing the config

You can add to the .env in the following format:

```txt
KEY=VALUE
```

## Encrypt the config file that app will read

```sh
secure-env .env -s <password>
```

# Documentation:

### Lightsail

Lightsail is a service that allows you to create a virtual machine in the cloud. It is a very easy way to deploy a server, and it's the one we are using in this project.

to automatically deploy our changes we use GitHub actions as you can find in the folder **.github/workflows**
example of a workflow check `.github/`workflows/deploy.yml` in where you will see the important step to deploy our app which is **Build and Push**
this uses the AWS CLI to push our newly created image to AWS LightSail

and the Pipeline is listening only in the master branch so any changes in the master branch will be deployed automatically.

### SQS Service
AWS SQS SERVICE is a service that allows you to create a queue in the cloud. It is a very easy way to deploy a queue, and it's the one we are using in this project, to send events to the mobile app about the matching clients.

### Update Environment Variables
for this project to add new variables to the .enV file, it's not easy as just adding the variable to the file, you need to encrypt the file and then add the encrypted file to the repo. and for this we are using a package called secure-env.

secure-env is a package that allows you to encrypt your .enV file and then decrypt it when you need to use it.

so in our case if we need to add a new variable to the .enV file we need to do the following:

1. add the new variable to the .env file
2. encrypt the .enV file using the following command:
```sh
secure-env .env -s <password>
```
.env is the name of the file that contains the variables

-s is the flag to specify the password that will be used to encrypt the file, in our case in this project the password is xSO8P5MMSIlUQTIGeuHwtUK7

3. add the encrypted file to the repository


after you finish this now you have an encrypted .env.enc file that contains the new variable and the old ones.

and now this can be used in our project like this
```js
const secureEnv = require('secure-env');
_.merge(process.env, secureEnv({secret: process.env.CONF_ENC_UNLOCK}));
```
you can find this line in `./src/lib/server.ts` file

this line will decrypt the .env.enc file and add the variables to the process.env object so it can use them in the project.

process.env.CONF_ENC_UNLOCK is the password that will be used to decrypt the file, in our case in this project the password is xSO8P5MMSIlUQTIGeuHwtUK7
you can check this value in `package.json` file in the scripts section

```json
{
  ...
  "scripts": {
      ...
      "start": "export CONF_ENC_UNLOCK=xSO8P5MMSIlUQTIGeuHwtUK7 && node build/lib/server.js",
      ...
  },
  ...
}
