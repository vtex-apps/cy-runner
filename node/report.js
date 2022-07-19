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
      ['specsPassed', 'Successful', 'ok'],
      ['specsSkipped', 'Skipped', 'warn'],
      ['specsFailed', 'Failed', 'error'],
    ]

    items.forEach((item) => {
      const tests = control[item[0]]

      // eslint-disable-next-line vtex/prefer-early-return
      if (tests.length > 0) {
        const str = tests.length > 1 ? 'specs' : 'spec'

        qe.msg(`${item[1]} ${str}`, item[2])
        tests.forEach((test) => {
          qe.msg(test, true, true)
        })
        qe.newLine()
      }
    })

    if (control.runUrl != null) {
      qe.msg('Cypress Dashboard URL for this run')
      qe.msg(control.runUrl, true, true)
    }

    control.specsFailed.length < 1 && control.specsPassed.length > 0
      ? qe.success('The test ran successfully, well done!')
      : qe.fail(`The test failed!`)
  }
}
