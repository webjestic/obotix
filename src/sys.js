/**
 * 
 */

import os from 'os'
import fnlib from 'fnlib'

var resources = {}

function getResources() {
    resources.timestamp = Date.now()
    resources.totalmem = os.totalmem()
    resources.freemem = os.freemem()
    resources.heapTotal = process.memoryUsage().heapTotal
    resources.heapUsed = process.memoryUsage().heapUsed
    resources.arrayBuffers = process.memoryUsage().arrayBuffers

    resources.cpus1m = Math.round(os.loadavg()[0] * 1000) / 1000
    resources.cpus5m = Math.round(os.loadavg()[1] * 1000) / 1000
    resources.cpus15m = Math.round(os.loadavg()[2] * 1000) / 1000
    return resources
}

function getResourceStrings() {
    getResources()
    return {
        hostname: os.hostname(),
        timestamp: (new Date(resources.timestamp).toLocaleString()),
        totalmem: fnlib.formatBytes(resources.totalmem),
        freemem: fnlib.formatBytes(resources.freemem),
        heapTotal: fnlib.formatBytes(resources.heapTotal),
        heapUsed: fnlib.formatBytes(resources.heapUsed),
        arrayBuffers: fnlib.formatBytes(resources.arrayBuffers) ,
        cpus: os.cpus().length,
        cpus1m: `${resources.cpus1m}%`,
        cpus5m: `${resources.cpus5m}%`,
        cpus15m: `${resources.cpus15m}%`
    }
}

function displayResources(log) {
    getResources()
    if (log !== undefined) {
        log.info(`     Hostname: ${os.hostname()}`)
        log.info('    Timestamp:', (new Date(resources.timestamp).toLocaleString()) )
        log.info(' Total Memory:', fnlib.formatBytes(resources.totalmem)  )
        log.info('  Free Memory:', fnlib.formatBytes(resources.freemem)  )
        log.info('   Total Heap:', fnlib.formatBytes(resources.heapTotal)  )
        log.info('    Used Heap:', fnlib.formatBytes(resources.heapUsed)  )
        log.info('Array Buffers:', fnlib.formatBytes(resources.arrayBuffers)  )
    
        log.info(`         CPUs: ${os.cpus().length} `)
        log.info(` CPU 1min Avg: ${resources.cpus1m}%`  )
        log.info(` CPU 5min Avg: ${resources.cpus5m}%`  )
        log.info(`CPU 15min Avg: ${resources.cpus15m}%`  )
    } else {
        console.log(`     Hostname: ${os.hostname()}`)
        console.log('    Timestamp:', (new Date(resources.timestamp).toLocaleString()) )
        console.log(' Total Memory:', fnlib.formatBytes(resources.totalmem)  )
        console.log('  Free Memory:', fnlib.formatBytes(resources.freemem)  )
        console.log('   Total Heap:', fnlib.formatBytes(resources.heapTotal)  )
        console.log('    Used Heap:', fnlib.formatBytes(resources.heapUsed)  )
        console.log('Array Buffers:', fnlib.formatBytes(resources.arrayBuffers)  )

        console.log(`         CPUs: ${os.cpus().length} `)
        console.log( ` CPU 1min Avg: ${resources.cpus1m}%`  )
        console.log( ` CPU 5min Avg: ${resources.cpus5m}%`  )
        console.log( `CPU 15min Avg: ${resources.cpus15m}%`  )
    }
}

export default {
    getResources,
    displayResources,
    getResourceStrings
}