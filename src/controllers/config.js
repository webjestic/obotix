

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