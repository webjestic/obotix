
import { Logish } from 'logish'
import * as config from './config.js'

export function getLogger(namespace) {
    let log = new Logish(config.doc.env.logish)
    log.setNamespace(namespace)
    return log
}
