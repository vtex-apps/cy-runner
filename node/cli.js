const fs = require('fs')
const qe = require('./utils')
const path = require('path/posix')
const PATH_HOME = process.env.HOME
const PATH_CACHE = path.join(PATH_HOME, '.cache')
const PATH_CACHE_VTEX = path.join(PATH_CACHE, 'vtex')
const PATH_TOOLBELT = path.join(PATH_HOME, '.cache', 'toolbelt')
const PATH_TOOLBELT_BIN = path.join(PATH_TOOLBELT, 'bin')
const TOOLBELT_BIN = path.join(PATH_TOOLBELT_BIN, 'vtex-e2e')
const TOOLBELT_URL_OUTPUT = 'node/.toolbelt.url'

// Needed to run vtex cli on patched mode
process.env.IN_CYPRESS = 'true'

exports.vtexCli = async (config) => {
  const START = qe.tick()
  const deployCli = config.base.vtex.deployCli
  const workspace = config.workspace

  qe.msgSection('Toolbelt deployment and authentication')
  if (deployCli.enabled) {
    // Try to clean vtex cache state to avoid bugs
    await cleanCache()
    // Check if toolbelt is installed already
    if (fs.existsSync(TOOLBELT_BIN))
      qe.msg('Patched version of toolbelt is installed already')
    else await installToolbelt(deployCli)
    qe.msg(
      `Starting login process using ${config.base.vtex.account} ...`,
      'warn'
    )
    // Authenticate in background
    await startBackground(config.base.vtex)
  } else {
    if (
      typeof workspace.linkApp != 'undefined' ||
      typeof workspace.removeApps != 'undefined' ||
      typeof workspace.installApps != 'undefined'
    )
      qe.msg(
        'Your vtex cli must be authenticated because deployCli is disabled',
        'warn'
      )
  }
  // Get user and robot credentials
  await getCredentials(config.base.vtex)
  process.exit(0)
  // Use workspace
  await useWorkspace(config.workspace)
  // Manage Apps
  await manageApps(config.workspace)
  return {
    path: `${process.env.PATH}:${PATH_TOOLBELT_BIN}`,
    time: qe.toc(START),
  }
}

async function cleanCache() {
  try {
    fs.rmSync(PATH_CACHE_VTEX, { recursive: true })
    qe.msg(`${PATH_CACHE_VTEX} cleaned successfully`)
  } catch (e) {
    qe.msg(`${PATH_CACHE_VTEX} doesn't exist, no need to clean it`, 'error')
  }
}

async function installToolbelt(deployCli) {
  try {
    qe.msg('Patched version of toolbelt not found, deploying it...', 'warn')
    if (!fs.existsSync(PATH_CACHE_VTEX)) fs.mkdirSync(PATH_CACHE_VTEX)
    if (fs.existsSync(PATH_TOOLBELT))
      fs.rmSync(PATH_TOOLBELT, { recursive: true })
    qe.msg(`Cloning toolbelt from ${deployCli.git}`, true, true)
    qe.exec(`cd ${PATH_CACHE} && git clone ${deployCli.git}`)
    qe.msg(
      `Checking out toolbelt patched branch ${deployCli.branch}`,
      true,
      true
    )
    qe.exec(`cd ${PATH_TOOLBELT} && git checkout ${deployCli.branch}`)
    qe.msg('Installing yarn packages', true, true)
    qe.exec(`cd ${PATH_TOOLBELT} && yarn`)
    qe.msg('Building patched toolbelt', true, true)
    qe.exec(`cd ${PATH_TOOLBELT} && yarn build`)
    qe.msg('Copying binary to vtex-e2e', true, true)
    fs.copyFileSync(path.join(PATH_TOOLBELT_BIN, 'run'), TOOLBELT_BIN)
    qe.msg('Calling vtex cli twice to warm it up (autofix bug)', true, true)
    try {
      qe.exec(`${TOOLBELT_BIN} whoami`)
    } catch (_ee) {
      qe.exec(`${TOOLBELT_BIN} whoami`)
    }
  } catch (e) {
    qe.crash(e)
  }
}

