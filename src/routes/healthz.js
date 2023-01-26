/**
 * 
 */

import healthz from '../controllers/healthz.js'

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
     * /healthz/live 
     */
    router.get('/live', (req, res) => {
        const response = healthz.liveCheck(req, res)
        res.status(response.status).json(response.data)
    })

    /** 
     * /healthz/ready 
     */
    router.get('/ready', (req, res) => {
        const response = healthz.readyCheck(req, res)
        res.status(response.status).json(response.data)
    })

    return router
}