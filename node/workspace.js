const path = require('path')

const system = require('./system')
const logger = require('./logger')
const toolbelt = require('./toolbelt')
const storage = require('./storage')

exports.init = async (config) => {
  const START = system.tick()
  const NAME = config.workspace.name

  logger.msgSection('Workspace set up')
  logger.msgOk('Change workspace')

  const check = await toolbelt.changeWorkspace(NAME)

  check ? logger.msgPad(NAME) : system.crash('Failed to change workspace', NAME)

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
    const link = await toolbelt.link(APP)

    link.stderr.on('data', (data) => {
      logger.msgPad(data)
    })

    link.stdout.on('data', (data) => {
      if (/App running/.test(data)) {
        logger.msgOk('App linked successfully')

        return { success: true, time: system.tack(START) }
      }
    })
  }

  //
  //   const MAX_TRIES = 8
  //   let THIS_TRY = 0
  //
  //   while (!check) {
  //     THIS_TRY++
  //     if (THIS_TRY === MAX_TRIES) {
  //       logger.msgError('Failed to link the app')
  //
  //       return { success: false, time: system.tack(START) }
  //     }
  //
  //     // eslint-disable-next-line no-await-in-loop
  //     await system.delay(10000)
  //     // eslint-disable-next-line no-await-in-loop
  //     check = RegExp(APP).test(await toolbelt.dependency())
  //     logger.msgPad('Waiting 10 more seconds to link gets ready')
  //   }
  //
  //   logger.msgOk('App linked successfully')
  // }

  return { success: false, time: system.tack(START) }
}
