
import mongo from './mongo.js'
import redis from './redis.js'
import logger from './logger.js'
import xpress from './xpress.js'

var config = undefined
var app = undefined //xpress.app
var express = undefined // xpress.express

function setConfig(document) { config = document}

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
    config,
    logger,
    init,
    listen,
    setConfig,
    getLogger,
    setLogLevel,
    getRouter,
    addRequestMiddleware,
    addRouter,
    addResponseMiddleware
}