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


export interface Rating {
    stars: number;
    comment: string;
    timestamp: number;
}

export interface TransactionUser {
    lastName: string,
    firstName: string,
    email: string
}

export interface UserTransactions extends mongoose.Document {
    transaction_id:string,
    driver: TransactionUser,
    parker: TransactionUser,
}

export const UserTransactionSchema = new Schema({
  transaction_id: {
    type: String,
    required: true,
    index: true,
    unique: true
  },
  driver: {
    lastName: String,
    firstName: String,
    email: String,
  },
  parker: {
    lastName: String,
    firstName: String,
    email: String,
  },
});


const UserTransactionDB = mongoose.model<UserTransactions>(Constants.TRANSACTIONS_TABLE, UserTransactionSchema);
export default UserTransactionDB;
