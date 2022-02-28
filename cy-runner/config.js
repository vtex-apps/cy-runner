const fs = require('fs')
const {promises: pfs} = require('fs')
const yaml = require('js-yaml')
const qe = require('./utils')
const schema = require('./schema')
const CONFIG_FILE = 'cy-runner.yml'
let configSet = null
let secrets = null

// Check config file, parse it and add dynamic settings
if (!fs.existsSync(CONFIG_FILE)) qe.crash(`${CONFIG_FILE} not found`)
try {
    configSet = yaml.load(fs.readFileSync(CONFIG_FILE, 'utf8'))
    schema.validate(configSet)
    const ACCOUNT = configSet.testConfig.vtex.account
    configSet.testConfig.vtex['authUrl'] = `https://${ACCOUNT}.myvtex.com/api/vtexid/pub/authentication`
} catch (e) {
    qe.msgErr(`Check your ${CONFIG_FILE}.`)
    qe.crash(e)
}

// Load SECRET from file or memory
const SECRET_NAME = configSet.secretName
const SECRET_FILE = `.${SECRET_NAME}.json`
let loadedFrom = null
if (fs.existsSync(SECRET_FILE)) {
    try {
        secrets = yaml.load(fs.readFileSync(SECRET_FILE, 'utf8'))
        loadedFrom = 'file'
    } catch (e) {
        qe.crash('Check if your secrets file is well formatted')
    }
} else {
    try {
        if (typeof process.env[SECRET_NAME] == 'undefined') {
            qe.crash(`Neither ".${SECRET_NAME}.json" or ENV "${SECRET_NAME}" found`)
        }
        secrets = yaml.load(process.env[SECRET_NAME], 'utf8')
        loadedFrom = 'memory'
    } catch (e) {
        qe.crash('Check if your secrets ENV is well formatted')
    }
}

// Check secrets
function checkSecret(key, value) {
    if (typeof value != 'string')
        qe.crash(`Secret must be string [${key}]`)
    if (value.length <= 0)
        qe.crash(`Secret must be string not null [${key}]`)
}

try {
    // Check VTEX Cli secrets
    if (configSet.testConfig.authVtexCli) {
        const VTEX_ATTRIBUTES = [
            'apiKey',
            'apiToken',
            'authCookieName',
            'robotMail',
            'robotPassword',
        ]
        VTEX_ATTRIBUTES.forEach((att) => {
            if (typeof secrets.vtex[att] == 'undefined')
                checkSecret(`secrets.vtex.${att}`, secrets.vtex[att])
        })
    }
    // Check TWILIO secrets
    if (configSet.testConfig.twilio) {
        const TWILIO_ATTRIBUTES = ['apiUser', 'apiToken', 'baseUrl']
        TWILIO_ATTRIBUTES.forEach((att) => {
            checkSecret(`secrets.twilio.${att}`, secrets.twilio[att])
        })
    }
} catch (e) {
    qe.msgErr('Missing value when reading your secrets!')
    qe.crash(e)
}

// Merge from Secrets with config section
Object.entries(secrets).forEach((secret) => {
    let key = secret[0]
    for (let property in secret[1]) {
        configSet.testConfig[key][property] = secrets[key][property]
    }
})

// Write cypress.env.json
let cypressEnvFile = 'cypress.env.json'
try {
    pfs.writeFile(cypressEnvFile, JSON.stringify(configSet))
} catch (e) {
    qe.msgErr(e)
}

// Feedback to user
qe.msg(`Secrets loaded from ${loadedFrom} successfully`)

// Expose config
module.exports = {
    config: configSet,
}
