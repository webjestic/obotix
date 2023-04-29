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

import rateLimit from './middleware/rateLimit.js'
import auth from './middleware/auth.js'
import role from './middleware/role.js'

import apikeyModel from './models/apikey.js'
import usersModel from './models/users.js'
import configModel from './models/config.js'
import dbversionModel from './models/dbversion.js'

import AccountController from './controllers/account.js'
import BaseClass from './app/baseclass.js'


class Obotix  {
    logger = Logger
    db = Db
    config = Conifg
    dblog = DbLog
    http = Http
    sys = Sys

    baseClass = BaseClass
    log = undefined
    dbversion = undefined

    constructor () {
        dotenv.config()
    }


    async init() {
        this.logger.init()
        this.log = this.logger.getLogger('obx:index')
        this.log.info(`Initializing app in a ${process.env.NODE_ENV.toUpperCase()} environment.`)

        try {
            await this.db.init()
            this.dbversion = new DBVersion.DBNodeUpdater()
            await this.dbversion.update('OAPI_DB_NODE')
            await this.config.init()
            await this.dblog.init()
            await this.sys.init()
            await this.http.init()
        } catch (ex) {
            this.log.error('Critical error occured, exiting gracefully.')
            this.log.fatal(ex.message, {stack: ex.stack})
            process.exit()
        }
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
        let msg = ''
        switch (middlewareName.toLowerCase()) {
        case 'ratelimit':
            return rateLimit
        case 'auth':
            return auth
        case 'role':
            return role
        default :
            msg = `Error: Middleware not found: ${middlewareName}`
            this.log.error(`Error: Middleware not found: ${msg}`)
            throw new Error(msg)
        }
    }

    getModel(modelName) {
        let msg = ''
        switch (modelName.toLowerCase()) {
        case 'apikey':
            return apikeyModel
        case 'users':
            return usersModel
        case 'dbversion':
            return dbversionModel
        case 'config':
            return configModel
        default :
            msg = `Error: Model not found: ${modelName}`
            this.log.error(msg)
            throw new Error(msg)
        }
    }


    onEvent(event, callback) {
        let msg = ''
        const accountEvents = ['onAccountCreate', 'onAccountDelete', 'onAccountLogin', 'onAccountLogout']
        const configEvents = ['onConfigChange']

        if (accountEvents.indexOf(event) !== -1 ) {
            try {
                let accountController = AccountController()
                accountController.on(event, callback)
                return true
            } catch (ex) {
                this.log.error(ex.message, { stack: ex.stack })
                throw new Error(ex.message)
            }
        }

        if (configEvents.indexOf(event) !== -1) {
            try {
                this.config.on(event, callback)
                return true
            } catch (ex) {
                this.log.error(ex.message, { stack: ex.stack })
                throw new Error(ex.message)
            }
        }

        msg =`Error: No event found for: ${event}`
        this.log.error(msg)
        throw new Error(msg)
    }

    listen(port, callback) { this.http.listen(port, callback) }
}

const obotix = new Obotix()
export default obotix
