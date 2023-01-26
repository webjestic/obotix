/**
 * 
 */


import os from 'os'
import fnlib from 'fnlib'



var stats = {
    'get': 0,
    'put' : 0,
    'post' : 0,
    'delete' : 0,
    'totalRequests' : 0,
    'internalErrors': 0,
    'notFounds' : 0,
    'host' : (os.hostname()),
    'started' : (new Date(Date.now()).toISOString()),
    'running' : ''
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
function getStats(req, res) {

    const onlineForCalc = fnlib.getTimeSince(stats.started)
    let onlineFor = `${onlineForCalc.years} years ${onlineForCalc.days} days ${onlineForCalc.hours} hours `
    onlineFor += `${onlineForCalc.minutes} minutes ${onlineForCalc.seconds} seconds`
    stats.running = onlineFor

    let response = {
        status: 200,
        data: stats
    }
    return response
}


/** 
* @param {Object} req 
* @param {Object} res 
* @returns {boolean}
*/
// eslint-disable-next-line no-unused-vars
function updateStats(req, res) {
    if (req.method === 'GET') stats.get = stats.get +1
    if (req.method === 'PUT') stats.put = stats.put +1
    if (req.method === 'POST') stats.post = stats.post +1
    if (req.method === 'DELETE') stats.delete = stats.delete +1

    stats.totalRequests = stats.totalRequests + 1
    return true
}


function incNotFound() {
    stats.notFounds = stats.notFounds + 1
}

function incInternalErrors() {
    stats.internalErrors = stats.internalErrors + 1
}



export default {
    getStats,
    updateStats,
    incNotFound,
    incInternalErrors
}