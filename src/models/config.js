/**
 * 
 */

import db from '../app/db.js'
import logger from '../app/logger.js'

const log = logger.getLogger('model:accesslog')
var dbconn = undefined

export default function () {
    if (dbconn === undefined) {
        dbconn = {
            connection: undefined,
            schema: undefined,
            model: undefined,
            data: undefined,
            onChange: undefined,
        }

        try {
            dbconn.connection = db.getConnFromConnStr(process.env.OAPI_DB_NODE) 
            dbconn.schema = new db.mongoose.Schema({ any: db.mongoose.Schema.Types.Mixed }, { strict: false })
            dbconn.model = dbconn.connection.model('Config', dbconn.schema)
        } catch(ex) {
            log.error(ex)
        }
    }
        
    return dbconn
}
