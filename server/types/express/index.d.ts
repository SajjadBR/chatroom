import {User} from '../../DB'

export {}

declare global {
    namespace Express {
        export interface Request {
            user?: User
        }
    }
}