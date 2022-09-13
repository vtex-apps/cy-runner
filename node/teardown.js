const path = require('path')

const system = require('./system')
const logger = require('./logger')
const toolbelt = require('./toolbelt')
const storage = require('./storage')
const { wipe } = require('./wipe')

module.exports.teardown = async (config) => {
  const START = system.tick()
  const { workspace } = config

  logger.msgSection('Workspace teardown')

  // Collect apps versions used on the test
  const APPS_INSTALLED = path.join(logger.logPath(), '_apps_installed.txt')
  const APPS_DEPENDENCY = path.join(logger.logPath(), '_apps_dependency.json')

  logger.msgWarn('Saving apps versions used on this test')
  logger.msgPad(APPS_INSTALLED.replace(system.basePath(), '.'))
  storage.write((await toolbelt.ls()).toString(), APPS_INSTALLED)
  logger.msgPad(APPS_DEPENDENCY.replace(system.basePath(), '.'))
  storage.write((await toolbelt.dependency()).toString(), APPS_DEPENDENCY)
  logger.msgOk('Apps versions saved successfully')

  // Save debug file
  logger.msgWarn('Saving debug.json')
  const SRC = system.debugFile()
  const DST = path.join(logger.logPath(), 'debug.json')

  logger.msgPad(`${SRC} -> ${DST.replace(system.basePath(), '.')}`)
  storage.copy(SRC, DST)
  logger.msgOk('Debug file saved successfully')

  // Remove sensitive files
  const SENSITIVE_FILES = ['cypress.env.json', 'cypress.json']

  logger.msgWarn('Removing sensitive files')
  SENSITIVE_FILES.forEach((file) => {
    logger.msgPad(file)
    storage.delete(file)
  })
  logger.msgOk('Sensitive files removed successfully')

  // Keep state files
  if (config.base.keepStateFiles) storage.keepStateFiles(config)

  // Do wipe
  await wipe(config)

  // Remove dynamic workspace
  if (workspace.teardown.enabled) {
    logger.msgWarn(`Removing workspace ${workspace.name}`)
    if (await toolbelt.deleteWorkspace(workspace.name)) {
      logger.msgOk(`Workspace deleted successfully`)
    } else {
      logger.msgError(`Workspace delete failed`)
    }
  }

  return system.tack(START)
}
