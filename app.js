
import express from 'express'
import obotix from './src/index.js'

const app = express()
const router = express.Router()

await obotix.mount(app)
const log = obotix.logger.getLogger('app:index')

obotix.addRequestMiddleware( (req, res, next) => { next() } )
obotix.addRouter(router)
obotix.addResponseMiddleware( (req, res, next) => { next() } )

obotix.listen( () => {
    log.info(`Service is listening on port ${process.env.OAPI_PORT}.`)
})