async function startBackground(vtex) {
  try {
    qe.msg('Toolbelt version', true, true, true)
    qe.exec(`${TOOLBELT_BIN} --version`, 'inherit')
    qe.msg(`Removing old ${TOOLBELT_URL_OUTPUT}, if any`, true, true)
    if (fs.existsSync(TOOLBELT_URL_OUTPUT)) fs.rmSync(TOOLBELT_URL_OUTPUT)
    qe.msg('Logging out from any other sessions', true, true)
    await qe.exec(`${TOOLBELT_BIN} logout`)
    qe.msg(`Trying to login on ${vtex.account}`, true, true)
    qe.exec(`${TOOLBELT_BIN} login ${vtex.account} 1> ${TOOLBELT_URL_OUTPUT} &`)
    let size = 0
    while (size < 3) size = qe.fileSize(TOOLBELT_URL_OUTPUT)
    qe.exec('yarn cypress run -P node')
  } catch (e) {
    qe.crash('Failed to authenticate using toolbelt\n' + e)
  }
  // Feedback to user and path to be added returned
  qe.msg(`Login on ${vtex.account} completed successfully`)
}

async function getCredentials(vtex) {
  const header = {
    method: 'GET',
    url: vtex.idUrl,
    qs: { user: vtex.apiKey, pass: vtex.apiToken },
  }
  let response = await qe.request(header, {})
  console.log(response)
}

async function useWorkspace(workspace) {}

async function manageApps(workspace) {}

// async function syncConfig(config) {
//   const CONFIG_A = 'cypress.env.json'
//   const CONFIG_B = config.base.stateFiles[0]
//   let A = JSON.parse(fs.readFileSync(CONFIG_A, 'utf-8'))
//   let B = JSON.parse(fs.readFileSync(CONFIG_B, 'utf-8'))
//   fs.writeFileSync(CONFIG_A, JSON.stringify(merge(A, B)))
//   fs.writeFileSync(CONFIG_B, '{}')
// }

// // Get admin Cookie
// it('Getting admin auth cookie', () => {
//   // Get Cookie Credential
//   cy.request({
//     method: 'GET',
//     url: CONFIG.vtex.idUrl,
//     qs: { user: CONFIG.vtex.apiKey, pass: CONFIG.vtex.apiToken },
//   }).then((response) => {
//     expect(response.body).property('authStatus').to.equal('Success')
//     let cookie = 'authCookieValue'
//     CONFIG.vtex[cookie] = response.body.authCookie.Value
//     cy.addConfig(STATE_FILE, 'config', 'vtex', cookie, CONFIG.vtex[cookie])
//   })
// })
//
// // Get Robot Cookie
// it('Getting robot cookie', () => {
//   cy.vtex('local token').then((cookie) => {
//     // If we try to write directly on cypress.env.json, Cypress crashes
//     cy.addConfig(STATE_FILE, 'config', 'vtex', 'robotCookie', cookie.stdout)
//   })
// })
//
// // Changing to desired workspace
// it(`Using workspace ${WORKSPACE.name}`, () => {
//   cy.vtex(`workspace use ${WORKSPACE.name}`)
//     .its('stdout')
//     .should('contain', WORKSPACE.name)
// })
//
// // If asked to manage apps, let's do it
// if (APPS.enabled) {
//   // Install
//   APPS.install.forEach((app) => {
//     it(`Installing ${app}`, APP_RETRIES, () => {
//       cy.vtex(`install ${app}`)
//         .its('stdout', FAIL_TIMEOUT)
//         .should('contains', 'successfully')
//     })
//   })
//   // Uninstall
//   APPS.uninstall.push(APPS.link)
//   APPS.uninstall.forEach((app) => {
//     it(`Removing ${app}`, APP_RETRIES, () => {
//       cy.vtex(`uninstall ${app}`)
//         .its('stdout', FAIL_TIMEOUT)
//         .should('contains', 'successfully')
//     })
//   })
//   // Link
//   it(`Linking ${APPS.link}`, APP_RETRIES, () => {
//     // cy.vtex('link').should('contains', 'successfully')
//     cy.log('placeholder to test app install')
//   })
// }
