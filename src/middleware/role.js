
import logger from '../app/logger.js'
const log = logger.getLogger('user:roles')

export default function(role)  {
    return (req, res, next) => {
        log.debug ('req.apiuser.role', req.apiuser.role)
        log.debug ('required role', role)
        if (req.apiuser.role === undefined)
            return res.status(403).json( { message: 'Forbidden: Undefined role.' } )
        if (req.apiuser.role < role) 
            return res.status(403).json( { message: 'Forbidden: Not enough privileges.' } )

        next()
    }
}