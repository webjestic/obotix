

import obotix from './src/index.js'

await obotix.init()
const router = obotix.getRouter()

const log = obotix.getLogger('app:index')
obotix.setLogLevel('trace')

obotix.addRequestMiddleware( (req, res, next) => { next() } )
obotix.addRouter(router)
obotix.addResponseMiddleware( (req, res, next) => { next() } )

obotix.listen( () => {
    log.info(`Service is listening on port ${process.env.OAPI_PORT}.`)
})
