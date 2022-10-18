
import mongo from '../mongo.js'

export default function (router) {

    router.get('/live', (req, res) => {
        res.status(200).json({status: 'OK'})
    })

    router.get('/ready', (req, res) => {
        res.status(200).json({status: 'OK', ready: mongo.readyState()})
    })

    return router
}