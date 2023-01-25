/**
 * This is a critical module, responsible for establishing database connections.
 */

// import dotenv from 'dotenv' // loads this environment variables from .env
import mongoose from 'mongoose'
import logger from './logger.js'

const log = logger.getLogger('app:db')
var connections = []

// dotenv.config()


/**
 * Function is executed on event "disconnected" for a db connection.
 * Defines the actions to be taken on disconnect.
 * 
 * @param {Object} conn 
 */
function onDisconnected(conn) { 
    log.warn(`Mongoose Event: ${conn.config.db}: disconnected. Singal emitted.`) 
}


/**
 * Function is executed on event "reconnected" for a db connection.
 * Defines the actions to be taken on reconnect.
 * 
 * @param {*} conn 
 */
function onReconnected(conn) { 
    log.info(`Mongoose Event: ${conn.config.db}: reconnected. Singal emitted.`) 
}


/**
 * Function is executed on event "error" for a db connection.
 * Defines the actions to be taken on a connection error.
 * 
 * @param {*} err 
 * @param {*} conn 
 */
function onError(err, conn) { 
    console.error('Mongoose Event ERRPR:', conn.config.db, err) 
}


/**
 * This function is reponsible for creating a connection to a database.
 * Function will return a connection that has been connected OR it will terminate the 
 * application by assuming the database connection is critical to the functionality of the app.
 * 
 * @param {String} connectionString 
 * @returns connection object
 */
async function createConnection(connectionString) {
    if (connections.length < 1) 
        log.info(`Initializing app in a ${process.env.NODE_ENV.toUpperCase()} environment.`)
    

    try {
        var conn = await mongoose.createConnection(connectionString, 
            {useNewUrlParser: true, keepAlive: true, keepAliveInitialDelay: 300000}).asPromise()

        conn.on('disconnected', () => { onDisconnected(conn) }). 
            on('reconnected', () => { onReconnected(conn) }).  
            on('error', (err) => { onError(err, conn) })

        conn.config.db = getDbNameFromConnStr(connectionString)

        connections.push({ name: conn.config.db, conn: conn })

        log.info(`MongoDB ${conn.config.db} is connected.`)

        return conn
    } catch(ex) {
        log.error(`Unable to connect to ${connectionString.substring(connectionString.lastIndexOf('/') + 1)}. Try VPN?`, ex)
        log.fatal('Terminating process due to critical errors.')
        process.exit()
    }
}


/**
 * Extracts the DB Name from a connection string
 * 
 * @param {String} connectionString 
 * @returns {String} dbName
 */
function getDbNameFromConnStr(connectionString) {
    let dbName = connectionString.substring(connectionString.lastIndexOf('/') + 1)
    if (dbName.includes('?'))
        dbName = dbName.substring(0, dbName.indexOf('?') - 1)
    return dbName
}


/**
 * 
 * @returns 
 */
function getConnFromConnStr(connectionString) {
    let result = undefined
    if (connections.length > 0) {
        for (let conn of connections) {
            if (conn.name === getDbNameFromConnStr(connectionString)) 
                result = conn.conn
        }
    }
    return result
}



/**
 * Function will disconnect a connection and execute any actions required for cleanup.
 * 
 * @param {*} connection 
 */
function disconnect(connection) {
    connection.close()
        .then( () => {

        }).catch( (err) => {
            log.error (err)
        })
}


/**
 *  Initialize the module
 */
async function init() {
    await createConnection(process.env.OAPI_DB_NODE)
    await createConnection(process.env.OAPI_DB_APP)
}


export default {
    init,
    disconnect,
    createConnection,
    getDbNameFromConnStr,
    getConnFromConnStr,
    connections,
    mongoose,
}