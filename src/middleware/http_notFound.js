import logger from '../logger.js'

const log = logger.getLogger('obotix:404')


// eslint-disable-next-line no-unused-vars
export default function (req, res, next){
    log.debug(`404 encounter for ${req.method} ${req.path}`)
    const response = {
        'message' : `404 Not found: ${req.method} ${req.path}`
    }
    res.status(404).json(response)
}
