const qe = require('./cy-runner/utils')
const {config} = require('./cy-runner/config')
const {vtexCli} = require('./cy-runner/cli')
const {vtexWorkspace} = require('./cy-runner/workspace')
const {vtexTestStrategy} = require('./cy-runner/test')
const {vtexWipe} = require('./cy-runner/wipe')
const {vtexTeardown} = require('./cy-runner/teardown')
const {vtexReport} = require('./cy-runner/report')

// Controls test state
let control = {
  start: qe.tick(),
  timing: {},
  testsFailed: [],
  testsSkipped: [],
  testsPassed: []
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
  call = await vtexTestStrategy(config)
  control.timing['vtexTestStrategy'] = call.time
  control.testsFailed = call.testsFailed
  control.testsSkipped = call.testsSkipped
  control.testsPassed = call.testsPassed

  // Wipe
  control.timing['vtexWipe'] = await vtexWipe(config)

  // Teardown
  control.timing['vtexTeardown'] = await vtexTeardown(config)

  // Final Report
  control.timing['total'] = qe.toc(control.start)
  process.exit(await vtexReport(control))
}

await main()
