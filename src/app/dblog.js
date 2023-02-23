


import logger from './logger.js'
import config from './config.js'
import dbconn from '../models/dblog.js'
import fs from 'fs'

const version = (JSON.parse(fs.readFileSync('package.json', 'utf8'))).version


function logToDb(logEntry) {
    try {
        let dblog = dbconn()
        if (dblog.connection.readyState === 1) {
            if (config.getConfig().logger.logToDb.enabled === true) {
                if (levelAllowed(logEntry.level)) {

                    const entry = { 
                        'level': logEntry.level,
                        'entry': logEntry.message.substring(1),
                        'server': logEntry.hostname,
                        'namespace': logEntry.namespace,
                        'timestamp': new Date(logEntry.datetime.dateString),
                        'data' : { version: version, logData: logEntry.data || 'na' }
                    }

                    try {
                        dblog.model.create(entry, (err) => {
                            if (err) return console.error(err)
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

function levelAllowed( logLevel) {
    try {
        const levels = Object.freeze({ 'trace': 0, 'debug': 1, 'info': 2, 'warn': 3, 'error': 4, 'fatal': 5 })
        return levels[logLevel] >= levels[config.getConfig().logger.logToDb.level] 
    } catch (ex) {
        console.log(ex)
    }
}

class DBLog {

    log = logger.getLogger('app:dblog')
    async init() {

        this.log.debug('Initializing database logging.')

        try {
            logger.addEventFunction(logToDb)
        } catch(ex) {
            this.log.error(ex.message, { stack: ex.stack })
        }

        let msg = `LogToDb listener attached to Logish: Enabled=${config.getConfig().logger.logToDb.enabled} `
        msg = msg + `Level>="${config.getConfig().logger.logToDb.level}"`
        this.log.debug(msg)
    }

}


const dblog = new DBLog()
export default dblog

