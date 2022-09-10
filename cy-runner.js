const cfg = require('./node/config')
const { workspace } = require('./node/workspace')
const { credentials } = require('./node/credentials')
const { strategy } = require('./node/test')
const { teardown } = require('./node/teardown')
const { issue } = require('./node/jira')
const { report } = require('./node/report')
const system = require('./node/system')
const logger = require('./node/logger')
const cypress = require('./node/cypress')

// Controls test state
const control = {
  start: system.tick(),
  timing: {},
  specsFailed: [],
  specsSkipped: [],
  specsDisabled: [],
  specsPassed: [],
  runUrl: null,
}

async function main() {
  // Init logger
  logger.init()

  // Welcome message
  logger.msgSection('Cypress Runner')

  // Read cy-runner.yml configuration
  let config = await cfg.getConfig('cy-runner.yml')

  process.exit(0)

  // Report configuration to help understand that'll run
  await cfg.sectionsToRun(config)

  // Configure workspace (create, install, uninstall, link app)
  control.timing.workspace = await workspace(config)

  // Get credentials
  let call = await credentials(config)

  config = call.config

  // Tests
  if (config.base.cypress.devMode) {
    logger.msgSection('Running in dev mode')
    logger.msgWarn('When you finish, please wait the process flow')
    await cypress.open()
  } else {
    call = await strategy(config)
    control.timing.strategy = call.time
    control.specsFailed = call.specsFailed
    control.specsSkipped = call.specsSkipped
    control.specsDisabled = call.specsDisabled
    control.specsPassed = call.specsPassed
    control.runUrl = call.runUrl
    if (config.base.jira.enabled && control.specsFailed.length) {
      await issue(config, control.specsFailed, control.runUrl)
    }
  }

  // Teardown
  control.timing.teardown = await teardown(config)

  // Final Report
  control.timing.total = system.tock(control.start)
  await report(control, config)
}

main().then((r) => r)
