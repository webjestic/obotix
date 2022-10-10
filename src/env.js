
import * as dotenv from 'dotenv'

function load() {
    dotenv.config()
    if (!validate())
        throw new Error('Some environment variables are undefined.')
}

function validate() {
    let errors = []
    if (process.env.NODE_ENV === undefined) errors.push('ERROR: NODE_ENV is undefined env variable.')
    if (process.env.OAPI_CONFIG_APP === undefined) errors.push('ERROR: OAPI_CONFIG_APP is undefined env variable.')
    if (process.env.OAPI_DOMAIN === undefined) errors.push('ERROR: OAPI_DOMAIN is undefined env variable.')
    if (process.env.OAPI_PORT === undefined) errors.push('ERROR: OAPI_PORT is undefined env variable.')
    if (process.env.OAPI_MONGO === undefined) errors.push('ERROR: OAPI_MONGO is undefined env variable.')
    if (process.env.OAPI_REDIS === undefined) errors.push('ERROR: OAPI_REDIS is undefined env variable.')
    if (process.env.OAPI_JWT_KEY === undefined) errors.push('ERROR: OAPI_JWT_KEY is undefined env variable.')

    if (errors.length > 0) {
        for (let err in errors)
            console.log(`NOT FOUND: ${errors[err]}`)
        return false
    }
    return true
}

export default {
    load,
    validate
}