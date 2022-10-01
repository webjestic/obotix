
import env from './env.js'
import * as mongo from './mongo.js'
import * as config from './config.js'
import * as redis from './redis.js'

// import * as redis from './redis.js'

async function run() {
    env.load()
    await mongo.connect()
    await config.load()
    redis.connect()
}

export default {
    run
}