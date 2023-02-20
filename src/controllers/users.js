

import dbcollection from '../models/users.js'
import baseClass from '../app/baseclass.js'

import bcrypt from 'bcrypt'


class UsersClass extends baseClass.ObotixController {
    saltRounds = 8

    /**
     * Initialize base class constructor, creating the unique this.log for this instance.
     */
    constructor() {
        super('ctrl:users')
        this.dbconn = dbcollection()
    }


    createHashKey(plainTextApiKey) {
        const salt = bcrypt.genSaltSync(this.saltRounds)
        const hash = bcrypt.hashSync(plainTextApiKey, salt)
        return hash
    }
    
    checkHashKey(plainTextApiKey, hashKey) {
        const result = bcrypt.compareSync(plainTextApiKey, hashKey)
        return result
    }
 

    /**
     * 
     * @param {*} req 
     * @param {*} res 
     * @returns 
     */
    async get (req, res) {
        var response = { status: 200, message: 'OK' }
        const query = super.get(req, res)
        const paginate = this.paginate(req)
        const projection = { 
            _id: 1, 
            password: 0,
            __v: 0
        }

        try {
            response.data = await this.dbconn.model.find(query, projection).limit(paginate.limit).skip(paginate.page).exec()
            return response
        } catch (ex) {
            let msg = 'UserClass.get() threw an exception:'
            this.log.error(msg, ex)
            throw new Error(`Exception: See previos ERROR: ${msg}`) 
        }
    }


    /**
     * 
     * @param {*} req 
     * @param {*} res 
     * @returns 
     */
    async post (req, res) {
        var response = { status: 200, message: 'OK' }

        // Filter the input and prepare the body
        const body = super.post(req, res)
        if (Object.keys(body).length <= 0) {
            response.status = 400
            response.message = 'Invalid document body.'
            return response
        }

        // Check if the document already exits
        try {
            let existingDoc = await this.dbconn.model.find({ username: body.username }).exec()
            if (existingDoc.data !== undefined && Object.keys(existingDoc.data).length > 0) {
                response.status = 400
                response.message = 'Document already exists.'
                response.data = existingDoc.data
                return response
            }
        } catch (ex) {
            this.log.error(ex.message, ex)
            throw new Error(ex.message)
        }

        // Encrypt password for storage
        body.password = this.createHashKey(body.password)

        // Store the data
        try {
            response.data = await this.dbconn.model.create(body)
            response.data = response.data._doc
            delete response.data.password
            return response
        } catch (ex) {
            this.log.error(ex.message, ex)
            throw new Error(ex.message)
        }
    }


    /**
     * 
     * @param {*} req 
     * @param {*} res 
     * @returns 
     */
    async put (req, res) {
        var response = { status: 200, message: 'OK' }
        const body = super.put(req, res)

        if (body._id !== undefined && typeof body._id === 'string')
            var filter = { _id: body._id }
        else {
            response.status = 400
            response.message = '_id required for update.'
            return response
        }
        
        const options = { 
            projection: {
                password: 0,
                __v: 0
            },
            upsert: true,
            new: true
        }

        try {
            response.data = await this.dbconn.model.findOneAndUpdate(filter, body, options)
            return response
        } catch (ex) {
            this.log.error(ex.message, ex)
            throw new Error (ex.message)
        }
    }


    /**
     * 
     * @param {*} req 
     * @param {*} res 
     * @returns 
     */
    async delete (req, res) {
        var response = { status: 200, message: 'OK' }
        const query = super.delete(req, res)

        if ((Object.keys(query).length === 0)) {
            response.status = 400
            response.message = 'Query Params Required.'
            return response
        }

        try {
            this.log.warn(`DELETE: User by ${req.header['x-api-user']}`, query)
            response.data = await this.dbconn.model.deleteMany(query).exec()
            return response
        } catch (ex) {
            this.log.error(ex.message, ex)
            throw new Error (ex.message)
        }
    }
}


var usersClass = undefined
export default function () {
    if (usersClass === undefined) usersClass = new UsersClass
    return usersClass
}
// export default UsersClass
