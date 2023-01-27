

import fs from 'fs'
import obotix from './src/index.js'
await obotix.init()


const app = obotix.getApp()
const log = obotix.getLogger('main:index')


/** Early Middleware */
app.use(obotix.addUrlEncodedMiddleware())
app.use(obotix.addStatsMiddleware())

/** Routers */
app.use(obotix.addSwaggerRouter())
app.use(obotix.addHealthzRouter())
app.use('/node', obotix.addStatsRouter())
app.use('/node', obotix.addUuidRouter())

/** Late Middleware */
app.use(obotix.addErrorHandlingMiddleware())


var pckg = JSON.parse(fs.readFileSync('package.json', 'utf8'))

const port = process.env.OAPI_PORT || 3000
app.listen(port, () => {
    obotix.system.displayResources(log)
    log.info(`${pckg.name} ${pckg.version} is listening on port ${port}. PID: ${process.pid}`)
})


