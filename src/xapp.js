/**
 * 
 */

import express from 'express'

import notFound from './middleware/notFound.js'
import internalError from './middleware/internalError.js'

import healthz from './routes/healthz.js'

var app = undefined


/** Variable Getters */
function getApp() { return app }
function getExpress() { return express }
function getRouter() { return express.Router() }


/**
 * 
 * @returns 
 */
function addUrlEncodedMiddleware() {
    app.disable('x-powered-by')

    var router = getRouter()
    router.use(express.json())
    router.use(express.urlencoded({ extended: false }))
    return router
}


/**
 * 
 * @returns 
 */
function addErrorHandlingMiddleware() {
    var router = getRouter()
    router.use(notFound)
    router.use(internalError)
    return router
}


/**
 * 
 * @returns 
 */
function addHealthzRouter() {
    return healthz(getRouter())
}


/**
 * 
 */
async function init() {
    if (app === undefined) 
        app = express()
}


export default {
    init,
    getApp,
    getExpress,
    getRouter,
    addUrlEncodedMiddleware,
    addErrorHandlingMiddleware,
    addHealthzRouter
}