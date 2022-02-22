const qe = require('./conductor/utils')
const { secrets, vtex } = require('./conductor/config')
const { vtexCli } = require('./conductor/cli')
const { vtexSetup } = require('./conductor/setup')
const { vtexTeardown } = require('./conductor/teardown')
const START = Date.now()

async function main() {
  // Report integration options
  for (const item in vtex.integration) {
    let status = vtex.integration[item] ? 'enabled' : 'disabled'
    qe.msg(`${item.toUpperCase()} integration is ${status}`)
    if (!vtex.integration[item] && item == 'vtexCli') {
      if (!vtex.configuration.devMode) {
        qe.msgDetail('You are running with vtexCli and devMode disabled')
        qe.msgDetail('I hope you know what you are doing =D')
      }
    }
  }

  // VTEX CLI
  const PATH = await vtexCli(vtex.configuration, vtex.integration.vtexCli)
  process.env.PAHT = PATH

  // Workspace setup
  const WKS = await vtexSetup(vtex.workspace, vtex.configuration, START)
  vtex.workspace.setup.name = WKS

  // Teardown
  if (vtex.workspace.teardown.enabled) await vtexTeardown(vtex.workspace)
}

main()
