const qe = require('./utils')

module.exports.vtexTeardown = async (config) => {
  qe.msg(`Teardown workspace "${config.testWorkspace.name}"`)
  let teardown = config.testWorkspace.teardown
  let stopOnFail = teardown.stopOnFail
  let testPassed = await qe.runCypress(teardown.spec, config)
  if (!testPassed && stopOnFail) {
    qe.msg('[testWorkspace] failed')
    qe.msgDetail('[teardown.stopOnFail] enabled, stopping the tests')
    qe.crash('Prematurely exit duo a [stopOnFail]')
  }
}
