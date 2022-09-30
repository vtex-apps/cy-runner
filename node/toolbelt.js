const system = require('./system')
const logger = require('./logger')

const MAX_RETRIES = 3

// Get user, email and workspace name
exports.whoami = async () => {
  const VTEX = await system.vtexBin()
  let stdout = null
  let check = false
  let thisTry = 1

  while (thisTry <= MAX_RETRIES && !check) {
    stdout = system.exec(`${VTEX} whoami`, 'pipe').toString()
    check = /Logged/.test(stdout)
    thisTry++
  }

  const mailOrKey = check ? stdout.split(' ')[7] : null
  const workspace = check ? stdout.split(' ')[11] : null

  return { isLogged: check, mailOrKey, workspace, stdout }
}

// Get local user token
exports.getLocalToken = async () => {
  const VTEX = await system.vtexBin()
  const userOrRobot = await this.whoami()
  let result = null
  let token = null

  if (userOrRobot.isLogged) {
    let check = false
    let thisTry = 1

    while (thisTry <= MAX_RETRIES && !check) {
      result = system.exec(`${VTEX} local token`, 'pipe')
      token = result.slice(0, -1)
      check = /ey/.test(token)
      thisTry++
    }

    userOrRobot.token = token

    if (check) return userOrRobot
  }

  system.crash('Failed to get local user token', result, true)
}

// Crash app if on master
exports.crashIfMaster = async (msg) => {
  const check = await this.whoami()

  if (check.workspace === 'master') {
    system.crash(`Failed to ${msg}`, `You can't ${msg} master workspace`)
  }
}

exports.deleteWorkspace = async (workspace) => {
  await this.crashIfMaster('delete')
  const VTEX = await system.vtexBin()

  const result = system.exec(`${VTEX} workspace delete -f ${workspace}`, 'pipe')
  const check = /successfully/.test(result)

  check
    ? logger.msgOk(`Workspace ${workspace} deleted`)
    : logger.msgPad(`Failed to delete workspace ${workspace}`)
}

exports.changeWorkspace = async (workspace) => {
  const VTEX = await system.vtexBin()
  let check = false
  let thisTry = 1

  while (thisTry <= MAX_RETRIES && !check) {
    system.exec(`${VTEX} workspace use ${workspace}`, 'pipe')
    // eslint-disable-next-line no-await-in-loop
    const result = await this.whoami()

    check = RegExp(result.workspace).test(workspace)
    thisTry++
  }

  return check
}

exports.ls = async () => {
  const VTEX = await system.vtexBin()

  return system.exec(`${VTEX} ls`, 'pipe').toString()
}

exports.dependency = async () => {
  const VTEX = await system.vtexBin()

  return system.exec(`${VTEX} deps ls`, 'pipe').toString()
}

exports.install = async (app) => {
  // Show list of apps to be installed
  app.forEach((a) => {
    logger.msgPad(a)
  })
  // Crash if on master
  await this.crashIfMaster('install apps')
  const VTEX = await system.vtexBin()

  // Install apps and count successfully ones
  const result = system.exec(`${VTEX} install ${app.join(' ')}`, 'pipe')
  const count = (result.match(/successfully/g) || []).length

  // Feedback
  count === app.length
    ? logger.msgOk(`${count} of ${app.length} apps installed`)
    : logger.msgError(`${count} of ${app.length} apps installed`)

  // Return success if the count matches apps requested to install
  return { success: count === app.length, log: result }
}

exports.uninstall = async (app) => {
  // Show list of apps to be installed
  app.forEach((a) => {
    logger.msgPad(a)
  })
  // Crash if on master
  await this.crashIfMaster('uninstall apps')
  const VTEX = await system.vtexBin()

  // Install apps and count successfully ones
  const result = system.exec(`${VTEX} uninstall ${app.join(' ')}`, 'pipe')
  const count = (result.match(/successfully/g) || []).length

  // Feedback
  count === app.length
    ? logger.msgOk(`${count} of ${app.length} apps uninstalled`)
    : logger.msgError(`${count} of ${app.length} apps uninstalled`)

  // Return success if the count matches apps requested to uninstall
  return { success: count === app.length, log: result }
}

exports.link = async (logFile) => {
  const VTEX = await system.vtexBin()

  return system.spawn(VTEX, ['link', '--verbose'], logFile, system.basePath())
}
