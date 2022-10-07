const logger = require('./logger')
const system = require('./system')
const storage = require('./storage')
const credentials = require('./credentials')
const toolbelt = require('./toolbelt')
const http = require('./http')

const [, , action] = process.argv

const TAX_APPS = ['avalara', 'cybersource', 'taxjar', 'digitalriver']

async function checkAccount() {
  logger.init()
  logger.msgSection('Cypress Runner - Handle account level resources')
  const config = storage.readYaml('cy-runner.yml')
  const secrets = credentials.readSecrets(config)
  // eslint-disable-next-line global-require,import/no-self-import
  const lock = require('./lock')

  if (action === 'reserve') return lock.reserveAccount(config, secrets)
  if (action === 'release') return lock.releaseAccount(config, secrets)

  system.crash(
    `You must call me with 'reserve' or 'release' action`,
    `./cy-runner/node/lock ( reserve | release )`
  )
}

function getCypressTestsIndex(config) {
  return config.data.apps.findIndex((obj) => obj.id === 'cypress-tests')
}

function releaseCypressTests(config) {
  const cypressTestsIndex = getCypressTestsIndex(config)

  if (cypressTestsIndex !== -1) {
    config.data.apps[cypressTestsIndex] = {
      fields: ['cypress'], // fields should not be empty. So, on release we are setting to random text (eg:cypress)
      id: 'cypress-tests',
      major: 1,
    }
  }

  return config
}

function reserveCypressTests(config, workspace) {
  const cypressTestsIndex = getCypressTestsIndex(config)

  if (cypressTestsIndex !== -1) {
    config.data.apps[cypressTestsIndex].fields[0] = workspace
    config.data.apps[cypressTestsIndex].fields[1] = Date.now()
  } else {
    config.data.apps.push({
      fields: [workspace, Date.now()],
      id: 'cypress-tests',
      major: 1,
    })
  }

  return config
}

async function generateWorkspaceName(config, prefix) {
  return config.workspace.name === 'random'
    ? `${prefix}${await system.getId()}`
    : config.workspace.name
}

exports.reserveAccount = async (config, secrets = null) => {
  logger.msgOk(`Checking current configuration`)
  // Let's checkAccount
  const { account } = config.base.vtex
  const { prefix } = config.workspace
  const workspace = await generateWorkspaceName(config, prefix)

  // We need to update the config to be used further
  config.workspace.name = workspace

  // Check current configuration
  const getTaxCfg = await getTaxConfiguration(config, secrets)
  const cypressTestsIndex = getCypressTestsIndex(getTaxCfg)

  const actual = getTaxCfg.data.apps[cypressTestsIndex]?.fields[0]
  const ranTime = getTaxCfg.data.apps[cypressTestsIndex]?.fields[1]

  if (getTaxCfg.inUse) {
    // Yes, get the time running in seconds
    const maxTime = 40 // in minutes
    const timeRunning = ((Date.now() - ranTime) / 1000 / 60).toFixed(2)

    if (timeRunning < maxTime && ranTime) {
      // Test running less than 40 minutes, try again later
      logger.msgError('Another test is running', true)
      system.crash(
        `As ${actual} is being tested, orderForm is reserved`,
        `Please, trigger the test again in ${maxTime - timeRunning} minutes`,
        { pr: true, dump: false }
      )
    } else {
      // Test running more than 40 minutes or appId miss configured
      ranTime
        ? logger.msgPad(`Test ${actual} stuck [${timeRunning} min.], releasing`)
        : logger.msgPad(`Test ${actual} stuck [appId misconfigured], releasing`)
      config.data = getTaxCfg.data
      config = releaseCypressTests(config)
      config.data.taxConfiguration = {}
      const release = await this.releaseAccount(config, secrets)

      if (!release.success) system.crash('Failed to release', release.data)
      if (action) logger.msgSection('Reserve account level resources')
    }
  }

  logger.msgOk(`Reserving orderForm to workspace ${workspace}`)
  config.data = getTaxCfg.data

  reserveCypressTests(config, workspace)

  if (TAX_APPS.includes(prefix)) {
    config.data.taxConfiguration = {
      url: `https://${workspace}--${account}.myvtex.com/${prefix}/checkout/order-tax`,
      authorizationHeader: secrets.vtex.authorizationHeader,
      allowExecutionAfterErrors: false,
      integratedAuthentication: false,
    }
  } else {
    // How To use taxConfiguration for new apps
    // In your app, Go to cy-runner.yml and copy prefix
    // Add it in TAX_APPS and Create PR in cy-runner repo
    logger.msgPad(
      `TaxConfiguration can be used only by these taxApps(${TAX_APPS.toString()})`
    )
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
      config = releaseCypressTests(config)
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
    config = releaseCypressTests(config)
    config.data.taxConfiguration = {}
  }

  const call = await setTaxConfiguration(config, secrets)

  call.success
    ? logger.msgOk('Released successfully')
    : logger.msgError('Failed to released')

  return call
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
  const cypressTestsIndex = getCypressTestsIndex(result)

  if (result?.data?.taxConfiguration === null) {
    if (
      cypressTestsIndex === -1 ||
      result.data.apps[cypressTestsIndex].fields[0] === config.workspace.name
    ) {
      return { inUse: false, data: result?.data }
    }
  }

  return { inUse: true, data: result?.data }
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

  return { success: result?.status === 204, data: result?.data }
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
