/**
 * 
 */
import dotenv from 'dotenv'
import Logger from './app/logger.js'
import Db from './app/db.js'
import Conifg from './app/config.js'
import DbLog from './app/dblog.js'
import Http from './app/http.js'
import Sys from './app/sys.js'

import apikey from './middleware/apikey.js'
import rateLimit from './middleware/rateLimit.js'


class Obotix {
    logger = Logger
    db = Db
    config = Conifg
    dblog = DbLog
    http = Http
    sys = Sys

    log = undefined

    constructor () {
        dotenv.config()
    }

    async init() {
        this.logger.init()
        this.log = this.logger.getLogger('app:index')
        this.log.info(`Initializing app in a ${process.env.NODE_ENV.toUpperCase()} environment.`)

        await this.db.init()
        await this.config.init()
        await this.dblog.init()
        this.sys.init()
        await this.http.init()
    }
    
    getApp() { return this.http.getApp() }
    getRouter() { return this.http.getRouter() }
    getExpress() { return this.http.getExpress() }
    getMongoose() { return this.db.getMongoose()  }

    /**
     * Creates an instance of log.
     * 
     * @param {string} namespace - A unique identifier applied to logging within a specific module or namespace.
     * @returns instance.
     */
    getLogger(namespace = '') { return this.logger.getLogger(namespace) }
    getConfig() { return this.config.getConfig() }

    getMiddleware(middlewareName) {
        switch (middlewareName.toLowerCase()) {
        case 'apikey':
            return apikey
        case 'ratelimit':
            return rateLimit
        default :
            this.log.error(`addMiddleware Error: ${middlewareName}`)
            return false
        }
    }

    listen(port, callback) { this.http.listen(port, callback) }
}

const obotix = new Obotix()
export default obotix

