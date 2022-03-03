const qe = require('./utils')

module.exports.vtexWipe = async (config) => {
  const START = qe.tick()
  if (config.workspace.wipe.enabled) {
    qe.msg(`Wiping workspace [${config.workspace.name}]`)
    let wipe = config.workspace.wipe
    let stopOnFail = wipe.stopOnFail
    let testPassed = await qe.runCypress(wipe, config)
    if (!testPassed && stopOnFail) await qe.stopOnFail(config, 'wipe')
  } else qe.msg('[workspace.wipe] is disabled')
  return qe.toc(START)
}
