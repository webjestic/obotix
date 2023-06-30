/**
 * 
 */

import dbcollection from '../models/apikey.js'
import baseClass from '../app/baseclass.js'

import bcrypt from 'bcrypt'

class ApiKeyClass extends baseClass.ObotixController {

    saltRounds = 8
    // SALT ROUND - TABLE
    // rounds=8 : ~40 hashes/sec
    // rounds=9 : ~20 hashes/sec
    // rounds=10: ~10 hashes/sec
    // rounds=11: ~5  hashes/sec
    // rounds=12: 2-3 hashes/sec
    // rounds=13: ~1 sec/hash
    // rounds=14: ~1.5 sec/hash
    // rounds=15: ~3 sec/hash
    // rounds=25: ~1 hour/hash
    // rounds=31: 2-3 days/hash

    constructor() {
        super('obx-ctrl:apikey')
        this.dbconn = dbcollection()
    }


    createHashKey(plainTextApiKey) {
        const salt = bcrypt.genSaltSync(this.saltRounds)
        const hash = bcrypt.hashSync(plainTextApiKey, salt)
        return hash
    }
    
    checkHashKey(plainTextApiKey, hashKey) {
        const result = bcrypt.compareSync(plainTextApiKey, hashKey)
        return result
    }

    // eslint-disable-next-line no-unused-vars
    async  verifyApiKey(req, res) {
        var response = { status: 401, data: {} }
        const apikey = req.get('x-api-key') 
        const apiuser = req.get('x-api-user') 

        if (!apikey || !apiuser) return response

        try {
            let apiKeyDoc = await this.dbconn.model.find({ 'username' : apiuser }).exec()
            apiKeyDoc = apiKeyDoc[0]
            const rightnow = new Date()
            const expireyDate = new Date(apiKeyDoc.expirey)
            this.log.trace('ApiKey Expirery date:', expireyDate)

            if (apiKeyDoc.username === apiuser && apiKeyDoc.enabled == true) {
                if (expireyDate.getTime() > rightnow.getTime()) {
                    if (this.checkHashKey(apikey, apiKeyDoc.apikey) === true) {
                        response.status = 200
                        response.data = apiKeyDoc
                    }
                }
            }

        } catch (ex) {
            this.log.error(ex.message, { stack: ex.stack })
            response.data = ex
        }

        return response
    }

    // eslint-disable-next-line no-unused-vars
    async  get(req, res) {
        var response = { status: 200, message: 'OK' }
        const query = super.get(req, res)
        const paginate = this.paginate(req)
        const projection = { 
            _id: 1, 
            apikey: 0,
            __v: 0
        }

        if (query.isexpired !== undefined) {
            if (query.isexpired === 'true') 
                query.expirey = { '$lte': new Date(Date.now()) }   
        }
        if (query.role !== undefined) query.role = { '$eq': Number(query.role) }

        try {
            response.data = await this.dbconn.model.find(query, projection).limit(paginate.limit).skip(paginate.page).exec()
            return response
        } catch (ex) {
            this.log.error(ex.message, { stack: ex.stack })
            throw new Error(`Exception: See previos ERROR: ${ex.message}`) 
        }
    }


    async post (req, res) {
        var response = { status: 200, message: 'OK' }

        // Filter the input and prepare the body
        const body = super.post(req, res)
        if (Object.keys(body).length <= 0) {
            response.status = 400
            response.message = 'Invalid document body.'
            return response
        }

        if (body.apikey === undefined ||
            body.username === undefined ||
            body.expirey === undefined ||
            body.role === undefined ||
            body.enabled === undefined) {
            response.status = 400
            response.message = 'Invalid document body.'
            return response
        }

        // Check if the document already exits
        try {
            let existingDoc = await this.dbconn.model.find({ user: body.username }).exec()
            if (existingDoc.data !== undefined && Object.keys(existingDoc.data).length > 0) {
                response.status = 400
                response.message = 'Document already exists.'
                response.data = existingDoc.data
                return response
            }
        } catch (ex) {
            this.log.error(ex.message, { stack: ex.stack })
            throw new Error(ex.message)
        }

        // Encrypt password for storage
        body.apikey = this.createHashKey(body.apikey)

        // Store the data
        try {
            response.data = await this.dbconn.model.create(body)
            response.data = response.data._doc
            delete response.data.apikey
            return response
        } catch (ex) {
            this.log.error(ex.message, { stack: ex.stack })
            throw new Error(ex.message)
        }
    }


    async put (req, res) {
        var response = { status: 200, message: 'OK' }
        const body = super.put(req, res)

        if (body._id !== undefined && typeof body._id === 'string')
            var filter = { _id: body._id }
        else {
            response.status = 400
            response.message = '_id required for update.'
            return response
        }

        const options = { 
            projection: {
                apikey: 0,
                __v: 0
            },
            upsert: true,
            new: true
        }

        try {
            response.data = await this.dbconn.model.findOneAndUpdate(filter, body, options)
            return response
        } catch (ex) {
            this.log.error(ex.message, { stack: ex.stack })
            throw new Error (ex.message)
        }
    }


    async delete (req, res) {
        var response = { status: 200, message: 'OK' }
        const query = super.delete(req, res)

        if ((Object.keys(query).length === 0)) {
            response.status = 400
            response.message = 'Query Params Required.'
            return response
        }

        try {
            this.log.warn(`DELETE: ApiKey by ${req.authuser.username}`, query)
            response.data = await this.dbconn.model.deleteMany(query).exec()
            return response
        } catch (ex) {
            this.log.error(ex.message, { stack: ex.stack })
            throw new Error (ex.message)
        }
    }

}


var apiKey = undefined
export default function () {
    if (apiKey === undefined) apiKey = new ApiKeyClass()
    return apiKey
}
