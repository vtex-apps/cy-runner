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
  logger.msgOk('Change workspace')
  logger.msgPad(NAME)

  const check = await toolbelt.changeWorkspace(NAME)

  if (!check) system.crash('Failed to change workspace')

  return system.tack(START)
}

exports.installApps = async (config) => {
  const START = system.tick()
  const APPS = config.workspace.installApps

  if (APPS?.length) {
    logger.msgOk('Install apps')
    const check = await toolbelt.install(APPS)

    if (!check) system.crash('Failed to install apps', 'Check the logs')
  }

  return system.tack(START)
}

exports.uninstallApps = async (config) => {
  const START = system.tick()
  const APPS = config.workspace.removeApps

  if (APPS?.length) {
    logger.msgOk('Uninstall apps')
    const check = await toolbelt.uninstall(APPS)

    if (!check) system.crash('Failed to uninstall apps', 'Check the logs')
  }

  return system.tack(START)
}

exports.updateVtexIgnore = async () => {
  const IGNORE_FILE = path.join(system.basePath(), '.vtexignore')
  const SHORT_NAME = IGNORE_FILE.replace(system.rootPath(), '.')

  logger.msgOk(`Update ${SHORT_NAME}`)
  if (!storage.exists(IGNORE_FILE)) storage.write('# cy-runner', IGNORE_FILE)
  const IGNORE_DATA = storage.read(IGNORE_FILE).toString()
  const EXCLUSIONS = ['cypress', 'cy-runner', 'cypress-shared']

  EXCLUSIONS.forEach((exclusion) => {
    const check = RegExp(exclusion).test(IGNORE_DATA)

    logger.msgPad(exclusion)
    if (!check) storage.append(`${exclusion}\n`, IGNORE_FILE)
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
    logger.msgOk(`Read ${SHORT_NAME}`)
    const MANIFEST = storage.readYaml(MANIFEST_FILE)
    const APP = `${MANIFEST.vendor}.${MANIFEST.name}@${MANIFEST.version}`

    // Link app
    logger.msgOk(`Link ${APP}`)
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

      logger.msgPad('waiting 10 seconds until the link gets ready')
      // eslint-disable-next-line no-await-in-loop
      await system.delay(10000)

      const log = storage.read(APP_LOG)

      check = /App running/.test(log.toString())
    }

    check
      ? logger.msgOk('App linked successfully')
      : logger.msgError('Failed to link app')

    storage.write(link.pid.toString(), APP_PID)

    return { success: check, time: system.tack(START), subprocess: link }
  }

  return { success: true, time: system.tack(START), subprocess: null }
}

exports.teardown = async (config) => {
  const START = system.tick()
  const { workspace } = config

  logger.msgSection('Workspace teardown')
  await this.dumpAppsVersion()
  await this.dumpDebug()
  await this.cleanSensitiveData()
  if (config.base.keepStateFiles) await storage.keepStateFiles(config)
  await wipe(config)
  if (workspace.teardown.enabled) await toolbelt.deleteWorkspace(workspace.name)

  return system.tack(START)
}

// Save apps list
exports.dumpAppsVersion = async () => {
  const APPS_INSTALLED = path.join(logger.logPath(), '_apps_installed.txt')
  const APPS_DEPENDENCY = path.join(logger.logPath(), '_apps_dependency.json')

  logger.msgOk('Dump apps versions')
  logger.msgPad(APPS_INSTALLED.replace(system.basePath(), '.'))
  storage.write((await toolbelt.ls()).toString(), APPS_INSTALLED)
  logger.msgPad(APPS_DEPENDENCY.replace(system.basePath(), '.'))
  storage.write((await toolbelt.dependency()).toString(), APPS_DEPENDENCY)
}

// Clean sensitive data
exports.cleanSensitiveData = async () => {
  const SENSITIVE_FILES = ['cypress.env.json', 'cypress.json']

  logger.msgOk('Clean sensitive data')
  SENSITIVE_FILES.forEach((file) => {
    logger.msgPad(file)
    storage.delete(file)
  })
}

// Save debug file
exports.dumpDebug = async () => {
  logger.msgOk('Dump toolbelt debug')
  const SRC = system.debugFile()
  const DST = path.join(logger.logPath(), '_debug.json')

  logger.msgPad(`${SRC} -> ${DST.replace(system.basePath(), '.')}`)
  storage.copy(SRC, DST)
}
