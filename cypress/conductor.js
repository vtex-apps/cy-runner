const qe = require('./conductor/utils')
const { secrets, vtex } = require('./conductor/config')
const { vtexCli } = require('./conductor/vtexCli')
const { vtexWorkspace } = require('./conductor/vtexWorkspace')
const START = Date.now()

async function main() {
  // Report integration options
  for (const item in vtex.integration) {
    let status = vtex.integration[item] ? 'enabled' : 'disabled'
    qe.outMsg(`${item.toUpperCase()} integration is ${status}`)
  }

  // VTEX CLI
  if (vtex.integration.vtexCli) await vtexCli(vtex.configuration)

  // Workspace setup
  const wks = await vtexWorkspace(vtex.workspace, vtex.configuration, START)
  vtex.workspace.setup.name = wks
}

main()
