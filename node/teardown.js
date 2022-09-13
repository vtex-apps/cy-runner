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
  storage.write(toolbelt.ls(), APPS_INSTALLED)
  logger.msgPad(APPS_DEPENDENCY.replace(system.basePath(), '.'))
  storage.write(toolbelt.dependency(), APPS_DEPENDENCY)
  logger.msgOk('Apps versions saved successfully')

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

  // Keep state files
  if (config.base.keepStateFiles) storage.keepStateFiles(config)

  return system.tack(START)
}
