const fs = require('fs')
const {merge} = require('lodash')
const qe = require('./utils')

exports.vtexWorkspace = async (config) => {
  const WORKSPACE = config.testWorkspace;
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
    await syncConfig(config) // sync setup env
    // Run Cypress in automated mode
    if (WORKSPACE.setup.enabled || WORKSPACE.setup.manageApps.enabled) {
      qe.msg(`Creating and/or updating workspace [${WORKSPACE.name}]`)
      await qe.runCypress(WORKSPACE.setup, config)
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