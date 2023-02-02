/**
 * 
 */

import dbconn from '../models/accesslog.js'
import logger from '../app/logger.js'
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

function getPaginate(req) {
    let paginate = {}

    let limit = Number(req.query.limit) || 100
    let page = Number(req.query.page) || 1

    if (limit <= 0) limit = 100
    if (page <= 0) page = 1

    paginate.limit = limit
    paginate.page = (page - 1) * limit
    return paginate
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
                    result.count = 0
                    result.entries = []
                    for (const [key, entry] of Object.entries(doc)) {
                        var logentry = `${new Date(entry.timestamp).toISOString()} ${entry.ip} ${entry.uid}`
                        logentry = logentry + ` ${entry.access} ${entry.svr} ${entry.apikeyuser}`
                        result.entries.push(logentry)
                        result.count = Number(key) + 1
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
function deleteAccessLogs(req, res) {
    
}

export default {
    getAccesslogs,
    deleteAccessLogs
}
