/**
 * 
 */

import dotenv from 'dotenv'
import logger from './logger.js'
import db from './db.js'
import config from './config.js'
import logtodb from './logtodb.js'
import xapp from './xapp.js'
import system from './sys.js'


var express = undefined
const getApp = xapp.getApp
const getRouter = xapp.getRouter
const getLogger = logger.getLogger
const getConfig = config.getConfig

const addErrorHandlingMiddleware = xapp.addErrorHandlingMiddleware
const addHealthzRouter = xapp.addHealthzRouter
const addUrlEncodedMiddleware = xapp.addUrlEncodedMiddleware
const addSwaggerRouter = xapp.addSwaggerRouter
const addStatsMiddleware = xapp.addStatsMiddleware
const addStatsRouter = xapp.addStatsRouter
const addUuidRouter = xapp.addUuidRouter


/**
 * 
 */
async function init() {
    if (express === undefined) {
        express = xapp.getExpress()
        dotenv.config()
        await db.init()
        await config.init()
        logtodb.init()
        await xapp.init()
    }
}


export default {
    init,
    db,

    logger,
    getLogger,

    config,
    getConfig,

    system,

    /** exapp */
    express,
    getApp,
    getRouter,

    addUrlEncodedMiddleware,
    addStatsMiddleware,
    addErrorHandlingMiddleware,
    addHealthzRouter,
    addStatsRouter,
    addSwaggerRouter,
    addUuidRouter
}
