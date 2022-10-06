
import * as dotenv from 'dotenv'

function load() {
    dotenv.config()
    if (!validate())
        throw new Error('Some environment variables are undefined.')
}

function validate() {
    let errors = []
    if (process.env.NODE_ENV === undefined) errors.push('ERROR: NODE_ENV is undefined.')
    if (process.env.OAPI_DOMAIN === undefined) errors.push('ERROR: OAPI_DOMAIN is undefined.')
    if (process.env.OAPI_PORT === undefined) errors.push('ERROR: OAPI_PORT is undefined.')
    if (process.env.OAPI_X_API_KEY === undefined) errors.push('ERROR: OAPI_X_API_KEY is undefined.')
    if (process.env.OAPI_JWT_KEY === undefined) errors.push('ERROR: OAPI_JWT_KEY is undefined.')
    if (process.env.OAPI_MONGO === undefined) errors.push('ERROR: OAPI_MONGO is undefined.')
    if (process.env.OAPI_REDIS === undefined) errors.push('ERROR: OAPI_REDIS is undefined.')

    if (errors.length > 0) {
        for (let err in errors)
            console.log(`NOT FOUND: ${err}`)
        return false
    }
    return true
}

export default {
    load,
    validate
}