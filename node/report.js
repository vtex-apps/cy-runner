const qe = require('./utils')

module.exports.report = async (control, config) => {
  qe.msgSection('Execution report')

  qe.msg('Execution time')
  for (const section in control.timing) {
    qe.msg(`${section.padEnd(30, '.')} ${control.timing[section]}`, true, true)
  }

  qe.newLine()

  if (config.base.cypress.devMode) {
    qe.success('Hope your tests went well. See you soon!')
  } else {
    const items = [
      ['strategiesPassed', 'Successful', 'ok'],
      ['strategiesSkipped', 'Skipped', 'warn'],
      ['strategiesFailed', 'Failed', 'error'],
    ]

    items.forEach((item) => {
      const tests = control[item[0]]

      // eslint-disable-next-line vtex/prefer-early-return
      if (tests.length > 0) {
        const str = tests.length > 1 ? 'strategies' : 'strategy'

        qe.msg(`${item[1]} ${str}`, item[2])
        tests.forEach((test) => {
          qe.msg(test, true, true)
        })
        qe.newLine()
      }
    })
    if (control.strategiesFailed.length < 1) {
      qe.success('The test ran successfully, well done!')
    } else {
      qe.fail(`The test failed!`)
    }
  }
}
