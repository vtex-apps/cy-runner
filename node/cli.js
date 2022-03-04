const fs = require('fs')
const qe = require('./utils')
const path = require('path/posix')
const PATH_HOME = process.env.HOME
const PATH_CACHE = path.join(PATH_HOME, '.cache')
const PATH_CACHE_VTEX = path.join(PATH_CACHE, 'vtex')
const PATH_TOOLBELT = path.join(PATH_HOME, '.cache', 'toolbelt')
const PATH_TOOLBELT_BIN = path.join(PATH_TOOLBELT, 'bin')
const TOOLBELT_BIN = path.join(PATH_TOOLBELT_BIN, 'vtex-e2e')
const TOOLBELT_URL_OUTPUT = '.toolbelt.url'

// Needed to run vtex cli on patched mode
process.env.IN_CYPRESS = 'true'

exports.vtexCli = async (config) => {
  const START = qe.tick()
  const deployCli = config.base.vtex.deployCli
  const workspace = config.workspace

  if (deployCli.enabled) {
    qe.msgSection('Toolbelt deployment')
    // Try to clean vtex cache state to avoid bugs
    await cleanCache()
    // Check if toolbelt is installed already
    if (fs.existsSync(TOOLBELT_BIN))
      qe.msgOk('Patched version of toolbelt is installed already')
    else await installToolbelt(deployCli)
    // Start vtex cli in background
    await startBackground(config.base.vtex)
  } else {
    if (
      typeof workspace.linkApp != 'undefined' ||
      typeof workspace.removeApps != 'undefined' ||
      typeof workspace.installApps != 'undefined'
    )
      qe.msgErr(
        'Make sure you have vtex cli authenticated already as you plan to manage apps'
      )
  }
  return {
    path: `${process.env.PATH}:${PATH_TOOLBELT_BIN}`,
    time: qe.toc(START),
  }
}

async function cleanCache() {
  try {
    fs.rmSync(PATH_CACHE_VTEX, { recursive: true })
    qe.msgOk(`${PATH_CACHE_VTEX} cleaned successfully`)
  } catch (e) {
    qe.msgErr(`${PATH_CACHE_VTEX} doesn't exist, no need to clean it`)
  }
}

async function startBackground(vtex) {
  qe.msgDetail('Version: ', true)
  qe.exec(`${TOOLBELT_BIN} --version`, 'inherit')
  qe.msgOk(`Start login with ${vtex.account} in background `)
  try {
    qe.msgOk(`Removing old ${TOOLBELT_URL_OUTPUT}, if any`)
    if (fs.existsSync(TOOLBELT_URL_OUTPUT)) fs.rmSync(TOOLBELT_URL_OUTPUT)
    qe.msgOk(`Calling vtex login ${vtex.account}`)
    qe.exec(`${TOOLBELT_BIN} login ${vtex.account} 1> ${TOOLBELT_URL_OUTPUT} &`)
    let size = 0
    while (size < 3) size = qe.fileSize(TOOLBELT_URL_OUTPUT)
    qe.msgOk('Callback file created successfully')
  } catch (e) {
    qe.crash(e)
  }
  // Feedback to user and path to be added returned
  qe.msgOk('Toolbelt started in background successfully')
}

async function installToolbelt(deployCli) {
  try {
    qe.msgErr('Patched version of toolbelt not found, deploying it')
    if (!fs.existsSync(PATH_CACHE_VTEX)) fs.mkdirSync(PATH_CACHE_VTEX)
    if (fs.existsSync(PATH_TOOLBELT))
      fs.rmSync(PATH_TOOLBELT, { recursive: true })
    qe.msgDetail(`Cloning toolbelt from ${deployCli.git}`)
    qe.exec(`cd ${PATH_CACHE} && git clone ${deployCli.git}`)
    qe.msgDetail(`Checking out toolbelt patched branch ${deployCli.branch}`)
    qe.exec(`cd ${PATH_TOOLBELT} && git checkout ${deployCli.branch}`)
    qe.msgDetail('Installing yarn packages')
    qe.exec(`cd ${PATH_TOOLBELT} && yarn`)
    qe.msgDetail('Building patched toolbelt')
    qe.exec(`cd ${PATH_TOOLBELT} && yarn build`)
    qe.msgDetail('Copying binary to vtex-e2e')
    fs.copyFileSync(path.join(PATH_TOOLBELT_BIN, 'run'), TOOLBELT_BIN)
    qe.msgDetail('Calling vtex cli twice to warm it up (autofix bug)')
    try {
      qe.exec(`${TOOLBELT_BIN} whoami`)
    } catch (_ee) {
      qe.exec(`${TOOLBELT_BIN} whoami`)
    }
  } catch (e) {
    qe.crash(e)
  }
}
