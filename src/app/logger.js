


import { Logish } from 'logish'
import fs from 'fs'

var eventFunction = undefined

class Logger {

    defaultConfig = (JSON.parse(fs.readFileSync('config/default.json', 'utf8'))).logish
    logs = []
    log = undefined

    init() {
        this.log = this.getLogger('obx:logger')
        this.log.info('Initializing logging system.')
    }


    /**
     * Creates an instance of log.
     * 
     * @param {string} namespace - A unique identifier applied to logging within a specific module or namespace.
     * @returns instance.
     */
    getLogger(namespace = '') {
        const log = new Logish( this.defaultConfig )
        log.setNamespace(namespace)
        log.use(this.logListener)
        this.logs.push(log)
        return log
    }


    logListener(logEntry) {
        if (eventFunction !== undefined && typeof eventFunction === 'function')
            eventFunction(logEntry)
    }


    addEventFunction(fn) {
        if (typeof fn === 'function')
            eventFunction = fn
        else
            return false
        return true
    }


    setLevel(level) {
        this.defaultConfig.level = level
        for (var log of this.logs) 
            log.setLevel(level)
    }
}


const logger = new Logger()
export default logger
