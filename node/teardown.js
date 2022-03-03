const qe = require('./utils')

module.exports.vtexTeardown = async (config) => {
  const START = qe.tick()
  if (config.testWorkspace.teardown.enabled) {
    qe.msg(`Removing workspace [${config.testWorkspace.name}]`)
    await qe.runCypress(config.testWorkspace.teardown, config)
  } else qe.msg('[testWorkspace.teardown] is disabled')
  return qe.toc(START)
}
