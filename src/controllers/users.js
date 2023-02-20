

import dbcollection from '../models/users.js'
import baasClass from '../app/baseclass.js'

import bcrypt from 'bcrypt'


class UsersClass extends baasClass.ObotixController {
    saltRounds = 8

    /**
     * Initialize base class constructor, creating the unique this.log for this instance.
     */
    constructor() {
        super('ctrl:users')
        this.dbconn = dbcollection()
    }
 

    async get (req, res) {
        var response = Object.assign(this.response)
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


    async post (req, res) {
        var response = Object.create(this.response)

        // Filter the input and prepare the body
        const body = super.post(req, res)
        if (Object.keys(body).length <= 0) {
            response.status = 400
            response.message = 'Invalid document body.'
            return response
        }

        // Check if the document already exits
        try {
            let existingDoc = await this.get({ query: { user: body.user } }, {})
            if (existingDoc !== undefined && Object.keys(existingDoc).length > 0) {
                response.status = 400
                response.message = 'Document already exists.'
                response.data = existingDoc
                return response
            }
        } catch (ex) {
            this.log.error(ex.message, ex)
            throw new Error(ex.message)
        }

        // Encrypt password for storage
        const salt = bcrypt.genSaltSync(this.saltRounds)
        body.password = bcrypt.hashSync(body.password, salt)

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


    async put (req, res) {
        var response = Object.create(this.response)
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


    async delete (req, res) {
        var response = Object.create(this.response)
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



export default UsersClass
