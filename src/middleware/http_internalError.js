
import logger from '../logger.js'

const log = logger.getLogger('server:500')

// eslint-disable-next-line no-unused-vars
export default function (err, req, res, next){
    log.error(err.message, err)
    log.debug(`500 encounter for ${req.method} ${req.path}`)
    const response = {
        'message': `500 Error on: ${req.method} ${req.path}`,
        'error' : err.message

    }
    res.status(500).json(response)
}