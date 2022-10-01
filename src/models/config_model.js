

import mongo from '../mongo.js'


// Schemas: https://mongoosejs.com/docs/guide.html
const fileSchema = new mongo.mongoose.Schema({
    
    title: String,
    active: Boolean,
    writeLevels: [String],
    format: String,
    filename: String,
    maxsize_in_mb: Number,
    backups_kept: Number,
    gzip_backups: Boolean
      
})
const configSchema = new mongo.mongoose.Schema({

    name: {
        type: String,
        required: true
    },
    env: {
        APP_NAME: String,
        CONFIG_ENV: String,
        ROLES: {
            basic: Number,
            moderator: Number,
            manager: Number,
            admin: Number
        },
        logish: {
            level: String,
            performanceTime: Boolean,
            controllers: [
                {
                    name: String,
                    active: Boolean,
                    displayOnlyEnvNamespace: Boolean,
                    displayLevels: [String],
                    format: String,
                    useColor: Boolean
                },
                {
                    name: String,
                    active: Boolean,
                    files: [fileSchema]
                }
            ]
        }
    }
})

/* Dev Note: Commented code kept to show how to attach functions to schema
whitelistsSchema.methods.generateAuthToken = function() { 
    const token = jwt.sign({ _id: this._id, role: this.role }, process.env.OAPI_JWT_KEY)
    log.debug('_id:', this._id)
    log.debug('role:', this.role)
    log.debug('jwt:', token)
    return token
}
*/

// Dev Note:
// by default mongoose model converts ('Config') to lowercase and adds plural 'configs'
// to identify the collection in the db.
export const Config = mongo.mongoose.model('Config', configSchema)
