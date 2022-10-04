
import mongoose from 'mongoose'
import * as logger from './logger.js'

var log = undefined

export async function connect() {
    log = logger.getLogger('engine:mongo')
    const connstr = `${process.env.OAPI_MONGO}?retryWrites=true&w=majority`

    try {
        await mongoose.connect(connstr)
        log.info(`MongoDB.mongoose connected to ${process.env.NODE_ENV} db.`)
        return true
    } catch (ex) {
        log.error('mongodb.mongoose connect() ERROR:', ex)
        return false
    }
}
  
export function disconnect() {
    log.debug('Disconnecting from mongo database...')
    mongoose.disconnect()
        .then(() => {
            let msg = `MongoDB.mongoose disconnected from ${process.env.NODE_ENV} `
            msg += `${process.env.OAPI_MONGODB_DATABASE}`
            log.info(msg)            
        }).catch((e) => {
            log.error('mongodb.mongoose disconnect() ERROR:', e)
        })
}
  
export function readyState() {
    return mongoose.connection.readyState
}

export default {
    mongoose
}