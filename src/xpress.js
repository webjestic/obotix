
import express from 'express'
import setup from './setup.js'
import logger from './logger.js'

import http_notFound from './middleware/http_notFound.js'
import http_internalError from './middleware/http_internalError.js'

import healthzRoute from './routes/healthz_route.js'

var app = undefined
var log = undefined
var requests = []
var routes = []
var responses = []

async function addRequestMiddleware(middlware) {
    log.trace('addRequestMiddleware')
    if (middlware !== undefined && typeof middlware === 'function')
        requests.push(middlware)
    else 
        log.error('addRequestMiddleware: middleware is undefined or not a function.')
}

async function addRouter(router) {
    log.trace('addRouter')
    if (router !== undefined && typeof router === 'function')
        routes.push(router)
    else 
        log.error('addRouter: router is undefined or not a function.')
}

async function addResponseMiddleware(middlware) {
    log.trace('addResponseMiddleware')
    if (middlware !== undefined && typeof middlware === 'function')
        responses.push(middlware)
    else
        log.error('addResponseMiddleware: middleware is undefined or not a function.')
}

export function updateAppUse(array) {
    for (let fn of array) 
        app.use(fn)
}

function getRouter() {
    return express.Router()
}

async function init()  {
    log = logger.getLogger('obotix:xpress')
    app = express()
    await setup.run()
}

async function mount() {

    //
    app.use(express.json())
    app.use(express.urlencoded({ extended: false }))
    
    app.use('/healthz', healthzRoute(getRouter()))
    updateAppUse(requests)
    updateAppUse(routes)
    updateAppUse(responses)

    //
    app.use(http_notFound)
    app.use(http_internalError)

}

async function listen(callback) {
    await mount()
    app.listen(process.env.OAPI_PORT, () => {
        if (callback !== undefined && typeof callback === 'function')
            callback()
    })
}

export default {
    app,
    express,
    requests,
    responses,
    init,
    listen,
    getRouter,
    addRequestMiddleware,
    addRouter,
    addResponseMiddleware
}
