
import * as logger from './logger.js'

var log = undefined
var requests = []
var routes = []
var responses = []

// eslint-disable-next-line no-unused-vars
export async function addRequestMiddleware(middlware) {
    log.debug('addRequestMiddleware')
    if (middlware !== undefined && typeof middlware === 'function')
        requests.push(middlware)
    else 
        log.error('addRequestMiddleware: middleware is undefined or not a function.')
}

// eslint-disable-next-line no-unused-vars
export async function addRouter(router) {
    log.debug('addRouter')
    if (router !== undefined && typeof router === 'function')
        routes.push(router)
    else 
        log.error('addRouter: router is undefined or not a function.')
}

// eslint-disable-next-line no-unused-vars
export async function addResponseMiddleware(middlware) {
    log.debug('addResponseMiddleware')
    if (middlware !== undefined && typeof middlware === 'function')
        responses.push(middlware)
    else
        log.error('addResponseMiddleware: middleware is undefined or not a function.')
}

function updateAppUse(app, array) {
    for (let fn of array) 
        app.use(fn)
}


// eslint-disable-next-line no-unused-vars
export async function run(app) {
    log = logger.getLogger('obotix:xpress')

    updateAppUse(app, requests)
    updateAppUse(app, routes)
    updateAppUse(app, responses)
}
