
import express from 'express'
import obotix from './src/index.js'

const app = express()
await obotix.mount(app)
const log = obotix.logger.getLogger('app:index')

app.listen(process.env.OAPI_PORT, () => {
    log.info(`Service is listening on port ${process.env.OAPI_PORT}.`)
})
