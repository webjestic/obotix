

import obotix from './src/index.js'
await obotix.init()


const app = obotix.getApp()
const log = obotix.getLogger('main:index')

app.use(obotix.addUrlEncodedMiddleware())
app.use(obotix.addHealthzRouter())

// add routers here

app.use(obotix.addErrorHandlingMiddleware())


const port = process.env.OAPI_PORT || 3000
app.listen(port, () => {
    log.info(`HTTP Server is listening on port ${port}. PID:${process.pid}`)
})


