/**
 * 
 */

import dbconn from '../models/accesslog.js'
import logger from '../app/logger.js'
import getPaginate from '../app/fn/paginate.js'
const log = logger.getLogger('ctrl:accesslog')


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
                    result.pagelimit = `Page ${req.query.page} | Limit ${paginate.limit}`
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
