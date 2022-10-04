
import Redis from 'ioredis'
import * as logger from './logger.js'

var log = undefined

export var cmd = undefined
export var pub = undefined

export async function connect() {
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

