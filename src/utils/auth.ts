import * as bcrypt from 'bcryptjs';
import * as Constants from '../utils/constants';

export default class Auth {
    private static readonly saltRounds = Number(process.env.SALT_RNDS);

    public static hashPassword(password: string, callback: (error: Error, hash: string) => void): void {
        bcrypt.hash(password, this.saltRounds, (error, hash) => {
            callback(error, hash);
        });
    }

    public static compare(password: string, hashPass: string, callback: (error: string | null, match: boolean | null) => void): void {
        bcrypt.compare(password, hashPass, (err: Error, match: boolean) => {
            if(match) {
                // passwords match
                callback(null, true);
            } else {
                // passwords do not match
                callback(Constants.INVALID_PASS_MATCH, null);
            }
        });
    }
}