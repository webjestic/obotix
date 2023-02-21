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

        if (!token) return response
      
        try {
            const decoded = jwt.verify(token, process.env.OAPI_JWT_KEY, {algorithm: 'HS512'})
            this.log.debug('decoded token', decoded)
            // req.authuser = decoded 
            response.status = 200
            response.data = decoded
        } catch (ex) {
            this.log.error(ex.message, ex)
            response.data = ex
        }

        return response
    }


    async register(req, res) {
        var response = { status: 200, message: 'OK' }

        try {
            if (req.body.password === req.body.passwordRepeat)
                response = await this.post(req, res)
            return response
        } catch (ex) {
            this.log.error(ex.message)
            throw new Error(ex.message)
        }
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
            this.log.error(ex.message)
            throw new Error(ex.message)
        }

        // if no document was found for the user
        try {
            if (response.data[0]._id === undefined) {
                this.log.debug(`Login Fail: No document for ${query.email}`)
                response.status = 401
                response.message = 'Invalid login attempt; credentials.'
                return response
            }
        } catch (ex) {
            this.log.error(ex.message)
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
            this.log.error(ex.message)
            throw new Error(ex.message)
        }

        // logged in
        try {
            projection.password = 0
            projection.role = 0
            projection._id = 0
            response.data = {} 
            response.data.account = await this.dbconn.model.find({ email: query.email }, projection).exec()
            response.data.account = response.data.account[0]
            response.data.auth = response.data.account.generateAuthToken()
            return response
        } catch (ex) {
            this.log.error(ex.message)
            throw new Error(ex.message)
        }

    }


    /**
     * Account owner profile. Can only get their own profile.
     * 
     * @param {*} req 
     * @param {*} res 
     * @returns 
     */
    async get (req, res) {
        var response = { status: 200, message: 'OK' }

        try {
            response = await this.usersCtrl.get(res, req)
        } catch (ex) {
            this.log.error(ex.message, ex)
            throw new Error(ex.message)
        }

        return response
    }



    async post (req, res) {
        var response = { status: 200, message: 'OK' }

        try {
            response = await this.usersCtrl.post(req, res)
        } catch (ex) {
            this.log.error(ex.message, ex)
            throw new Error(ex.message)
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
        var response = { status: 200, message: 'OK' }

        try {
            response = this.usersCtrl.put(req, res)
        } catch (ex) {
            this.log.error(ex.message, ex)
            throw new Error(ex.message)
        }

        return response 
    }


    /**
     * Account owner deletion. Can only delete their own account.
     * @param {*} req 
     * @param {*} res 
     * @returns 
     */
    async delete (req, res) {
        var response = { status: 200, message: 'OK' }

        try {
            response = this.usersCtrl.delete(req, res)
        } catch (ex) {
            this.log.error(ex.message, ex)
            throw new Error(ex.message)
        }

        return response 
    }
}


var accountClass = undefined
export default function () {
    if (accountClass === undefined) accountClass = new AccountClass
    return accountClass
}

