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

## After changes have been tested you can push a new image version

```sh
$ ./release.sh '<Release notes>'
```

After this you should have your image ready for use.
You can find more about about this docker application [here](http://docker.com).
