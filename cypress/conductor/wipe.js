const qe = require('./utils')

module.exports.vtexTeardown = async (workspace, config) => {
  qe.msg('Wipe data from test')
  await qe.runCypress(config, workspace.wipe, { workspace: workspace })
}
