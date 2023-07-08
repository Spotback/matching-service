import userdb from '../model/user'
import spotsByBlock from '../model/spots-by-block'

import * as Constants from '../utils/constants';
import axios from "axios";

const findOneUser = async (handler, mongoMsg, callback)=>{
    const result = userdb.findOne(mongoMsg.data);
    const data = {succeeded:true,result };
    return callback(data);
}


const succeeded = ()=> true

export const eventBus = (address, data,callback)=> {
    console.log({ address , data})
    userdb.findOne(data.data).select('email car firstName lastName')
    .then(res=> {
        console.log("result",res)
        res.succeeded=succeeded;
        callback(res)
    })
    .catch(err=> console.log("userdb err", err));
}

export const eventBusAsync = async (address, filter)=> {
    console.log({ address , filter})
    switch (address) {
        case Constants.MONGO_FINDONE_HANDLER: {
            const user = await userdb.findOne(filter.data).select('email car firstName lastName');
            console.log("userdb",user)
            return user
        }
        case Constants.MONGO_FIND_HANDLER: {
                const result = await spotsByBlock.find(filter.data)
                console.log("spotsByBlock", result)
                return result;
        }
        default:
                console.log("[SWITCH] NO VALUE FOUND")
            break;
    }


}
export default { eventBus, findOneUser}
