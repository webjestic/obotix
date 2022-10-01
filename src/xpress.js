
import * as logger from './logger.js'

var log = undefined
var requests = []
var routes = []
var responses = []

// eslint-disable-next-line no-unused-vars
export async function addRequestMiddleware(middlware) {
    log.debug('addRequestMiddleware')
    requests.push(middlware)
}

// eslint-disable-next-line no-unused-vars
export async function addRouter(router) {
    log.debug('addRouter')
    routes.push(router)
}

// eslint-disable-next-line no-unused-vars
export async function addResponseMiddleware(middlware) {
    log.debug('addResponseMiddleware')
    responses.push(middlware)
}

function populateUse(app, array) {
    for (let fn of array) 
        app.use(fn)
}

// eslint-disable-next-line no-unused-vars
export async function run(app) {
    log = logger.getLogger('obotix:xpress')
    populateUse(app, requests)
    populateUse(app, routes)
    populateUse(app, responses)
}
