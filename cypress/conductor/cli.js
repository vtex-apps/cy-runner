const fs = require('fs')
const { promises: pfs } = require('fs')
const qe = require('./utils')
const path = require('path/posix')
const HOME = process.env.HOME
const VTEX_PATH = path.join(HOME, '.cache')
const VTEX_ENV = path.join(HOME, '.vtex')
const TOOLBELT_PATH = path.join(VTEX_PATH, 'toolbelt')
const VTEX_BIN = path.join(TOOLBELT_PATH, 'bin', 'vtex-e2e')
const VTEX_URL_FILE = '.vtex.url'
const CY_CACHE = path.join(HOME, '.config', 'Cypress', 'cy')

// Config to VTEX CLI on this setup
process.env.IN_CYPRESS = true
process.env.PATH = `${process.env.PATH}:${TOOLBELT_PATH}/bin`

async function vtexCli(config, runSetup) {
  if (runSetup) {
    // Clean VTEX env
    try {
      pfs
        .rm(VTEX_ENV, { recursive: true, force: true })
        .then(qe.msg(`${VTEX_ENV} removed sucessfully`))
    } catch (e) {
      qe.msgErr(`Fail to delete ${VTEX_ENV}`)
      qe.crash(e)
    }
    // Check if toolbelt is installed already
    if (fs.existsSync(VTEX_BIN)) qe.msg('VTEX CLI installed already')
    else {
      const VTEX_REPO = config.toolbelt.git
      const VTEX_BRANCH = config.toolbelt.branch
      try {
        qe.msg('Toolbelt not found, installing it...')
        if (!fs.existsSync(VTEX_PATH)) pfs.mkdir(VTEX_PATH)
        qe.msgDetail('Cloning toolbelt repo...')
        qe.exec(`cd ${VTEX_PATH} && git clone ${VTEX_REPO}`)
        qe.msgDetail('Changing toolbelt branch...')
        qe.exec(`cd ${TOOLBELT_PATH} && git checkout ${VTEX_BRANCH}`)
        qe.msgDetail('Installing yarn packages...')
        qe.exec(`cd ${TOOLBELT_PATH} && yarn`)
        qe.msgDetail('Building yarn packages...')
        qe.exec(`cd ${TOOLBELT_PATH} && yarn build`)
        qe.msgDetail('Copying binary to vtex-e2e...')
        await pfs.copyFile(path.join(TOOLBELT_PATH, 'bin', 'run'), VTEX_BIN)
      } catch (ee) {
        qe.msgErr('Error on installing toolbelt!')
        qe.crash(ee)
      }
    }
    qe.msg('Calling VTEX CLI to warm it up...')
    try {
      qe.exec('vtex-e2e whoami')
    } catch (e) {
      qe.exec('vtex-e2e whoami')
    }
    qe.msgDetail('Version: ', true)
    qe.exec('vtex-e2e --version', 'inherit')
    qe.msg('Calling VTEX CLI in background... ', true)
    ACCOUNT = config.vtex.account
    qe.exec(`vtex-e2e login ${ACCOUNT} 1> ${VTEX_URL_FILE} &`)
    var size = 0
    while (size < 3) {
      size = qe.fileSize(VTEX_URL_FILE)
    }
    qe.statusMsg('done!')
    // Empty state files
    const VTEX_STATE_FILES = config.stateFiles
    VTEX_STATE_FILES.forEach((file) => {
      pfs.writeFile(file, '{}')
    })
    pfs.rm(CY_CACHE, { recursive: true, force: true })
    // Save to use on Cypress calls
    qe.msg('Now you can call Cypress!')
  } else {
    qe.msg('VTEX CLI setup skipped')
    qe.msgDetail(
      'Make sure you have "vtex-e2e" on your path if "workspace.setup" is enabled'
    )
  }
  // Create state files if they not exist
  const VTEX_STATE_FILES = config.stateFiles
  VTEX_STATE_FILES.forEach((file) => {
    if (!fs.existsSync(file)) pfs.writeFile(file, '{}')
  })
  // Return path to be added
  return `${process.env.PATH}:${TOOLBELT_PATH}/bin`
}

// Expose
module.exports = {
  vtexCli: vtexCli,
}
