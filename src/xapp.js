/**
 * 
 */

import express from 'express'

// SWAGGER DOCUMENTATION
import swaggerUi from 'swagger-ui-express'
import YAML from 'yamljs'
const swaggerDocument = YAML.load('config/swagger.yaml')

/** Middleware */
import notFound from './middleware/notFound.js'
import internalError from './middleware/internalError.js'
import statsMW from './middleware/stats.js'

/** Routes */
import healthz from './routes/healthz.js'
import stats from './routes/stats.js'
import uuid from './routes/uuid.js'


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
function addSwaggerRouter() {
    var router = getRouter()
    router.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
    return router
}


/**
 * 
 * @returns 
 */
function addStatsMiddleware() {
    var router = getRouter()
    router.use(statsMW)
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
 * @returns 
 */
function addUuidRouter() {
    return uuid(getRouter())
}


/**
 * 
 */
function addStatsRouter() {
    return stats(getRouter())
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
    addStatsMiddleware,
    addSwaggerRouter,
    addHealthzRouter,
    addStatsRouter,
    addUuidRouter
}