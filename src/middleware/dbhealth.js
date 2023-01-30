/**
 * Responsible ensuring the database is connected
 */

import db from '../app/db.js'
import logger from '../app/logger.js'

const log = logger.getLogger('mw:dbhealth')

/**
 * Function is responsible for checkting the readyState of the database connections.
 * If a connection is not "connected" then an exception is thrown, allowing Express
 * tp handle it.
 * 
 * @param {Object} req 
 * @param {Object} res 
 * @param {function} next 
 */
// eslint-disable-next-line no-unused-vars
export default function (req, res, next){
    log.trace('Middleware: dbhealth')

    let result = undefined
    try {
        for (let conn of db.connections) {
            if (conn.conn.readyState !== 1)
                result = `${conn.conn.config.db} not connected.` 
        }

    } catch(ex) {
        log.error('readyCheck Exception', ex)
    }

    if (result !== undefined) {
        log.error(result)
        throw new Error(result)
    } else
        next()
}
