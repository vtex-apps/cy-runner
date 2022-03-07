const qe = require('./utils')

exports.workspace = async (config) => {
  const START = qe.tick()
  let wrk = config.workspace
  let linkApp = wrk.linkApp
  let installApps = wrk.installApps
  let removeApps = wrk.removeApps
  let wipe = wrk.wipe
  let teardown = wrk.teardown
  let manageWorkspace =
    wrk.random ||
    linkApp.enabled ||
    installApps.length > 0 ||
    removeApps.length > 0 ||
    wipe.enabled ||
    teardown.enabled
  let vtexBin = config.base.vtex.bin

  if (manageWorkspace) {
    qe.msgSection('Workspace preparation')
    // Check if vtex cli is logged
    let toolbelt = await qe.toolbelt(vtexBin, 'whoami')
    if (typeof toolbelt === 'string') {
      // Feedback with actual user
      qe.msg('Toolbelt logged as ' + toolbelt)
      // Change workspace
      qe.msg('Changing workspace to ' + wrk.name)
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
    } else {
      if (!config.base.vtex.deployCli.enabled)
        qe.crash(
          'deployCli is disabled, you must be logged on your system toolbelt to manage workspace'
        )
      qe.crash('You have deployCli enabled, but something goes wrong')
    }
  }
  return qe.toc(START)
}

async function doLinkApp(config) {
  if (config.workspace.linkApp.enabled) {
    qe.msg('Linking app', 'warn', false)
    qe.msg('Reading ../manifest.json', true, true)
    let testApp = qe.storage('../manifest.json', 'read')
    testApp = JSON.parse(testApp)
    let app = `${testApp.vendor}.${testApp.name}`
    let version = testApp.version.split('.')[0]
    qe.msg(`Uninstalling ${app}`, true, true)
    await qe.toolbelt(config.base.vtex.bin, `uninstall ${app}`)
    qe.msg(`Unlinking ${app}`, true, true)
    await qe.toolbelt(config.base.vtex.bin, `unlink ${app}@${version}.x`)
    let ignoreFile = '../.vtexignore'
    let exclusions = ['cypress', 'cy-runner', 'cypress-shared']
    qe.msg(`Adding cy-runner exclusions to ` + ignoreFile, true, true)
    exclusions.forEach((line) => {
      qe.storage(ignoreFile, 'append', line + '.*\n')
      qe.storage(ignoreFile, 'append', '/' + line + '\n')
    })
    qe.msg(`Linking ${app}`, true, true)
    let logOutput = config.workspace.linkApp.logOutput.enabled
      ? '1> cy-runner.log &'
      : '--no-watch'
    await qe.toolbelt(config.base.vtex.bin, `link ${logOutput}`, app)
    qe.msg('App linked successfully')
  }
}
