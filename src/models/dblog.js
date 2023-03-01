

/**
 * 
 */

import db from '../app/db.js'
import logger from '../app/logger.js'

const log = logger.getLogger('obx-model:dblog')
var dbconn = undefined

export default function () {
    if (dbconn === undefined) {
        dbconn = {
            connection: undefined,
            schema: undefined,
            model: undefined,
        }

        try {
            dbconn.connection = db.getConnFromConnStr(process.env.OAPI_DB_NODE) 
            dbconn.schema = new db.mongoose.Schema({ any: db.mongoose.Schema.Types.Mixed }, { strict: false })
            dbconn.model = dbconn.connection.model('Log', dbconn.schema)
        } catch(ex) {
            dbconn = undefined
            log.error(ex.message, { stack: ex.stack })
        }
    }
        
    return dbconn
}