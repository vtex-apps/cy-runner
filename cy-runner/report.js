const qe = require("./utils")

module.exports.vtexReport = async (control) => {

  qe.report('Execution report')

  qe.msg('Timings')
  for (let section in control.timing)
    qe.msgDetail(`${section} ran in ${control.timing[section]}`)

  qe.newLine()
  
  qe.msg('Test strategy')
  qe.msgDetail(`Success: ${control.testsPassed}`)
  qe.msgDetail(`Skipped: ${control.testsSkipped}`)
  qe.msgDetail(`Failure: ${control.testsFailed}`)

  if (control.testsFailed.length < 1)
    qe.success('The test ran successfully, well done')
  else
    qe.fail(`The test was skipped on ${control.testsSkipped} and failed on ${control.testsFailed}`)
}
