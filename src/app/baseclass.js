/**
 * 
 */


import logger from '../app/logger.js'

import Joi from 'joi'
import validator from 'validator'

import { EventEmitter} from 'events'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const __modulename = path.basename(__filename)


class ObotixClass {
    _dirname = __dirname
    _filename = __filename
    __modulename = __modulename
    log = undefined

    constructor (namespace) {
        this.log = logger.getLogger(namespace)
    }
}


class ObotixEmitter extends EventEmitter{
    constructor (namespace) {
        super(namespace)
    }
}


class ObotixController extends ObotixClass {

    joi = Joi
    validator = validator
    dbconn = undefined

    response = {
        status: 200,
        message: 'OK'
    }
    

    constructor (namespace) { 
        super(namespace) 
    }


    paginate(req) {
        let paginate = {}

        let limit = Number(req.query.limit) || 100
        let page = Number(req.query.page) || 1
    
        if (limit <= 0) limit = 100
        if (page <= 0) page = 1
    
        if (limit > 1000) limit = 1000
    
        paginate.limit = limit
        paginate.page = (page - 1) * limit
        paginate.pageDisplay = page

        return paginate
    }


    queryFromRequest(queryParams) {
        var query = {}
        if (queryParams !== undefined) {
            for (const [key, value] of Object.entries(queryParams)) {
                if (key.toLowerCase() !== 'page' && key.toLowerCase() !== 'limit')
                    query[key] = value
                    // console.log(`${key}: ${value}`)
            }
        }
        return query
    }


    bodyFromRequest(reqBody) {
        var body = {}
        if (reqBody !== undefined) {
            for (const [key, value] of Object.entries(reqBody)) 
                body[key] = value
                // console.log(`${key}: ${value}`)
        }
        return body
    }


    // eslint-disable-next-line no-unused-vars
    get(req, res) {
        this.log.debug(`get() ${this.dbconn.connection.config.db} ${this.dbconn.model.modelName}`)
        return this.queryFromRequest(req.query)
    }


    // eslint-disable-next-line no-unused-vars
    post(req, res) {
        this.log.debug(`get() ${this.dbconn.connection.config.db} ${this.dbconn.model.modelName}`)
        return this.bodyFromRequest(req.body)
    }


    // eslint-disable-next-line no-unused-vars
    put(req, res) {
        this.log.debug(`get() ${this.dbconn.connection.config.db} ${this.dbconn.model.modelName}`)
        return this.bodyFromRequest(req.body)
    }


    // eslint-disable-next-line no-unused-vars
    delete(req, res) {
        this.log.debug(`get() ${this.dbconn.connection.config.db} ${this.dbconn.model.modelName}`)
        return this.queryFromRequest(req.query)
    }
}


export default {
    ObotixClass,
    ObotixEmitter,
    ObotixController
}