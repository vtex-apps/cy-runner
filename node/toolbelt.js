const path = require('path')

const system = require('./system')
const logger = require('./logger')

const VTEX = path.join(
  system.cyRunnerPath(),
  'node_modules',
  'vtex',
  'bin',
  'run'
)

// Get user, email and workspace name
exports.whoami = async () => {
  const stdout = system.exec(`${VTEX} whoami`, 'pipe').toString()
  const check = /Logged/.test(stdout)
  const mailOrKey = check ? stdout.split(' ')[7] : null
  const workspace = check ? stdout.split(' ')[11] : null

  return { isLogged: check, mailOrKey, workspace, stdout }
}

// Get local user token
exports.getLocalToken = async () => {
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

  const result = system.exec(`${VTEX} workspace delete -f ${workspace}`, 'pipe')

  if (!/successfully/.test(result)) logger.msgPad('Failed to delete workspace')
}

exports.changeWorkspace = async (workspace) => {
  system.exec(`${VTEX} workspace use ${workspace}`, 'pipe')
  const check = this.whoami()

  return RegExp(check.workspace).test(workspace)
}

exports.ls = async () => {
  return system.exec(`${VTEX} ls`, 'pipe').toString()
}

exports.dependency = async () => {
  return system.exec(`${VTEX} deps ls`, 'pipe').toString()
}

exports.install = async (app) => {
  // Show list of apps to be installed
  app.forEach((a) => {
    logger.msgPad(a)
  })
  // Crash if on master
  await this.crashIfMaster('install apps')

  // Install apps and count successfully ones
  const result = system.exec(`${VTEX} install ${app.join(' ')}`, 'pipe')
  const count = (result.match(/successfully/g) || []).length

  // Return success if the count matches apps requested to install
  return count === app.length
}

exports.uninstall = async (app) => {
  // Show list of apps to be installed
  app.forEach((a) => {
    logger.msgPad(a)
  })
  // Crash if on master
  await this.crashIfMaster('uninstall apps')

  // Install apps and count successfully ones
  const result = system.exec(`${VTEX} uninstall ${app.join(' ')}`, 'pipe')
  const count = (result.match(/successfully/g) || []).length

  // Return success if the count matches apps requested to install
  return count === app.length
}

exports.link = () => {
  return system.spawn(VTEX, ['link', '--verbose'], system.basePath())
}
