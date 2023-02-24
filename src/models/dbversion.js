/**
 * 
 */

import db from '../app/db.js'
import logger from '../app/logger.js'

const log = logger.getLogger('obx-model:dbversion')
var dbconn = undefined

export default function () {
    if (dbconn === undefined) {
        dbconn = {
            connection: undefined,
            schema: undefined,
            model: undefined
        }

        // Example Document
        // {
        //     "_id": {"$oid":"63ea8071104e5441f7137685"},
        //     "db": "dev-obx-node",
        //     "version": "01.41.111",
        //     "state": "inProgress",
        //     "updatedBy": "A074709.local",
        //     "startTime": "2/13/2023, 1:11:14 PM",
        //     "endTime": ""
        // }
        try {
            dbconn.connection = db.getConnFromConnStr(process.env.OAPI_DB_NODE) 
            dbconn.schema = new db.mongoose.Schema({ 
                // any: db.mongoose.Schema.Types.Mixed 
                verid : {
                    type: String,
                    required: true,
                    minlength: 10,   // MyTN-Node0.2.5
                    maxlength: 40, 
                    unique: true
                },
                db: {
                    type: String,
                    required: true,
                    minlength: 4,   // MyTN
                    maxlength: 20, 
                    unique: false
                },
                version: {
                    type: String,
                    required: true,
                    minlength: 5, // 0.0.0 to 000.000.000.000
                    maxlength: 16,
                    unique: false
                },
                state: {
                    type: String,
                    enum: ['inProgress', 'Complete', 'inError'],
                    required: true,
                    minlength: 6, // inError
                    maxlength: 20 
                },
                updatedBy: {
                    type: String,
                    required: true,
                    minlength: 6, // A074709.local
                    maxlength: 128 
                },
                startTime: {
                    type: Date,
                    required: true
                },
                endTime: {
                    type: Date,
                    required: false
                },
            }, 
            { 
                strict: true 
            })
            
            dbconn.model = dbconn.connection.model('Dbversion', dbconn.schema)
        } catch(ex) {
            dbconn = undefined
            log.error(ex)
        }
    }
        
    return dbconn
}
