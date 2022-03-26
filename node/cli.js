const path = require('path')

const qe = require('./utils')

const PATH_HOME = process.env.HOME
const PATH_CACHE = path.join(PATH_HOME, '.cache')
const PATH_VTEX = path.join(PATH_CACHE, 'vtex')
const PATH_TOOLBELT = path.join(PATH_HOME, '.cache', 'toolbelt')
const PATH_TOOLBELT_BIN = path.join(PATH_TOOLBELT, 'bin')
const TOOLBELT_BIN = path.join(PATH_TOOLBELT_BIN, 'vtex-e2e')
const TOOLBELT_URL = 'node/.toolbelt.url'

// Needed to run vtex cli on patched mode
process.env.IN_CYPRESS = 'true'

exports.vtexCli = async (config) => {
  const START = qe.tick()
  const { deployCli } = config.base.vtex

  if (deployCli.enabled) {
    qe.msgSection('Toolbelt deployment and authentication')
    // Clean vtex cache state to avoid bugs
    await cleanCache()
    // Check if toolbelt is installed already
    if (qe.storage(TOOLBELT_BIN)) {
      qe.msg('Patched version of toolbelt is installed already')
    } else {
      await installToolbelt(deployCli)
    }

    qe.msg(`Starting login process using ${config.base.vtex.account}`, 'warn')
    // Authenticate in background
    await startBackground(config.base.vtex)
  }

  return {
    path: `${process.env.PATH}:${PATH_TOOLBELT_BIN}`,
    time: qe.toc(START),
  }
}

async function cleanCache() {
  if (qe.storage(PATH_VTEX, 'rm')) qe.msg(`${PATH_VTEX} cleaned successfully`)
  else qe.msg(`${PATH_VTEX} doesn't exist, no need to clean it`, 'warn')
}

async function installToolbelt(deployCli) {
  try {
    qe.msg('Patched version of toolbelt not found, deploying it...', 'warn')
    if (!qe.storage(PATH_VTEX)) qe.storage(PATH_VTEX, 'mkdir')
    if (qe.storage(PATH_TOOLBELT)) qe.storage(PATH_TOOLBELT, 'rm')
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
    qe.storage(path.join(PATH_TOOLBELT_BIN, 'run'), 'copy', TOOLBELT_BIN)
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
  let login

  try {
    qe.msg('Toolbelt version', true, true, true)
    qe.exec(`${TOOLBELT_BIN} --version`, 'inherit')
    qe.msg(`Removing old ${TOOLBELT_URL}, if any`, true, true)
    if (qe.storage(TOOLBELT_URL)) qe.storage(TOOLBELT_URL, 'rm')
    qe.msg('Logging out from any other sessions', true, true)
    qe.exec(`${TOOLBELT_BIN} logout`)
    qe.msg(`Calling toolbelt`, true, true, true)
    qe.exec(`${TOOLBELT_BIN} login ${vtex.account} 1> ${TOOLBELT_URL} &`)
    let size = 0

    while (size < 3) {
      if (qe.storage(TOOLBELT_URL)) {
        size = qe.storage(TOOLBELT_URL, 'size')
      }
    }

    qe.msg(`callback file created`, 'complete', true)
    qe.msg(`Trying to login on account ${vtex.account}`, true, true)

    const envName = 'cypress.env.json'
    const src = path.join(__dirname, '..', envName)
    const dst = path.join(__dirname, envName)

    // Make cypress.env.json is available to login
    if (!qe.storage(dst)) qe.storage(src, 'link', dst)
    login = qe.exec('yarn cypress run -P node', 'pipe').toString()
  } catch (e) {
    qe.crash('Failed to authenticate using toolbelt', e)
  }

  const tlb = await qe.toolbelt(TOOLBELT_BIN, 'whoami')

  // Exit if login fails
  if (!tlb.success) qe.crash(`Error to login on ${vtex.account}`, login)

  // Feedback to user and path to be added returned
  qe.msg(`Login on ${vtex.account} completed successfully`)
}
