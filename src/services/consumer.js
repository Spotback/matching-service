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

export const eventBusAsync = async (address, data)=> {
    console.log({ address , data})
    const result = await spotsByBlock.find(data.data)
    console.log("spotsByBlock", result)
    return result;

}
export default { eventBus, findOneUser}
