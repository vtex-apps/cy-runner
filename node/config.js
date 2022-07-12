const path = require('path')

const qe = require('./utils')

exports.getConfig = async (configFile) => {
  qe.msg('Checking configuration', 'warn')
  // Check config file, parse it and add dynamic values
  let config = qe.loadYmlConfig(configFile)
  const VTEX_AUTH_PATH = '.myvtex.com/api/vtexid/pub/authentication'
  const VTEX_ACCOUNT = config.base.vtex.account

  config.base.vtex.authUrl = `https://${VTEX_ACCOUNT}${VTEX_AUTH_PATH}`
  // Load secrets and parse it
  const secrets = qe.loadSecrets(config)

  // Do check to avoid waste of time on CI environments
  const isCI = process.env.CI ?? false
  const skipAutoConfigOnCI = config.base.skipAutoConfigOnCI ?? false

  // Checks to avoid silly configuration errors on CI
  if (isCI && !skipAutoConfigOnCI) {
    // TODO: Refactor to be possible run E2E without deployCli
    qe.msg(
      'CI detected, auto configuring deployCli, Twilio, and some Cypress flags',
      'warn'
    )
    qe.msg('To avoid auto config, enable base.skipAutoConfigOnCI', true, true)
    config.base.vtex.deployCli.enabled = true
    config.base.twilio.enabled = true
    config.base.cypress.devMode = false
    config.base.cypress.runHeaded = false
    config.base.cypress.getCookies = true
    config.base.cypress.quiet = true
    config.base.cypress.videoUploadOnPasses = false
    config.base.cypress.trashAssetsBeforeRuns = false
    config.base.cypress.watchForFileChanges = false
    config.base.cypress.browser = 'chrome'
    config.base.cypress.sorry = false
  }

  if (secrets) config = qe.mergeSecrets(config, secrets)
  // Get workspace to run tests
  config.workspace.name = qe.getWorkspaceName(config)
  // Set right vtex cli to be used in further calls
  config.base.vtex.bin = config.base.vtex.deployCli.enabled
    ? 'vtex-e2e'
    : 'vtex'
  // Write cypress.env.json
  qe.writeEnvJson(config)
  // Write cypress.json
  qe.writeCypressJson(config)
  // Create empty state files
  qe.createStateFiles(config)
  // Create empty logs dir
  if (!qe.storage('logs')) {
    qe.storage('logs', 'mkdir')
    qe.msg('Logs dir created successfully')
  }

  // Make link if base has Cypress folder
  const lnk = path.join(__dirname, '..', 'cypress')
  const src = path.join(__dirname, '..', 'cypress-shared', 'support', 'common')
  const cyp = path.join(__dirname, '..', '..', 'cypress')
  let dst = path.join(__dirname, '..', '..', 'cypress', 'support')

  if (qe.storage(dst)) {
    // Create common link inside cypress
    dst = path.join(dst, 'common')
    if (qe.storage(dst)) qe.storage(dst, 'rm')
    qe.storage(src, 'link', dst)
    // Create cypress link inside cy-runner
    if (qe.storage(lnk)) qe.storage(lnk, 'rm')
    qe.storage(cyp, 'link', lnk)
    qe.msg('Local cypress detected, common links created')
  }

  return config
}
