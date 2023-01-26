/**
 * 
 */

import { Logish } from 'logish'


/**
 * This is the default configuration for Logish.
 * Values may be overriden during configuration load.
 */
var defaultConfig = {
    'level': 'trace',
    'performanceTime': true,
    'controllers': [
        {
            'name': 'console',
            'active': true,
            'displayOnlyEnvNamespace': false,
            'displayLevels': [
                'trace',
                'debug',
                'info',
                'warn',
                'error',
                'fatal'
            ],
            'format': '%datetime %level %namespace %entry %performance',
            'useColor': true
        },
        {
            'name': 'file',
            'active': false,
            'files': [
                {
                    'title': 'app logs',
                    'active': false,
                    'writeLevels': [
                        'warn',
                        'error',
                        'fatal'
                    ],
                    'format': '[%datetime %level] %namespace %host - %entry %performance',
                    'filename': 'logs/app.log',
                    'maxsize_in_mb': 5,
                    'backups_kept': 5,
                    'gzip_backups': false
                }
            ]
        }
    ]
}


/** An array of all log instances created during the run session */ 
var logs = []


/**
 * This allows the application to hook into a centralized logging call. 
 * All instances of Logish will execute this function if it is defined.
 * Most likely this is being assinged a value from logtodb.js
 */
var centralLoggingFunction = undefined


/**
 * Listener will execute the developer attached centralized logging event.
 * 
 * @param {Json} logEntry 
 */
function logListener(logEntry) {
    if (centralLoggingFunction !== undefined && typeof centralLoggingFunction === 'function')
        centralLoggingFunction(logEntry)
}


/**
 * This is an exported function. allowing an outside source to listen to
 * add their own function, which executes on every logging event.
 * 
 * @param {function} fn 
 * @returns {boolean}
 */
function addEventFunction(fn) {
    if (typeof fn === 'function')
        centralLoggingFunction = fn
    else
        return false
    return true
}


/**
 * Returns an instance of Logish for use within an external module. This function regiters
 * the instance in the logs array, so any config changes could be applied to all existing instances.
 * 
 * @param {String} namespace 
 * @returns {Object} a new instance of Logish
 */
function getLogger(namespace) {
    const log = new Logish( defaultConfig )
    log.setNamespace(namespace)
    log.use(logListener)
    logs.push(log)
    return log
}


/**
 * Sets the logging level for all existing instances within the "logs" array.
 * 
 * @param {String} level 
 */
function setLevel(level) {
    defaultConfig.level = level
    for (var log of logs) 
        log.setLevel(level)
}


export default { 
    defaultConfig,
    addEventFunction,
    getLogger,
    setLevel
}

