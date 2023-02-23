/**
 * 
 * https://www.vonage.com/communications-apis/pricing/?icmp=l3nav|l3nav_pricing_novalue
 * https://www.twilio.com/en-us/pricing
 */

import dbcollection from '../models/users.js'
import baseClass from '../app/baseclass.js'
import UsersCtrl from '../controllers/users.js'

import jwt from 'jsonwebtoken'

class AccountClass extends baseClass.ObotixController {

    usersCtrl = undefined

    /**
     * Initialize base class constructor, creating the unique this.log for this instance.
     */
    constructor() {
        super('ctrl:account')
        this.dbconn = dbcollection()
        this.usersCtrl = UsersCtrl()
    }


    // eslint-disable-next-line no-unused-vars
    async verifyToken(req, res) {
        var response = { status: 401, data: {} }
        const token = req.get('x-auth-token')

        if (token === undefined || token === null || token == 'null') return response
      
        try {
            const decoded = jwt.verify(token, process.env.OAPI_CRYPTO_KEY, {algorithm: 'HS512'})
            this.log.debug('decoded token', decoded)
            // req.authuser = decoded 
            response.status = 200
            response.data = decoded
        } catch (ex) {
            this.log.error(ex.message, { stack: ex.stack })
            response.data = ex
        }

        return response
    }


    // eslint-disable-next-line no-unused-vars
    async register(req, res) {
        var response = { status: 200, message: 'OK' }
        var body = this.bodyFromRequest(req.body)

        try {
            if (body.password !== body.passwordRepeat) {
                response.status = 401
                response.message = 'Password does not match passwordRepeat.'
            }
            delete body.passwordRepeat
            if (body.role !== undefined) delete body.role
        } catch (ex) {
            this.log.error(ex.message, { stack: ex.stack })
            throw new Error(ex.message)
        }


        // Check if the document already exits
        try {
            let existingDoc = await this.dbconn.model.find({ username: body.username }).exec()
            if (existingDoc.data !== undefined && Object.keys(existingDoc.data).length > 0) {
                response.status = 400
                response.message = 'Account already exists.'
                return response
            }
        } catch (ex) {
            this.log.error(ex.message, { stack: ex.stack })
            throw new Error(ex.message)
        }

        // Encrypt password for storage
        // Password Requirements
        try {
            const regex = new RegExp('^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z])[a-zA-Z0-9!@#$%^&*]{8,32}$')
            if (regex.test(body.password))
                body.password = this.usersCtrl.createHashKey(body.password)
            else {
                response.status = 400
                response.message = `Password does not meet the strength requirements.
            - Minimum 8 characters
            - Maximum 32 characters
            - At least 1 number
            - At least 1 lower case letter
            - At least 1 upper case letter
            - At least 1 special character of !@#$%^&*`
                return response
            }
        } catch (ex) {
            this.log.error(ex.message, { stack: ex.stack })
            throw new Error(ex.message)
        }

        // Store the data
        try {
            response.data = await this.dbconn.model.create(body)
            response.data = response.data._doc
            delete response.data.password
        } catch (ex) {
            this.log.error(ex.message, { stack: ex.stack })
            throw new Error(ex.message)
        }

        return response
    }


