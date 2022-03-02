const qe = require('./cy-runner/utils')
const {config} = require('./cy-runner/config')
const {vtexCli} = require('./cy-runner/cli')
const {vtexWorkspace} = require('./cy-runner/workspace')
const {vtexTestStrategy} = require('./cy-runner/test')
const {vtexWipe} = require('./cy-runner/wipe')
const {vtexTeardown} = require('./cy-runner/teardown')

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

  control.timing['total'] = qe.toc(control.start)

  console.log(control)
  process.exit(0)

  // Wipe
  if (config.workspace.wipe.enabled) {
    await vtexWipe(config.workspace, config.configuration)
    timing['wipe'] = qe.tick()
  } else {
    qe.msg('Wipe is disabled, skipping...')
  }


  // Teardown
  if (config.workspace.teardown.enabled) {
    await vtexTeardown(config.workspace, config.configuration)
    timing['teardown'] = qe.tick()
  } else {
    qe.msg('Teardown is disabled, skipping...')
  }

  // Final Report
  qe.report('Execution report')
  if (success.length > 0) qe.msgDetail('Succeed tests: ' + success)
  if (skipped.length > 0) qe.msgDetail('Skipped tests: ' + skipped)
  if (failed.length > 0) qe.msgDetail('Failed tests: ' + failed)
  let partialTime = 0
  let lastTime = 0
  for (let item in timing) {
    let seconds = 0
    if (item === 'start') partialTime = timing[item]
    else {
      seconds = (timing[item] - partialTime) / 1000
      qe.msgDetail(`Time on ${item}: ${seconds} seconds`)
    }
    lastTime = timing[item]
  }
  let totalTime = (lastTime - timing.start) / 1000
  qe.msgDetail(`Total time: ${totalTime} seconds`)
  qe.msgDetail(`Note: Setup and teardown aren't counted as success or failure`)
  if (failed.length < 1) {
    qe.success('The test ran sucessfuly, well done')
  } else {
    qe.fail(`The test was skipped on ${skipped} and failed on ${failed}`)
  }
}

main()
