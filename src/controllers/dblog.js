/**
 * 
 */

import dbconn from '../models/dblog.js'
import logger from '../app/logger.js'
import getPaginate from '../app/fn/paginate.js'
const log = logger.getLogger('ctrl:dblog')


function getQuery(req) {
    var query = {}
    if (req.query.startDate !== undefined && req.query.endDate !== undefined) {
        query.timestamp = {
            '$gte': new Date(req.query.startDate),
            '$lte': new Date(req.query.endDate)
        }
    }
    if (req.query.namespace !== undefined) query.namespace = { '$regex': req.query.namespace, '$options': 'i' }
    if (req.query.server !== undefined) query.server = { '$regex': req.query.server, '$options': 'i' } 
    if (req.query.level !== undefined) query.level = req.query.level
    if (req.query.entry !== undefined) query.entry = { '$regex': req.query.entry, '$options': 'i' } 
    
    return query
}


// eslint-disable-next-line no-unused-vars
async function getLogs(req, res) {

    const dblog = dbconn()

    const count = await dblog.model.count()
    log.debug(`count=${count}`)
    log.debug(req.query)

    let query = getQuery(req)
    let paginate = getPaginate(req)

    return dblog.model.find(query).limit(paginate.limit).skip(paginate.page).exec()
        .then(doc => {
            var result = {}
            
            if (req.query.oneline !== undefined) {
                if (req.query.oneline === 'true') {
                    result.count = 0
                    result.entries = []
                    for (const [key, entry] of Object.entries(doc)) {
                        try {
                            var logentry = `[${new Date(entry.timestamp).toISOString()} ${entry.server}]`
                            logentry = logentry + ` ${entry.level.toUpperCase()} ${entry.namespace} ${entry.entry}`
                            result.entries.push(logentry)
                            result.count = Number(key) + 1
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
async function deleteLogs(req, res) {

    const dblog = dbconn()

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
        
    return dblog.model.deleteMany(query).exec()
        .then(response => {
            return response
        }).catch(err => {
            log.error(err)
            return err  
        })

}

export default {
    getLogs,
    deleteLogs
}
