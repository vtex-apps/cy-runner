const qe = require('./conductor/utils')
const { secrets, vtex } = require('./conductor/config')
const { vtexCli } = require('./conductor/vtexCli')
const { vtexWorkspace } = require('./conductor/vtexWks')
const START = Date.now()

// Report configuration for integration
for (const item in vtex.integration) {
  let status = vtex.integration[item] ? 'enabled' : 'disabled'
  qe.outMsg(`${item.toUpperCase()} integration is ${status}`)
}

// Configure VTEX CLI
if (vtex.integration.vtexCli) vtexCli(vtex.configuration)

// Setup
vtexWorkspace(vtex.workspace.setup, START)
