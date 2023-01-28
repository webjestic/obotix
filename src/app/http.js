/**
 * 
 */

import express from 'express'
import logger from './logger.js'
import swaggerUi from 'swagger-ui-express'
import YAML from 'yamljs'


class Http {

    log = logger.getLogger('app:http')
    app = express()


    async init() {
        this.log.debug('Initializing http serivce.')

        this.app.disable('x-powered-by')
        this.app.use(express.json())
        this.app.use(express.urlencoded({ extended: false }))
        this.app.use('/docs', swaggerUi.serve, swaggerUi.setup(YAML.load('config/swagger.yaml')))
    }


    getExpress() { return express }
    getRouter() { return express.Router() }
    getApp() { return this.app }
}


const http = new Http()
export default http
