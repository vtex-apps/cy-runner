const fs = require('fs')
const {promises: pfs} = require('fs')
const yaml = require('js-yaml')
const qe = require('./utils')
const schema = require('./schema')
const CONFIG_FILE = 'cy-runner.yml'
let config = null
let secrets = null

// Check config file, parse it and add dynamic settings
if (!fs.existsSync(CONFIG_FILE)) qe.crash(`${CONFIG_FILE} not found`)
try {
    config = yaml.load(fs.readFileSync(CONFIG_FILE, 'utf8'))
    schema.validate(config)
    const ACCOUNT = config.testConfig.vtex.account
    const AUTH_URL = `https://${ACCOUNT}.myvtex.com/api/vtexid/pub/authentication`
    config.testConfig.vtex['authUrl'] = AUTH_URL
    qe.msg(`${CONFIG_FILE} loaded successfully`)
} catch (e) {
    qe.msgErr(`Check your ${CONFIG_FILE}.`)
    qe.crash(e)
}

// Load SECRET from file or memory
const SECRET_NAME = config.secretName
const SECRET_FILE = `.${SECRET_NAME}.json`
if (fs.existsSync(SECRET_FILE)) {
    try {
        secrets = yaml.load(fs.readFileSync(SECRET_FILE, 'utf8'))
        JSON.stringify(secrets)
        qe.msg('Secrets loaded from file sucessfully')
    } catch (e) {
        qe.msg('Please, check if your secrets file is well formated.')
        qe.crash(e)
    }
} else {
    try {
        if (typeof process.env[SECRET_NAME] == 'undefined') {
            qe.msgErr('Secrets not found on file or memory!')
            qe.crash(`Missing file ".${SECRET_NAME}.json" and env "${SECRET_NAME}".`)
        }
        secrets = yaml.load(process.env[SECRET_NAME], 'utf8')
        JSON.stringify(secrets)
        qe.msg('Secrets loaded from memory sucessfully')
    } catch (e) {
        qe.msgErr(`Please, check you env secrets!`)
        qe.crash(e)
    }
}

// Check crucial values on secrets
const VTEX_ATTRIBUTES = [
    'apiKey',
    'apiToken',
    'authCookieName',
    'robotMail',
    'robotPassword',
]
const TWILIO_ATTRIBUTES = ['apiUser', 'apiToken']

try {
    VTEX_ATTRIBUTES.forEach((att) => {
        if (typeof secrets.vtex[att] == 'undefined')
            throw new Error(JSON.stringify({vtex: att}))
    })
    TWILIO_ATTRIBUTES.forEach((att) => {
        if (typeof secrets.twilio[att] == 'undefined')
            throw new Error(JSON.stringify({twilio: att}))
    })
} catch (e) {
    qe.msgErr('Crucial value missing on your secrets!')
    qe.crash(e)
}

// Merge from Secrets with VTEX Configuration section
for (const KEY in config.testConfig.vtex) {
    const VALUE = config.testConfig.vtex[KEY]
    secrets.vtex[KEY] = VALUE
}

// Propagate configuration settings to workspace
const KEYS = ['runHeaded']
KEYS.forEach((value) => {
    config.workspace[value] = config.configuration[value]
})

// Write cypress.env.json
if (config.testConfig.createCypressEnvFile) {
    let fileName = 'cypress.env.json'
    try {
        pfs.writeFile(fileName, JSON.stringify(secrets))
        qe.msg(`${fileName} created sucessfully`)
    } catch (e) {
        qe.msgErr(e)
    }
}

// Expose
module.exports = {
    secrets: secrets,
    config: config,
}
