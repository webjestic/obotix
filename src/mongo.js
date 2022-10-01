
import mongoose from 'mongoose'

export async function connect() {

    let connstr = `mongodb+srv://${process.env.OAPI_MONGODB_USERNAME}:${process.env.OAPI_MONGODB_PASSWORD}`
    connstr += `@${process.env.OAPI_MONGODB_SERVER}/${process.env.OAPI_MONGODB_DATABASE}?retryWrites=true&w=majority`

    try {
        await mongoose.connect(connstr)
        console.info(`MongoDB.mongoose connected to ${process.env.OAPI_MONGODB_DATABASE}`)
        return true
    } catch (ex) {
        console.error('mongodb.mongoose connect() ERROR:', ex)
        return false
    }
}
  
export function disconnect() {
    console.debug('Disconnecting from mongo database...')
    mongoose.disconnect()
        .then(() => {
            let msg = `MongoDB.mongoose disconnected from ${process.env.OAPI_MONGODB_SERVER} `
            msg += `${process.env.OAPI_MONGODB_DATABASE}`
            console.info(msg)            
        }).catch((e) => {
            console.error('mongodb.mongoose disconnect() ERROR:', e)
        })
}
  
export function readyState() {
    return mongoose.connection.readyState
}

export default {
    mongoose
}