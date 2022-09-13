const cfg = require('./node/config')
// const { strategy } = require('./node/test')
// const { issue } = require('./node/jira')
const system = require('./node/system')
const logger = require('./node/logger')
const cypress = require('./node/cypress')
const workspace = require('./node/workspace')
const { deprecated } = require('./node/depreated')
const { report } = require('./node/report')
const { teardown } = require('./node/teardown')

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
    if (call.success) call = await workspace.installApps(config)
    else logger.msgError('Failed to install apps')
    control.timing.installApps = call.time

    // Uninstall apps
    if (call.success) call = await workspace.uninstallApps(config)
    else logger.msgError('Failed to uninstall apps')
    control.timing.uninstallApps = call.time

    // Link app
    if (call.success) call = await workspace.linkApp(config)
    else logger.msgError('Failed to link app')
    control.timing.linkApp = call.time

    // Start the tests
    if (call.success) call = await workspace.linkApp(config)
    else logger.msgError('Failed to link app')

    // const call = await strategy(config)
    //
    // control.timing.strategy = call.time
    // control.specsFailed = call.specsFailed
    // control.specsSkipped = call.specsSkipped
    // control.specsDisabled = call.specsDisabled
    // control.specsPassed = call.specsPassed
    // control.runUrl = call.runUrl
    // if (config.base.jira.enabled && control.specsFailed.length) {
    //   await issue(config, control.specsFailed, control.runUrl)
    // }
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
