
import Redis from 'ioredis'
import * as config from './config.js'
import * as logger from './logger.js'

var log = undefined

export var cmd = undefined
export var pub = undefined

export async function connect() {
    log = logger.getLogger('engine:redis')
    if (config.doc.redis.enabled) {
        try {
            cmd = new Redis()
            pub = new Redis()
            log.info('Redis connected and publisher channel open.')
        } catch(err) {
            log.error(err)
        }
    } else 
        log.warn('Redis is NOT Enabled.')
}

