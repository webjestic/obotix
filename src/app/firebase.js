/**
 * 
 */
import logger from './logger.js'
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
        
        if (process.env.GOOGLE_FIREBASE_ADMINSDK) {
            this.admin = admin
            this.admin.initializeApp({
                //credential: this.admin.credential.applicationDefault()
                credential: this.admin.credential.cert(JSON.parse(process.env.GOOGLE_FIREBASE_ADMINSDK))
            })
            this.log.info('Firebase SDK successfully initialized.')
        } else 
            throw new Error('No GOOGLE_FIREBASE_ADMINSDK found.')
    }
}


const firebase = new Firebase()
export default firebase
