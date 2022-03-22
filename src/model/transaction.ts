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

export interface TransactionDetail {
    transactionId: string;
    // email of the user in transaction with the other user
    email: string;
    timestamp: number;
    coordinates: string;
    rating: Rating;
}

export interface UserTransactions extends mongoose.Document {
    transactions:Array<TransactionDetail>;
    email: string;
}

export const UserTransactionSchema = new Schema({
    transactions: {
        type: Array<TransactionDetail>(),
        required: true,
        default: []
    },
    email: {
        type: String,
        index: true,
        unique: true,
        required: true            
    },
});

const UserTransactionDB = mongoose.model<UserTransactions>(Constants.TRANSACTIONS_TABLE, UserTransactionSchema);
export default UserTransactionDB;
