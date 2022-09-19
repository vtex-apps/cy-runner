const logger = require('./logger')
const system = require('./system')
const cypress = require('./cypress')

module.exports.report = async (control, config) => {
  logger.msgSection('Execution report', true)

  logger.msgOk('Execution time', true)

  for (const section in control.timing) {
    logger.msgPad(`${section.padEnd(30, '.')} ${control.timing[section]}`, true)
  }

  logger.newLine(1, true)

  if (config.base.cypress.devMode) {
    system.success('Hope your tests went well. See you soon!')
  } else {
    this.printSpecs(control)

    if (control.runUrl != null) cypress.showDashboard(control.runUrl)

    // Final result
    control.specsFailed?.length < 1 &&
    control.specsSkipped?.length < 1 &&
    control.specsPassed?.length > 0
      ? system.success('The test ran successfully, well done!')
      : system.fail('The test failed! Please, check the artifacts.')
  }
}

module.exports.printSpecs = (control) => {
  const items = [
    ['specsDisabled', 'Disabled', 'ok'],
    ['specsPassed', 'Successful', 'ok'],
    ['specsSkipped', 'Skipped', 'warn'],
    ['specsFailed', 'Failed', 'error'],
  ]

  items.forEach((item) => {
    const tests = control[item[0]]

    // eslint-disable-next-line vtex/prefer-early-return
    if (tests?.length > 0) {
      const str = tests.length > 1 ? 'specs' : 'spec'

      if (item[2] === 'ok') logger.msgOk(`${item[1]} ${str}`, true)
      if (item[2] === 'warn') logger.msgWarn(`${item[1]} ${str}`, true)
      if (item[2] === 'error') logger.msgError(`${item[1]} ${str}`, true)
      tests.sort()
      tests.forEach((test) => {
        logger.msgPad(cypress.specNameClean(test), true)
      })

      logger.newLine(1, true)
    }
  })
}
