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
const VTEX_STATE_FILES = ['.vtex.json', '.orders.json']
const CY_CACHE = path.join(HOME, '.config', 'Cypress', 'cy')

// Config to VTEX CLI on this setup
process.env.IN_CYPRESS = true
process.env.PATH = `${process.env.PATH}:${TOOLBELT_PATH}/bin`

async function vtexCli(config) {
  // Clean VTEX env
  try {
    pfs
      .rm(VTEX_ENV, { recursive: true, force: true })
      .then(qe.outMsg(`${VTEX_ENV} removed sucessfully`))
  } catch (error) {
    qe.errMsg(`Fail to delete ${VTEX_ENV}`)
    qe.errFixMsg(error)
    qe.crash()
  }
  // Check if toolbelt is installed already
  if (fs.existsSync(VTEX_BIN)) qe.outMsg('VTEX CLI installed already')
  else {
    const VTEX_REPO = config.toolbelt.git
    const VTEX_BRANCH = config.toolbelt.branch
    try {
      qe.outMsg('Toolbelt not found, installing it...')
      if (!fs.existsSync(VTEX_PATH)) pfs.mkdir(VTEX_PATH)
      qe.outFixMsg('Cloning toolbelt repo...')
      qe.exec(`cd ${VTEX_PATH} && git clone ${VTEX_REPO}`)
      qe.outFixMsg('Changing toolbelt branch...')
      qe.exec(`cd ${TOOLBELT_PATH} && git checkout ${VTEX_BRANCH}`)
      qe.outFixMsg('Installing yarn packages...')
      qe.exec(`cd ${TOOLBELT_PATH} && yarn`)
      qe.outFixMsg('Building yarn packages...')
      qe.exec(`cd ${TOOLBELT_PATH} && yarn build`)
      qe.outFixMsg('Copying binary to vtex-e2e...')
      await pfs.copyFile(path.join(TOOLBELT_PATH, 'bin', 'run'), VTEX_BIN)
    } catch (e) {
      qe.errMsg('Error installing Toolbelt!')
      qe.crash()
    }
  }
  qe.outMsg('Calling VTEX CLI to warm it up...')
  qe.exec('vtex-e2e whoami')
  qe.outFixMsg('Version: ', true)
  qe.exec('vtex-e2e --version', 'inherit')
  qe.outMsg('Calling VTEX CLI in background... ', true)
  ACCOUNT = config.vtex.account
  qe.exec(`vtex-e2e login ${ACCOUNT} 1> ${VTEX_URL_FILE} &`)
  var size = 0
  while (size < 3) {
    size = qe.fileSize(VTEX_URL_FILE)
  }
  qe.statusMsg('done!')
  pfs.rm(CY_CACHE, { recursive: true, force: true })
  VTEX_STATE_FILES.forEach((file) => {
    pfs.writeFile(file, '{}')
  })
  // Save to use on Cypress calls
  process.env.VTEX_BIN = 'vtex-e2e'
  qe.outMsg('Now you can call Cypress!')
}

// Expose
module.exports = {
  vtexCli: vtexCli,
}
