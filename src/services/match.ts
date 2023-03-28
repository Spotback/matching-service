
import * as Constants from '../utils/constants';
import WebUtil from '../utils/webUtil'
import JWT from '../utils/jwtUtil';
import EMAIL from '../utils/emailUtil';
import { v1 as uuidv1 } from 'uuid';
import Auth from '../utils/auth'
import UserDB, { User, Car } from '../model/user';
import { request, Request, Response } from 'express';
import { MatchRequest } from '../model/MatchRequest';
import * as fs from 'fs';
import producer from '../utils/producer';
import matcherAlgo from './matchingVerticle-clone'
import Message from './Message'


class Match {

    private validateReq(request: MatchRequest): boolean {
        if (Object.keys(request).length < 3) return false;
        if ('currentLocation' in request || 'desiredLocation' in request
            || 'email' in request) return true;
        return false;
    }

    public account = async (req: Request, res: Response): Promise<void> => {
        const legit = JWT.verify(req.headers.bearer as string);
        if (legit) {
            const email: string = legit.email;
            const body = req.body;
            // console.log(req);
            body.email = email;
            console.log(body)
            if(this.validateReq(body)) {
                // producer.send(body);
                let m = new Message(body,res);
                await matcherAlgo(m)
                // WebUtil.successResponse(res, Constants.SUCCESS, 200, null);
            } else {
                WebUtil.errorResponse(res, "Missing request parameters", Constants.CLIENT_ERROR_HB, 400);
            }
        } else {
            WebUtil.errorResponse(res, Constants.CLIENT_ERROR_UA_T, Constants.CLIENT_ERROR_UA, 401);
        }

    }
}

export default new Match();
