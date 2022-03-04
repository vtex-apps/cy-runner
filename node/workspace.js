const fs = require('fs')
const { merge } = require('lodash')
const qe = require('./utils')

exports.workspace = async (config) => {
  const START = qe.tick()
  const WORKSPACE = config.workspace
  if (config.workspace.runInDevMode) {
    // Open Cypress en DEV/GUI mode
    qe.msgSection('Development mode')
    qe.msgOk('You must run the steps wipe by yourself')
    // Install, remove or link apps
    await manageApps(config)
    // Sync credentials
    await syncConfig(config) // sync setup env
    // Call strategy
    await qe.openCypress()
    if (WORKSPACE.wipe.enabled) await qe.openCypress(WORKSPACE.wipe, 'wipe')
    // TODO: Fix this code
    if (WORKSPACE.teardown.enabled)
      await qe.openCypress(WORKSPACE.teardown, 'teardown')
    qe.msg(
      'My job finishes here, hope you did well on your tests. See you soon!'
    )
    process.exit(0)
  } else {
    // Run Cypress in automated mode
    // TODO: FIx this code
    if (WORKSPACE.setup.enabled || WORKSPACE.setup.manageApps.enabled) {
      await workspaceSetup(config)
      await syncConfig(config) // sync setup env
    } else {
      qe.msg('[setup] and [manageApps] are disabled, skipping workspace set up')
    }
  }
  return qe.toc(START)
}

// Manage Apps
async function manageApps(config) {
  let vtex = config.base.vtex.deployCli.enabled ? 'vtex-e2e' : 'vtex'
  let toInstall = config.workspace.installApps
  let toRemove = config.workspace.removeApps
  let toLink = config.workspace.linkApp
  let manageApps =
    typeof toInstall === 'object' || typeof toRemove === 'object' || toLink
  if (manageApps) {
    if (toInstall === 'object') {
      qe.msgSection('Apps management')
      toInstall.forEach((app) => {
        qe.msgOk('Installing ' + app)
        try {
          qe.exec(`${vtex} install app`)
        } catch (e) {
          qe.crash(e)
        }
      })
    }
    if (toRemove === 'object') {
      toRemove.forEach((app) => {
        qe.msgOk('Removing ' + app)
        try {
          qe.exec(`echo y | ${vtex} uninstall app`)
        } catch (e) {
          qe.crash(e)
        }
      })
    }
    if (toLink) {
      qe.msgOk('Linking app to be tested')
      try {
        qe.exec(`cd .. && echo y | ${vtex} link --no-watch`)
      } catch (e) {
        qe.crash(e)
      }
    }
  }
}

// Update cypress.env.json with .state.json config tokens and clean .state.json for other users
async function syncConfig(config) {
  const CONFIG_A = 'cypress.env.json'
  const CONFIG_B = config.base.stateFiles[0]
  let A = JSON.parse(fs.readFileSync(CONFIG_A, 'utf-8'))
  let B = JSON.parse(fs.readFileSync(CONFIG_B, 'utf-8'))
  fs.writeFileSync(CONFIG_A, JSON.stringify(merge(A, B)))
  fs.writeFileSync(CONFIG_B, '{}')
}

// Do setup or install apps
async function workspaceSetup(config) {
  let workspace = config.workspace
  let stopOnFail = config.workspace.setup.stopOnFail
  qe.msg(`Using workspace [${workspace.name}]`)
  let testPassed = await qe.runCypress(workspace.setup, config)
  if (!testPassed && stopOnFail) await qe.stopOnFail(config, 'workspaceSetup')
}
