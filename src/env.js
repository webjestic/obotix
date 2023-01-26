/**
 * 
 */

import * as dotenv from 'dotenv'



/**
 * 
 * @returns {boolean}
 */
function validate() {
    let errors = []
    if (process.env.NODE_ENV === undefined) errors.push('ERROR: NODE_ENV is undefined env variable.')
    if (process.env.OAPI_PORT === undefined) errors.push('ERROR: OAPI_PORT is undefined env variable.')
    if (process.env.OAPI_DB_NODE === undefined) errors.push('ERROR: OAPI_DB_NODE is undefined env variable.')
    if (process.env.OAPI_DB_APP === undefined) errors.push('ERROR: OAPI_DB_APP is undefined env variable.')
    if (process.env.OAPI_CRYPTO_KEY === undefined) errors.push('ERROR: OAPI_CRYPTO_KEY is undefined env variable.')
    

    if (errors.length > 0) {
        for (let err in errors)
            console.log(`NOT FOUND: ${errors[err]}`)
        return false
    }
    return true
}


/**
 * 
 */
async function init() {
    dotenv.config()
    if (!validate()) 
        throw new Error('Some environment variables are undefined.')
}

export default {
    init
}