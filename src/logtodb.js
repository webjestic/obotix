/**
 * 
 */

import db from './db.js'
import config from './config.js'
import logger from './logger.js'

const log = logger.getLogger('app:logtodb')

var connDB = undefined
var logSchema = undefined
var LogDb = undefined


/**
 * Determines if a log level is allowed to be written to the DB. The rule is simple, any level
 * greater-than-or-equal-to the level defined is allowed.
 * 
 * @param {*} logLevel 
 * @returns boolean
 */
function levelAllowed( logLevel) {
    const levels = Object.freeze({ 'trace': 0, 'debug': 1, 'info': 2, 'warn': 3, 'error': 4, 'fatal': 5 })
    // const conf = config.getConfig()
    return levels[logLevel] >= levels[config.getConfig().logger.logToDb.level] 
}


/**
 * Function is responsible for determining if a logEntry is to be written to the DB and
 * then writing the entry to the DB.
 * 
 * @param {Object} logEntry 
 */
function logToDb(logEntry) {
    try {
        if (connDB.readyState === 1) {
            if (config.getConfig().logger.logToDb.enabled === true) {
                if (levelAllowed(logEntry.level)) {

                    const entry = { 
                        'level': logEntry.level,
                        'entry': logEntry.message.substring(1),
                        'server': logEntry.hostname,
                        'namespace': logEntry.namespace,
                        'timestamp': logEntry.datetime.dateString,
                        'data' : logEntry.data
                    }

                    LogDb.create(entry, (err) => {
                        if (err) return console.log(err)
                        // saved!
                    })

                }
            }
        }
    } catch(ex) {
        log.error(ex)
    }
}

/**
 * There is no modInit() for this module, because the timing of initialization is critical and
 * not necessarily desirable when the modlule is imported. Therefore, the module has a default
 * function which needs to be called at by an external source (index) when the timing is appropriate.
 */
function init() {
    if (connDB === undefined) {
        try {
            connDB = db.getConnFromConnStr(process.env.OAPI_DB_NODE) // db.conn.mytnNode
            logSchema = new db.mongoose.Schema({ any: db.mongoose.Schema.Types.Mixed }, { strict: false })
            LogDb = connDB.model('Log', logSchema)
            logger.addEventFunction(logToDb)
        } catch(ex) {
            log.error(ex)
        }
        let msg = `LogToDb listener attached to Logish: Enabled=${config.getConfig().logger.logToDb.enabled} `
        msg = msg + `Level>="${config.getConfig().logger.logToDb.level}"`
        log.debug(msg)
    }
}

export default {
    init
}