const cfg = require('./node/config')
const system = require('./node/system')
const logger = require('./node/logger')
const cypress = require('./node/cypress')
const workspace = require('./node/workspace')
const { block } = require('./node/block')
const { deprecated } = require('./node/depreated')
const { report } = require('./node/report')
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

    // Block test to avoid others change orderForm
    if (config.workspace.singleRun) await block(config)

    // Install apps
    control.timing.installApps = await workspace.installApps(config)

    // Uninstall apps
    control.timing.uninstallApps = await workspace.uninstallApps(config)

    // Link app
    const link = await workspace.linkApp(config)

    control.timing.linkApp = link.time

    // Run tests
    if (link.success) {
      const call = await runTests(config)

      control.timing.strategy = call.time
      control.specsFailed = call.specsFailed
      control.specsSkipped = call.specsSkipped
      control.specsDisabled = call.specsDisabled
      control.specsPassed = call.specsPassed
      control.runUrl = call.runUrl

      // Kill link subprocess
      if (link.subprocess) link.subprocess.kill('SIGHUP')

      // Jira automation
      if (config.base.jira.enabled && control.specsFailed?.length) {
        await issue(config, control.specsFailed, control.runUrl)
      }
    }
  }

  // Teardown
  control.timing.teardown = await workspace.teardown(config)

  // Report deprecated flags
  await deprecated(config)

  // Final Report
  control.timing.total = system.tack(control.start)
  await report(control, config)
}

main().then((r) => r)
