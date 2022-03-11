const qe = require('./utils')

module.exports.report = async (control, config) => {
  qe.msgSection('Execution report')

  qe.msg('Execution time')
  for (const section in control.timing) {
    qe.msg(`${section.padEnd(30, '.')} ${control.timing[section]}`, true, true)
  }

  qe.newLine()

  if (config.workspace.runInDevMode) {
    qe.success('Hope your tests went well. See you soon!')
  } else {
    qe.msg('Strategy status')
    if (control.testsPassed.length > 0) {
      qe.msg(`${'Success'.padEnd(30, '.')} ${control.testsPassed}`, true, true)
    }

    if (control.testsSkipped.length > 0) {
      qe.msg(`${'Skipped'.padEnd(30, '.')} ${control.testsSkipped}`, true, true)
    }

    if (control.testsFailed.length > 0) {
      qe.msg(`${'Failure'.padEnd(30, '.')} ${control.testsFailed}`, true, true)
    }

    if (control.testsFailed.length < 1) {
      qe.success('The test ran successfully, well done!')
    } else {
      qe.fail(`The test failed!`)
    }

    if (control.testsSkipped.length > 0) {
      qe.msg(`${'Skipped'.padEnd(30, '.')} ${control.testsSkipped}`, true, true)
    }

    if (control.testsFailed.length > 0) {
      qe.msg(`${'Failure'.padEnd(30, '.')} ${control.testsFailed}`, true, true)
    }

    if (control.testsFailed.length < 1) {
      qe.success('The test ran successfully, well done')
    } else {
      qe.fail(`The test failed`)
    }
  }
}
