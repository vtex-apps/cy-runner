const path = require('path')

const qe = require('./utils')

exports.getConfig = async (configFile) => {
  // Check config file, parse it and add dynamic values
  let config = qe.loadYmlConfig(configFile)
  const VTEX_AUTH_PATH = '.myvtex.com/api/vtexid/pub/authentication'
  const VTEX_ACCOUNT = config.base.vtex.account

  config.base.vtex.authUrl = `https://${VTEX_ACCOUNT}${VTEX_AUTH_PATH}`
  // Load secrets and parse it
  const secrets = qe.loadSecrets(config)

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
  const src = path.join(__dirname, '..', 'cypress-shared', 'support', 'common')
  let dst = path.join(__dirname, '..', '..', 'cypress', 'support')

  if (qe.storage(dst)) {
    dst = path.join(dst, 'common')
    if (qe.storage(dst)) qe.storage(dst, 'rm')
    qe.storage(src, 'link', dst)
    qe.msg('Local cypress detected, common link created')
  }

  return config
}
