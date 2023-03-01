/**
 * 
 */

import db from '../app/db.js'
import logger from '../app/logger.js'

const log = logger.getLogger('obx-model:config')
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
            dbconn.schema = new db.mongoose.Schema({ 
                // any: db.mongoose.Schema.Types.Mixed 
                logger: {
                    level: {
                        type: String,
                        enum: ['trace', 'debug', 'info', 'warn', 'error', 'fatal'],
                        required: true,
                        minlength: 4, 
                        maxlength: 6,
                        default: 'info'
                    },
                    logToDb: {
                        enabled: {
                            type: Boolean,
                            required: true,
                            default: true
                        },
                        level: {
                            type: String,
                            enum: ['trace', 'debug', 'info', 'warn', 'error', 'fatal'],
                            required: true,
                            minlength: 4, 
                            maxlength: 6 ,
                            default: 'error'
                        }
                    },
                    accesslog: {
                        enabled: {
                            type: Boolean,
                            required: true,
                            default: true
                        }
                    }
                },
                roles: {
                    guest: {
                        type: Number,
                        required: true,
                        default: 0
                    },
                    member: {
                        type: Number,
                        required: true,
                        default: 1
                    },
                    moderator: {
                        type: Number,
                        required: true,
                        default: 2
                    },
                    manager: {
                        type: Number,
                        required: true,
                        default: 4
                    },
                    admin: {
                        type: Number,
                        required: true,
                        default: 8
                    }
                }
            }, 
            { 
                strict: true 
            })
            dbconn.model = dbconn.connection.model('Config', dbconn.schema)
        } catch(ex) {
            dbconn = undefined
            log.error(ex.message, { stack: ex.stack })
        }
    }
        
    return dbconn
}
