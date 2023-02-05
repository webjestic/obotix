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
        if (req.query.isexpired === 'true') {
            // var today = (new Date(Date.now())).toLocale/DateString()
            // today = today.substring(0, today.indexOf('T'))
            query.expirey = { '$lte': new Date(Date.now()) }   
        }
    }

    return query
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
            return doc[0]
        }).catch(err => {
            log.error(err)
            return err
        })
}


// eslint-disable-next-line no-unused-vars
async function putApiKey(req, res) {
    const dbconn = dbcollection()
}


// eslint-disable-next-line no-unused-vars
async function postApiKey(req, res) {
    const dbconn = dbcollection()
}


// eslint-disable-next-line no-unused-vars
async function deleteApiKey(req, res) {
    const dbconn = dbcollection()
}


export default {
    verifyApiKey,
    postApiKey,
    deleteApiKey,
    putApiKey,
    getApiKey
}