/**
 * 
 */

import stats from '../controllers/stats.js'
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

    router.get('/', rateLimit, auth, role(roles.manager), (req, res) => {
        const response = stats.getStats(req, res)
        res.status(response.status).json(response.data)
    })

    return router
}