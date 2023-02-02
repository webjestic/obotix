/**
 * 
 */

import logger from '../app/logger.js'
import db from '../app/db.js'
import fs from 'fs'

const log = logger.getLogger('ctrl:healthz')

var ver = 0
try {
    let pckg = JSON.parse(fs.readFileSync('package.json', 'utf8'))
    ver = pckg.version
} catch (ex) {
    console.log('healthz/live error getting package.')
}


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
function liveCheck(req, res) {
    return { 
        status: 200,
        data: {
            status: 'OK',
            version: ver
        }
    }
}


/**
 * Responsible for reporting the status of our database connections.
 * Checks the sttus of both MyTN and MyTN-Node database connections.
 * If connections are OK, then Status 200 is returned with basic information.
 * If connections are NOT OK, then Status 500 is returned with basic information.
 * 
 * @param {Object} req 
 * @param {Object} res 
 * @returns {Object}
 */
// eslint-disable-next-line no-unused-vars
function readyCheck(req, res) {

    let status = 200
    let msg = 'OK'
    let result = {
        status: msg,
        totalConnections : db.connections.length,
        connections: []
    }

    try {
        for (let conn of db.connections) {
            result.connections.push ( {name: conn.conn.config.db, state: conn.conn.readyState } )
            if (conn.conn.readyState !== 1) {
                status = 500
                msg = 'Internal Error'
            }
        }
    } catch(ex) {
        status = 500
        log.error('readyCheck Exception', ex)
    }


    if (status === 500) {
        log.error('readyCheck failure: connections' ,result)
        msg = 'Internal Error'
        result.message = msg
    }
    
    return {
        status: status,
        message: msg,
        data : result
    }
}


export default {
    liveCheck,
    readyCheck
}