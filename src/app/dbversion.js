/**
 * Module classes responsible for providing the PRIMARY and OBSERVER database
 * workflows for making database structure changes.
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
    appVersion = undefined          // current app version from package.json
    versionData = undefined         // data from config/dbversions/0.4.2.json
    dbName = undefined              // name of database being updated
    envVarName = undefined          // .env variable name of database to update OAPI_DB_NODE or OAPI_DB_APP
    versionModel = undefined        // database collection model

    iAmPrimary = false              // flag to determine if this is the instance making the updates
    updateInProgress = false        // flat to determine if update is still in progress
    updateDoc_id = undefined        // dbversions._id of record being worked


    /**
     * The method that is called externally, to trigger the DB Update process.
     * 
     * Example: dbupdateInstance.update('MYTN_DB_NODE')
     * 
     * @param {String} envVarName - Used to determine which config/dbversions/version.json DATA to use.
     */
    async update(envVarName) {

        // Class variable initialization
        this.log = logger.getLogger('app:dbversion')
        this.appVersion = (JSON.parse(fs.readFileSync('package.json', 'utf8'))).version
        this.dbName = db.getDbNameFromConnStr(process.env[envVarName.toUpperCase()])
        this.envVarName = envVarName

        // Load config/dbversions/0.4.2.json data and IF it exists start the process
        this.loadVersionJsonFromFile()
        if (this.versionData !== undefined) {

            await this.startUpdate()
            if (this.iAmPrimary && this.updateInProgress) {

                // PRIMARY server (the updating server) enters here. 
                // Observing servers do not.

                // This is a call to sub-class implementation. This is a call to the abstract-method
                await this.updateDB()
                this.log.info('Updates applied, updating dbversion state to "Complete".')

                try {
                    await this.versionModel.model.findByIdAndUpdate( this.updateDoc_id, { 
                        state: 'Complete', 
                        endTime: new Date() 
                    })
                    this.log.info('Updated dbversions.doc, signaling the observing servers.')
                } catch(ex) {
                    this.log.error(ex)
                }
            }
            await this.endUpdate()
        }
    }


    /**
     * Checks to see if a config/dbversions/0.4.2.json file exists and loads it.
     */
    async loadVersionJsonFromFile() {
        this.log.info(`Checking "${this.dbName}" DB for updates.`)

        const versionFile = `./config/dbversions/${this.appVersion}.json`
        try {
            this.versionData = (JSON.parse(fs.readFileSync(versionFile, 'utf8')))

            // Specifically load the DB updates. See .env file and /config/dbversions/version.json file.
            if (this.versionData[this.envVarName] !== undefined) {
                this.log.info(`DB update available for ${this.dbName} version ${this.appVersion}.`)
                this.versionData = this.versionData[this.envVarName]
            } else {
                this.versionData = undefined
                this.log.info(`NO update available for ${this.dbName} version ${this.appVersion}.`)
            }
             
        } catch(ex) {
            this.versionData = undefined
            this.log.info('No databasse version updates files found.')
        }
    }


    /**
     * Start the update process by creating a unique document in the Node.dbversions collection.
     * 
     * Scenario One: 
     * This instance of the Node server is the first to create the unique document and proceeds to
     * as the PRIMARY server for updates and sets the class variables "iAmPrimary", "updateInProgress", 
     * and "updateDoc_id".
     * 
     * Scenario Two:
     * This is NOT the primary server and recieves a "duplicate id" error message when trying to
     * create the unique update document. This server is an OBSERVER instance; therefore, does
     * not update any Class variables.  This instance will not make udpates, but will enter the
     * monitoring loop and wait for the PRIMARY server to complete the updates.
     */
    async startUpdate() {
        this.versionModel = dbversionModel()

        const newdoc = {
            verid: `${this.dbName}_${this.appVersion}`,
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
            this.log.info('PRIMARY: This server is applying the database updates.')
            this.updateDoc_id = result._id
            this.iAmPrimary = true
            this.updateInProgress = true

        } catch(ex) {
            if (ex.code !== undefined && ex.code === 11000) { // 11000 is Duplicate Key
                this.log.info('OBSERVER: Update already in progress. Monitoring update progress.')
                this.updateInProgress = true
            } else {
                this.log.error('Failed to update "debversions" :', ex)
                this.log.fatal('Error too serious to continue. Contact Admin or Developer immediately. ')
                process.exit()
            }
            
        }
    }


    /**
     * ABSTRACT METHOD
     * 
     * - intended for sub-class implementation. This is an abstract method.
     * - sub-class instances will apply the actual updates and do so from within this method.
     */
    async updateDB() { }


    /**
     * This is the monitoring loop.  This is where observer instances will wait for the
     * primary server to finish updates. This loop continues to check the progress of the
     * update every second.
     */
    async endUpdate() {

        this.log.info(`Waiting for ${this.dbName} updates to complete.`)
        if (!this.iAmPrimary) {
            do {
                await this.checkProgress()
                if (this.updateInProgress)
                    await fnlib.sleep(1000)
            } while(this.updateInProgress)
        }

        this.log.info(`DB Updates complete for ${this.dbName} ${this.appVersion}`)
    }


    /**
     * Checks the update document for a "state" change and updates class variable.
     */
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

    /**
     * Abstract Method Implementation
     */
    async updateDB() {
        this.log.debug(`updateDB() running for environment variable ${this.envVarName}.`)
        this.log.info(`Running DB updates for ${this.dbName} ${this.appVersion}.`)

        this.configs = configModel()
        this.apikeys = apiKeyModel()

        await this.updateConfigs()
        await this.updateApiKeys()
    }


    async updateConfigs() {
        if (this.versionData.configs === undefined) return true
        this.log.info(`Updating ${this.configs.connection.config.db}.configs`)

        // Should always be only one document
        let configDoc = await this.configs.model.find({}).exec()
        configDoc = configDoc[0]

        var results = undefined
        if (configDoc !== undefined) {
            this.log.debug(`configs.id : ${configDoc.id}`)
            this.log.debug(this.versionData.configs)
            try {
                results = await this.configs.model.findByIdAndUpdate( configDoc.id, this.versionData.configs)
                this.log.debug(results)
            } catch(ex) {
                this.log.error('updateConfigs() ', ex)
            }
        } else {
            this.log.info(`Creating new ${this.dbName}.configs`)
            try {
                results = await this.configs.model.create(this.versionData.configs)
                this.log.debug(results)
            } catch (ex) {
                this.log.error('updateConfigs() ', ex)
            }
        }
    }


    async updateApiKeys() {
        if (this.versionData.apikeys === undefined) return true
        this.log.info(`Updating ${this.configs.connection.config.db}.apikeys`)

        try {
            var results = await this.apikeys.model.insertMany (this.versionData.apikeys)
            this.log.debug(results)
        } catch (ex) {
            this.log.error('updateApiKeys() ', ex)
        }
    }
}


export default {
    DBVersionUpdater,
    DBNodeUpdater
}