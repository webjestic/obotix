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
                    unique: true,
                    match: /^[a-z0-9]{4,16}$/
                },
                email: {
                    type: String,
                    required: true,
                    minlength: 10, // feve@tn.in
                    maxlength: 255,
                    unique: true,
                    // eslint-disable-next-line no-useless-escape
                    match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/

                },
                password: {
                    // password stored as a bcrypt hash value
                    type: String,
                    required: true,
                    minlength: 5,
                    maxlength: 1024
                },
                firstName: {
                    type: String,
                    required: true,
                    minlength: 2,
                    maxlength: 20,
                    match: /^[a-zA-Z]{2,20}$/
                },
                lastName: {
                    type: String,
                    required: true,
                    minlength: 3,
                    maxlength: 30,
                    match: /^[a-zA-Z]{3,30}$/
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
                    default: 0,
                    enum: [0, 1, 2, 4, 8]
                }
            }, 
            { 
                strict: true 
            })

            dbconn.schema.methods.generateAuthToken = function() { 
                const payload = { _id: this._id, username: this.username, email: this.email, role: this.role  }
                const token = jwt.sign(payload, process.env.OAPI_CRYPTO_KEY, { algorithm: 'HS512', expiresIn: '9h'})
                const refresh = jwt.sign(payload, process.env.OAPI_CRYPTO_KEY, { algorithm: 'HS512', expiresIn: '12h'})
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
