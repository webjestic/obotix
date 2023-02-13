/**
 * 
 */

import logger from '../app/logger.js'
import dbcollection from '../models/apikey.js'
import getPaginate from '../app/fn/paginate.js'

import bcrypt from 'bcrypt'

const log = logger.getLogger('ctrl:apikey')
const saltRounds = 8

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



async function createHashKey(plainTextApiKey) {
    const salt = bcrypt.genSaltSync(saltRounds)
    const hash = bcrypt.hashSync(plainTextApiKey, salt)
    return hash
}

async function checkHashKey(plainTextApiKey, hashKey) {
    const result = bcrypt.compareSync(plainTextApiKey, hashKey)
    return result
}


// eslint-disable-next-line no-unused-vars
async function verifyApiKey(req, res) {
    const dbconn = dbcollection()

    const apikey = req.header('x-api-key') 
    const apiuser = req.header('x-api-user') 
    let apikeys = undefined
    let allowAccess = false

    log.trace(`Middleware: apikey: API User: ${apiuser} Key: ${apikey}`)

    if (apikey && apiuser) {
        apikeys = await dbconn.model.find({ 'user' : apiuser }).exec()
        apikeys = apikeys[0]
        log.debug(apikeys)

        try {
            const rightnow = new Date()
            const expireyDate = new Date(apikeys.expirey)
            if (apikeys.user === apiuser && apikeys.enabled == true) {
                if (expireyDate.getTime() > rightnow.getTime()) {
                    if (checkHashKey(apikey, apikeys.apikey))
                        allowAccess = true
                }
            }

        } catch(ex) {
            allowAccess = false
        }
    }

    if (allowAccess) 
        req.apiuser = apikeys

    return allowAccess
}


// eslint-disable-next-line no-unused-vars
function getQuery(req) {
    let query = {}

    if (req.query.enabled !== undefined) {
        if (req.query.enabled === 'true') query.enabled = true
        if (req.query.enabled === 'false') query.enabled = false
    }
    if (req.query.user !== undefined) query.user = req.query.user
    if (req.query.isexpired !== undefined) {
        if (req.query.isexpired === 'true') 
            query.expirey = { '$lte': new Date(Date.now()) }   
        
    }
    if (req.query.role !== undefined) query.role = { '$eq': Number(req.query.role) }

    return query
}


async function scrubBody(req) {
    var body = {}
    log.debug(req.body)

    if (req.body.apikey !== undefined) body.apikey = await createHashKey(req.body.apikey)
    if (req.body.user !== undefined) body.user = req.body.user 
    if (req.body.expirey !== undefined) body.expirey = req.body.expirey
    if (req.body.enabled !== undefined) {
        if (req.body.enabled === true) body.enabled = true
        if (req.body.enabled === false) body.enabled = false
    }
    if (req.body.role !== undefined) body.role = req.body.role

    if (body.apikey === undefined ||
        body.user === undefined ||
        body.expirey === undefined ||
        body.role === undefined ||
        body.enabled === undefined)
        body = false

    return body
}


// eslint-disable-next-line no-unused-vars
async function getApiKey(req, res) {
    const dbconn = dbcollection()

    let query = getQuery(req)
    let paginate = getPaginate(req)

    const projection = { 
        _id: 1, 
        apikey: 0,
        __v: 0
    }

    return dbconn.model.find(query, projection).limit(paginate.limit).skip(paginate.page).exec()
        .then(doc => {
            return doc
        }).catch(err => {
            log.error(err)
            return err
        })
}


// eslint-disable-next-line no-unused-vars
async function postApiKey(req, res) {
    const dbconn = dbcollection()

    const body = await scrubBody(req)

    if (body === false) {
        return new Promise((resolve, reject) => {
            reject({ status: 400, message: 'Invalid document body.'})
        })
    }

    // using await instead of chaining multiple then statements
    // await is NON-BLOCKING for the main interpreter
    const existingDoc = await getApiKey({ query: { user: body.user }}, {})
    if (existingDoc !== undefined && Object.keys(existingDoc).length > 0) {
        return new Promise((resolve, reject) => {
            reject({ status: 400, message: 'Document already exists.', doc: existingDoc})
        })
    } else {
        return dbconn.model.create(body)
            .then(doc => {
                var newdoc = doc._doc
                delete newdoc.apikey
                return doc
            }).catch(err => {
                log.errpr(err)
                return err
            })
    }


}


// eslint-disable-next-line no-unused-vars
async function putApiKey(req, res) {
    const dbconn = dbcollection()

    if (req.body._id !== undefined && typeof req.body._id === 'string')
        var filter = { _id: req.body._id }
    else {
        return new Promise((resolve, reject) => {
            reject({ status: 400, message: '_id required for update.'})
        })
    }

    // options.projection will return only the field updates included in req.body plus the _id and filter
    const options = { 
        projection: {
            apikey: 0,
            __v: 0
        },
        upsert: true,
        new: true
    }

    var body = {}
    if (req.body.enabled !== undefined && typeof req.body.enabled === 'boolean') body.enabled = req.body.enabled
    if (req.body.expirey !== undefined) {
        let x = new Date(req.body.expirey)
        if (x instanceof Date && !isNaN(x)) body.expirey = req.body.expirey
    }
    if (req.body.role !== undefined && typeof req.body.role === 'number' ) body.role = req.body.role
    // if (req.body.user !== undefined && typeof req.body.user === 'string') body.user = req.body.user

    // Mongoose Doc: https://mongoosejs.com/docs/tutorials/findoneandupdate.html
    return dbconn.model.findOneAndUpdate(filter, body, options)
        .then(result => {
            return result
        }).catch(err => {
            log.error(err)
            return err
        })
}


// eslint-disable-next-line no-unused-vars
async function deleteApiKey(req, res) {
    const dbconn = dbcollection()

    log.debug('query', req.query)
    var query = getQuery(req)

    // if no parameters were sent, return a rejected promise.
    log.debug(`query length ${Object.keys(query).length}`)
    if ((Object.keys(query).length === 0)) {
        return new Promise((resolve, reject) => {
            reject({ status: 400, message: 'Query Params Required.'})
        })
    }

    
    log.fatal(`DELETE: ApiKey by ${req.header['x-api-user']}`, query)
    return dbconn.model.deleteMany(query).exec()
        .then(response => {
            log.warn('DELETE: Success', response)
            return response
        }).catch(err => {
            log.error(err)
            return err  
        })

}


export default {
    verifyApiKey,
    postApiKey,
    deleteApiKey,
    putApiKey,
    getApiKey
}