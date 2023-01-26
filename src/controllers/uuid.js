/**
 * 
 */


import fnlib from 'fnlib'


/**
 * Responsible for checking the basic health of the App and Express.
 * If this function is able to execute, then it was reached via a route in express.
 * Therefore, the HTTP Server is responsibe - and this is the purpose of the check.
 * 
 * @param {Object} req 
 * @param {Object} res 
 * @returns {Object}
 */
// eslint-disable-next-line no-unused-vars
function getUuid(req, res) {

    let response = {
        status: 200,
        data: {
            uuid: (fnlib.randomUUID()),
            version: 'v4'
        }
    }
    return response
}



export default {
    getUuid
}