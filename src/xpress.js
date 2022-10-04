
import * as logger from './logger.js'

var log = undefined
var requests = []
var routes = []
var responses = []

export async function addRequestMiddleware(middlware) {
    log.debug('addRequestMiddleware')
    if (middlware !== undefined && typeof middlware === 'function')
        requests.push(middlware)
    else 
        log.error('addRequestMiddleware: middleware is undefined or not a function.')
}

export async function addRouter(router) {
    log.debug('addRouter')
    if (router !== undefined && typeof router === 'function')
        routes.push(router)
    else 
        log.error('addRouter: router is undefined or not a function.')
}

export async function addResponseMiddleware(middlware) {
    log.debug('addResponseMiddleware')
    if (middlware !== undefined && typeof middlware === 'function')
        responses.push(middlware)
    else
        log.error('addResponseMiddleware: middleware is undefined or not a function.')
}

export function updateAppUse(app, array) {
    for (let fn of array) 
        app.use(fn)
}

export async function run(app) {
    log = logger.getLogger('obotix:xpress')

    updateAppUse(app, requests)
    updateAppUse(app, routes)
}

export {
    requests,
    responses
}
