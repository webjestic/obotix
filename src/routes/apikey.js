/**
 * 
 */

import ApiKeyCtrl from '../controllers/apikey.js'
import apikey from '../middleware/apikey.js'
import rateLimit from '../middleware/rateLimit.js'
import role from '../middleware/role.js'
import config from '../app/config.js'

/**
 * Function accepts a router (ideally a freshly created router) and adds REST methods.
 * Function should be simply handle the route status and response, be evaluating the
 * controllers returned json object.
 * 
 * @param {Object} router 
 * @returns {Object} 
 */
export default function (router) {

    const roles = config.getConfig().roles
    const apiKeyCtrl = ApiKeyCtrl()

    router.get('/apikey', rateLimit, apikey, role(roles.manager), async (req, res) => {
        try {
            const response = await apiKeyCtrl.get(req, res)
            if (response.data !== undefined) res.status(response.status).json(response.data)
            else res.status(response.status).json(response)
        } catch(ex) {
            res.status(500).json(ex)
        }
    })


    router.post('/apikey', rateLimit, apikey, role(roles.manager), async (req, res) => {
        try {
            const response = await apiKeyCtrl.post(req, res)
            if (response.data !== undefined) res.status(response.status).json(response.data)
            else res.status(response.status).json(response)
        } catch(ex) {
            res.status(500).json(ex)
        }
    })


    router.put('/apikey', rateLimit, apikey, role(roles.manager), async (req, res) => {
        try {
            const response = await apiKeyCtrl.put(req, res)
            if (response.data !== undefined) res.status(response.status).json(response.data)
            else res.status(response.status).json(response)
        } catch(ex) {
            res.status(500).json(ex)
        }
    })


    router.delete('/apikey', rateLimit, apikey, role(roles.manager), async (req, res) => {
        try {
            const response = await apiKeyCtrl.delete(req, res)
            if (response.data !== undefined) res.status(response.status).json(response.data)
            else res.status(response.status).json(response)
        } catch(ex) {
            res.status(500).json(ex)
        }
    })

    
    return router
}