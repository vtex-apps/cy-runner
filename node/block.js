const system = require('./system')
const logger = require('./logger')
const cypress = require('./cypress')
const workspace = require('./workspace')

module.exports.block = async (config) => {
  const { singleRun } = config.workspace

  // eslint-disable-next-line vtex/prefer-early-return
  if (singleRun?.enabled) {
    logger.msgOk('Locking orderForm')

    // Force disable parallelism for wipe
    config.base.cypress.maxJobs = 0

    // Disable wipe
    config.workspace.wipe.enabled = false

    // Lock
    const result = await cypress.run(singleRun, config)

    if (result[0].totalFailed) {
      logger.msgError('Failed to lock')
      await workspace.teardown(config)
      system.crash(
        'Failed to lock, try again later',
        'another test using orderForm is running'
      )
    }
  }
}
