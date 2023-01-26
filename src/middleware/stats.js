/**
 * MIDDLEWARE
 *  
 * Responsible for handling all HTTP Status 404 - Not Found
 */

import statsCtrl from '../controllers/stats.js'


/**
 *
 * @param {Object} req 
 * @param {Object} res 
 * @param {function} next 
 */
export default function (req, res, next){
    statsCtrl.updateStats(req, res)
    next()
}