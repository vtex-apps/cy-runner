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
    let call = await workspace.init(config)

    control.timing.initWorkspace = call.time

    // Install apps
    call.success
      ? (call = await workspace.installApps(config))
      : logger.msgError('Failed to init the workspace')
    control.timing.installApps = call.time

    // Uninstall apps
    call.success
      ? (call = await workspace.uninstallApps(config))
      : logger.msgError('Failed to install apps')
    control.timing.uninstallApps = call.time

    // Link app
    call.success
      ? (call = await workspace.linkApp(config))
      : logger.msgError('Failed to uninstall apps')
    control.timing.linkApp = call.time

    // Start the tests
    call.success
      ? (call = await runTests(config))
      : logger.msgError('Failed to link the app')

    control.timing.strategy = call.time
    control.specsFailed = call.specsFailed
    control.specsSkipped = call.specsSkipped
    control.specsDisabled = call.specsDisabled
    control.specsPassed = call.specsPassed
    control.runUrl = call.runUrl

    // Open Jira ticket
    if (config.base.jira.enabled && control.specsFailed.length) {
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
