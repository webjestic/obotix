/**
 * 
 */
import logger from './logger.js'
import os from 'os'
import fnlib from 'fnlib'


class Sys {

    log = logger.getLogger('app:sys')
    resources = {}

    init() {
        this.log.debug('Initializing system objects.')
    }

    getResources() {
        this.resources.hostname = os.hostname(),
        this.resources.timestamp = Date.now()
        this.resources.totalmem = os.totalmem()
        this.resources.freemem = os.freemem()
        this.resources.heapTotal = process.memoryUsage().heapTotal
        this.resources.heapUsed = process.memoryUsage().heapUsed
        this.resources.arrayBuffers = process.memoryUsage().arrayBuffers
    
        this.resources.cpus = os.cpus().length,
        this.resources.cpuModel = os.cpus()[0].model,
        this.resources.cpus1m = Math.round(os.loadavg()[0] * 1000) / 1000
        this.resources.cpus5m = Math.round(os.loadavg()[1] * 1000) / 1000
        this.resources.cpus15m = Math.round(os.loadavg()[2] * 1000) / 1000
        return this.resources
    }

    getResourceStrings() {
        this.getResources()
        return {
            hostname: this.resources.hostname,
            timestamp: (new Date(this.resources.timestamp).toLocaleString()),
            totalmem: fnlib.formatBytes(this.resources.totalmem),
            freemem: fnlib.formatBytes(this.resources.freemem),
            heapTotal: fnlib.formatBytes(this.resources.heapTotal),
            heapUsed: fnlib.formatBytes(this.resources.heapUsed),
            arrayBuffers: fnlib.formatBytes(this.resources.arrayBuffers) ,
            cpus: this.resources.cpus,
            cpumodel: this.resources.cpuModel,
            cpus1m: `${this.resources.cpus1m}%`,
            cpus5m: `${this.resources.cpus5m}%`,
            cpus15m: `${this.resources.cpus15m}%`
        }
    }

    displayResources(log) {
        this.getResources()
        if (log !== undefined) {
            log.info(`     Hostname: ${this.resources.hostname}`)
            log.info('    Timestamp:', (new Date(this.resources.timestamp).toLocaleString()) )
            log.info(' Total Memory:', fnlib.formatBytes(this.resources.totalmem)  )
            log.info('  Free Memory:', fnlib.formatBytes(this.resources.freemem)  )
            log.info('   Total Heap:', fnlib.formatBytes(this.resources.heapTotal)  )
            log.info('    Used Heap:', fnlib.formatBytes(this.resources.heapUsed)  )
            log.info('Array Buffers:', fnlib.formatBytes(this.resources.arrayBuffers)  )
        
            log.info(`         CPUs: ${this.resources.cpus} `)
            log.info(`    CPU Model: ${this.resources.cpuModel} `)
            log.info(` CPU 1min Avg: ${this.resources.cpus1m}%`  )
            log.info(` CPU 5min Avg: ${this.resources.cpus5m}%`  )
            log.info(`CPU 15min Avg: ${this.resources.cpus15m}%`  )
        } else {
            console.log(`     Hostname: ${this.resources.hostname}`)
            console.log('    Timestamp:', (new Date(this.resources.timestamp).toLocaleString()) )
            console.log(' Total Memory:', fnlib.formatBytes(this.resources.totalmem)  )
            console.log('  Free Memory:', fnlib.formatBytes(this.resources.freemem)  )
            console.log('   Total Heap:', fnlib.formatBytes(this.resources.heapTotal)  )
            console.log('    Used Heap:', fnlib.formatBytes(this.resources.heapUsed)  )
            console.log('Array Buffers:', fnlib.formatBytes(this.resources.arrayBuffers)  )
    
            console.log(`         CPUs: ${this.resources.cpus} `)
            console.log(`    CPU Model: ${this.resources.cpuModel} `)
            console.log(` CPU 1min Avg: ${this.resources.cpus1m}%`  )
            console.log(` CPU 5min Avg: ${this.resources.cpus5m}%`  )
            console.log(`CPU 15min Avg: ${this.resources.cpus15m}%`  )
        }
    }
}


const sys = new Sys()
export default sys
