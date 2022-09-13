const logger = require('./logger')
const system = require('./system')
const cypress = require('./cypress')

module.exports.report = async (control, config) => {
  logger.msgSection('Execution report')

  logger.msgOk('Execution time')

  for (const section in control.timing) {
    logger.msgPad(`${section.padEnd(30, '.')} ${control.timing[section]}`)
  }

  logger.newLine()

  if (config.base.cypress.devMode) {
    system.success('Hope your tests went well. See you soon!')
  } else {
    const items = [
      ['specsDisabled', 'Disabled', 'warn'],
      ['specsPassed', 'Successful', 'ok'],
      ['specsSkipped', 'Skipped', 'error'],
      ['specsFailed', 'Failed', 'error'],
    ]

    items.forEach((item) => {
      const tests = control[item[0]]

      // eslint-disable-next-line vtex/prefer-early-return
      if (tests?.length > 0) {
        const str = tests.length > 1 ? 'specs' : 'spec'

        logger.msgOk(`${item[1]} ${str}`, item[2])
        tests.sort()
        tests.forEach((test) => {
          logger.msgPad(cypress.specNameClean(test))
        })

        logger.newLine()
      }
    })

    if (control.runUrl != null) cypress.showDashboard(control.runUrl)

    control.specsFailed?.length < 1 && control.specsSkipped?.length < 1
      ? system.success('The test ran successfully, well done!')
      : system.fail('The test failed!')
  }
}
