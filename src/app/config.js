


import logger from './logger.js'
// import db from './db.js'
import fs from 'fs'
import { EventEmitter } from 'events'
import dbconn from '../models/config.js'



class Config extends EventEmitter {

    dbconn = undefined
    defaultConfig = (JSON.parse(fs.readFileSync('config/default.json', 'utf8'))).configs
    log = logger.getLogger('app:config')


    async init() {
        this.log.debug('Initializing remote configuration.')
        try {
            this.dbconn = dbconn()

            this.setConfigWatch()
            this.setupDbListeners()
            await this.loadConfig()
            await this.checkForConfigSchemaUpdate()
        } catch(ex) {
            this.log.error(ex)
        }
    }


    setConfigWatch() {
        this.dbconn.onChange = this.dbconn.model.watch()
        this.dbconn.onChange.on('change', () => {
            try {
                this.configChange() 
            } catch (ex) {
                this.log.error(ex)
            }
        })
        this.dbconn.onChange.on('error', (err) => {
            this.log.error(err)
        })
    }


    setupDbListeners() {
        this.dbconn.connection.on('disconnected', () => {
            this.log.warn(`Disconnect detected. Closing Config.watch() on ${this.dbconn.connection.config.db}`)
            this.dbconn.onChange.close()
        })
        this.dbconn.connection.on('reconnected', () => {
            this.log.info(`Reconnect detected. Reopening Config.watch() on ${this.dbconn.connection.config.db}`)
            this.setConfigWatch()
        })
    }


    configChange() {
        this.loadConfig()
        this.emit('configChange')
        this.log.info(`Configuration update recieved from ${this.dbconn.connection.config.db}.configs. Notifying listeners.`)
    }


    async loadConfig() {
        try {
            const doc = await this.dbconn.model.find({}).exec()
            this.dbconn.data = doc[0]
            if (this.dbconn.data === undefined) {
                this.saveFirstConfig()
                this.dbconn.data = this.defaultConfig
            }
            this.log.info(`Configuration loaded from ${this.dbconn.connection.config.db}.configs.`)
            // this.log.debug('config.getConfig() returns', this.dbconn.data)
            logger.setLevel(this.dbconn.data.logger.level) // updating Logger, because it is not a subscriber
        } catch (ex) {
            this.log.error(ex)
        }
    }


    async saveFirstConfig() {
        try {
            Config.create(this.defaultConfig, (err) => {
                if (err) return console.log(err)
                // saved!
            })
        } catch(ex) {
            this.log.error(ex)
        }
    }


    async checkForConfigSchemaUpdate() {
        this.log.trace('begin checkForConfigSchemaUpdate()')

        var data = this.getConfig()
        const id = data._id
        this.log.debug(`configs._id= ${id}`)

        var updated = false

        if (data.logger === undefined) { 
            this.log.debug('configs.logger does not exist.')
            data.logger = this.defaultConfig.logger
            updated = true
        } 
        if (data.logger.level === undefined) {
            this.log.debug('configs.logger.level  does not exist.')
            data.logger.level = this.defaultConfig.logger.level
            updated = true
        }
        if (data.logger.logToDb === undefined) {
            this.log.debug('configs.logger.logToDb  does not exist.')
            data.logger.logToDb = this.defaultConfig.logger.logToDb
            updated = true
        }
        if (data.logger.logToDb.enabled === undefined) {
            this.log.debug('configs.logger.logToDb.enabled  does not exist.')
            data.logger.logToDb.enabled === this.defaultConfig.logToDb.enabled
            updated = true
        }
        if (data.logger.logToDb.level === undefined) {
            this.log.debug('configs.logger.logToDb.level  does not exist.')
            data.logger.logToDb.level = this.defaultConfig.logger.logToDb.level
            updated = true
        }
        if (data.logger.accesslog === undefined) {
            this.log.debug('configs.logger.accesslog  does not exist.')
            data.logger.accesslog = this.defaultConfig.logger.accesslog
            updated = true
        }
        if (data.logger.accesslog.enabled === undefined) {
            this.log.debug('configs.logger.accesslog.enabled  does not exist.')
            data.logger.accesslog.enabled = this.logger.accesslog.enabled
            updated = true
        }

        if (updated === true) {
            this.log.debug('Updating missing configs.keys.')
            try {
                var result = await this.dbconn.model.findByIdAndUpdate(id, data, { new: true })
            } catch (ex) {
                this.log.error(ex)
            }
            if (result === undefined) {
                this.log.error('config.js checkForConfigSchemaUpdate() findByIdAndUpdate ERROR')
                throw new Error('config.js checkForConfigSchemaUpdate() findByIdAndUpdate ERROR')
            }
        }

        this.log.trace('end checkForConfigSchemaUpdate()')
    }


    getConfig() {
        return this.dbconn.data
    }



}
const config = new Config()
export default config
