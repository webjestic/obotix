/**
 * 
 */

import logger from './logger.js'
import configModel from '../models/config.js'
import apiKeyModel from '../models/apikey.js'

import fs from 'fs'



class DBVersion {

    configs = undefined
    apikeys = undefined
    log = undefined
    version = (JSON.parse(fs.readFileSync('package.json', 'utf8'))).version

    async init() {
        this.log = logger.getLogger('app:dbversion')
        this.log.info(`Initializing DB Version check for ${this.version}`)
        this.configs = configModel()
        this.apikeys = apiKeyModel()
    }

}

const dbversion = new DBVersion()
export default dbversion