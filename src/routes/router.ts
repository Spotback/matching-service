import { Express } from 'express';
import Match from '../services/match'
export class Routes {

    public routes(app: Express): void {
        app.get('/ping', (req, res) => {
            res.status(200).send();
        })
        app.post('/match', Match.account);
    }
}
