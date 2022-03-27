const qe = require('./node/utils')
const { getConfig } = require('./node/config')
const { vtexCli } = require('./node/cli')
const { workspace } = require('./node/workspace')
const { credentials } = require('./node/credential')
const { strategy } = require('./node/test')
const { teardown } = require('./node/teardown')
const { report } = require('./node/report')

// Controls test state
const control = {
  start: qe.tick(),
  timing: {},
  specsFailed: [],
  specsSkipped: [],
  specsPassed: [],
}

async function main() {
  // Create logs folder
  if (!qe.storage('logs')) qe.storage('logs', 'mkdir')

  // Welcome message
  qe.msgSection('Cypress Runner')

  // Read cy-runner.yml configuration
  let config = await getConfig('cy-runner.yml')

  // Report configuration to help understand that'll run
  await qe.sectionsToRun(config)

  // Deploy, start in background, and add VTEX CLI to system PATH
  let call = await vtexCli(config)

  process.env.PATH = call.path
  control.timing.vtexCli = call.time

  // Configure workspace (create, install, uninstall, link app)
  control.timing.workspace = await workspace(config)

  // Get credentials
  call = await credentials(config)
  config = call.config
  control.timing.credentials = call.time

  // Tests
  if (config.base.cypress.devMode) {
    qe.msgSection('Running in dev mode')
    qe.msg('When you finish, please wait the process flow', 'warn')
    await qe.openCypress()
  } else {
    call = await strategy(config)
    control.timing.strategy = call.time
    control.specsFailed = call.specsFailed
    control.specsSkipped = call.specsSkipped
    control.specsPassed = call.specsPassed
  }

  // Teardown
  control.timing.teardown = await teardown(config)

  // Final Report
  control.timing.total = qe.toc(control.start)
  await report(control, config)
}

main()
