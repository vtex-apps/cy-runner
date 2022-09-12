const path = require('path')

const system = require('./system')
const logger = require('./logger')
const toolbelt = require('./toolbelt')
const storage = require('./storage')

exports.init = async (config) => {
  const START = system.tick()
  const NAME = config.workspace.name

  logger.msgSection('Workspace set up')
  logger.msgWarn(`Changing workspace to ${NAME}`)

  const check = await toolbelt.changeWorkspace(NAME)

  check
    ? logger.msgOk('Changed workspace successfully')
    : logger.msgError('Failed to change the workspace')

  return { success: check, time: system.tack(START) }
}

exports.installApps = async (config) => {
  const START = system.tick()
  const APPS = config.workspace.installApps
  let check = true

  // eslint-disable-next-line vtex/prefer-early-return
  if (APPS?.length) {
    logger.msgWarn('Installing Apps')
    check = await toolbelt.install(APPS)
    check
      ? logger.msgOk('Apps installed successfully')
      : logger.msgError('Failed to install apps')
  }

  return { success: check, time: system.tack(START) }
}

exports.uninstallApps = async (config) => {
  const START = system.tick()
  const APPS = config.workspace.removeApps
  let check = true

  // eslint-disable-next-line vtex/prefer-early-return
  if (APPS?.length) {
    logger.msgWarn('Uninstalling Apps')
    check = await toolbelt.uninstall(APPS)
    check
      ? logger.msgOk('Apps uninstalled successfully')
      : logger.msgError('Failed to uninstall apps')
  }

  return { success: check, time: system.tack(START) }
}

exports.linkApp = async (config) => {
  const START = system.tick()
  const check = true

  // eslint-disable-next-line vtex/prefer-early-return
  if (config.workspace.linkApp.enabled) {
    const MANIFEST_FILE = path.join(system.basePath(), 'manifest.json')

    logger.msgWarn(`Reading ${MANIFEST_FILE}`)
    const MANIFEST = storage.readYaml(MANIFEST_FILE)
    const APP = `${MANIFEST.vendor}.${MANIFEST.name}`

    logger.msgOk(`${MANIFEST_FILE} read successfully`)
    logger.msgWarn(`Linking ${APP}`)
    logger.msgOk(`${APP} linked successfully`)
  }
  //
  //     qe.msg(`Reading ${manifestFile}`, true, true)
  //     let testApp = qe.storage(manifestFile, 'read')
  //
  //     testApp = JSON.parse(testApp)
  //     const app = `${testApp.vendor}.${testApp.name}`
  //
  //
  //     check = await toolbelt.uninstall(APPS)
  //     check
  //       ? logger.msgOk('Apps uninstalled successfully')
  //       : logger.msgError('Failed to uninstall apps')
  //   }

  return { success: check, time: system.tack(START) }
}

//     //
//     // // Link app
//     // await doLinkApp(config)
//     //
//     // // Logging all apps
//     // await listApps(vtexBin)
//   }
//
//   return { success: check, time: system.tack(START) }
// }
//
// async function listApps(vtexBin) {
//   const appsLogFile = path.join('.', 'logs', 'appsVersions.log')
//   const depsLogFile = path.join('.', 'logs', 'depsVersions.log')
//   const apps = await qe.toolbelt(vtexBin, 'ls')
//   const deps = await qe.toolbelt(vtexBin, 'deps ls')
//
//   qe.msg(`Listing apps to ${appsLogFile}`)
//   qe.storage(appsLogFile, 'append', apps.stdout)
//   qe.msg(`Listing deps to ${depsLogFile}`)
//   qe.storage(depsLogFile, 'append', deps.stdout)
// }
//
//
//
// async function doLinkApp(config) {
//   // eslint-disable-next-line vtex/prefer-early-return
//   if (config.workspace.linkApp.enabled) {
//     qe.msg('Linking app', 'warn', false)
//     const manifestFile = path.join('..', 'manifest.json')
//
//     qe.msg(`Reading ${manifestFile}`, true, true)
//     let testApp = qe.storage(manifestFile, 'read')
//
//     testApp = JSON.parse(testApp)
//     const app = `${testApp.vendor}.${testApp.name}`
//
//     const ignoreFile = path.join('..', '.vtexignore')
//     const exclusions = [
//       'cypress',
//       'cy-runner',
//       'cypress-shared',
//       'docs/**/*.{gif,png,jpg}',
//     ]
//
//     qe.msg(`Adding cy-runner exclusions to ${ignoreFile}`, true, true)
//     exclusions.forEach((line) => {
//       qe.storage(ignoreFile, 'append', `${line}\n`)
//     })
//     qe.msg(`Linking ${app}`, true, true)
//
//     const outFile = path.join('cy-runner', 'logs', 'link.log')
//     const logOutput = config.workspace.linkApp.logOutput.enabled
//       ? `1> ${outFile} &`
//       : '--no-watch --verbose --trace'
//
//     const tlb = await qe.toolbelt(
//       config.base.vtex.bin,
//       `link ${logOutput}`,
//       app
//     )
//
//     if (tlb.success) {
//       qe.msg('App linked successfully')
//     } else {
//       qe.msg('Error linking App', 'error')
//       await teardown(config)
//       qe.crash(`Link ${app} to test failed`)
//     }
//   }
// }
