/**
 * 
 */

import accesslog from '../controllers/accesslog.js'
import apikey from '../middleware/apikey.js'
import rateLimit from '../middleware/rateLimit.js'

/**
 * Function accepts a router (ideally a freshly created router) and adds REST methods.
 * Function should be simply handle the route status and response, be evaluating the
 * controllers returned json object.
 * 
 * @param {Object} router 
 * @returns {Object} 
 */
export default function (router) {

    // eslint-disable-next-line no-unused-vars
    router.get('/accesslogs', rateLimit, apikey, async (req, res) => {
        accesslog.getAccesslogs(req, res)
            .then(response => {
                res.status(200).json(response)
            }).catch(err => {
                if (err.status !== undefined) res.status(err.status).json(err)
                else res.status(500).json(err)
            })
    })


    // eslint-disable-next-line no-unused-vars
    router.delete('/accesslogs', rateLimit, apikey, async (req, res) => {
        accesslog.deleteAccessLogs(req, res)
            .then(response => {
                res.status(200).json(response)
            }).catch(err => {
                if (err.status !== undefined) res.status(err.status).json(err)
                else res.status(500).json(err)
            })
    })
    
    return router
}