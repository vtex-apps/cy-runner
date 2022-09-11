const system = require('./system')
const logger = require('./logger')
const toolbelt = require('./toolbelt')
const storage = require('./storage')
const { wipe } = require('./wipe')

module.exports.teardown = async (config) => {
  const START = system.tick()
  const { workspace } = config
  const TEARDOWN_SET = [
    workspace.wipe.enabled,
    workspace.teardown.enabled,
    config.base.keepStateFiles,
  ]

  const FOUND = []

  TEARDOWN_SET.forEach((set) => {
    if (set) FOUND.push(set)
  })

  if (FOUND.length) {
    logger.msgSection('Workspace teardown')

    // Do wipe
    await wipe(config)

    // Remove dynamic workspace
    if (workspace.teardown.enabled) {
      logger.msgWarn(`Removing workspace ${workspace.name}`)
      if (await toolbelt.deleteWorkspace(workspace.name)) {
        logger.msgOk(`Workspace ${workspace.name} deleted successfully`)
      } else {
        logger.msgError(`Workspace ${workspace.name} delete failed`)
      }
    }

    // Keep state files
    if (config.base.keepStateFiles) storage.keepStateFiles(config)
  }

  return system.tack(START)
}
