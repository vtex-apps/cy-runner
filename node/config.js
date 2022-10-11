const path = require('path')

const { get } = require('lodash')

const logger = require('./logger')
const storage = require('./storage')
const credentials = require('./credentials')
const lock = require('./lock')
const system = require('./system')
const cypress = require('./cypress')
const http = require('./http')

exports.getConfig = async (configFile) => {
  // Load and parse cy-runner.yml file
  logger.msgOk('Loading cy-runner configuration')
  let config = storage.loadConfig(configFile)

  // Check toolbelt version
  logger.msgOk('Checking toolbelt version')
  await system.vtexBin(true)

  // Fill URLs
  const VTEX_AUTH_PATH = '.myvtex.com/api/vtexid/pub/authentication'
  const VTEX_ACCOUNT = config.base.vtex.account
  const WORKSPACE = await this.getWorkspaceName(config)
  const ACCOUNT = config.base.vtex.account
  const DOMAIN = config.base.vtex.domain
  const RESERVE = config.workspace?.reserveAccount?.enabled

  config.base.vtex.authUrl = `https://${VTEX_ACCOUNT}${VTEX_AUTH_PATH}`
  config.base.vtex.baseUrl = `https://${WORKSPACE}--${ACCOUNT}.${DOMAIN}`

  // Load and parse secrets
  const secrets = credentials.readSecrets(config)

  // Lock the orderForm, if it is the case, in CI the lock is done by GH Actions
  if (RESERVE) await lock.reserveAccount(config, secrets)

  // Do check to avoid waste of time on CI environments
  const SKIP_AUTO_CONFIG = config.base.skipAutoConfigOnCI ?? false

  // Checks to avoid silly configuration errors on CI
  if (system.isCI() && !SKIP_AUTO_CONFIG) {
    logger.msgWarn('Auto configuring Cypress flags')
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

  // Inject envs to make sure local tests will run like GitHub
  if (!config.envs) config.envs = []
  config.envs.push(
    'ELECTRON_EXTRA_LAUNCH_ARGS: --disable-gpu --disable-software-rasterizer'
  )
  config.envs.push('LIBVA_DRIVER_NAME: --disable-software-rasterizer')
  config.envs.push('DISPLAY: :99')
  config.envs.push('NODE_NO_WARNINGS: 1')

  // Clean debug and disable Sorry if not listening on 1233
  if (!system.isCI()) {
    logger.msgOk('Cleaning debug file')
    storage.delete(system.debugFile())
    logger.msgPad(system.debugFile())

    const sorryRunning = await http.runningSorryCypress()

    if (!sorryRunning) {
      logger.msgError('Sorry Cypress not running')
      logger.msgPad('disabling dashboard')
      logger.msgPad('disabling parallelization')
      logger.msgPad('waiting 7 seconds to you cancel and try again')
      await system.delay(7000)
      config.base.cypress.maxJobs = 0
    }
  }

  // Merge secrets on config
  if (secrets) config = credentials.mergeSecrets(config, secrets)

  // Report configuration to help understand that'll run
  await this.sectionsToRun(config)

  // Set up Cypress environment
  logger.msgSection('Cypress set up')
  config = await credentials.getCookies(config)
  logger.msgOk('Creating Cypress environment')
  cypress.saveCypressEnvJson(config)
  cypress.saveCypressJson(config)

  // Create state files
  storage.createStateFiles(config)

  // Make link if base has Cypress folder
  const lnk = path.join(__dirname, '..', 'cypress')
  const src = path.join(__dirname, '..', 'cypress-shared', 'support', 'common')
  const cyp = path.join(__dirname, '..', '..', 'cypress')
  const dst = path.join(__dirname, '..', '..', 'cypress', 'support')

  if (storage.exists(dst)) {
    logger.msgOk('Linking local Cypress code on Cy-Runner')

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
  }

  // Export envs to make debug easier inside GitHub
  if (config.envs && system.isCI()) {
    logger.msgOk('Exporting envs variables')
    config.envs.forEach((env) => {
      const [envName, envValue] = env.split(': ')

      logger.msgPad(`${envName} = ${envValue}`)
      process.env[envName] = envValue
    })
  }

  return config
}

exports.getWorkspaceName = async (config) => {
  const { workspace } = config

  if (workspace.name === 'random') {
    const id = system.getId()
    const { prefix } = workspace

    workspace.name = `${prefix}${id}`
  } else {
    workspace.name = workspace.name.toLowerCase()
  }

  logger.msgOk('Defining workspace')
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
        logger.msgPad(cypress.specNameClean(spec))
      })
      getList(itemEnabled, 'dependency').forEach((dep) => {
        logger.msgPipe(cypress.specNameClean(dep))
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
