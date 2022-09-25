const logger = require('./logger')
const cypress = require('./cypress')

module.exports.wipe = async (config) => {
  const { wipe } = config.workspace

  // eslint-disable-next-line vtex/prefer-early-return
  if (wipe.enabled) {
    logger.msgOk('Wiping data')

    // Disable parallelism for wipe and increase verbosity
    logger.msgPad('Setting maxJobs to 0')
    config.base.cypress.maxJobs = 0
    logger.msgPad('Setting quiet to false')
    config.base.cypress.quiet = false

    // Remove data
    logger.msgPad('Running wipe')
    const results = await cypress.run(wipe, config)
    let success = false

    results.forEach((result) => {
      if (result.success) if (!result.specsFailed?.length) success = true
    })

    success
      ? logger.msgOk('Data wiped successfully')
      : logger.msgError('Failed to wipe data')
  }
}
