const path = require('path')

const { get } = require('lodash')

const logger = require('./logger')
const storage = require('./storage')
const credentials = require('./credentials')
const system = require('./system')
const cypress = require('./cypress')
const { tick } = require('./system')

exports.getConfig = async (configFile) => {
  logger.msgWarn('Checking cy-runner configuration file')
  // Load and parse config file
  let config = storage.loadConfig(configFile)

  // Fill URLs
  const VTEX_AUTH_PATH = '.myvtex.com/api/vtexid/pub/authentication'
  const VTEX_ACCOUNT = config.base.vtex.account
  const WORKSPACE = this.getWorkspaceName(config)
  const ACCOUNT = config.base.vtex.account
  const DOMAIN = config.base.vtex.domain

  config.base.vtex.authUrl = `https://${VTEX_ACCOUNT}${VTEX_AUTH_PATH}`
  config.base.vtex.baseUrl = `https://${WORKSPACE}--${ACCOUNT}.${DOMAIN}`

  // Load and parse secrets
  const secrets = credentials.readSecrets(config)

  // Do check to avoid waste of time on CI environments
  const SKIP_AUTO_CONFIG = config.base.skipAutoConfigOnCI ?? false

  // Checks to avoid silly configuration errors on CI
  if (system.isCI() && !SKIP_AUTO_CONFIG) {
    logger.msgWarn('On CI, auto configuring Cypress flags')
    logger.msgPad('Set base.skipAutoConfigOnCI to true to avoid auto config')
    config.base.cypress.devMode = false
    config.base.cypress.runHeaded = false
    config.base.cypress.getCookies = true
    config.base.cypress.quiet = true
    config.base.cypress.videoUploadOnPasses = false
    config.base.cypress.trashAssetsBeforeRuns = false
    config.base.cypress.watchForFileChanges = false
    config.base.cypress.browser = 'chrome'
  }

  // Force verbosity if it is running local and clean debug.log
  if (!system.isCI()) {
    config.base.cypress.quiet = false
    storage.delete(system.debugFile())
  }

  // Merge secrets on config
  if (secrets) config = credentials.mergeSecrets(config, secrets)

  // Report configuration to help understand that'll run
  await this.sectionsToRun(config)

  // Set up Cypress environment
  logger.msgSection('Cypress set up')
  config = await credentials.getCookies(config)
  logger.msgWarn('Creating dynamic Cypress environment')
  cypress.saveCypressEnvJson(config)
  cypress.saveCypressJson(config)
  logger.msgOk('Cypress environment created successfully')

  // Create state files
  storage.createStateFiles(config)

  // Make link if base has Cypress folder
  const lnk = path.join(__dirname, '..', 'cypress')
  const src = path.join(__dirname, '..', 'cypress-shared', 'support', 'common')
  const cyp = path.join(__dirname, '..', '..', 'cypress')
  const dst = path.join(__dirname, '..', '..', 'cypress', 'support')

  if (storage.exists(dst)) {
    logger.msgWarn('Local Cypress detected, linking')

    // Create common links inside cypress
    const com = path.join(dst, 'common')
    const clean = path.join(__dirname, '..', '..')

    logger.msgPad(`${src.replace(clean, '.')} -> ${com.replace(clean, '.')}`)
    if (storage.exists(com)) storage.unLink(com)
    storage.link(src, com)

    // Create cypress link inside cy-runner
    logger.msgPad(`${cyp.replace(clean, '.')} -> ${lnk.replace(clean, '.')}`)
    if (storage.exists(lnk)) storage.unLink(lnk)
    storage.link(cyp, lnk)

    logger.msgOk('Cypress linked successfully')
  }

  return config
}

exports.getWorkspaceName = (config) => {
  const { workspace } = config

  workspace.random = false
  if (workspace.name === 'random') {
    const seed = tick()
    const { prefix } = workspace

    workspace.random = true
    workspace.name = `${prefix}${seed.toString().substring(6, 13)}`
  }

  logger.msgOk('Workspace to be used or created')
  logger.msgPad(workspace.name)

  return workspace.name
}

exports.sectionsToRun = async (config) => {
  logger.msgSection('Sections to run')
  const getList = (item, property) => {
    const list = get(config, `${item}.${property}`)

    return list !== undefined ? list : []
  }

  system.traverse([], config).forEach((item) => {
    // eslint-disable-next-line vtex/prefer-early-return
    if (/enabled/.test(item.key) && /true/.test(item.type)) {
      const [itemEnabled] = item.key.split('.enabled')

      logger.msgOk(itemEnabled)
      getList(itemEnabled, 'specs').forEach((spec) => {
        logger.msgPad(`runs ${spec}`)
      })
      getList(itemEnabled, 'dependency').forEach((dep) => {
        logger.msgPad(`deps ${dep}`)
      })
    }
  })

  const NUM_APPS_INSTALL = config.workspace.installApps.length
  const NUM_APPS_REMOVE = config.workspace.removeApps.length

  if (NUM_APPS_INSTALL) {
    logger.msgOk('Apps to be installed')
    getList('workspace', 'installApps').forEach((app) => {
      logger.msgPad(app)
    })
  }

  if (NUM_APPS_REMOVE) {
    logger.msgOk('Apps to be removed')
    getList('workspace', 'removeApps').forEach((app) => {
      logger.msgPad(app)
    })
  }
}
