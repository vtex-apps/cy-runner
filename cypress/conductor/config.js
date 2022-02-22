const fs = require('fs')
const { promises: pfs } = require('fs')
const yaml = require('js-yaml')
const qe = require('./utils')
const YAML_FILE = 'cypress.yaml'

let vtex = null
let secrets = null

// Check if a config file exists
if (!fs.existsSync(YAML_FILE)) {
  qe.errMsg(YAML_FILE + ' does not exist!')
  qe.errFixMsg(`You must create a ${YAML_FILE} on the B2B root first.`)
  qe.crash()
}

// Load YAML configuration
try {
  vtex = yaml.load(fs.readFileSync(YAML_FILE, 'utf8'))
  JSON.stringify(vtex)
  // Add authUrl attribute
  const ACCOUNT = vtex.configuration.vtex.account
  const AUTH_URL = `https://${ACCOUNT}.myvtex.com/api/vtexid/pub/authentication`
  vtex.configuration.vtex['authUrl'] = AUTH_URL
  qe.outMsg(`${YAML_FILE} file loaded sucessfully`)
} catch (e) {
  qe.errMsg(`Error on load ${YAML_FILE}!`)
  qe.errFixMsg(`Please, check if your ${YAML_FILE} well formated.`)
  qe.crash()
}

// Load SECRET from file or memory
const SECRET_NAME = vtex.secretName
const SECRET_FILE = `.${SECRET_NAME}.json`
if (fs.existsSync(SECRET_FILE)) {
  try {
    secrets = yaml.load(fs.readFileSync(SECRET_FILE, 'utf8'))
    JSON.stringify(secrets)
    qe.outMsg('Secrets loaded from file sucessfully')
  } catch (e) {
    qe.errMsg(`Error on load the secrets file!`)
    qe.errFixMsg('Please, check if your secrets file is well formated.')
    qe.crash()
  }
} else {
  try {
    if (typeof process.env[SECRET_NAME] == 'undefined') {
      qe.errMsg('Secrets not found on file or memory!')
      qe.errFixMsg(
        `Please create a file ".${SECRET_NAME}.json" or ENV "${SECRET_NAME}".`
      )
      qe.crash()
    }
    secrets = yaml.load(process.env[SECRET_NAME], 'utf8')
    JSON.stringify(secrets)
    qe.outMsg('Secrets loaded from memory sucessfully')
  } catch (e) {
    qe.errMsg(`Error on load the secrets!`)
    qe.errFixMsg('Please, check if your secrets env is well formated.')
    qe.crash()
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
      throw new Error(JSON.stringify({ vtex: att }))
  })
  TWILIO_ATTRIBUTES.forEach((att) => {
    if (typeof secrets.twilio[att] == 'undefined')
      throw new Error(JSON.stringify({ twilio: att }))
  })
} catch (e) {
  qe.errMsg('Crucial value missing on your secrets!')
  qe.crash(e)
}

// Merge from Secrets with VTEX Configuration section
for (const KEY in vtex.configuration.vtex) {
  const VALUE = vtex.configuration.vtex[KEY]
  secrets.vtex[KEY] = VALUE
}

// Write cypress.env.json
if (vtex.configuration.createCypressEnvFile) {
  let fileName = 'cypress.env.json'
  try {
    pfs.writeFile(fileName, JSON.stringify(secrets))
    qe.outMsg(`${fileName} created sucessfully`)
  } catch (e) {
    qe.errMsg(e)
  }
}

// Expose
module.exports = {
  secrets: secrets,
  vtex: vtex,
}
