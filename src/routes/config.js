/**
 * 
 */

import ConfigsCtrl from '../controllers/config.js'
import auth from '../middleware/auth.js'
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
    const configsCtrl = ConfigsCtrl()

    router.get('/config', rateLimit, auth, role(roles.manager), async (req, res) => {
        try {
            const response = await configsCtrl.get(req, res)
            if (response.data !== undefined && response.status === 200) 
                res.status(response.status).json(response.data)
            else 
                res.status(response.status).json(response)
        } catch(ex) {
            throw new Error(ex.message)
        }
    })


    router.put('/config', rateLimit, auth, role(roles.manager), async (req, res) => {
        try {
            const response = await configsCtrl.put(req, res)
            if (response.data !== undefined && response.status === 200) 
                res.status(response.status).json(response.data)
            else 
                res.status(response.status).json(response)
        } catch(ex) {
            throw new Error(ex.message)
        }
    })
    
    return router
}