const path = require('path')

const system = require('./system')
const logger = require('./logger')
const toolbelt = require('./toolbelt')
const storage = require('./storage')

exports.init = async (config) => {
  const START = system.tick()
  const NAME = config.workspace.name

  logger.msgSection('Workspace set up')
  logger.msgWarn(`Changing workspace to ${NAME}`)

  const check = await toolbelt.changeWorkspace(NAME)

  check
    ? logger.msgOk('Changed workspace successfully')
    : logger.msgError('Failed to change the workspace')

  return { success: check, time: system.tack(START) }
}

exports.installApps = async (config) => {
  const START = system.tick()
  const APPS = config.workspace.installApps
  let check = true

  // eslint-disable-next-line vtex/prefer-early-return
  if (APPS?.length) {
    logger.msgWarn('Installing Apps')
    check = await toolbelt.install(APPS)
    check
      ? logger.msgOk('Apps installed successfully')
      : logger.msgError('Failed to install apps')
  }

  return { success: check, time: system.tack(START) }
}

exports.uninstallApps = async (config) => {
  const START = system.tick()
  const APPS = config.workspace.removeApps
  let check = true

  // eslint-disable-next-line vtex/prefer-early-return
  if (APPS?.length) {
    logger.msgWarn('Uninstalling Apps')
    check = await toolbelt.uninstall(APPS)
    check
      ? logger.msgOk('Apps uninstalled successfully')
      : logger.msgError('Failed to uninstall apps')
  }

  return { success: check, time: system.tack(START) }
}

exports.updateVtexIgnore = async () => {
  const IGNORE_FILE = path.join(system.basePath(), '.vtexignore')
  const SHORT_NAME = IGNORE_FILE.replace(system.rootPath(), '.')

  logger.msgWarn(`Updating ${SHORT_NAME} to ignore cy-runner files`)
  if (!storage.exists(IGNORE_FILE)) storage.write('# cy-runner', IGNORE_FILE)
  const IGNORE_DATA = storage.read(IGNORE_FILE).toString()
  const EXCLUSIONS = ['cypress', 'cy-runner', 'cypress-shared']

  EXCLUSIONS.forEach((exclusion) => {
    const check = RegExp(exclusion).test(IGNORE_DATA)

    if (!check) storage.append(`${exclusion}\n`, IGNORE_FILE)
  })
  logger.msgOk('Ignore file updated successfully')
}

exports.linkApp = async (config) => {
  const START = system.tick()
  let check = false

  // eslint-disable-next-line vtex/prefer-early-return
  if (config.workspace.linkApp.enabled) {
    const MANIFEST_FILE = path.join(system.basePath(), 'manifest.json')
    const SHORT_NAME = MANIFEST_FILE.replace(system.rootPath(), '.')

    // Read name of app to be linked
    logger.msgWarn(`Reading ${SHORT_NAME}`)
    const MANIFEST = storage.readYaml(MANIFEST_FILE)
    const APP = `${MANIFEST.vendor}.${MANIFEST.name}@${MANIFEST.version}`
    const ARR = system.dropMinor(APP)

    logger.msgOk('Manifest read successfully')

    // Update vtex ignore
    await this.updateVtexIgnore()

    // Link app
    logger.msgWarn(`Linking ${APP}`)
    toolbelt.link(APP)
    const MAX_TRIES = 8
    let THIS_TRY = 0

    while (!check) {
      THIS_TRY++
      if (THIS_TRY === MAX_TRIES) {
        logger.msgError('Failed to link the app')

        return { success: false, time: system.tack(START) }
      }

      // eslint-disable-next-line no-await-in-loop
      await system.delay(10000)
      // eslint-disable-next-line no-await-in-loop
      check = RegExp(`${ARR[0]}.*${ARR[1]}`).test(await toolbelt.ls())
      logger.msgPad('Waiting 10 more seconds to link gets ready')
    }

    logger.msgOk('App linked successfully')
  }

  return { success: check, time: system.tack(START) }
}
