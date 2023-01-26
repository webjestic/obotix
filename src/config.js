/**
 * 
 */

import db from './db.js'
import logger from './logger.js'
import { EventEmitter } from 'node:events'

const log = logger.getLogger('app:config')


const defaultConfig = {
    'logger' : {
        'level' : 'trace',
        'logToDb' : {
            'enabled' : true,
            'level' : 'warn'
        }
    },
    'rateLimit' : {
        'windowMs' : [1,60,1000],
        'max': 30
    }
}


let data = undefined
var connDB = undefined
var configSchema = undefined
var Config = undefined
var onConfigChange = undefined
var emitter = undefined


/**
 * 
 */
async function saveFirstConfig() {
    try {
        log.debug('No config document found in DB. Creating one.')
        await Config.create(defaultConfig)
        // Config.create(defaultConfig, (err) => {
        //     if (err) return console.log(err)
        //     // saved!
        // })
    } catch(ex) {
        log.error(ex)
    }
}


/**
 * Responsible for loading th configuration.
 */
async function loadConfig() {
    try {
        const doc = await Config.find({}).exec()
        data = doc[0]
        if (data === undefined) {
            saveFirstConfig()
            data = defaultConfig
        }
        log.info(`Configuration loaded from ${connDB.config.db}.configs.`)
        log.debug('config.getConfig():', data)
        logger.setLevel(data.logger.level) // updating Logger, because it is not a subscriber
    } catch (ex) {
        log.error(ex)
    }
}


/**
 * Function defines that actions that should take place when a config change as been identified.
 */
function configChange() {
    loadConfig()
    emitter.emit('configChange')
    log.info(`Configuration update recieved from ${connDB.config.db}.configs. Notifying listeners.`)
}


/**
 * Responsible for closing and clearing the onConfigChange hook. 
 * This is ideally called when a connection has been disconnected for some reason.
 * Once a reconnection is established, setConfigWatch() should be called to hook the 
 * the watching/listener back up.
 */
function stopWatchingDB() {
    onConfigChange.close()
    onConfigChange = undefined
}

/**
 * Responsible for creating the Schema (Config) update listener. This will "watch" the 
 * database for any updates made to the Schema collection. When an update is made, this
 * function defines the functionality that should be carried out.
 */
function setConfigWatch() {
    onConfigChange = Config.watch()
    onConfigChange.on('change', () => {
        try {
            configChange() 
        } catch (ex) {
            log.error(ex)
        }
    })
    onConfigChange.on('error', (err) => {
        log.error(err)
    })
}


/**
 * Responsible for setting up the listeners to the DB connection, and defining the
 * functionality on "disconnected", "reconnected", and "error" events.
 */
function setupDbListeners() {
    connDB.on('disconnected', () => {
        log.warn(`Disconnect detected. Closing Config.watch() on ${connDB.config.db}`)
        onConfigChange.close()
    })
    connDB.on('reconnected', () => {
        log.info(`Reconnect detected. Reopening Config.watch() on ${connDB.config.db}`)
        setConfigWatch()
    })
}


/**
 * Responsible for returning a copy of the current configuration.
 * 
 * @returns data Object
 */
function getConfig() {
    return data
}


/**
 * Module initialization.
 */
async function init() {
    try {
        connDB = db.getConnFromConnStr(process.env.OAPI_DB_NODE) 
        configSchema = new db.mongoose.Schema({ any: db.mongoose.Schema.Types.Mixed }, { strict: false })
        Config = await connDB.model('Config', configSchema)
    } catch(ex) {
        log.error(ex)
    }

    emitter = new EventEmitter()
    setConfigWatch()
    setupDbListeners()
    await loadConfig()
}
// await modInit()


export default {
    init,
    stopWatchingDB,
    getConfig,
    emitter
}
