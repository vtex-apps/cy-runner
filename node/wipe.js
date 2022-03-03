const qe = require('./utils')

module.exports.vtexWipe = async (config) => {
  const START = qe.tick()
  if (config.testWorkspace.wipe.enabled) {
    qe.msg(`Wiping workspace [${config.testWorkspace.name}]`)
    let wipe = config.testWorkspace.wipe
    let stopOnFail = wipe.stopOnFail
    let testPassed = await qe.runCypress(wipe, config)
    if (!testPassed && stopOnFail) await qe.stopOnFail(config, 'wipe')
  } else qe.msg('[testWorkspace.wipe] is disabled')
  return qe.toc(START)
}
