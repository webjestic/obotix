
import mongo from './mongo.js'
import redis from './redis.js'
import logger from './logger.js'
import xpress from './xpress.js'

var config = undefined
var app = undefined //xpress.app
var express = undefined // xpress.express

function setConfig(document) { 
    config = document 
    if (config.logish !== undefined && config.logish.level) 
        logger.setLogLevel(config.logish.level)
}
function getConfig() { return config }

function responseTemplate() {
    return {
        status: 200,
        message: '',
        data: {}
    }
}

async function init() { 
    await xpress.init() 
    app = xpress.app
    express = xpress.express
}

function getLogger(namespace) { return logger.getLogger(namespace) }
function setLogLevel(level) { logger.setLogLevel(level) }

function listen(callback) { xpress.listen(callback) }
function getRouter() { return xpress.getRouter() }
function addRequestMiddleware(middlware) { xpress.addRequestMiddleware(middlware) }
function addRouter(router) { xpress.addRouter(router) }
function addResponseMiddleware(middlware) { xpress.addResponseMiddleware(middlware) }

export default {
    app,
    express,
    mongo,
    redis,
    logger,
    config,
    setConfig,
    getConfig,
    init,
    listen,
    getLogger,
    setLogLevel,
    getRouter,
    addRequestMiddleware,
    addRouter,
    addResponseMiddleware,
    responseTemplate
}