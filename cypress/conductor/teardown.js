const qe = require('./utils')

module.exports.vtexTeardown = async (workspace) => {
  let path = 'cypress/integration/'
  let specFile = path + workspace.teardown.file
  let stopOnFail = workspace.teardown.stopOnFail
  let wks = workspace.name
  qe.msg(`Teardown workspace "${wks}"`)
  await qe.runCypress(specFile, stopOnFail, { workspace: workspace })
}
