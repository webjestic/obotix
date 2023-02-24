
import dbcollection from '../models/config.js'
import baseClass from '../app/baseclass.js'

class ConfigController extends baseClass.ObotixController {

    constructor() {
        super('obx-ctrl:config')
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
            this.log.error(ex.message, { stack: ex.stack })
            throw new Error(`Exception: See previos ERROR: ${ex.message}`) 
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
            this.log.error(ex.message, { stack: ex.stack })
            throw new Error (ex.message)
        }
    }

}

var configController = undefined
export default function () {
    if (configController === undefined) configController = new ConfigController
    return configController
}
