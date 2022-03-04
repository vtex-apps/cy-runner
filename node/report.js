const qe = require('./utils')

module.exports.report = async (control) => {
  qe.msgSection('Execution report')

  qe.msg('Execution time')
  for (let section in control.timing)
    qe.msgDetail(`${section.padEnd(30, '.')} ${control.timing[section]}`)

  qe.newLine()

  qe.msg('Strategy status')
  qe.msgDetail('Success'.padEnd(30, '.') + ' ' + control.testsPassed)
  qe.msgDetail('Skipped'.padEnd(30, '.') + ' ' + control.testsSkipped)
  qe.msgDetail('Failure'.padEnd(30, '.') + ' ' + control.testsFailed)

  if (control.testsFailed.length < 1)
    qe.success('The test ran successfully, well done')
  else
    qe.fail(
      `The test was skipped on ${control.testsSkipped} and failed on ${control.testsFailed}`
    )
}
