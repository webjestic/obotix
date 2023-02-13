

/**
 * 
 */

import db from '../app/db.js'

var dbconn = undefined

export default function () {
    if (dbconn === undefined) {
        dbconn = {
            connection: undefined,
            schema: undefined,
            model: undefined
        }

        try {
            dbconn.connection = db.getConnFromConnStr(process.env.OAPI_DB_NODE) 
            dbconn.schema = new db.mongoose.Schema({ any: db.mongoose.Schema.Types.Mixed }, { strict: false })
            dbconn.model = dbconn.connection.model('Apikey', dbconn.schema)
        } catch(ex) {
            this.log.error(ex)
        }
    }
        
    return dbconn
}

// userSchema.methods.generateAuthToken = function() { 
//     const token = jwt.sign({ _id: this._id, role: this.role }, process.env.OAPI_JWT_KEY)
//     log.debug('_id:', this._id)
//     log.debug('role:', this.role)
//     log.debug('jwt:', token)
//     return token
// }