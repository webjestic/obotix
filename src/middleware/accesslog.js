/**
 * Responsible for logging access.
 */

import logger from '../app/logger.js'
import config from '../app/config.js'
import os from 'os'

import dbconn from '../models/accesslog.js'

const log = logger.getLogger('obx-mw:accesslog')


/**
 * Responsible for creating a log entry for Access. Log entry is currently writing to DB.
 * Function is able to create a newly detached instance of Logish and could write to
 * an access.log file if desired.
 * 
 * @param {Object} req 
 * @param {Object} res 
 * @param {function} next 
 */
// eslint-disable-next-line no-unused-vars
export default async function (req, res, next){

    const accesslogs = dbconn()

    const conf = config.getConfig()
    if (conf.logger.accesslog.enabled) {
        if (req.path !== '/live' && req.path !== '/ready') {
                
            const rip = req.get('x-forwarded-for') || req.socket.remoteAddress 
            const dt = Date.now()
            const ts = new Date(dt)
            const uid = req.get('uid') || 'NA'
            const apiuser = req.get('x-api-user') || 'guest'
    
            const entry = `${new Date(ts).toISOString()} | ${os.hostname} | ${rip} | ${uid} | ${req.method} ${req.path}`
            const acceessEntry = { 
                access: `${req.method} ${req.path}`,
                uid: uid,
                ip: rip,
                svr: `${os.hostname}`,
                timestamp: ts,
                apikeyuser: apiuser
                // log: entry
            }

            try {
                log.trace(entry)
                await accesslogs.model.create(acceessEntry)
            } catch(ex) {
                log.error(ex)
            }
        }
    }
    next()
}
