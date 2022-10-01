
import Redis from 'ioredis'
import * as logger from './logger.js'

var log = undefined

export var cmd = undefined
export var pub = undefined

export async function connect() {
    log = logger.getLogger('engine:redis')
    try {
        cmd = new Redis()
        pub = new Redis()
        log.info('Redis connected and publisher channel open.')
    } catch(err) {
        log.error(err)
    }
}

