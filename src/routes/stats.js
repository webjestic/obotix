/**
 * 
 */

import stats from '../controllers/stats.js'

/**
 * Function accepts a router (ideally a freshly created router) and adds REST methods.
 * Function should be simply handle the route status and response, be evaluating the
 * controllers returned json object.
 * 
 * @param {Object} router 
 * @returns {Object} 
 */
export default function (router) {

    /**
     * /stats 
     */
    router.get('/', (req, res) => {
        const response = stats.getStats(req, res)
        res.status(response.status).json(response.data)
    })

    return router
}