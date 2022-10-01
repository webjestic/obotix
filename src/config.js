
import { Config } from './models/config_model.js'

export var doc = undefined

export async function load() {
    try {
        doc = await Config.findOne({ 'CONFIG_ENV': process.env.NODE_ENV }).exec()
        console.log('Sucessfully pulled remote config.')
    } catch (ex) {
        console.error('Failed to pull remote data.')
        doc = undefined
    }
    return doc
}
