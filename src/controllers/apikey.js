/**
 * 
 */

import logger from '../app/logger.js'
import dbcollection from '../models/apikey.js'
import getPaginate from '../app/fn/paginate.js'

const log = logger.getLogger('ctrl:apikey')


/**
 * 
 * @param {Object} req 
 * @param {Object} res 
 * @returns {Object}
 */
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
            if (apikeys.user === apiuser && apikeys.apikey === apikey && apikeys.enabled == true)
                allowAccess = true

            if (apikeys.expirey <= Date.now()) 
                allowAccess = false
        } catch(ex) {
            allowAccess = false
        }
    }

    if (allowAccess) req.apiuser = apikeys
    return allowAccess
}


// eslint-disable-next-line no-unused-vars
function getQuery(req) {
    let query = {}

    if (req.query.enabled !== undefined) {
        if (req.query.enabled === 'true') query.enabled = true
        if (req.query.enabled === 'false') query.enabled = false
    }
    if (req.query.apikey !== undefined)  query.apikey = req.query.apikey 
    if (req.query.user !== undefined) query.user = req.query.user
    if (req.query.isexpired !== undefined) {
        if (req.query.isexpired === 'true') 
            query.expirey = { '$lte': new Date(Date.now()) }   
        
    }
    if (req.query.role !== undefined) query.role = { '$eq': Number(req.query.role) }

    return query
}


function scrubBody(req) {
    var body = {}
    log.debug(req.body)

    if (req.body.apikey !== undefined) body.apikey = req.body.apikey
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
        _id: 0, 
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

    const body = scrubBody(req)

    if (body === false) {
        return new Promise((resolve, reject) => {
            reject({ status: 400, message: 'Invalid document body.'})
        })
    }

    // using await instead of chaining multiple then statements
    // await is NON-BLOCKING for the main interpreter
    const existingDoc = await getApiKey({ query: { apikey: body.apikey, user: body.user }}, {})
    if (existingDoc !== undefined && Object.keys(existingDoc).length > 0) {
        return new Promise((resolve, reject) => {
            reject({ status: 400, message: 'Document already exists.', doc: existingDoc})
        })
    } else {
        return dbconn.model.create(body)
            .then(doc => {
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

    if (req.body.apikey !== undefined && typeof req.body.apikey === 'string')
        var filter = { apikey: req.body.apikey }
    else {
        return new Promise((resolve, reject) => {
            reject({ status: 400, message: 'apikey required for update.'})
        })
    }

    // options.projection will return only the field updates included in req.body plus the _id and filter
    const options = { 
        projection: {
            _id: 0,
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
    if (req.body.user !== undefined && typeof req.body.user === 'string') body.user = req.body.user

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