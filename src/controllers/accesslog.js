/**
 * 
 */

import dbcollection from '../models/accesslog.js'
import baseClass from '../app/baseclass.js'


class AccessLogsClass extends baseClass.ObotixController {

    constructor() {
        super('ctrl:accesslog')
        this.dbconn = dbcollection()
    }


    prepareQuery(query) {
        if (query.startDate !== undefined && query.endDate !== undefined) {
            query.timestamp = {
                '$gte': new Date(query.startDate),
                '$lte': new Date(query.endDate)
            }
        }
        if (query.ip !== undefined) query.ip = { '$regex': query.ip, '$options': 'i' } // ip contains
        if (query.svr !== undefined) query.svr = { '$regex': query.svr, '$options': 'i' } 
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
                        var logentry = `${new Date(entry.timestamp).toISOString()} ${entry.ip} ${entry.uid}`
                        logentry = logentry + ` ${entry.access} ${entry.svr} ${entry.apikeyuser}`
                        result.entries.push(logentry)
                        result.returned = Number(key) + 1
                    } catch(ex) {
                        this.log.error(ex)
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


var accessLogsClass = undefined
export default function () {
    if (accessLogsClass === undefined) accessLogsClass = new AccessLogsClass
    return accessLogsClass
}

/*
function getQuery(req) {
    var query = {}
    if (req.query.startDate !== undefined && req.query.endDate !== undefined) {
        query.timestamp = {
            '$gte': new Date(req.query.startDate),
            '$lte': new Date(req.query.endDate)
        }
    }
    if (req.query.ip !== undefined) query.ip = { '$regex': req.query.ip, '$options': 'i' } // ip contains
    if (req.query.svr !== undefined) query.svr = { '$regex': req.query.svr, '$options': 'i' } 
    if (req.query.uid !== undefined) query.uid = req.query.uid
    if (req.query.apikeyuser !== undefined) query.apikeyuser = req.query.apikeyuser
    if (req.query.access !== undefined) query.access = req.query.access
    return query
}


// eslint-disable-next-line no-unused-vars
async function getAccesslogs(req, res) {

    const accesslogs = dbconn()

    const count = await accesslogs.model.count()
    log.debug(`count=${count}`)
    log.debug(req.query)

    let query = getQuery(req)
    let paginate = getPaginate(req)

    return accesslogs.model.find(query).limit(paginate.limit).skip(paginate.page).exec()
        .then(doc => {
            var result = {}
            
            if (req.query.oneline !== undefined) {
                if (req.query.oneline === 'true') {
                    result.dbtotal = count
                    result.pagelimit = `Page ${paginate.pageDisplay} | Limit ${paginate.limit}`
                    result.returned = 0
                    result.entries = []
                    for (const [key, entry] of Object.entries(doc)) {
                        try {
                            var logentry = `${new Date(entry.timestamp).toISOString()} ${entry.ip} ${entry.uid}`
                            logentry = logentry + ` ${entry.access} ${entry.svr} ${entry.apikeyuser}`
                            result.entries.push(logentry)
                            result.returned = Number(key) + 1
                        } catch(ex) {
                            log.error(ex)
                        }
                    }
                } else
                    result = doc
            } else 
                result = doc

            return result
        }).catch(err => {
            log.error(err)
            return err
        })
}


// eslint-disable-next-line no-unused-vars
async function deleteAccessLogs(req, res) {

    const accesslogs = dbconn()

    log.debug('query', req.query)
    var query = getQuery(req)

    // if no parameters were sent, return a rejected promise.
    log.debug(`query length ${Object.keys(query).length}`)
    if ((Object.keys(query).length === 0) && req.query.deleteall === undefined) {
        return new Promise((resolve, reject) => {
            reject({ status: 400, message: 'Query Params Required.'})
        })
    }

    // if the mighty deleteall param was sent, set the query to trash it all.
    if (req.query.deleteall !== undefined && req.query.deleteall === 'true') 
        query = {}
        
    return accesslogs.model.deleteMany(query).exec()
        .then(response => {
            return response
        }).catch(err => {
            log.error(err)
            return err  
        })

}

export default {
    getAccesslogs,
    deleteAccessLogs
}
*/
