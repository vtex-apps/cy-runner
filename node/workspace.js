const path = require('path')

const lock = require('./lock')
const system = require('./system')
const logger = require('./logger')
const toolbelt = require('./toolbelt')
const storage = require('./storage')
const { wipe } = require('./wipe')

const MAX_RETRIES = 3

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
    let check = { success: false, log: null }
    let thisTry = 1

    while (thisTry <= MAX_RETRIES && !check.success) {
      logger.msgOk(`[try ${thisTry}/${MAX_RETRIES}] Installing apps`)
      // eslint-disable-next-line no-await-in-loop
      check = await toolbelt.install(APPS)
      thisTry++
    }

    if (!check.success) system.crash('Failed to install some app', check.log)
  }

  return system.tack(START)
}

exports.uninstallApps = async (config) => {
  const START = system.tick()
  const APPS = config.workspace.removeApps

  if (APPS?.length) {
    let check = { success: false, log: null }
    let thisTry = 1

    while (thisTry <= MAX_RETRIES && !check.success) {
      logger.msgOk(`[try ${thisTry}/${MAX_RETRIES}] Uninstalling apps`)
      // eslint-disable-next-line no-await-in-loop
      check = await toolbelt.uninstall(APPS)
      thisTry++
    }

    if (!check.success) system.crash('Failed to uninstall some app', check.log)
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
    let APP_LOG = path.join(logger.logPath(), `_link_${APP}.log`)
    const APP_PID = path.join(logger.logPath(), `_pid`)
    const STOP = 13
    const link = await toolbelt.link(APP_LOG)
    let check = false
    let loop = 0

    while (!check) {
      // To not wait forever
      loop++
      if (loop === STOP) break
      if (link.killed) system.crash('Link failed', JSON.stringify(link))

      logger.msgPad(`waiting ${130 - loop * 10} seconds until link gets ready`)
      // eslint-disable-next-line no-await-in-loop
      await system.delay(10000)

      const log = storage.read(APP_LOG)

      check = /App running | App linked successfully/.test(log.toString())
    }

    if (check) {
      logger.msgOk('App linked successfully')
    } else {
      APP_LOG = APP_LOG.replace(system.cyRunnerPath(), '.')
      logger.msgError('Failed to link app, you should', true)
      logger.msgPad(`1. Read the log ${APP_LOG}`, true)
      logger.msgPad('2. Fix your code if get some error on log', true)
      logger.msgPad('3. Try the E2E test again', true)
      logger.msgWarn('The link fail due an error or timeout (120 s)', true)
    }

    if (link.pid) storage.write(link.pid.toString(), APP_PID)

    return { success: check, time: system.tack(START), subprocess: link }
  }

  return { success: true, time: system.tack(START), subprocess: null }
}

exports.teardown = async (config, linkSucceed = true) => {
  const START = system.tick()
  const { workspace } = config
  const RESERVE = config.workspace?.reserveAccount?.enabled

  if (RESERVE) await lock.releaseAccount(config)

  logger.msgSection('Workspace teardown')
  await this.dumpEnvironment()
  storage.keepDebugFiles()
  if (config.base.keepStateFiles) storage.keepStateFiles(config)
  // Run wipe only if link succeeds
  if (linkSucceed) await wipe(config)
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
  let DST = path.join(logger.logPath(), '_debug.json')

  logger.msgPad(`${SRC} -> ${DST.replace(system.basePath(), '.')}`)
  storage.copy(SRC, DST)

  DST = path.join(logger.logPath(), '_node_versions.json')
  logger.msgPad(`Node versions -> ${DST.replace(system.basePath(), '.')}`)
  storage.append(JSON.stringify(process.versions), DST)

  DST = path.join(logger.logPath(), '_env.txt')
  logger.msgPad(`Env variables -> ${DST.replace(system.basePath(), '.')}`)
  delete process.env.VTEX_QE
  storage.append(JSON.stringify(process.env), DST)
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
