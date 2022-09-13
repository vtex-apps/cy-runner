const path = require('path')

const system = require('./system')
const logger = require('./logger')
const toolbelt = require('./toolbelt')
const storage = require('./storage')
const { wipe } = require('./wipe')

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
  logger.msgOk('Dump VTEX toolbelt debug file')
  const SRC = system.debugFile()
  const DST = path.join(logger.logPath(), 'debug.json')

  logger.msgPad(`${SRC} -> ${DST.replace(system.basePath(), '.')}`)
  storage.copy(SRC, DST)
}
