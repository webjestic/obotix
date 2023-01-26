/**
 *  Responsible for handling all HTTP Status 404 - Not Found
 */

import logger from '../logger.js'
import stats from '../controllers/stats.js'

const log = logger.getLogger('mw:404')


/**
 *
 * @param {Object} req 
 * @param {Object} res 
 * @param {function} next 
 */
// eslint-disable-next-line no-unused-vars
export default function (req, res, next){
    log.debug(`404 encounter for ${req.method} ${req.path}`)
    const response = {
        'message' : `404 Not found: ${req.method} ${req.path}`
    }
    stats.incNotFound()
    res.status(404).json(response)
}