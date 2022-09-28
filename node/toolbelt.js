const system = require('./system')
const logger = require('./logger')

// Get user, email and workspace name
exports.whoami = async () => {
  const VTEX = await system.vtexBin()
  const stdout = system.exec(`${VTEX} whoami`, 'pipe').toString()
  const check = /Logged/.test(stdout)
  const mailOrKey = check ? stdout.split(' ')[7] : null
  const workspace = check ? stdout.split(' ')[11] : null

  return { isLogged: check, mailOrKey, workspace, stdout }
}

// Get local user token
exports.getLocalToken = async () => {
  const VTEX = await system.vtexBin()
  const userOrRobot = await this.whoami()

  if (userOrRobot.isLogged) {
    userOrRobot.token = system
      .exec(`${VTEX} local token`, 'pipe')
      .toString()
      .slice(0, -1)

    return userOrRobot
  }

  system.crash('No user logged', 'Check if you are logged on VTEX Toolbelt')
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

  system.exec(`${VTEX} workspace use ${workspace}`, 'pipe')
  const check = await this.whoami()

  return RegExp(check.workspace).test(workspace)
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
