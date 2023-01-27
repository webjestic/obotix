/**
 * 
 */

import logger from '../logger.js'
import db from '../db.js'

const log = logger.getLogger('ctrl:apikey')

var connDB = undefined
var apikeySchema = undefined
var Apikeys = undefined


/**
 * 
 */
function init() {
    if (connDB === undefined) {
        try {
            connDB = db.getConnFromConnStr(process.env.OAPI_DB_NODE) // mytn.db.conn.mytnNode
            apikeySchema = new db.mongoose.Schema({ any: db.mongoose.Schema.Types.Mixed }, { strict: false })
            Apikeys = connDB.model('Apikey', apikeySchema)
        } catch(ex) {
            log.error(ex)
        }
    }
}


/**
 * 
 * @param {Object} req 
 * @param {Object} res 
 * @returns {Object}
 */
// eslint-disable-next-line no-unused-vars
async function verifyApiKey(req, res) {
    init()

    const apikey = req.header('x-api-key') 
    const apiuser = req.header('x-api-user') 
    let apikeys = undefined
    let allowAccess = false

    log.trace(`Middleware: apikey: API User: ${apiuser} Key: ${apikey}`)

    if (apikey && apiuser) {
        apikeys = await Apikeys.find({ 'user' : apiuser }).exec()
        apikeys = apikeys[0]
        log.debug(apikeys)

        if (apikeys.user === apiuser && apikeys.apikey === apikey && apikeys.enabled == true)
            allowAccess = true

        if (apikeys.expirey <= Date.now()) 
            allowAccess = false
    }

    return allowAccess
}


export default {
    verifyApiKey
}