const system = require('./system')
const logger = require('./logger')
const cypress = require('./cypress')
const storage = require('./storage')

module.exports.wipe = async (config) => {
  const { wipe } = config.workspace

  // eslint-disable-next-line vtex/prefer-early-return
  if (wipe.enabled) {
    const SENSITIVE_FILES = ['cypress.env.json', 'cypress.json']
    const { stopOnFail } = wipe

    logger.msgWarn('Wiping data')

    const result = await cypress.run(wipe, config)

    if (result[0].totalFailed) {
      logger.msgError('Failed to clean data')
      logger.msgPad('Look into the logs folder to get more information')
      if (stopOnFail) {
        system.crash('Crash dua a stopOnFail trigger', 'Wipe failed')
      }
    } else {
      logger.msgOk('Data cleaned successfully')
    }

    logger.msgWarn('Removing sensitive files')
    SENSITIVE_FILES.forEach((file) => {
      logger.msgPad(file)
      storage.delete(file)
    })
    logger.msgOk('Sensitive files removed successfully')
  }
}
