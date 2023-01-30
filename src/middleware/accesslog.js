/**
 * Responsible for logging access.
 */

import logger from '../app/logger.js'
import db from '../app/db.js'
import config from '../app/config.js'
import os from 'os'

const log = logger.getLogger('ctrl:accesslog')


var dbconn = {
    connection: undefined,
    schema: undefined,
    model: undefined,
    data: undefined,
}


function init() {
    if (dbconn.connection === undefined) {
        try {
            dbconn.connection = db.getConnFromConnStr(process.env.OAPI_DB_NODE) // mytn.db.conn.mytnNode
            dbconn.schema = new db.mongoose.Schema({ any: db.mongoose.Schema.Types.Mixed }, { strict: false })
            dbconn.model = dbconn.connection.model('Accesslog', dbconn.schema)
        } catch(ex) {
            log.error(ex)
        }
    }
}


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
export default function (req, res, next){
    log.trace('Middleware: accesslog')
    if (dbconn.connection === undefined) init()

    if (config.getConfig().logger.accesslog.enabled) {
        if (dbconn.connection !== undefined) {
            if (req.path !== '/live' && req.path !== '/ready') {
                
                const rip = req.headers['x-forwarded-for'] || req.socket.remoteAddress 
                const dt = Date.now()
                const ts = new Date(dt).toISOString()
                const uid = req.header('uid') || 'NA'
                const apiuser = req.header('x-api-user') || 'guest'
    
                const entry = `${ts} | ${os.hostname} | ${rip} | ${uid} | ${req.method} ${req.path}`
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
                    dbconn.model.create(acceessEntry, (err) => {
                        if (err) return log.error(err)
                    })
                } catch(ex) {
                    log.error(ex)
                }
            }
        }
    }
    next()
}
