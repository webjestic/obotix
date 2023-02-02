


import logger from './logger.js'
import config from './config.js'
import dbconn from '../models/dblog.js'



function levelAllowed( logLevel) {
    const levels = Object.freeze({ 'trace': 0, 'debug': 1, 'info': 2, 'warn': 3, 'error': 4, 'fatal': 5 })
    // const conf = config.getConfig()
    return levels[logLevel] >= levels[config.getConfig().logger.logToDb.level] 
}


class DBLog {

    log = logger.getLogger('app:dblog')
    dblog = undefined


    async init() {
        if (dblog === undefined) {
            this.log.debug('Initializing database logging.')

            try {
                this.dblog = dbconn()
                logger.addEventFunction(this.logToDb)
            } catch(ex) {
                this.log.error(ex)
            }

            let msg = `LogToDb listener attached to Logish: Enabled=${config.getConfig().logger.logToDb.enabled} `
            msg = msg + `Level>="${config.getConfig().logger.logToDb.level}"`
            this.log.debug(msg)
        }
    }


    logToDb(logEntry) {
        try {
            if (dblog.connection.readyState === 1) {
                if (config.getConfig().logger.logToDb.enabled === true) {
                    if (levelAllowed(logEntry.level)) {
    
                        const entry = { 
                            'level': logEntry.level,
                            'entry': logEntry.message.substring(1),
                            'server': logEntry.hostname,
                            'namespace': logEntry.namespace,
                            'timestamp': logEntry.datetime.dateString,
                            'data' : logEntry.data || {}
                        }
    
                        try {
                            dblog.model.create(entry, (err) => {
                                if (err) return this.log.error(err)
                                // saved!
                            })
                        } catch(ex) {
                            // using console - does not trigger another log event
                            console.log(ex)
                        }
    
                    }
                }
            }
        } catch(ex) {
            // using console - does not trigger another log event
            console.error(ex)
        }
    }
}


const dblog = new DBLog()
export default dblog

