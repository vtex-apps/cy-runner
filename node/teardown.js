const qe = require('./utils')

// TODO: Fix this code
module.exports.vtexTeardown = async (config) => {
  const START = qe.tick()
  if (config.workspace.teardown.enabled) {
    qe.msg(`Removing workspace [${config.workspace.name}]`)
    await qe.runCypress(config.workspace.teardown, config)
  } else qe.msg('[workspace.teardown] is disabled')
  return qe.toc(START)
}
