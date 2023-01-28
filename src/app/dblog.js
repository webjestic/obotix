


import logger from './logger.js'
import db from './db.js'
import config from './config.js'

var dbconn = {
    connection: undefined,
    schema: undefined,
    model: undefined,
    data: undefined,
}

function levelAllowed( logLevel) {
    const levels = Object.freeze({ 'trace': 0, 'debug': 1, 'info': 2, 'warn': 3, 'error': 4, 'fatal': 5 })
    // const conf = config.getConfig()
    return levels[logLevel] >= levels[config.getConfig().logger.logToDb.level] 
}


class DBLog {

    log = logger.getLogger('app:dblog')


    async init() {
        this.log.debug('Initializing database logging.')

        try {
            dbconn.connection = db.getConnFromConnStr(process.env.OAPI_DB_NODE) // db.conn.mytnNode
            dbconn.schema = new db.mongoose.Schema({ any: db.mongoose.Schema.Types.Mixed }, { strict: false })
            dbconn.model = dbconn.connection.model('Log', dbconn.schema)
            logger.addEventFunction(this.logToDb)
        } catch(ex) {
            this.log.error(ex)
        }
        let msg = `LogToDb listener attached to Logish: Enabled=${config.getConfig().logger.logToDb.enabled} `
        msg = msg + `Level>="${config.getConfig().logger.logToDb.level}"`
        this.log.debug(msg)
        
    }


    logToDb(logEntry) {
        try {
            if (dbconn.connection.readyState === 1) {
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
    
                        dbconn.model.create(entry, (err) => {
                            if (err) return this.log.error(err)
                            // saved!
                        })
    
                    }
                }
            }
        } catch(ex) {
            console.error(ex)
        }
    }
}


const dblog = new DBLog()
export default dblog

