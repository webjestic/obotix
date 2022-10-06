
import { Logish } from 'logish'

const defaultConfig = {

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
            'format': '%level %namespace %entry %performance',
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

var logs = []

function getLogger(namespace) {
    //let log = new Logish(config.doc.logish)
    let log = new Logish(defaultConfig)
    log.setNamespace(namespace)
    logs.push(log)
    return log
}

function setLogLevel(logLevel) {
    for (let log of logs) 
        log.setLevel(logLevel)
}

export default {
    defaultConfig,
    logs,
    setLogLevel,
    getLogger
}
