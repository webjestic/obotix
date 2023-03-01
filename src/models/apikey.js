

/**
 * 
 */

import db from '../app/db.js'
import logger from '../app/logger.js'

var dbconn = undefined
const log = logger.getLogger('obx-model:apikey')

export default function () {
    if (dbconn === undefined) {
        dbconn = {
            connection: undefined,
            schema: undefined,
            model: undefined
        }

        try {
            dbconn.connection = db.getConnFromConnStr(process.env.OAPI_DB_NODE) 
            dbconn.schema = new db.mongoose.Schema({ 
                // any: db.mongoose.Schema.Types.Mixed 
                apikey : {
                    type: String,
                    required: true,
                    minlength: 30,   // $2b$08$yIfXox1SGSU3m0X8t3cuB.axsjlbOGTQPslMpBZ59N83nKg0wuGb6
                    maxlength: 80, 
                    unique: true
                },
                username: {
                    type: String,
                    required: true,
                    minlength: 4,   // MyTN-Team
                    maxlength: 20, 
                    unique: false
                },
                expirey: {
                    type: Date,
                    required: true
                },
                enabled: {
                    type: Boolean,
                    required: true
                },
                role: {
                    type: Number,
                    enum: [0, 1, 2, 4, 8],
                    required: true
                }
            }, 
            { 
                strict: true 
            })
            dbconn.model = dbconn.connection.model('Apikey', dbconn.schema)
        } catch(ex) {
            dbconn = undefined
            log.error(ex.message, { stack: ex.stack })
        }
    }
        
    return dbconn
}
