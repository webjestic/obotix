
import express from 'express'
import obotix from './src/index.js'

const app = express()
await obotix.mount(app)
const log = obotix.logger.getLogger('app:index')

// eslint-disable-next-line no-unused-vars
function reqMW(req, res, next) {
    next()
}

// eslint-disable-next-line no-unused-vars
function resMW(req, res, next) {
    next()
}

obotix.addRequestMiddleware(reqMW)
obotix.addResponseMiddleware(resMW)

app.listen(process.env.OAPI_PORT, () => {
    log.info(`Service is listening on port ${process.env.OAPI_PORT}.`)
})
