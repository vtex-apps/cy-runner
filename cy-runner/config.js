const fs = require('fs')
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
            qe.crash(`Neither [.${SECRET_NAME}.json] or ENV [${SECRET_NAME}] found`)
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

// Merge secrets on config
Object.entries(secrets).forEach((secret) => {
    let key = secret[0]
    for (let property in secret[1]) {
        configSet.testConfig[key][property] = secrets[key][property]
    }
})

// Create a workspace name if it is defined as random
if (configSet.testWorkspace.name === 'random') {
    const SEED = qe.tick()
    configSet.testWorkspace.name = `e2e${SEED.toString().substring(0, 7)}`
    qe.msg(`New workspace name generated as [${configSet.testWorkspace.name}]`)
}

// Write cypress.env.json
const CYPRESS_ENV_JSON = 'cypress.env.json'
try {
    fs.writeFileSync(CYPRESS_ENV_JSON, JSON.stringify(configSet))
    qe.msg(`Secrets loaded (from ${loadedFrom}) and [${CYPRESS_ENV_JSON}] created successfully`)
} catch (e) {
    qe.msgErr(e)
}

// Write cypress.json
const CYPRESS_JSON_FILE = 'cypress.json'
const CYPRESS = configSet.testConfig.cypress
const WORKSPACE = configSet.testWorkspace.name
const ACCOUNT = configSet.testConfig.vtex.account
const DOMAIN = configSet.testConfig.vtex.domain
try {
    fs.writeFileSync(CYPRESS_JSON_FILE, JSON.stringify({
        baseUrl: `https://${WORKSPACE}--${ACCOUNT}.${DOMAIN}`,
        chromeWebSecurity: CYPRESS.chromeWebSecurity,
        video: CYPRESS.video,
        videoCompression: CYPRESS.videoCompression,
        videoUploadOnPasses: CYPRESS.videoUploadOnPasses,
        screenshotOnRunFailure: CYPRESS.screenshotOnRunFailure,
        trashAssetsBeforeRuns: CYPRESS.trashAssetsBeforeRuns,
        viewportWidth: CYPRESS.viewportWidth,
        viewportHeight: CYPRESS.viewportHeight,
        defaultCommandTimeout: CYPRESS.defaultCommandTimeout,
        requestTimeout: CYPRESS.defaultCommandTimeout,
        watchForFileChanges: CYPRESS.watchForFileChanges,
        pageLoadTimeout: CYPRESS.pageLoadTimeout,
        browser: CYPRESS.browser,
        projectId: CYPRESS.projectId,
        retries: 0,
    }))
    qe.msg(`[${CYPRESS_JSON_FILE}] created successfully`)
} catch (e) {
    qe.crash(e)

}

// Create empty files as asked
try {
    let STATE_FILES = configSet.testConfig.stateFiles
    STATE_FILES.forEach(stateFile => {
        fs.writeFileSync(stateFile, '{}')
    })
    qe.msg(`Empty state files [${STATE_FILES}] create successfully`)
} catch (e) {
    qe.crash(e)
}


// Expose config
module.exports = {
    config: configSet,
}
