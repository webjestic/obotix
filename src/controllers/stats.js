/**
 * 
 */


import fnlib from 'fnlib'
import system from '../sys.js'


const started = (new Date(Date.now()).toLocaleString()) //toISOString())
var stats = {
    'get': 0,
    'put' : 0,
    'post' : 0,
    'delete' : 0,
    'internalErrors': 0,
    'notFounds' : 0,
    'totalRequests' : 0,
    'live' : 0,
    'ready' : 0
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

    const onlineForCalc = fnlib.getTimeSince(started)
    let onlineFor = `${onlineForCalc.years} years ${onlineForCalc.days} days ${onlineForCalc.hours} hours `
    onlineFor += `${onlineForCalc.minutes} minutes ${onlineForCalc.seconds} seconds`

    let sys = system.getResourceStrings()
    sys.started = started
    sys.running = onlineFor

    let response = {
        status: 200,
        data: {
            stats: stats,
            system: sys
        }
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

    if (req.path === '/live') stats.live = stats.live + 1
    if (req.path === '/ready') stats.ready = stats.ready + 1

    if (req.path !== '/live' && req.path !== '/ready') {
        if (req.method === 'GET') stats.get = stats.get +1
        if (req.method === 'PUT') stats.put = stats.put +1
        if (req.method === 'POST') stats.post = stats.post +1
        if (req.method === 'DELETE') stats.delete = stats.delete +1

        stats.totalRequests = stats.totalRequests + 1
    }
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