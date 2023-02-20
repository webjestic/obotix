/**
 * 
 */

import db from '../app/db.js'
import logger from '../app/logger.js'
import jwt from 'jsonwebtoken'

const log = logger.getLogger('model:users')
var dbconn = undefined

export default function () {
    if (dbconn === undefined) {
        dbconn = {
            connection: undefined,
            schema: undefined,
            model: undefined,
        }

        try {
            dbconn.connection = db.getConnFromConnStr(process.env.OAPI_DB_APP) 
            dbconn.schema = new db.mongoose.Schema({ 
                // any: db.mongoose.Schema.Types.Mixed 
                username: {
                    type: String,
                    required: true,
                    minlength: 4,
                    maxlength: 20,
                    unique: true
                },
                email: {
                    type: String,
                    required: true,
                    minlength: 10, // feve@tn.in
                    maxlength: 255,
                    unique: true
                },
                password: {
                    type: String,
                    required: true,
                    minlength: 5,
                    maxlength: 1024
                },
                firstName: {
                    type: String,
                    required: true,
                    minlength: 2,
                    maxlength: 20
                },
                lastName: {
                    type: String,
                    required: true,
                    minlength: 3,
                    maxlength: 30
                },
                dob: {
                    type: Date,
                    required: false,
                    // regex 2018-12-06 
                    // eslint-disable-next-line no-useless-escape
                    match: /^\d{4}[-]\d{2}[-]\d{2}$/
                },
                phone: {
                    type: String,
                    required: false,
                    mixlength: 12,
                    maxlength: 16,
                    // internation phone number regex: +1 740 277 9814
                    // https://regex101.com/
                    match: /^\+\d{1,3}\s\d{3}-\d{3}-\d{4}$/
                },
                role: {
                    type: Number,
                    default: 0
                }
            }, 
            { 
                strict: true 
            })

            dbconn.schema.methods.generateAuthToken = function() { 
                const payload = { _id: this._id, email: this.email }
                const token = jwt.sign(payload, process.env.OAPI_CRYPTO_KEY, { expiresIn: '2h'})
                const refresh = jwt.sign(payload, process.env.OAPI_CRYPTO_KEY, { expiresIn: '4h'})
                log.debug(`_id: ${this._id} email ${this.email}`)
                log.debug('jwt:', token)
                log.debug('rjwt:', refresh)
                return {token: token, refresh: refresh}
            }

            dbconn.model = dbconn.connection.model('User', dbconn.schema)
        } catch(ex) {
            dbconn = undefined
            log.error(ex)
        }
    }
        
    return dbconn
}
