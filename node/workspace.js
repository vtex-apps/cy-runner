const path = require('path')

const qe = require('./utils')
const { teardown } = require('./teardown')

exports.workspace = async (config) => {
  const START = qe.tick()
  const wrk = config.workspace
  const { linkApp } = wrk
  const { installApps } = wrk
  const { removeApps } = wrk
  const manageWorkspace =
    wrk.random ||
    linkApp.enabled ||
    installApps.length > 0 ||
    removeApps.length > 0

  const vtexBin = config.base.vtex.bin

  if (manageWorkspace) {
    qe.msgSection('Workspace preparation')
    // Check if vtex cli is logged
    const toolbelt = await qe.toolbelt(vtexBin, 'whoami')

    if (typeof toolbelt === 'string') {
      // Feedback with actual user
      qe.msg(`Toolbelt logged as ${toolbelt}`)
      // Change workspace
      qe.msg(`Changing workspace to ${wrk.name}`)
      await qe.toolbelt(vtexBin, `workspace use ${wrk.name}`)
      // Install apps
      if (installApps.length > 0) {
        qe.msg('Installing apps', 'warn', false)
        installApps.forEach((app) => {
          qe.msg(app, true, true)
          qe.toolbelt(vtexBin, `install ${app}`)
        })
        qe.msg('Apps installed successfully')
      }

      // Uninstall apps
      if (removeApps.length > 0) {
        qe.msg('Uninstalling apps', 'warn', false)
        removeApps.forEach((app) => {
          qe.msg(app, true, true)
          qe.toolbelt(vtexBin, `uninstall ${app}`)
        })
        qe.msg('Apps uninstalled successfully')
      }

      // Link app
      await doLinkApp(config)

      // Logging all apps
      await listApps(vtexBin)
    } else {
      if (!config.base.vtex.deployCli.enabled) {
        qe.crash(
          'deployCli is disabled, you must be logged on your system toolbelt to manage workspace'
        )
      }

      qe.crash('You have deployCli enabled, but something goes wrong')
    }
  }

  return qe.toc(START)
}

async function listApps(vtexBin) {
  const appsLogFile = path.join('.', 'logs', 'appsVersions.log')
  const depsLogFile = path.join('.', 'logs', 'depsVersions.log')
  const apps = await qe.toolbelt(vtexBin, 'ls')
  const deps = await qe.toolbelt(vtexBin, 'deps ls')

  qe.msg(`Listing apps to ${appsLogFile}`)
  qe.storage(appsLogFile, 'append', apps)
  qe.msg(`Listing deps to ${depsLogFile}`)
  qe.storage(depsLogFile, 'append', deps)
}

async function doLinkApp(config) {
  // eslint-disable-next-line vtex/prefer-early-return
  if (config.workspace.linkApp.enabled) {
    qe.msg('Linking app', 'warn', false)
    const manifestFile = path.join('..', 'manifest.json')

    qe.msg(`Reading ${manifestFile}`, true, true)
    let testApp = qe.storage(manifestFile, 'read')

    testApp = JSON.parse(testApp)
    const app = `${testApp.vendor}.${testApp.name}`
    const [version] = testApp.version.split('.')

    qe.msg(`Uninstalling ${app} if needed`, true, true)
    await qe.toolbelt(config.base.vtex.bin, `uninstall ${app}`)
    qe.msg(`Unlinking ${app} if needed`, true, true)
    await qe.toolbelt(config.base.vtex.bin, `unlink ${app}@${version}.x`)
    const ignoreFile = path.join('..', '.vtexignore')
    const exclusions = ['cypress', 'cy-runner', 'cypress-shared']

    qe.msg(`Adding cy-runner exclusions to ${ignoreFile}`, true, true)
    exclusions.forEach((line) => {
      qe.storage(ignoreFile, 'append', `${line}\n`)
    })
    qe.msg(`Linking ${app}`, true, true)
    const logFolder = 'logs'
    const outFile = path.join('cy-runner', logFolder, 'link.log')
    const logOutput = config.workspace.linkApp.logOutput.enabled
      ? `1> ${outFile} &`
      : '--no-watch'

    if (!qe.storage(logFolder, 'exists')) qe.storage(logFolder, 'mkdir')
    const check = await qe.toolbelt(
      config.base.vtex.bin,
      `link ${logOutput}`,
      app
    )

    if (check === 'error') {
      qe.msg(`Error linking ${app}`, 'error')
      await teardown(config)
      qe.crash('Prematurely exit duo a link failure')
    } else {
      qe.msg('App linked successfully')
    }
  }
}
