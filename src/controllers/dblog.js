/**
 * 
 */

import dbcollection from '../models/dblog.js'
import baseClass from '../app/baseclass.js'


class DbLogClass extends baseClass.ObotixController {

    constructor() {
        super('ctrl:dblog')
        this.dbconn = dbcollection()
    }

    prepareQuery(query) {
        if (query.startDate !== undefined && query.endDate !== undefined) {
            query.timestamp = {
                '$gte': new Date(query.startDate),
                '$lte': new Date(query.endDate)
            }
        }
        if (query.namespace !== undefined) query.namespace = { '$regex': query.namespace, '$options': 'i' }
        if (query.server !== undefined) query.server = { '$regex': query.server, '$options': 'i' } 
        if (query.entry !== undefined) query.entry = { '$regex': query.entry, '$options': 'i' } 

        return query
    }


    async get (req, res) {
        var response = { status: 200, message: 'OK' }
        var query = super.get(req, res)
        query = this.prepareQuery(query)

        try {
            var count = await this.dbconn.model.count()
            var paginate = this.paginate(req)
        } catch (ex) {
            this.log.error(ex.message, ex)
            throw new Error(ex.message)
        }

        if (query.oneline !== undefined) {
            var oneline = query.oneline
            delete query.oneline
        }

        try { 
            var doc = await this.dbconn.model.find(query).limit(paginate.limit).skip(paginate.page).exec()
        } catch (ex) {
            this.log.error(ex.message, ex)
            throw new Error(ex.message)
        }

        var result = {}
        if (oneline !== undefined) {
            if (oneline === 'true') {
                result.count = count
                result.pagelimit = `Page ${paginate.pageDisplay} | Limit ${paginate.limit}`
                result.returned = 0
                result.entries = []
                for (const [key, entry] of Object.entries(doc)) {
                    try {
                        var logentry = `[${new Date(entry.timestamp).toISOString()} ${entry.server}]`
                        logentry = logentry + ` ${entry.level.toUpperCase()} ${entry.namespace} ${entry.entry}`
                        result.entries.push(logentry)
                        result.returned = Number(key) + 1
                    } catch(ex) {
                        this.log.error(ex.message, ex)
                        throw new Error(ex.message)
                    }
                }
            } else
                result = doc
        } else 
            result = doc

        response.data = result
        return response
    }


    async delete (req, res) {
        var response = { status: 200, message: 'OK' }
        var query = super.delete(req, res)
        query = this.prepareQuery(query)

        // if no parameters were sent, return a rejected promise.
        this.log.debug(`query length ${Object.keys(query).length}`)
        if ((Object.keys(query).length === 0) && query.deleteall === undefined) {
            response.status = 400
            response.message = 'Query Params Required.'
            return response
        }

        // if the mighty deleteall param was sent, set the query to trash it all.
        if (query.deleteall !== undefined && query.deleteall === 'true') 
            query = {}
        
        try {
            response.data = await this.dbconn.model.deleteMany(query).exec()
        } catch (ex) {
            this.log.error(ex.message, ex)
            throw new Error(ex.message)
        }

        return response
    }
}


var dblogClass = undefined
export default function () {
    if (dblogClass === undefined) dblogClass = new DbLogClass
    return dblogClass
}
