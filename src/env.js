
import * as dotenv from 'dotenv'

function load() {
    dotenv.config()
    if (!validate())
        throw new Error('Some environment variables are undefined.')
}

function validate() {
    let error = []
    if (process.env.NODE_ENV === undefined) error.push('ERROR: NODE_ENV is undefined.')
    if (process.env.OAPI_DOMAIN === undefined) error.push('ERROR: OAPI_DOMAIN is undefined.')
    if (process.env.OAPI_PORT === undefined) error.push('ERROR: OAPI_PORT is undefined.')
    if (process.env.OAPI_MONGODB_SERVER === undefined) error.push('ERROR: OAPI_MONGODB_SERVER is undefined.')
    if (process.env.OAPI_MONGODB_USERNAME === undefined) error.push('ERROR: OAPI_MONGODB_USERNAME is undefined.')
    if (process.env.OAPI_MONGODB_PASSWORD === undefined) error.push('ERROR: OAPI_MONGODB_PASSWORD is undefined.')
    if (process.env.OAPI_MONGODB_DATABASE === undefined) error.push('ERROR: OAPI_MONGODB_DATABASE is undefined.')
    if (process.env.OAPI_X_API_KEY === undefined) error.push('ERROR: OAPI_X_API_KEY is undefined.')
    if (process.env.OAPI_JWT_KEY === undefined) error.push('ERROR: OAPI_JWT_KEY is undefined.')

    if (error.length > 0) {
        console.log('ERROR: error')
        return false
    }
    return true
}

export default {
    load,
    validate
}