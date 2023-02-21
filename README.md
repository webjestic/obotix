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

## Rate Limit

Rate limiter is added to specific routes that deal with heavy processing, such as DB or IO. </br>
rateLimit is param middleware.
```javascript

import obotix from 'obotix'
const rateLimit = obotix.getMiddleware('rateLimit')

router.post('/', rateLimit, async (req, res) => {
    // read write DB
}
```

## ApiKey

Auth is added to specific routes that require it. </br>
auth is param middleware.
```javascript

import obotix from 'obotix'
const rateLimit = obotix.getMiddleware('rateLimit')
const rateLimit = obotix.getMiddleware('apiKey')

router.put('/', rateLimit, apikey, async (req, res) => {

    console.log( req.apiuser.user )
    console.log( req.apiuser.apikey )
    console.log( req.apiuser.role )
    console.log( req.apiuser.expiery )

    // execute auth required code
    // read write DB
}
```

## Roles
Roles is added to specific routes that require it. </br>
Roles is param middleware.
```javascript

import obotix from 'obotix'
const rateLimit = obotix.getMiddleware('rateLimit')
const apikey = obotix.getMiddleware('apiKey')
const role = obotix.getMiddleware('role')
const roles = obotix.getConfig().roles

router.get('/', rateLimit, apikey, role(roles.manager), async (req, res) => {
    // execute role privileged colde
    // execute auth required code
    // read write DB
}
```

## Req Express Object - API User & Auth User
```javascript

 function (req, res) {
    console.log ( req.apiuser )
    console.log ( req.authuser )
 }

```