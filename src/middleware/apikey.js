/**
 * MIDDLEWARE
 *  
 * Responsible for handling all HTTP Status 404 - Not Found
 */

import ApiKeyCtrl from '../controllers/apikey.js'


/**
 *
 * @param {Object} req 
 * @param {Object} res 
 * @param {function} next 
 */
export default async function (req, res, next) {
    const apiKeyCtrl = ApiKeyCtrl()
    if (await apiKeyCtrl.verifyApiKey(req, res) === true)
        next()
    else
        res.status(401).json( { message: 'Unauthorized Api User.' } )
}