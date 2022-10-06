
import env from './env.js'
import mongo from './mongo.js'
import redis from './redis.js'

async function run() {
    env.load()
    await mongo.connect()
    redis.connect()
}

export default {
    run
}