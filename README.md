# obotix - in ALPHA

## Installation
```bash
npm i obotix
```
### Install with scaffold
```bash
npm i -g obotix-cli
obotix-cli create backend my-project
cd my-project
npm i obotix
```

## Useage
```javascript
import obotix from 'obotix'

await obotix.init()
const router = obotix.getRouter()

const log = obotix.getLogger('app:index')
obotix.setLogLevel('trace')

// direct access to the express app instance
// obotix.app

// direct access to express 
// obotix.express

obotix.addRequestMiddleware( (req, res, next) => { next() } )
obotix.addRouter(router)
obotix.addResponseMiddleware( (req, res, next) => { next() } )

obotix.listen( () => {
    log.info(`Service is listening on port ${process.env.OAPI_PORT}.`)
})
```
