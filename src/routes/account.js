
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
    

    router.post('/account/login', rateLimit, auth, role(roles.manager), async (req, res) => {
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


    router.post('/account/register', rateLimit, auth, role(roles.manager), async (req, res) => {
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


    router.get('/account', rateLimit, auth, role(roles.manager), async (req, res) => {
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


    router.put('/account', rateLimit, auth, role(roles.manager), async (req, res) => {
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


    router.delete('/account', rateLimit, auth, role(roles.manager), async (req, res) => {
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