import express from 'express';
import { Express } from 'express';
import * as bodyParser from 'body-parser';
import { Routes } from '../routes/router'
import mongoose = require("mongoose");

class App {

    public app: Express = express();
    public routePrv: Routes = new Routes();
    public mongoUrl = process.env.MONGO_URL as string;

    constructor() {
        this.config();
        this.mongoSetup();
        this.routePrv.routes(this.app);
    }

    private config(): void {
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: false }));
        // serving static files 
        this.app.use(express.static('public'));
    }

    private mongoSetup(): void {
        mongoose.connect(this.mongoUrl, { 
            useNewUrlParser: true,
            useUnifiedTopology: true, 
            useCreateIndex: true,
            useFindAndModify: false
        });
    }

}

export default new App().app;
