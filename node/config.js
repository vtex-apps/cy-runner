const fs = require('fs')
const yaml = require('js-yaml')
const { merge } = require('lodash')
const qe = require('./utils')
const schema = require('./schema')

exports.getConfig = async (configFile) => {
  let config = null
  let secrets = null

  // Check config file, parse it and add dynamic settings
  if (!fs.existsSync(configFile)) qe.crash(`${configFile} not found`)
  try {
    config = yaml.load(fs.readFileSync(configFile, 'utf8'))
    schema.validate(config)
    const VTEX_ACCOUNT = config.base.vtex.account
    config.base.vtex[
      'authUrl'
    ] = `https://${VTEX_ACCOUNT}.myvtex.com/api/vtexid/pub/authentication`
  } catch (e) {
    qe.err(`Check your ${configFile}.`)
    qe.crash(e)
  }

  // Load SECRET from file or memory
  // TODO: Fix this code
  const SECRET_NAME = config.base.secrets.name
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
    if (typeof value != 'string') qe.crash(`Secret must be string [${key}]`)
    if (value.length <= 0) qe.crash(`Secret must be string not null [${key}]`)
  }

  try {
    // Check VTEX Cli secrets
    if (config.base.vtex.deployCli) {
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
    if (config.base.twilio) {
      const TWILIO_ATTRIBUTES = ['apiUser', 'apiToken', 'baseUrl']
      TWILIO_ATTRIBUTES.forEach((att) => {
        checkSecret(`secrets.twilio.${att}`, secrets.twilio[att])
      })
    }
  } catch (e) {
    qe.err('Missing value when reading your secrets!')
    qe.crash(e)
  }

  // Merge secrets on config
  merge(config.base, secrets)

  // Create a workspace name if it is defined as random
  if (config.workspace.name === 'random') {
    const SEED = qe.tick()
    const PREFIX = config.workspace.prefix
    config.workspace.name = `${PREFIX}${SEED.toString().substring(0, 7)}`
    qe.msg(`New workspace name generated as [${config.workspace.name}]`)
  }

  // Write cypress.env.json
  const CYPRESS_ENV_JSON = 'cypress.env.json'
  try {
    fs.writeFileSync(CYPRESS_ENV_JSON, JSON.stringify(config))
    qe.msg(
      `Secrets loaded (from ${loadedFrom}) and [${CYPRESS_ENV_JSON}] created successfully`
    )
  } catch (e) {
    qe.err(e)
  }

  // Write cypress.json
  const CYPRESS_JSON_FILE = 'cypress.json'
  const CYPRESS = config.base.cypress
  const WORKSPACE = config.workspace.name
  const ACCOUNT = config.base.vtex.account
  const DOMAIN = config.base.vtex.domain
  try {
    fs.writeFileSync(
      CYPRESS_JSON_FILE,
      JSON.stringify({
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
      })
    )
    qe.msg(`[${CYPRESS_JSON_FILE}] created successfully`)
  } catch (e) {
    qe.crash(e)
  }

  // Create empty files as asked
  try {
    let STATE_FILES = config.base.stateFiles
    STATE_FILES.forEach((stateFile) => {
      fs.writeFileSync(stateFile, '{}')
    })
    qe.msg(`Empty state files [${STATE_FILES}] create successfully`)
  } catch (e) {
    qe.crash(e)
  }
  return config
}
