/**
 * 
 */

import logger from '../app/logger.js'
const log = logger.getLogger('mw:role')

export default function(role)  {
    return (req, res, next) => {
        log.debug (`req.apiuser.role ${req.apiuser.role} and requires ${role}`)
        
        if (req.apiuser.role === undefined)
            return res.status(403).json( { message: 'Forbidden: Undefined role.' } )

        try {
            if (req.apiuser.role < role) 
                return res.status(403).json( { message: 'Forbidden: Not enough privileges.' } )

            // this is the only path to success (an approved privelage)
            if (req.apiuser.role >= role)
                next()

        } catch (ex) {
            log.error('error checking roles', ex)
        }

    }
}