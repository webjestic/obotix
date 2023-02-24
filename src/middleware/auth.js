/**
 * 
 */


import ApiKeyCtrl from '../controllers/apikey.js'
import AccountCtrl from '../controllers/account.js'

import logger from '../app/logger.js'
const log = logger.getLogger('obx-mw:auth')

export default async function (req, res, next) {

    const apiKeyCtrl = ApiKeyCtrl()
    const accountCtrl = AccountCtrl()

    try {
        var result = await accountCtrl.verifyToken(req, res)
        if (result.status === 200) {
            req.authuser = result.data
            next()
        } else {
            result = await apiKeyCtrl.verifyApiKey(req, res)
            if (result.status === 200) {
                req.authuser = result.data
                next()
            } else
                res.status(401).json( { status: 401, message: 'Access Denied. Unauthorized User.' } )
        }
    } catch (ex) {
        log.error(ex.message, ex)
    }

}