const qe = require('./node/utils')
const { getConfig } = require('./node/config')
const { vtexCli } = require('./node/cli')
const { workspace } = require('./node/workspace')
const { strategy } = require('./node/test')
const { wipe } = require('./node/wipe')
const { teardown } = require('./node/teardown')
const { report } = require('./node/report')

// Controls test state
let control = {
  start: qe.tick(),
  timing: {},
  testsFailed: [],
  testsSkipped: [],
  testsPassed: [],
}

async function main() {
  // Welcome message
  qe.msgSection('Cypress Runner')

  // Read cy-runner.yml configuration
  let config = await getConfig('cy-runner.yml')

  // Report configuration to help understand that'll run
  await qe.sectionsToRun(config)

  // Deploy, start in background, and add VTEX CLI to system PATH
  let call = await vtexCli(config)
  process.env.PATH = call.path
  control.timing['vtexCli'] = call.time
  qe.success('PartbyPart')

  // Configure workspace (create, install, uninstall, link app)
  control.timing['workspace'] = await workspace(config)

  // Tests
  call = await strategy(config)
  control.timing['vtexStrategy'] = call.time
  control.testsFailed = call.testsFailed
  control.testsSkipped = call.testsSkipped
  control.testsPassed = call.testsPassed

  // Wipe
  control.timing['vtexWipe'] = await wipe(config)

  // Teardown
  control.timing['vtexTeardown'] = await teardown(config)

  // Final Report
  control.timing['total'] = qe.toc(control.start)
  await report(control)
}

main()
