const cfg = require('./node/config')
const system = require('./node/system')
const logger = require('./node/logger')
const cypress = require('./node/cypress')
const workspace = require('./node/workspace')
const { deprecated } = require('./node/depreated')
const { report } = require('./node/report')
const { teardown } = require('./node/teardown')
const { runTests } = require('./node/test')
const { issue } = require('./node/jira')

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
  const config = await cfg.getConfig('cy-runner.yml')

  // Tests
  if (config.base.cypress.devMode) {
    await cypress.open()
  } else {
    // Init workspace set up
    control.timing.initWorkspace = await workspace.init(config)

    // Install apps
    control.timing.installApps = await workspace.installApps(config)

    // Uninstall apps
    control.timing.uninstallApps = await workspace.uninstallApps(config)

    // Link app
    control.timing.linkApp = await workspace.linkApp(config)

    process.exit()
    // Start the tests
    const call = await runTests(config)

    control.timing.strategy = call.time
    control.specsFailed = call.specsFailed
    control.specsSkipped = call.specsSkipped
    control.specsDisabled = call.specsDisabled
    control.specsPassed = call.specsPassed
    control.runUrl = call.runUrl

    // Open Jira ticket
    if (config.base.jira.enabled && control.specsFailed?.length) {
      await issue(config, control.specsFailed, control.runUrl)
    }
  }

  // Teardown
  control.timing.teardown = await teardown(config)

  // Report deprecated flags
  await deprecated(config)

  // Final Report
  control.timing.total = system.tack(control.start)
  await report(control, config)
}

main().then((r) => r)
