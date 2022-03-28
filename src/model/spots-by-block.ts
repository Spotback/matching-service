import * as mongoose from 'mongoose';
import * as Constants from '../utils/constants';

const Schema = mongoose.Schema;

/**
 * Converts an object to a dotified object.
 *
 * @param obj         Object
 * @returns           Dotified Object
 */
export const dotify = (obj: any) => {

    const res: any = {};
  
    function recurse(obj: any, current?: string) {
      for (const key in obj) {
        const value = obj[key];
        const newKey = (current ? current + '.' + key : key);
        if (value && typeof value === 'object') {
          recurse(value, newKey);
        } else {
          res[newKey] = value;
        }
      }
    }
  
    recurse(obj);
    return res;
  }

export interface Car {
    carType: string;
    color: string;
    make: string;
    model: string;
    year: string;
}

export interface Spot {
    car: Car;
    created_time: number;
    coordinates: string;
    email: string;
    leaveTime: string;
    spotType: string;
}

export interface SpotsByBlock  extends mongoose.Document {
    blockCoordinate: string;
    spots: Spot[];
}

export const SpotsByBlockSchema = new Schema({
    blockCoordinate: {
        type: String,
        index: true,
        unique: true,
        required: true            
    },
    spots: {
        type: Array<Spot>(),
        default: []
    }
});

const SpotsDB = mongoose.model<SpotsByBlock>('spots-by-block', SpotsByBlockSchema);
export default SpotsDB;