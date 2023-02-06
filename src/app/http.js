/**
 * 
 */

import express from 'express'
import logger from './logger.js'
import swaggerUi from 'swagger-ui-express'
import YAML from 'yamljs'
import 'express-async-errors'

import statsmw from '../middleware/stats.js'
import internalError from '../middleware/internalError.js'
import notFound from '../middleware/notFound.js'
import accesslog from '../middleware/accesslog.js'
import dbhealth from '../middleware/dbhealth.js'

import healthz from '../routes/healthz.js'
import stats from '../routes/stats.js'
import uuid from '../routes/uuid.js'
import configRoute from '../routes/config.js'
import apikeyRoute from '../routes/apikey.js'
import accesslogRoute from '../routes/accesslog.js'
import logRoute from '../routes/dblog.js'


class Http {

    log = logger.getLogger('app:http')
    app = express()


    async init() {
        this.log.debug('Initializing http serivce.')

        this.app.disable('x-powered-by')
        this.app.use(express.json())
        this.app.use(express.urlencoded({ extended: false }))

        this.app.use('/docs', swaggerUi.serve, swaggerUi.setup(YAML.load('config/swagger.yaml')))

        this.app.use(dbhealth)
        this.app.use(accesslog)
        this.app.use(statsmw)

        this.app.use('/', healthz(this.getRouter()))
        this.app.use('/node', stats(this.getRouter()))
        this.app.use('/node', uuid(this.getRouter()))
        this.app.use('/node', configRoute(this.getRouter()))
        this.app.use('/node', apikeyRoute(this.getRouter()))
        this.app.use('/node', accesslogRoute(this.getRouter()))
        this.app.use('/node', logRoute(this.getRouter()))
    }


    getExpress() { return express }
    getRouter() { return express.Router() }
    getApp() { return this.app }


    listen(port, callback) {
        this.app.use(notFound)
        this.app.use(internalError)

        this.app.listen(port, callback)
    }
}


const http = new Http()
export default http
