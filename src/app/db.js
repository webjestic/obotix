


import mongoose from 'mongoose'
import logger from './logger.js'


class DB {

    log = logger.getLogger('obx:db')
    connections = []
    mongoose = mongoose

    async init() {
        this.log.info('Initializing database objects.')
        await this.createConnection(process.env.OAPI_DB_NODE)
        await this.createConnection(process.env.OAPI_DB_APP)
    }

    async createConnection(connectionString) {
        try {
            var conn = await mongoose.createConnection(connectionString, 
                {useNewUrlParser: true}).asPromise()
    
            conn.on('disconnected', () => { this.onDisconnected(conn) }). 
                on('reconnected', () => { this.onReconnected(conn) }).  
                on('error', (err) => { this.onError(err, conn) })
    
            conn.config.db = this.getDbNameFromConnStr(connectionString)
            this.connections.push({ name: conn.config.db, conn: conn })
    
            this.log.info(`MongoDB ${conn.config.db} is connected.`)
            return conn

        } catch(ex) {
            const cs = connectionString
            this.log.error(`Unable to connect to ${cs.substring(cs.lastIndexOf('/') + 1)}. Try VPN?`)
            this.log.error(ex.message, { stack: ex.stack })
            this.log.fatal('Terminating process due to critical errors.')
            process.exit()
        }
    }


    onDisconnected(conn) { 
        this.log.warn(`Mongoose Event: ${conn.config.db}: disconnected. Singal emitted.`) 
    }
    
    onReconnected(conn) { 
        this.log.info(`Mongoose Event: ${conn.config.db}: reconnected. Singal emitted.`) 
    }

    onError(err, conn) { 
        this.log.error('Mongoose Event:', conn.config.db, err) 
    }


    getDbNameFromConnStr(connectionString) {
        let dbName = connectionString.substring(connectionString.lastIndexOf('/') + 1)
        if (dbName.includes('?'))
            dbName = dbName.substring(0, dbName.indexOf('?') - 1)
        return dbName
    }
    
    
    getConnFromConnStr(connectionString) {
        let result = undefined
        if (this.connections.length > 0) {
            for (let conn of this.connections) {
                if (conn.name === this.getDbNameFromConnStr(connectionString)) 
                    result = conn.conn
            }
        }
        return result
    }


    getMonggose() { return mongoose }


}
const db = new DB()
export default db

