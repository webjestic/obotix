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
import DBVersion from './app/dbversion.js'

import BaseClass from './app/baseclass.js'

import Fn from './app/fn/index.js'

import rateLimit from './middleware/rateLimit.js'
import auth from './middleware/auth.js'
import role from './middleware/role.js'


class Obotix {
    logger = Logger
    db = Db
    config = Conifg
    dblog = DbLog
    http = Http
    sys = Sys
    fn = Fn
    baseClass = BaseClass

    dbversion = undefined
    log = undefined

    constructor () {
        dotenv.config()
    }

    async init() {
        this.logger.init()
        this.log = this.logger.getLogger('app:index')
        this.log.info(`Initializing app in a ${process.env.NODE_ENV.toUpperCase()} environment.`)

        await this.db.init()
        this.dbversion = new DBVersion.DBNodeUpdater()
        await this.dbversion.update('OAPI_DB_NODE')
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
        case 'ratelimit':
            return rateLimit
        case 'auth':
            return auth
        case 'role':
            return role
        default :
            this.log.error(`addMiddleware Error: ${middlewareName}`)
            return false
        }
    }

    listen(port, callback) { this.http.listen(port, callback) }
}

const obotix = new Obotix()
export default obotix

