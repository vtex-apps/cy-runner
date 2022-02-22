const qe = require('./conductor/utils')
const { secrets, vtex } = require('./conductor/config')
const { vtexCli } = require('./conductor/cli')
const { vtexSetup } = require('./conductor/setup')
const { vtexTeardown } = require('./conductor/teardown')
let timing = { start: qe.tick() }

async function main() {
  // Report integration options
  for (const item in vtex.integration) {
    let status = vtex.integration[item] ? 'enabled' : 'disabled'
    qe.msg(`${item.toUpperCase()} integration is ${status}`)
  }
  if (!vtex.configuration.vtexCli && !vtex.configuration.devMode) {
    qe.msg('You are running with vtexCli and devMode disabled')
    qe.msgDetail('I hope you know what you are doing =D')
  }

  // VTEX CLI
  const PATH = await vtexCli(vtex.configuration)
  process.env.PAHT = PATH

  // Workspace setup
  const WKS = await vtexSetup(vtex.workspace, vtex.configuration, timing.start)
  vtex.workspace.setup.name = WKS
  timing['setup'] = qe.tick()

  // Teardown
  if (vtex.workspace.teardown.enabled)
    await vtexTeardown(vtex.workspace, vtex.configuration)
  timing['teardown'] = qe.tick()
}

main()
