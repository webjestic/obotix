/**
 * 
 */

import logger from '../app/logger.js'
const log = logger.getLogger('mw:role')

export default function(role)  {
    return (req, res, next) => {
        try {
            log.debug (`req.authuser.role ${req.authuser.role} and requires ${role}`)
        
            if (req.authuser.role === undefined)
                return res.status(403).json( { message: 'Forbidden: Undefined role.' } )
        } catch (ex) {
            log.error(ex.message, ex)
            return res.status(403).json( { message: 'Forbidden: Internal error validating role.' } )
        }

        try {
            if (req.authuser.role < role) 
                return res.status(403).json( { message: 'Forbidden: Not enough privileges.' } )

            // this is the only path to success (an approved privelage)
            if (req.authuser.role >= role)
                next()

        } catch (ex) {
            log.error(ex.message, ex)
        }

    }
}