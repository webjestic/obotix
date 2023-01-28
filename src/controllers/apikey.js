/**
 * 
 */

import logger from '../app/logger.js'
import db from '../app/db.js'

const log = logger.getLogger('ctrl:apikey')


var dbconn = {
    connection: undefined,
    schema: undefined,
    model: undefined,
    data: undefined,
}


/**
 * 
 */
function init() {
    if (dbconn.connection === undefined) {
        try {
            dbconn.connection = db.getConnFromConnStr(process.env.OAPI_DB_NODE) // mytn.db.conn.mytnNode
            dbconn.schema = new db.mongoose.Schema({ any: db.mongoose.Schema.Types.Mixed }, { strict: false })
            dbconn.model = dbconn.connection.model('Apikey', dbconn.schema)
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
        apikeys = await dbconn.model.find({ 'user' : apiuser }).exec()
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