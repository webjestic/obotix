/**
 * 
 */

import logger from './logger.js'
import db from './db.js'
import fnlib from 'fnlib'

import dbversionModel from '../models/dbversion.js'

import configModel from '../models/config.js'
import apiKeyModel from '../models/apikey.js'

import fs from 'fs'
import os from 'os'


class DBVersionUpdater {

    log = undefined
    appVersion = undefined      // current app version from package.json
    versionJsonData = undefined     // data from config/dbversions/0.4.2.json
    dbName = undefined          // name of database being updated
    envVarName = undefined      // .env variable name of database to update OAPI_DB_NODE or OAPI_DB_APP
    versionModel = undefined    // database collection model

    iAmUpdater = false          // flag to determine if this is the instance making the updates
    updateInProgress = false    // flat to determine if update is still in progress
    updateId = undefined        // dbversions._id of record being worked


    async update(envVarName) {

        // Class variable initialization
        this.log = logger.getLogger('app:dbversion')
        this.appVersion = (JSON.parse(fs.readFileSync('package.json', 'utf8'))).version
        this.dbName = db.getDbNameFromConnStr(process.env[envVarName])
        this.envVarName = envVarName

        this.loadVersionJsonFromFile()
        if (this.versionJsonData !== undefined) {
            await this.startUpdate()
            if (this.iAmUpdater && this.updateInProgress) {
                await this.updateDB()
                this.log.info('Updates applied, updating dbversion state to "Complete".')
                await this.versionModel.model.findByIdAndUpdate(this.updateId, { state: 'Complete', endTime: new Date()} )
            }
            await this.endUpdate()
        }
    }


    async loadVersionJsonFromFile() {
        this.log.info(`Checking "${this.dbName}" DB for updates.`)
        const versionFile = `./config/dbversions/${this.appVersion}.json`
        try {
            this.versionJsonData = (JSON.parse(fs.readFileSync(versionFile, 'utf8')))
            if (this.versionJsonData[this.envVarName] !== undefined) {
                this.log.info(`DB update available for ${this.dbName} version ${this.appVersion}.`)
                this.versionJsonData = this.versionJsonData[this.envVarName]
            } else  
                this.log.info(`DB update available for ${this.dbName} version ${this.appVersion}.`)
             
        } catch(ex) {
            this.log.info('No databasse version updates found.')
        }
    }


    async startUpdate() {
        this.versionModel = dbversionModel()
        this.log.info('Starting "dbversions" update event.')

        //     "db": "dev-obotix-node",
        //     "version": "01.41.111",
        //     "state": "inProgress",
        //     "updatedBy": "A074709.local",
        //     "startTime": "2/13/2023, 1:11:14 PM",
        //     "endTime": ""
        const newdoc = {
            db: this.dbName,
            version: this.appVersion,
            state: 'inProgress',
            updatedBy: os.hostname(),
            startTime: new Date(),
            endTime: null
        }
        // this.log.debug(newdoc)

        try {
            var result = await this.versionModel.model.create(newdoc)
            this.log.debug(`Dbversions doc created for ${this.dbName} ${this.appVersion}`)
            this.log.debug(`Database Update _id is: ${result._id}`)
            this.updateId = result._id
            this.iAmUpdater = true
            this.updateInProgress = true
        } catch(ex) {
            if (ex.code !== undefined && ex.code === 11000) { // Duplicate Key
                this.log.info('Update already in progress. Monitoring progress.')
                this.updateInProgress = true
            } else {
                this.log.error('Failed to update "debversions" :', ex)
                this.log.fatal('Error too serious to continue. Contact Admin or Developer immediately. ')
                process.exit()
            }
            
        }
    }


    async updateDB() {
        // intended for sub-class implementation and execution (Class override)
    }


    async endUpdate() {

        // wait for update progress to complete
        // this is for servers that are not executing the update
        this.log.info(`Waiting for ${this.dbName} updates to complete.`)
        do {
            this.checkProgress()
            await fnlib.sleep(1000)
        } while(this.updateInProgress)

        this.log.info(`DB Updates complete for ${this.dbName} ${this.appVersion}`)
    }


    async checkProgress() {
        try {
            const doc = await this.versionModel.model.find({ db: this.dbName, version: this.appVersion }).exec()
            // this.log.debug( doc[0])
            if (doc[0].state === 'Complete')
                this.updateInProgress = false
        } catch(ex) {
            this.log.error('checkProgress', ex)
        }
    }

}


class DBNodeUpdater extends DBVersionUpdater {

    configs = undefined
    apikeys = undefined

    async updateDB() {
        this.log.debug(`DBNodeUpdater.updateDB() running for environment variable ${this.envVarName}.`)
        this.log.info(`Running DB updates for ${this.dbName} ${this.appVersion}.`)
        this.log.debug('Version Data:', this.versionJsonData)
        this.configs = configModel()
        this.apikeys = apiKeyModel()

        await this.updateConfigs()
        await this.updateApiKeys()
    }

    async updateConfigs() {

    }

    async updateApiKeys() {

    }
}


export default {
    DBVersionUpdater,
    DBNodeUpdater
}