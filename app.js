/**
 * 
 */

import obotix from './src/index.js'
import fs from 'fs'

await obotix.init()

const log = obotix.getLogger('src:index')
const app = obotix.getApp()

obotix.addMiddleware('accesslog')
obotix.addMiddleware('dbhealth')
obotix.addMiddleware('stats')

obotix.addRoute('/', 'healthz')
obotix.addRoute('/node', 'stats')
obotix.addRoute('/node', 'uuid')

obotix.addMiddleware('notFound')
obotix.addMiddleware('internalError')


const port = process.env.OAPI_PORT || 3000
app.listen(port, () => {
    obotix.sys.displayResources(log)
    let pckg = JSON.parse(fs.readFileSync('package.json', 'utf8'))
    log.info(`${pckg.name} ${pckg.version} is listening on port ${port}. PID: ${process.pid}`)
})