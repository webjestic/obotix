
import Redis from 'ioredis'
import logger from './logger.js'

var log = undefined

var connection = undefined
var pubChannel = undefined

async function connect() {
    log = logger.getLogger('obotix:redis')
    if (process.env.OAPI_REDIS !== undefined) {
        try {
            connection = new Redis(process.env.OAPI_REDIS)
            pubChannel = new Redis(process.env.OAPI_REDIS)
            log.info('Redis connected and publisher channel opened.')
        } catch(err) {
            log.error(err)
        }
    } else
        log.warn('OAPI_REDIS is undefined.')
}

export default {
    Redis,
    connection,
    pubChannel,
    connect
}
