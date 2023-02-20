
/**
 * 
 */

import usersCtrl from '../controllers/users.js'
import apikey from '../middleware/apikey.js'
import rateLimit from '../middleware/rateLimit.js'
import role from '../middleware/role.js'
import config from '../app/config.js'

export default function (router) {

    const roles = config.getConfig().roles
    const users = usersCtrl()
    

    router.get('/users', rateLimit, apikey, role(roles.manager), async (req, res) => {
        try {
            const response = await users.get(req, res)
            if (response.data !== undefined && response.status === 200) 
                res.status(response.status).json(response.data)
            else 
                res.status(response.status).json(response)
        } catch(ex) {
            throw new Error(ex.message)
        }
    })


    router.post('/users', rateLimit, apikey, role(roles.manager), async (req, res) => {
        try {
            const response = await users.post(req, res)
            if (response.data !== undefined && response.status === 200) 
                res.status(response.status).json(response.data)
            else 
                res.status(response.status).json(response)
        } catch(ex) {
            throw new Error(ex.message)
        }
    })


    router.put('/users', rateLimit, apikey, role(roles.manager), async (req, res) => {
        try {
            const response = await users.put(req, res)
            if (response.data !== undefined && response.status === 200) 
                res.status(response.status).json(response.data)
            else 
                res.status(response.status).json(response)
        } catch(ex) {
            throw new Error(ex.message)
        }
    })


    router.delete('/users', rateLimit, apikey, role(roles.manager), async (req, res) => {
        try {
            const response = await users.delete(req, res)
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