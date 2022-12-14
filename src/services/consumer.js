import userdb from '../model/user'
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
    const fakeData={
            succeeded,
            car:{
                carType: "SMALL",
                color: "Black",
                make: "Audi",
                model: "Q7",
                year: "2021"
            },
            email:"test@gmail.com"
        };

    callback(fakeData)
    return fakeData;
}

export const eventBusAsync = async (address, data)=> {
    // console.log({ address , data})
    const fakeData={succeeded,  email:"test@gmail.com" };
    if(address==Constants.MONGO_FIND_HANDLER){
        // const url = `http://localhost:7090/readSpots?coordinates=${data.coordinates}`
        // console.log({url})
        // const resutl  = await axios.get(url)
        // console.log({ spots: JSON.stringify(resutl.data.spots) })
        // return resutl.data;
        return [
            {
                blockCoordinate: "hello",
                spots: [{
                    car: {
                        carType: "SMALL",
                        color: "Black",
                        make: "Audi",
                        model: "Q7",
                        year: "2021"
                    },
                    coordinates: "31.5105405,-9.7636349",
                    email: "test@gmail.com",
                    leaveTime: "600",
                    spotType: "small",
                }]
            }
        ]
    }
    return fakeData;

}
export default { eventBus, findOneUser}
