/**
 * 
 */

import obotix from './src/index.js'
import fs from 'fs'

await obotix.init()

const log = obotix.getLogger('src:index')


// Add middleware & Routes here
// ex:
// const app = obotix.getApp()
// app.use('/', myRoute(obotix.getRouter()) )


const port = process.env.OAPI_PORT || 3000
obotix.listen(port, () => {
    obotix.sys.displayResources(log)
    let pckg = JSON.parse(fs.readFileSync('package.json', 'utf8'))
    log.info(`${pckg.name} ${pckg.version} is listening on port ${port}. PID: ${process.pid}`)
})