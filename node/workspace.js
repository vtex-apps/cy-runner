const path = require('path')

const system = require('./system')
const logger = require('./logger')
const toolbelt = require('./toolbelt')
const storage = require('./storage')
const { wipe } = require('./wipe')

exports.init = async (config) => {
  const START = system.tick()
  const NAME = config.workspace.name

  logger.msgSection('Workspace set up')
  logger.msgOk('Changing workspace')
  logger.msgPad(NAME)

  const check = await toolbelt.changeWorkspace(NAME)

  if (!check) system.crash('Failed to change workspace')

  return system.tack(START)
}

exports.installApps = async (config) => {
  const START = system.tick()
  const APPS = config.workspace.installApps

  if (APPS?.length) {
    logger.msgOk('Installing apps')
    const check = await toolbelt.install(APPS)

    if (!check) system.crash('Failed to install apps', 'Check the logs')
  }

  return system.tack(START)
}

exports.uninstallApps = async (config) => {
  const START = system.tick()
  const APPS = config.workspace.removeApps

  if (APPS?.length) {
    logger.msgOk('Uninstalling apps')
    const check = await toolbelt.uninstall(APPS)

    if (!check) system.crash('Failed to uninstall apps', 'Check the logs')
  }

  return system.tack(START)
}

exports.updateVtexIgnore = async () => {
  const IGNORE_FILE = path.join(system.basePath(), '.vtexignore')
  const SHORT_NAME = IGNORE_FILE.replace(system.rootPath(), '.')

  logger.msgOk(`Updating ${SHORT_NAME}`)
  if (!storage.exists(IGNORE_FILE)) storage.write('# cy-r\n', IGNORE_FILE)
  const EXCLUSIONS = ['cypress', 'cy-runner', 'cypress-shared']

  EXCLUSIONS.forEach((exclusion) => {
    storage.append(`${exclusion}\n`, IGNORE_FILE)
  })
}

exports.linkApp = async (config) => {
  const START = system.tick()

  // eslint-disable-next-line vtex/prefer-early-return
  if (config.workspace.linkApp.enabled) {
    const MANIFEST_FILE = path.join(system.basePath(), 'manifest.json')
    const SHORT_NAME = MANIFEST_FILE.replace(system.rootPath(), '.')

    // Update vtex ignore
    await this.updateVtexIgnore()

    // Read name of app to be linked
    logger.msgOk(`Reading ${SHORT_NAME}`)
    const MANIFEST = storage.readYaml(MANIFEST_FILE)
    const APP = `${MANIFEST.vendor}.${MANIFEST.name}@${MANIFEST.version}`

    // Link app
    logger.msgOk(`Linking ${APP}`)
    const APP_LOG = path.join(logger.logPath(), `_link_${APP}.log`)
    const APP_PID = path.join(logger.logPath(), `_pid`)
    const STOP = 10
    const link = await toolbelt.link(APP_LOG)
    let check = false
    let loop = 0

    while (!check) {
      // To not wait forever
      loop++
      if (loop === STOP) break

      logger.msgPad('waiting 10 seconds until link gets ready')
      // eslint-disable-next-line no-await-in-loop
      await system.delay(10000)

      const log = storage.read(APP_LOG)

      check = /App running/.test(log.toString())
    }

    if (check) {
      logger.msgOk('App linked successfully')
    } else {
      logger.msgError('Failed to link app, you should', true)
      logger.msgPad(`1. Read the log ${APP_LOG}`, true)
      logger.msgPad('2. Fix your code if get some error on log', true)
      logger.msgPad('3. Try the E2E test again', true)
      logger.msgWarn('The link fail due an error or timeout (90 s)', true)
    }

    if (link.pid) storage.write(link.pid.toString(), APP_PID)

    return { success: check, time: system.tack(START), subprocess: link }
  }

  return { success: true, time: system.tack(START), subprocess: null }
}

exports.teardown = async (config) => {
  const START = system.tick()
  const { workspace } = config

  logger.msgSection('Workspace teardown')
  await this.dumpEnvironment()
  if (config.base.keepStateFiles) storage.keepStateFiles(config)
  await wipe(config)
  await this.cleanSensitiveData()
  if (workspace.teardown.enabled) await toolbelt.deleteWorkspace(workspace.name)

  return system.tack(START)
}

// Save apps list
exports.dumpEnvironment = async () => {
  const APPS_INSTALLED = path.join(logger.logPath(), '_apps_installed.txt')
  const APPS_DEPENDENCY = path.join(logger.logPath(), '_apps_dependency.json')

  logger.msgOk('Dumping environment')
  logger.msgPad(APPS_INSTALLED.replace(system.basePath(), '.'))
  storage.write((await toolbelt.ls()).toString(), APPS_INSTALLED)
  logger.msgPad(APPS_DEPENDENCY.replace(system.basePath(), '.'))
  storage.write((await toolbelt.dependency()).toString(), APPS_DEPENDENCY)

  const SRC = system.debugFile()
  const DST = path.join(logger.logPath(), '_debug.json')

  logger.msgPad(`${SRC} -> ${DST.replace(system.basePath(), '.')}`)
  storage.copy(SRC, DST)
}

// Clean sensitive data
exports.cleanSensitiveData = async () => {
  const SENSITIVE_FILES = ['cypress.env.json', 'cypress.json']

  logger.msgOk('Cleaning sensitive data')
  SENSITIVE_FILES.forEach((file) => {
    logger.msgPad(file)
    storage.delete(file)
  })
}
