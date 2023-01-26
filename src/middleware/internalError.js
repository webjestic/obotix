/**
 * Responsible for handling HTTP Status 500 - Internal Errors
 */

import logger from '../logger.js'
import stats from '../controllers/stats.js'

const log = logger.getLogger('mw:500')

/**
 * Default excetion/error handler for our express app.
 * 
 * @param {Object} req 
 * @param {Object} res 
 * @param {function} next 
 */
// eslint-disable-next-line no-unused-vars
export default function (err, req, res, next){
    log.error(err.message, { stack: err.stack })
    log.debug(`HTTP Status Coee 500 encountered for ${req.method} ${req.path}`)
    const response = {
        'message': `HTTP Status Code 500 - Internal Error encountered on: ${req.method} ${req.path}`,
        'error' : err.message
    }
    stats.incInternalErrors()
    res.status(500).json(response)
}