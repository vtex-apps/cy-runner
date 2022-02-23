const qe = require('./utils')

module.exports.vtexTeardown = async (workspace, config) => {
  qe.msg(`Teardown workspace "${workspace.name}"`)
  await qe.runCypress(config, workspace.teardown, {
    workspace: workspace,
  })
}
