

import { EventEmitter} from 'events'


import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const __modulename = path.basename(__filename)


console.log(__dirname)
console.log(__filename)
console.log(__modulename)


class ObotixClass {

}

class ObotixEmitter extends EventEmitter{

}


export default {
    ObotixClass,
    ObotixEmitter
}