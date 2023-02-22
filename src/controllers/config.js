
import dbcollection from '../models/config.js'
import baseClass from '../app/baseclass.js'

class ConfigController extends baseClass.ObotixController {

    constructor() {
        super('ctrl:config')
        this.dbconn = dbcollection()
    }

    async get(req, res) {
        var response = { status: 200, message: 'OK' }
        var query = super.get(req, res)

        const projection = { 
            _id: 0, 
            __v: 0
        }

        try {
            response.data = await this.dbconn.model.find(query, projection).exec()
            response.data = response.data[0]
            return response
        } catch (ex) {
            let msg = 'UserClass.get() threw an exception:'
            this.log.error(msg, ex)
            throw new Error(`Exception: See previos ERROR: ${msg}`) 
        }
    }


    async put(req, res) {
        var response = { status: 200, message: 'OK' }
        const body = super.put(req, res)
        
        const options = { 
            projection: {
                password: 0,
                __v: 0
            },
            upsert: true,
            new: true
        }

        try {
            // this.dbconn.data is a special feature of the config model
            response.data = await this.dbconn.model.findByIdAndUpdate(this.dbconn.data._id, body, options)
            return response
        } catch (ex) {
            this.log.error(ex.message, ex)
            throw new Error (ex.message)
        }
    }

}

var configController = undefined
export default function () {
    if (configController === undefined) configController = new ConfigController
    return configController
}


/*
import dbconn from '../models/config.js'
import logger from '../app/logger.js'
const log = logger.getLogger('ctrl:config')


// eslint-disable-next-line no-unused-vars
async function getConfigs(req, res) {
    const configs = dbconn()

    const projection = { 
        _id: 0, 
        __v: 0
    }

    return configs.model.find({}, projection).exec()
        .then(doc => {
            return doc[0]
        }).catch(err => {
            log.error(err)
            return err
        })
}


// eslint-disable-next-line no-unused-vars
async function putConfigs(req, res) {
    const configs = dbconn()

    const options = { 
        upsert: true,
        new: true
    }

    return configs.model.findByIdAndUpdate(configs.data._id, req.body, options)
        .then(result => {
            return result
        }).catch(err => {
            log.error(err)
            return err
        })
}


export default {
    getConfigs,
    putConfigs
}
*/