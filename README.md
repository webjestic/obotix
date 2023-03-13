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
npm i 
# create .env from env.ini
npm run dev
```

## Getting Started - index Example
```javascript
// import obotix app
import obotix from 'obotix'
// create a custom route
import customRoute from './routes/custom.js'

// initialize the system, logger, and app
await obotix.init()
const log = obotix.getLogger('app:index')
const app = mytn.getApp()

// get an obotix model if needed
const usersModel = obotix.getModel('users')
const configMode = obotix.getModel('config')
const configMode = obotix.getModel('apikey')

// get direct access to core objects if needed
const monoogse = obotix.getMongoose()
const express = obotix.getExpress()

// add custom routes
app.use('/v1', customRoute( obotix.getRouter() ) )

// start listening for requests
obotix.listen( () => {
    log.info(`Service is listening on port ${process.env.OAPI_PORT}.`)
})
```

## Create Route - Example
```javascript
import obotix from 'obotix'
import CustomController from '../controllers/custom.js'

export default function (router) {

    // for singleton Controller use "new CustomController()" otherwise
    const customController = CustomController() 

    const rateLimit = obotix.getMiddleware('rateLimit')

    router.get('/custom', rateLimit, async (res, req) => {
       try {
            const response = await customController.get(req, res)
            if (response.data !== undefined && response.status === 200) 
                res.status(response.status).json(response.data)
            else 
                res.status(response.status).json(response)
        } catch(ex) {
            // allow internal error middleware to handle
            throw new Error(ex.message)
        }
    })

    return router
}
```

## Create Controller - Example
```javascript
import obotix from 'obotix'
import dbCollecttion from '../models/custom.js'

class CustomController extends baseClass.ObotixController {
    constructor() {
        super('ctrl:custom')
        this.dbconn = dbCollecttion()
    }

    async get(req, res) {
        var response = { status: 200, message: 'OK' }
        const query = super.get(req, res)
        const paginate = this.paginate(req)
        const projection = { 
            __v: 0
        }

        try {
            response.data = await this.dbconn.model.find(query, projection).limit(paginate.limit).skip(paginate.page).exec()
            if (response.field === 'notExpected') {
                response.status = 400
                response.message = 'Something is not right'
                delete response.data // if you don't want to return the document
            }
        } catch (ex) {
            this.log.error(ex.message, { stack: ex.stack })
            throw new Error(ex.message) 
        }

        return response
    }
}

// Singleton approach - otherwise just export the class
var customController = undefined
export default function () {
    if (customController === undefined) customController = new CustomController()
    return customController
}
```

## Create Model - Example
```javascript
import obotix from 'obotix'

var dbconn = undefined

export default function () {

    // singleton - avoids compiling schema more than once
    if (dbconn !== undefined) return dbconn

    const log = obotix.getLogger('model:custom')

    dbconn = {
        connection: undefined,
        schema: undefined,
        model: undefined
    }

    // generic schema without strict definition or integrity 
    // https://mongoosejs.com/docs/guide.html to define a proper schema with integrity
    try {
        dbconn.connection = obotix.db.getConnFromConnStr(process.env.OAPI_DB_NODE) 
        dbconn.schema = new obotix.db.mongoose.Schema({ any: db.mongoose.Schema.Types.Mixed }, { strict: false })
        dbconn.model = dbconn.connection.model('Custom', dbconn.schema)
    } catch(ex) {
        // reset dbconn, log errors, and raise an exception
        dbconn = undefined
        this.log.error(ex.message, { stack: ex.stack })
        throw new Error(ex.message) 
    }

    return dbconn
}
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
const apikey = obotix.getMiddleware('apiKey')

router.put('/', rateLimit, apikey, async (req, res) => {

    console.log( req.apiuser.username )
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

## Express Request Object for Auth
```javascript

// Once Auth has been executed, it will store the verification object in the request.
// The following represents the object and it's condition.

 function (req, res) {
    console.log ( req.authuser )
    console.log ( req.authuser._id_ )       // id is either of User or Apikey
    console.log ( req.authuser.username )
    console.log ( req.authuser.role )
    console.log ( req.authuser.email )      // only if auth is NOT an ApiKey
 }

```

## Events

```javascript
//  List of avilable events.
//
// - `onAccountCreate` - Emitted when a new user successfully registers a new account.
// - `onAccountDelete` - Emitted when a user deletes their account.
// - `onAccountLogin` - Emitted when user successfully login.
// - `onAccountLogout` - Emitted when user successfully logout.
// - `onConfigChange` - Emitted when application recieves a config change update.


    import obotix from 'obotix'

    obotix.onEvent('onAccountCreate', (userDoc) => {
        // code stuff
    })

    obotix.onEvent('onConfigChange', (configDoc) => {
        // code stuff
    })
```

---
## Response Codes

```
200 OK - Request success and result found
204 No Content - Request success, but NOT successful results 
301 Moved Permanently - Route moved, send new route
400 Bad Request - Invalid request data sent (Bad data)
401 Unauthorized - No auth or invalid authentication (No credentials)
403 Forbidden - Invalidation authorization (Not enough privileges)
404 Not Found - Non existent ws request (no such endpoint - bad URI)
429 Too Many Requests - Returns too many requests from same IP (Rate-Limiting)
500 Inter Server Error - Server side errors and issues
503 Service Unavailable - In maintenance mode or overloaded
```

## Firebase
[Custom Auth](https://firebase.google.com/docs/auth/web/custom-auth?hl=en&authuser=0)

[Admin SDK](https://firebase.google.com/docs/admin/setup#node.js_6)

[Website Auth](https://firebase.google.com/docs/auth/web/start?authuser=0)

### firebase-adminskd.gpg

- decrypt | gpg --pinentry-mode=loopback --passphrase ADMIN-TOKEN_passphrase -d --no-use-agent -o .env .env.gpg
- encrypt | gpg --pinentry-mode=loopback --passphrase ADMIN-TOKEN_passphrase -c .env