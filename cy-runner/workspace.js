const fs = require('fs')
const qe = require('./utils')
const {vtexTeardown} = require('./teardown')
const {vtexWipe} = require('./wipe')

exports.vtexWorkspace = async (config) => {
  const WORKSPACE = config.testWorkspace
  if (config.testConfig.devMode) {
    // Open Cypress en DEV/GUI mode
    qe.msg('Starting in [devmode], Cypress will be opened in GUI mode')
    qe.msgDetail('You must run the steps by yourself [setup], [wipe], and [teardown] if they are enabled')
    if (WORKSPACE.setup.enabled) await qe.openCypress(WORKSPACE.setup, 'setup')
    await syncConfig(config) // sync setup env
    // Call testStrategy
    await qe.openCypress()
    if (WORKSPACE.wipe.enabled) await qe.openCypress(WORKSPACE.wipe, 'wipe')
    if (WORKSPACE.teardown.enabled) await qe.openCypress(WORKSPACE.teardown, 'teardown')
    qe.msg('My job finishes here, hope you did well on your tests. See you soon!')
    process.exit(0)
  } else {
    // Run Cypress in automated mode
    if (WORKSPACE.setup.enabled || WORKSPACE.setup.manageApps.enabled) {
      await workspaceSetup(config)
      await syncConfig(config) // sync setup env
    } else {
      qe.msg('[setup] and [manageApps] are disabled, skipping workspace set up')
    }
  }
}

// Update cypress.env.json with .state.json config tokens and clean .state.json for other users
async function syncConfig(config) {
  const CONFIG_A = 'cypress.env.json'
  const CONFIG_B = config.testConfig.stateFiles[0]
  let A = JSON.parse(fs.readFileSync(CONFIG_A, 'utf-8'))
  let B = JSON.parse(fs.readFileSync(CONFIG_B, 'utf-8'))
  fs.writeFileSync(CONFIG_A, JSON.stringify(merge(A, B)))
  fs.writeFileSync(CONFIG_B, '{}')
}

// Do setup or install apps
async function workspaceSetup(config) {
  qe.msg(`Using workspace [${workspace.name}]`)
  let workspace = config.testWorkspace
  let stopOnFail = config.testWorkspace.setup.stopOnFail
  let doWipe = config.testWorkspace.wipe.enabled
  let doTeardown = config.testWorkspace.teardown.enabled
  let testPassed = await qe.runCypress(workspace.setup.spec, config)
  if (!testPassed && stopOnFail) {
    qe.msg('[testWorkspace] failed')
    qe.msgDetail('[setup.stopOnFail] enabled, stopping the tests')
    if (doWipe) await vtexWipe(config)
    if (doTeardown) await vtexTeardown(config)
    qe.crash('Prematurely exit duo a [setup.stopOnFail]')
  }
}