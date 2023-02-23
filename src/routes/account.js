
/**
 * 
 */

import accountCtrl from '../controllers/account.js'
import auth from '../middleware/auth.js'
import rateLimit from '../middleware/rateLimit.js'
import role from '../middleware/role.js'
import config from '../app/config.js'

export default function (router) {

    const roles = config.getConfig().roles
    const account = accountCtrl()
    


    router.post('/account/login', rateLimit, async (req, res) => {
        try {
            const response = await account.login(req, res)
            if (response.data !== undefined && response.status === 200) 
                res.status(response.status).json(response.data)
            else 
                res.status(response.status).json(response)
        } catch(ex) {
            throw new Error(ex.message)
        }
    })


    router.get('/account/logout', rateLimit, auth, role(roles.guest), async (req, res) => {
        try {
            const response = await account.logout(req, res)
            if (response.data !== undefined && response.status === 200) 
                res.status(response.status).json(response.data)
            else 
                res.status(response.status).json(response)
        } catch(ex) {
            throw new Error(ex.message)
        }
    })


    router.post('/account/register', rateLimit, async (req, res) => {
        try {
            const response = await account.register(req, res)
            if (response.data !== undefined && response.status === 200) 
                res.status(response.status).json(response.data)
            else 
                res.status(response.status).json(response)
        } catch(ex) {
            throw new Error(ex.message)
        }
    })


    /**
     * Account owner profile. Can only get their own profile.
     */
    router.get('/account', rateLimit, auth, role(roles.guest), async (req, res) => {
        try {
            const response = await account.get(req, res)
            if (response.data !== undefined && response.status === 200) 
                res.status(response.status).json(response.data)
            else 
                res.status(response.status).json(response)
        } catch(ex) {
            throw new Error(ex.message)
        }
    })


    /**
     * Account owner update. Can only update their own account.
     */
    router.put('/account', rateLimit, auth, role(roles.guest), async (req, res) => {
        try {
            const response = await account.put(req, res)
            if (response.data !== undefined && response.status === 200) 
                res.status(response.status).json(response.data)
            else 
                res.status(response.status).json(response)
        } catch(ex) {
            throw new Error(ex.message)
        }
    })


    /**
     * Account owner delete. Can only delete their own account.
     */
    router.delete('/account', rateLimit, auth, role(roles.guest), async (req, res) => {
        try {
            const response = await account.delete(req, res)
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