    // eslint-disable-next-line no-unused-vars
    async login(req, res) {
        var response = { status: 200, message: 'OK' }
        var query = this.bodyFromRequest(req.body)
        var projection = { 
            _id: 1, 
            __v: 0
        }

        // retrieve user account document
        try {
            response.data = await this.dbconn.model.find({ email: query.email }, projection).exec()
        } catch (ex) {
            this.log.error(ex.message, { stack: ex.stack })
            throw new Error(ex.message)
        }

        // if no document was found for the user
        try {
            // if (response.data[0]._id === undefined) {
            if (response.data.length <= 0) {
                this.log.debug(`Login Fail: No document for ${query.email}`)
                response.status = 401
                response.message = 'Invalid login attempt; credentials.'
                delete response.data
                return response
            }
        } catch (ex) {
            this.log.error(ex.message, { stack: ex.stack })
            throw new Error(ex.message)
        }

        // singualize document and validate password
        try {
            response.data = response.data[0]
            if (response.data.email === query.email) {
                if (!this.usersCtrl.checkHashKey(query.password, response.data.password)) {
                    this.log.debug(`Login Fail: Passwords do not match for ${req.body.email}`)
                    response.status = 401
                    response.message = 'Invalid login attempt; credentials.'
                    return response
                }
            }
        } catch (ex) {
            this.log.error(ex.message, { stack: ex.stack })
            throw new Error(ex.message)
        }

        // logged in
        try {
            const authToken = response.data.generateAuthToken()
            response.data = {} 
            response.data.auth = authToken
            projection.password = 0
            projection.role = 0
            projection._id = 0
            response.data.account = await this.dbconn.model.find({ email: query.email }, projection).exec()
            response.data.account = response.data.account[0]
            this.log.info(`${response.data.account.username} login.`)
        } catch (ex) {
            this.log.error(ex.message, { stack: ex.stack })
            throw new Error(ex.message)
        }

        return response
    }


    // eslint-disable-next-line no-unused-vars
    async logout (req, res) {
        var response = { status: 200, message: 'OK' }

        try {
            this.log.info(`${req.authuser.username} logout.`)
            req.authuser = undefined
        } catch (ex) {
            this.log.error(ex.message, { stack: ex.stack })
            throw new Error(ex.message)
        }

        return response
    }


    /**
     * Account owner profile. Can only get their own profile.
     * 
     * @param {*} req 
     * @param {*} res 
     * @returns 
     */
    // eslint-disable-next-line no-unused-vars
    async get (req, res) {
        try {
            this.log.debug(`Request AuthUser: ${req.authuser.username}`)
            var response = { status: 200, message: 'OK' }
            var query = { username: req.authuser.username }
        } catch (ex) {
            this.log.error(ex.message, { stack: ex.stack })
            throw new Error(ex.message)
        }

        const projection = { 
            password: 0,
            role: 0,
            __v: 0
        }

        try {
            response.data = await this.dbconn.model.find(query, projection).exec()
            response.data = response.data[0]
        } catch (ex) {
            this.log.error(ex.message, { stack: ex.stack })
            throw new Error(`Exception: See previos ERROR: ${ex.message}`) 
        }

        return response
    }

 
    /**
     * Account owner update. Can only update their own account.
     * @param {*} req 
     * @param {*} res 
     * @returns 
     */
    async put (req, res) {
        try {
            this.log.debug(`Request AuthUser: ${req.authuser.username}`)
            var response = { status: 200, message: 'OK' }
            var body = super.put(req, res)
            var filter = { username: req.authuser.username}
        } catch (ex) {
            this.log.error(ex.message, { stack: ex.stack })
            throw new Error(ex.message)
        }
        
        const options = { 
            projection: {
                _id: 0,
                password: 0,
                role: 0,
                __v: 0
            },
            upsert: true,
            new: true
        }

        try {
            if (body.role !== undefined) delete body.role
            if (body._id !== undefined) delete body._id
            response.data = await this.dbconn.model.findOneAndUpdate(filter, body, options)
        } catch (ex) {
            this.log.error(ex.message, { stack: ex.stack })
            throw new Error (ex.message)
        }

        return response 
    }


    /**
     * Account owner deletion. Can only delete their own account.
     * @param {*} req 
     * @param {*} res 
     * @returns 
     */
    // eslint-disable-next-line no-unused-vars
    async delete (req, res) {
        try {
            this.log.debug(`Request AuthUser: ${req.authuser.username}`)
            var response = { status: 200, message: 'OK' }
            var filter = { username: req.authuser.username }
        } catch (ex) {
            this.log.error(ex.message, { stack: ex.stack })
            throw new Error(ex.message)
        }

        try {
            response.data = await this.dbconn.model.deleteOne(filter).exec()
        } catch (ex) {
            this.log.error(ex.message, { stack: ex.stack })
            throw new Error (ex.message)
        }

        return response 
    }
}


var accountClass = undefined
export default function () {
    if (accountClass === undefined) accountClass = new AccountClass
    return accountClass
}

