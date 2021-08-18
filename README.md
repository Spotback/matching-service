# Spotback Matching-Service backend

This is an **[es4x](https://reactiverse.io/es4x/)** & **[Vertx](https://vertx.io/)** app made with **Javascript** and will handle matching functions. To run this app you will need to install **Graalvm** and swap it with your jvm in the java_home env variable.

* [match function](endpoints/match.md)
    

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
$ npm run start

$ docker build -t spotback/matching-service:x.x.x-TEST .

$ docker run -p 127.0.0.1:8080:3000 spotback/matching-service:x.x.x-TEST
```

## Changing the config

You can add to the .env in the following format:

```txt
KEY=VALUE
```

## Encrypt the config file that app will read

```sh
$ npm install -g secure-env
$ secure-env .env -s mySecretPassword
```

## After changes have been tested you can push a new image version

```sh
$ ./release.sh '<Release notes>'
```

After this you should have your image ready for use.
You can find more about about this docker application [here](http://docker.com).