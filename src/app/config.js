


import logger from './logger.js'
import db from './db.js'
import fs from 'fs'
import { EventEmitter } from 'events'



class Config extends EventEmitter {

    dbconn = {
        connection: undefined,
        schema: undefined,
        model: undefined,
        data: undefined,
        onChange: undefined,
    }

    defaultConfig = (JSON.parse(fs.readFileSync('config/default.json', 'utf8'))).configs

    log = logger.getLogger('app:config')



    async init() {
        this.log.debug('Initializing remote configuration.')
        try {
            this.dbconn.connection = db.getConnFromConnStr(process.env.OAPI_DB_NODE) 
            this.dbconn.schema = new db.mongoose.Schema({ any: db.mongoose.Schema.Types.Mixed }, { strict: false })
            this.dbconn.model = await this.dbconn.connection.model('Config', this.dbconn.schema)

            this.setConfigWatch()
            this.setupDbListeners()
            await this.loadConfig()
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
            this.log.debug('config.getConfig() returns', this.dbconn.data)
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


    getConfig() {
        return this.dbconn.data
    }



}
const config = new Config()
export default config

