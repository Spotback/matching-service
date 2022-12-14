import { Response } from "express";
import * as Constants from '../utils/constants';
import WebUtil from '../utils/webUtil'
    
export default class myCustomMessage{
    data:any;
    res:Response;
    constructor(data,res){
        this.data = data;
        this.res = res;
    }

    body() {
        return this.data;
    }

    reply(message: unknown): void {
        WebUtil.successResponse(this.res, message, 200, null);

    }
    fail(failureCode: number, message: string): void {
        WebUtil.errorResponse(this.res, message, Constants.CLIENT_ERROR_HB, 400);
    }

}

