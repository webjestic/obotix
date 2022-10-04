
import setup from './setup.js'
import * as mongo from './mongo.js'
import * as redis from './redis.js'
import * as logger from './logger.js'
import * as xpress from './xpress.js'

var obotixApp = undefined
var config = undefined

async function mount(app)  {
    if (app == undefined || app.mountpath === undefined)
        throw new Error('Error: app is not an express object.')
    obotixApp = app
    await setup.run()
    await xpress.run()
}

function listen(callback) {
    xpress.updateAppUse(obotixApp, xpress.responses)
    obotixApp.listen(process.env.OAPI_PORT, () => {
        if (callback !== undefined && typeof callback === 'function')
            callback()
    })
}

function addRequestMiddleware(middlware) { xpress.addRequestMiddleware(middlware) }
function addRouter(router) { xpress.addRouter(router) }
function addResponseMiddleware(middlware) { xpress.addResponseMiddleware(middlware) }

function assignConfig(document) { config = document}

export default {
    mount,
    listen,
    assignConfig,
    mongo,
    redis,
    config,
    logger,
    addRequestMiddleware,
    addRouter,
    addResponseMiddleware
}