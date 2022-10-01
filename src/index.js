
import setup from './setup.js'
import * as mongo from './mongo.js'
import * as redis from './redis.js'
import * as config from './config.js'
import * as logger from './logger.js'
import * as xpress from './xpress.js'

async function mount(app)  {
    if (app == undefined || app.mountpath === undefined)
        throw new Error('Error: app is not an express object.')
    await setup.run()
    await xpress.run()
}

function addRequestMiddleware(middlware) { xpress.addRequestMiddleware(middlware) }
function addRouter(router) { xpress.addRouter(router) }
function addResponseMiddleware(middlware) { xpress.addResponseMiddleware(middlware) }

export default {
    mount,
    mongo,
    redis,
    config,
    logger,
    addRequestMiddleware,
    addRouter,
    addResponseMiddleware
}