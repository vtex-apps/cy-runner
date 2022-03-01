const qe = require('./utils')
const fs = require('fs')

exports.vtexWorkspace = async (config) => {
  const WORKSPACE = config.testWorkspace;
  if (config.testConfig.devMode) {
    // Open Cypress en DEV/GUI mode
    qe.msg('Starting in [devmode], Cypress will be opened in GUI mode')
    qe.msgDetail('You must run the steps by yourself, including [setup]')
    qe.msgDetail('[wipe] and [teardown] will be triggered at the end if configured')
    await qe.openCypress()
    if (WORKSPACE.wipe.enabled) await vtexWipe(config)
    if (WORKSPACE.teardown.enabled) await vtexTeardown(config)
    qe.msg('My job finishes here, hope you did well on your tests. See you soon!')
    process.exit(0)
  } else {
    // Run Cypress in automated mode
    if (WORKSPACE.setup.enabled || WORKSPACE.setup.manageApps.enabled) {
      qe.msg(`Creating and/or updating workspace [${WORKSPACE.name}]`)
      await qe.runCypress(WORKSPACE.setup, config)
    } else {
      qe.msg('[setup] and [manageApps] are disabled, skipping workspace set up')
    }
  }

  // Update cypress.env.json with .state.json config tokens and clean .state.json for other users
  const fileA = 'cypress.env.json'
  const fileB = config.testConfig.stateFiles[0]
  let A = JSON.parse(fs.readFileSync(fileA, 'utf-8'))
  let B = JSON.parse(fs.readFileSync(fileB, 'utf-8'))
  if (typeof B.vtex == 'object') {
    for (att in B.vtex) A.vtex[att] = B.vtex[att]
    fs.writeFileSync(fileA, JSON.stringify(A))
    fs.writeFileSync(fileB, '{}')
  }
}