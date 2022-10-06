
import Redis from 'ioredis'
import logger from './logger.js'

var log = undefined

var cmd = undefined
var pub = undefined

async function connect() {
    log = logger.getLogger('engine:redis')
    if (process.env.OAPI_REDIS !== undefined) {
        try {
            cmd = new Redis(process.env.OAPI_REDIS)
            pub = new Redis(process.env.OAPI_REDIS)
            log.info('Redis connected and publisher channel open.')
        } catch(err) {
            log.error(err)
        }
    } else
        log.warn('OAPI_REDIS is undefined.')
}

export default {
    cmd,
    pub,
    connect
}
