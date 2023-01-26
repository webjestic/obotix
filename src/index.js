/**
 * 
 */

import dotenv from 'dotenv'
import logger from './logger.js'
import db from './db.js'
import config from './config.js'
import logtodb from './logtodb.js'
import xapp from './xapp.js'


var express = undefined
const getApp = xapp.getApp
const getRouter = xapp.getRouter
const addUrlEncodedMiddleware = xapp.addUrlEncodedMiddleware
const addErrorHandlingMiddleware = xapp.addErrorHandlingMiddleware
const addHealthzRouter = xapp.addHealthzRouter
const getLogger = logger.getLogger
const getConfig = config.getConfig


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

    logger,
    getLogger,

    config,
    getConfig,

    db,

    /** exapp */
    express,
    getApp,
    getRouter,
    addUrlEncodedMiddleware,
    addErrorHandlingMiddleware,
    addHealthzRouter
}
