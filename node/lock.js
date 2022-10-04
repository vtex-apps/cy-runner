const logger = require('./logger')
const system = require('./system')
const storage = require('./storage')
const credentials = require('./credentials')
const toolbelt = require('./toolbelt')
const http = require('./http')

const [, , action] = process.argv

async function checkAccount() {
  logger.init()
  logger.msgSection('Cypress Runner - Handle account level resources')
  const config = storage.readYaml('cy-runner.yml')
  const secrets = credentials.readSecrets(config)

  if (action === 'reserve') return this.reserveAccount(config, secrets)
  if (action === 'release') return this.releaseAccount(config, secrets)

  system.crash(
    `You must call me with 'reserve' or 'release' action`,
    `./cy-runner/node/lock ( reserve | release )`
  )
}

exports.reserveAccount = async (config, secrets = null) => {
  logger.msgOk(`Checking current configuration`)
  // Check current configuration
  const getTaxCfg = await getTaxConfiguration(config, secrets)

  if (getTaxCfg.inUse) {
    // Yes, get the time running in seconds
    const maxTime = 40 // in minutes
    const ranTime = getTaxCfg.data.taxConfiguration.appId
    let actual = getTaxCfg.data.taxConfiguration.url

    actual = actual.split('/')[2].split('-')[0]
    const timeRunning = ((Date.now() - ranTime) / 1000 / 60).toFixed(2)

    if (timeRunning < maxTime && ranTime) {
      // Test running less than 40 minutes, try again later
      logger.msgError('Another test is running', true)
      system.crash(
        `As ${actual} is being tested, orderForm is reserved`,
        `Please, trigger the test again in ${40 - timeRunning} minutes`,
        { pr: true, dump: false }
      )
    } else {
      // Test running more than 40 minutes or appId miss configured
      ranTime
        ? logger.msgPad(`Test ${actual} stuck [${timeRunning} min.], releasing`)
        : logger.msgPad(`Test ${actual} stuck [appId misconfigured], releasing`)
      config.data = getTaxCfg.data
      config.data.taxConfiguration = {}
      const check = await this.releaseAccount(config, secrets)

      if (!check.success) system.crash('Failed to release', check.data)
    }
  }

  // Let's checkAccount
  logger.msgOk(`Reserving orderForm to workspace ${config.workspace.name}`)
  const workspace = config.workspace.name
  const { account } = config.base.vtex
  const { prefix } = config.workspace

  config.data = getTaxCfg.data
  config.data.taxConfiguration = {
    url: `https://${workspace}--${account}.myvtex.com/${prefix}/checkout/order-tax`,
    allowExecutionAfterErrors: false,
    integratedAuthentication: false,
    appId: Date.now(),
  }

  // Configure orderForm
  const call = await setTaxConfiguration(config, secrets)

  if (!call.success) system.crash('Failed to configure orderForm', call.data)

  // Configure apps
  const apps = ['vtex.orders-broadcast@0.x', 'vtex.sno@0.x']

  for (const app of apps) {
    // eslint-disable-next-line no-await-in-loop
    const check = await setAppsConfiguration(app, config, secrets)

    if (!check) {
      logger.msgError(`Failed to configure ${app}`, true)
      logger.msgPad('Releasing the orderForm')
      config.data.taxConfiguration = {}
      // eslint-disable-next-line no-await-in-loop
      await this.release(config, secrets)
      system.crash('Failed to configure app', app)
    }
  }

  // If we reach here, everything is good
  logger.msgOk('Requested successfully')
}

exports.releaseAccount = async (config, secrets = null) => {
  if (action) logger.msgSection('Release account level resources')
  logger.msgOk(`Releasing orderForm`)
  if (config.data?.taxConfiguration === undefined) {
    const getTaxCfg = await getTaxConfiguration(config, secrets)

    config.data = getTaxCfg.data
    config.data.taxConfiguration = {}
  }

  const call = await setTaxConfiguration(config, secrets)

  call.success
    ? logger.msgOk('Released successfully')
    : logger.msgError('Failed to released')
}

async function getTaxConfiguration(config, secrets = null) {
  logger.msgPad('getting current tax configuration')
  if (!secrets) secrets = config.base
  const { account } = config.base.vtex
  const axiosConfig = {
    url: `https://${account}.vtexcommercestable.com.br/api/checkout/pvt/configuration/orderForm`,
    method: 'get',
    headers: {
      'X-VTEX-API-AppKey': secrets.vtex.apiKey,
      'X-VTEX-API-AppToken': secrets.vtex.apiToken,
    },
  }

  const result = await http.request(axiosConfig)

  return result?.data?.taxConfiguration === null
    ? { inUse: false, data: result?.data }
    : { inUse: true, data: result?.data }
}

async function setTaxConfiguration(config, secrets) {
  logger.msgPad('setting orderForm configuration')
  if (!secrets) secrets = config.base
  const { account } = config.base.vtex
  const url = `https://${account}.vtexcommercestable.com.br/api/checkout/pvt/configuration/orderForm`
  const headers = {
    'X-VTEX-API-AppKey': secrets.vtex.apiKey,
    'X-VTEX-API-AppToken': secrets.vtex.apiToken,
  }

  const axiosConfig = { url, method: 'post', headers, data: config.data }
  const result = await http.request(axiosConfig)
  const success = result ? result.status === 204 : false
  const data = result ? result.data : null

  return { success, data }
}

async function setAppsConfiguration(appVersion, config, secrets) {
  logger.msgPad(`configuring ${appVersion}`)
  if (!secrets) secrets = config.base
  const { account } = config.base.vtex
  const graphQLApp = 'vtex.apps-graphql@3.x'
  const url = `https://${account}.myvtex.com/_v/private/admin-graphql-ide/v0/${graphQLApp}`
  const workspace = config.workspace.name
  const query =
    'mutation' +
    '($app:String, $version:String, $settings:String)' +
    '{saveAppSettings(app:$app, version:$version, settings:$settings){message}}'

  const [app, version] = appVersion.split('@')
  const variables = {
    app,
    version,
    settings: `{"targetWorkspace": "${workspace}"}`,
  }

  const user = await toolbelt.getLocalToken()
  const headers = { Cookie: `${secrets.vtex.authCookieName}=${user.token}` }
  const axiosConfig = {
    url,
    method: 'post',
    headers,
    data: { query, variables },
  }

  const result = await http.request(axiosConfig)

  return RegExp(workspace).test(result?.data?.data?.saveAppSettings?.message)
}

// If called outside cy-runner, let's deal with it
if (action) checkAccount().then((r) => r)
