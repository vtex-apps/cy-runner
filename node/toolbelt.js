const path = require('path')

const system = require('./system')

// const delay = (ms) => new Promise((res) => setTimeout(res, ms))
const VTEX = path.join(system.basePath(), 'node_modules', 'vtex', 'bin', 'run')

exports.whoami = async () => {
  const stdout = system.exec(`${VTEX} whoami`, 'pipe').toString()
  const check = /Logged/.test(stdout)
  const mailOrKey = check ? stdout.split(' ')[7] : null
  const workspace = check ? stdout.split(' ')[-1] : null

  return { isLogged: check, mailOrKey, workspace, stdout }
}

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

exports.deleteWorkspace = async (workspace) => {
  const result = system.exec(`${VTEX} workspace delete ${workspace}`, 'pipe')

  return /successfully/.test(result)
}

exports.changeWorkspace = async (workspace) => {
  system.exec(`${VTEX} workspace use ${workspace}`, 'pipe')
  const check = this.whoami()

  return RegExp(check.workspace).test(workspace)
}

// const MAX_TRIES = 3
// let stdout
// let check = false
// let thisTry = 0

//
//     case 'install':
//     /* falls through */
//
//     case 'uninstall':
//       // Check if we are on workspace master
//       stdout = this.exec(`${bin} whoami`, 'pipe').toString()
//       check = /master/.test(stdout)
//       if (check) {
//         this.crash(
//           'You should not install or uninstall apps on workspace master',
//           `${bin} ${cmd}\n${stdout}`
//         )
//       }
//     /* falls through */
//
//     case 'unlink':
//       while (!check && thisTry < MAX_TRIES) {
//         thisTry++
//         stdout = this.exec(`echo y | ${bin} ${cmd}`, 'pipe').toString()
//         check = /uccessfully|App not installed| unlinked|No linked apps/.test(
//           stdout
//         )
//         if (!check) await delay(thisTry * 3000)
//       }
//
//       break
//
//     case 'link':
//       cmd = `cd .. && echo y | ${bin} ${cmd}`
//       while (!check && thisTry < MAX_TRIES) {
//         thisTry++
//         stdout = this.exec(cmd, 'pipe').toString()
//         check = stdout !== 'error'
//         if (!check) await delay(thisTry * 3000)
//       }
//
//       break
//
//     case 'local':
//       stdout = this.exec(`echo y | ${bin} ${cmd}`, 'pipe').toString()
//       check = !/error/.test(stdout)
//       break
//
//     default:
//       stdout = this.exec(`${bin} ${cmd}`, 'pipe').toString()
//       check = true
//   }
//
//   return { success: check, stdout }
// }
