const qe = require("./utils")

module.exports.vtexReport = async (control) => {

  qe.report('Execution report')

  qe.msg('Timings')
  for (let section in control.timing)
    qe.msgDetail(`${section} ran in ${control.timing[section]}`)

  qe.msg('Test strategy')
  qe.msgDetail(`SUCCESS: ${control.testsPassed}`)
  qe.msgDetail(`SKIPPED: ${control.testsSkipped}`)
  qe.msgDetail(`FAILURE: ${control.testsFailed}`)

  let status = 0
  if (control.testsFailed.length < 1)
    qe.success('The test ran successfully, well done')
  else {
    qe.fail(`The test was skipped on ${control.testsSkipped} and failed on ${control.testsFailed}`)
    status = 99
  }
  return status
}
