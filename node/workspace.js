const system = require('./system')
const logger = require('./logger')
const toolbelt = require('./toolbelt')

exports.workspace = async (config) => {
  const START = system.tick()
  const wrk = config.workspace
  const { linkApp } = wrk
  const { installApps } = wrk
  const { removeApps } = wrk
  const FOUND = []
  const WORKSPACE_SET = [
    wrk.random,
    linkApp.enabled,
    installApps.length,
    removeApps.length
  ]

  WORKSPACE_SET.forEach((set) => {
    if (set) FOUND.push(set)
  })

  // Prepare workspace
  let check = true

  if (FOUND.length) {
    logger.msgSection('Workspace set up')
    logger.msgWarn(`Changing workspace to ${wrk.name}`)
    check = await toolbelt.changeWorkspace(wrk.name)
    if (check) logger.msgOk(`Changed to ${wrk.name} successfully`)
    else logger.msgError(`Failed to change the workspace to ${wrk.name}`)
    // return check
    // // Install apps
    // if (installApps.length > 0) {
    //   qe.msg('Installing apps', 'warn', false)
    //   await doInstallApps(installApps, vtexBin)
    //   qe.msg('Apps installed successfully')
    // }
    //
    // // Uninstall apps
    // if (removeApps.length > 0) {
    //   qe.msg('Uninstalling apps', 'warn', false)
    //   await doRemoveApps(removeApps, vtexBin)
    //   qe.msg('Apps uninstalled successfully')
    // }
    //
    // // Link app
    // await doLinkApp(config)
    //
    // // Logging all apps
    // await listApps(vtexBin)
  }

  return { success: check, time: system.tack(START) }
}

async function listApps(vtexBin) {
  const appsLogFile = path.join('.', 'logs', 'appsVersions.log')
  const depsLogFile = path.join('.', 'logs', 'depsVersions.log')
  const apps = await qe.toolbelt(vtexBin, 'ls')
  const deps = await qe.toolbelt(vtexBin, 'deps ls')

  qe.msg(`Listing apps to ${appsLogFile}`)
  qe.storage(appsLogFile, 'append', apps.stdout)
  qe.msg(`Listing deps to ${depsLogFile}`)
  qe.storage(depsLogFile, 'append', deps.stdout)
}

async function doInstallApps(apps, vtexBin) {
  for (const index in apps) {
    const app = apps[index]
    // eslint-disable-next-line no-await-in-loop
    const tlb = await qe.toolbelt(vtexBin, `install ${app}`)

    if (!tlb.success) qe.crash(`Error on install ${app}`)
    qe.msg(app, true, true)
  }
}

async function doRemoveApps(apps, vtexBin) {
  for (const index in apps) {
    const app = apps[index]
    // eslint-disable-next-line no-await-in-loop
    const tlb = await qe.toolbelt(vtexBin, `uninstall ${app}`)

    if (!tlb.success) qe.crash(`Error on remove ${app}`)
    qe.msg(app, true, true)
  }
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

    const ignoreFile = path.join('..', '.vtexignore')
    const exclusions = [
      'cypress',
      'cy-runner',
      'cypress-shared',
      'docs/**/*.{gif,png,jpg}',
    ]

    qe.msg(`Adding cy-runner exclusions to ${ignoreFile}`, true, true)
    exclusions.forEach((line) => {
      qe.storage(ignoreFile, 'append', `${line}\n`)
    })
    qe.msg(`Linking ${app}`, true, true)

    const outFile = path.join('cy-runner', 'logs', 'link.log')
    const logOutput = config.workspace.linkApp.logOutput.enabled
      ? `1> ${outFile} &`
      : '--no-watch --verbose --trace'

    const tlb = await qe.toolbelt(
      config.base.vtex.bin,
      `link ${logOutput}`,
      app
    )

    if (tlb.success) {
      qe.msg('App linked successfully')
    } else {
      qe.msg('Error linking App', 'error')
      await teardown(config)
      qe.crash(`Link ${app} to test failed`)
    }
  }
}
