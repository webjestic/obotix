
import env from './env.js'
import * as mongo from './mongo.js'
import * as redis from './redis.js'

async function run() {
    env.load()
    await mongo.connect()
    redis.connect()
}

export default {
    run
}