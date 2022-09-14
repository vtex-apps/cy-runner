const system = require('./system')
const logger = require('./logger')
const cypress = require('./cypress')

module.exports.wipe = async (config) => {
  const { wipe } = config.workspace

  // eslint-disable-next-line vtex/prefer-early-return
  if (wipe.enabled) {
    logger.msgOk('Wiping data')

    // Force disable parallelism for wipe
    config.base.cypress.maxJobs = 0

    // Remove data
    const { stopOnFail } = wipe
    const result = await cypress.run(wipe, config)

    if (result[0].totalFailed) {
      logger.msgError('Failed to wipe data')
      if (stopOnFail) system.crash('Triggered stopOnFail', 'Wipe failed')
    } else {
      logger.msgOk('Data wiped successfully')
    }
  }
}
