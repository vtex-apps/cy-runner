const qe = require('./utils')

async function vtexWorkspace(workspace, start) {
  let wks = workspace.name
  if (wks == null) wks = `e2e${start.toString().substr(-7)}`
  process.env.CY_WORKSPACE = wks
}

// Expose
module.exports = {
  vtexWorkspace: vtexWorkspace,
}
