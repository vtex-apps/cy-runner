const qe = require('./utils')

module.exports.vtexWipe = async (config) => {
  qe.msg(`Wipe workspace "${config.testWorkspace.name}"`)
  let wipe = config.testWorkspace.wipe
  let stopOnFail = wipe.stopOnFail
  let testPassed = await qe.runCypress(wipe.spec, config)
  if (!testPassed && stopOnFail) {
    qe.msg('[testWorkspace] failed')
    qe.msgDetail('[wipe.stopOnFail] enabled, stopping the tests')
    qe.crash('Prematurely exit duo a [stopOnFail]')
  }
}
