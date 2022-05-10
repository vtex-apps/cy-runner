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
    const tlb = await qe.toolbelt(vtexBin, 'whoami')

    if (tlb.success) {
      // Feedback with actual user
      // eslint-disable-next-line prefer-destructuring
      const user = tlb.stdout.split(' ')[7]

      qe.msg(`Toolbelt logged as ${user}`)
      // Change workspace
      qe.msg(`Changing workspace to ${wrk.name}`)
      await qe.toolbelt(vtexBin, `workspace use ${wrk.name}`)
      // Install apps
      if (installApps.length > 0) {
        qe.msg('Installing apps', 'warn', false)
        await doInstallApps(installApps, vtexBin)
        qe.msg('Apps installed successfully')
      }

      // Uninstall apps
      if (removeApps.length > 0) {
        qe.msg('Uninstalling apps', 'warn', false)
        await doRemoveApps(removeApps, vtexBin)
        qe.msg('Apps uninstalled successfully')
      }

      // Link app
      await doLinkApp(config)

      // Logging all apps
      await listApps(vtexBin)
    } else {
      if (!config.base.vtex.deployCli.enabled) {
        qe.crash(
          'You must be logged on toolbelt to manage workspace',
          `Do a 'vtex login ${config.base.vtex.account}' or enable base.vtex.deployCli`
        )
      }

      qe.crash(
        'You have deployCli enabled, but login fails',
        'Check your network!'
      )
    }
  }

  return qe.tack(START)
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
    const [version] = testApp.version.split('.')

    qe.msg(`Uninstalling ${app} if needed`, true, true)
    await qe.toolbelt(config.base.vtex.bin, `uninstall ${app}`)
    qe.msg(`Unlinking ${app} if needed`, true, true)
    await qe.toolbelt(config.base.vtex.bin, `unlink ${app}@${version}.x`)
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
    const logFolder = 'logs'
    const outFile = path.join('cy-runner', logFolder, 'link.log')
    const logOutput = config.workspace.linkApp.logOutput.enabled
      ? `1> ${outFile} &`
      : '--no-watch'

    if (!qe.storage(logFolder, 'exists')) qe.storage(logFolder, 'mkdir')
    const tlb = await qe.toolbelt(
      config.base.vtex.bin,
      `link ${logOutput}`,
      app
    )

    if (tlb.success) {
      qe.msg('App linked successfully')
    } else {
      qe.msg(`Error linking ${app}`, 'error')
      await teardown(config)
      qe.crash('Prematurely exit duo a link failure')
    }
  }
}
