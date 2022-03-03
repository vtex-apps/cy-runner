const qe = require('./node/utils')
const { config } = require('./node/config')
const { vtexCli } = require('./node/cli')
const { vtexWorkspace } = require('./node/workspace')
const { vtexStrategy } = require('./node/test')
const { vtexWipe } = require('./node/wipe')
const { vtexTeardown } = require('./node/teardown')
const { vtexJira } = require('./node/jira')
const { vtexReport } = require('./node/report')

// Controls test state
let control = {
  start: qe.tick(),
  timing: {},
  testsFailed: [],
  testsSkipped: [],
  testsPassed: [],
}

async function main() {
  // Report configuration to help understand that'll run
  await qe.reportSetup(config)

  // Deploy, start in background, and add VTEX CLI to system PATH
  let call = await vtexCli(config)
  process.env.PATH = call.path
  control.timing['vtexCli'] = call.time

  // Configure workspace (create, install, uninstall, link app)
  control.timing['vtexWorkspace'] = await vtexWorkspace(config)

  // Tests
  call = await vtexStrategy(config)
  control.timing['vtexStrategy'] = call.time
  control.testsFailed = call.testsFailed
  control.testsSkipped = call.testsSkipped
  control.testsPassed = call.testsPassed

  // Wipe
  control.timing['vtexWipe'] = await vtexWipe(config)

  // Teardown
  control.timing['vtexTeardown'] = await vtexTeardown(config)

  // Final Report
  control.timing['total'] = qe.toc(control.start)
  await vtexReport(control)
}

main()
