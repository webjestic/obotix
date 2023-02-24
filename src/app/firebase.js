/**
 * 
 */
import logger from './logger.js'
import shell from 'shelljs'
import fs from 'fs'
import admin from 'firebase-admin'

class Firebase {

    log = undefined
    firebaseConfig = undefined
    app = undefined
    admin = undefined

    constructor() {}

    async init() {
        this.log = logger.getLogger('obx:firebase')
        this.log.info('Initializing Google Firebase.')
        
        if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
            try {
                await this.decryptFirebaseFile()
                this.log.info(`Loading ${process.env.GOOGLE_APPLICATION_CREDENTIALS}`)

                this.admin = admin
                this.admin.initializeApp({
                    credential: this.admin.credential.applicationDefault()
                })
                
                this.log.info('Firebase app successfully initialized.')
            } catch (ex) {
                this.log.error(ex.message, { stack: ex.stack })
            }
        } else {
            this.log.error('No GOOGLE_APPLICATION_CREDENTIALS found.')
            throw new Error('No GOOGLE_APPLICATION_CREDENTIALS found.')
        }
    }

    async decryptFirebaseFile() {
        try {
            let firebaseFile = 'firebase-adminsdk.gpg'
            if (!fs.existsSync(firebaseFile)) 
                throw new Error(`${firebaseFile} does NOT exist.`)
                
            if (!fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
                // eslint-disable-next-line max-len
                let cmd = `gpg --pinentry-mode=loopback --passphrase ${process.env.OAPI_CRYPTO_KEY} -d -o ${process.env.GOOGLE_APPLICATION_CREDENTIALS} ${firebaseFile}`
                let result = shell.exec(cmd, {silent:true})
                if (result.code === 0) 
                    this.log.info(`${firebaseFile} decrypted successfully.`)
                else
                    this.log.error(`FAILED to decrypt ${firebaseFile}.`)
            } else 
                this.log.info(`${firebaseFile} has already decrypted.`)

        } catch (ex) {
            throw new Error(ex.message)
        }
    }

}

const firebase = new Firebase()
export default firebase
