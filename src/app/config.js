


import logger from './logger.js'
import dbconn from '../models/config.js'
import fs from 'fs'
import { EventEmitter } from 'events'



class Config extends EventEmitter {

    dbconn = undefined
    defaultConfig = (JSON.parse(fs.readFileSync('config/default.json', 'utf8'))).configs

    log = logger.getLogger('obx:config')



    async init() {
        this.log.info('Initializing remote configuration.')
        try {
            this.dbconn = dbconn()

            this.setConfigWatch()
            this.setupDbListeners()
            await this.loadConfig()
        } catch(ex) {
            this.log.error(ex.message, { stack: ex.stack })
        }
    }


    setConfigWatch() {
        this.dbconn.onChange = this.dbconn.model.watch()
        this.dbconn.onChange.on('change', this.setOnChangeChange)
        this.dbconn.onChange.on('error', this.setOnChangeError)
    }

    setOnChangeChange() {
        try {
            this.configChange() 
        } catch (ex) {
            this.log.error(ex.message, { stack: ex.stack })
        }
    }

    setOnChangeError(err) {
        this.log.error(err, { stack: err.stack } )
    }

    setupDbListeners() {
        this.dbconn.connection.on('disconnected', () => {
            this.log.warn(`Disconnect detected. Closing Config.watch() on ${this.dbconn.connection.config.db}`)
            this.dbconn.onChange.removeListener('change', this.setOnChangeChange)
            this.dbconn.onChange.removeListener('error', this.setOnChangeError)
            this.dbconn.onChange.close()
        })
        this.dbconn.connection.on('reconnected', () => {
            this.log.info(`Reconnect detected. Reopening Config.watch() on ${this.dbconn.connection.config.db}`)
            this.setConfigWatch()
        })
    }


    configChange() {
        this.loadConfig()
        this.emit('onConfigChange', this.dbconn.data)
        this.log.info(`Configuration update recieved from ${this.dbconn.connection.config.db}.configs. Notifying listeners.`)
    }


    async loadConfig() {
        try {
            const doc = await this.dbconn.model.find({}).exec()
            this.dbconn.data = doc[0]
            if (this.dbconn.data === undefined) {
                // this.saveFirstConfig()
                this.dbconn.data = this.defaultConfig
            }
            this.log.info(`Configuration loaded from ${this.dbconn.connection.config.db}.configs.`)
            // this.log.debug('config.getConfig() returns', this.dbconn.data)
            logger.setLevel(this.dbconn.data.logger.level) // updating Logger, because it is not a subscriber
        } catch (ex) {
            this.log.error(ex.message, { stack: ex.stack })
        }
    }


    // TODO: Flagged for deleteion; this is not a long term code comment.
    // async saveFirstConfig() {
    //     try {
    //         Config.create(this.defaultConfig, (err) => {
    //             if (err) return console.log(err)
    //             // saved!
    //         })
    //     } catch(ex) {
    //         this.log.error(ex.message, { stack: ex.stack })
    //     }
    // }


    getConfig() {
        return this.dbconn.data
    }



}
const config = new Config()
export default config

