/**
 * 
 */
import logger from './logger.js'
// import admin from 'firebase-admin'
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
            this.log.info(`Loading ${process.env.GOOGLE_APPLICATION_CREDENTIALS}`)
            try {
                this.admin = admin
                this.admin.initializeApp({
                    credential: this.admin.credential.applicationDefault()
                })
            } catch (ex) {
                this.log.error(ex.message, { stack: ex.stack })
            }
        } else {
            this.log.error('No GOOGLE_APPLICATION_CREDENTIALS found.')
            throw new Error('No GOOGLE_APPLICATION_CREDENTIALS found.')
        }

    }

}

const firebase = new Firebase()
export default firebase
