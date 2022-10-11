const cfg = require('./config')
const logger = require('./logger')
const system = require('./system')
const storage = require('./storage')
const credentials = require('./credentials')
const toolbelt = require('./toolbelt')
const http = require('./http')

const [, , action] = process.argv
const MAX_TIME = 40 // Forced releasing time for stuck workspace (minutes)

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

exports.reserveAccount = async (config, secrets = null) => {
  // If from action, show next section
  if (action) logger.msgSection('Reserve account level resources')

  // Let's checkAccount
  const { account } = config.base.vtex
  // Set up base info
  const workspace = await cfg.getWorkspaceName(config)

  config.workspace.name = workspace

  logger.msgOk(`Checking current configuration`)

  // Check current configuration
  const orderFormCfg = await getOrderFormConfig(config, workspace, secrets)

  // Save results to be used later
  config.data = orderFormCfg.data

  // Check
  if (orderFormCfg.startTime && !orderFormCfg.usedInLocal) {
    // Yes, get the time running in seconds
    const ranTime = (Date.now() - orderFormCfg.startTime) / 1000 / 60

    if (ranTime < MAX_TIME) {
      // Test running less than 40 minutes, try again later
      logger.msgError('Another test is running', true)
      system.crash(
        `Account ${config.base.vtex.account} was reserved to ${orderFormCfg.workspace}`,
        `Please, try again in ${Math.floor(MAX_TIME - ranTime)} minutes`,
        { pr: true, dump: false }
      )
    } else {
      // Test running more than 40 minutes or appId miss configured
      logger.msgPad(
        `Workspace ${orderFormCfg.workspace} stuck [${Math.floor(
          ranTime
        )} minutes], releasing`
      )
      config = await this.releaseAccount(config, secrets)
    }
  }

  // Reserve app
  logger.msgOk(`Reserving ${account} to ${config.workspace.name}`)

  if (!orderFormCfg.usedInLocal) {
    config.data.apps.push({
      fields: [config.workspace.name, Date.now()],
      id: 'e2e',
      major: 1,
    })
  }

  await setOrderFormConfig(config, secrets)

  // Set up other reservations
  await setAppConfig(config, secrets)

  // If we reach here, everything is good
  logger.msgOk('Requested successfully')
}

exports.releaseAccount = async (config, secrets = null) => {
  // If from action, show start section
  if (action) logger.msgSection('Release account level resources')

  logger.msgOk('Releasing account level resources')
  const workspace = await cfg.getWorkspaceName(config)
  const orderFormCfg = await getOrderFormConfig(config, workspace, secrets)

  config.data = orderFormCfg.data
  config.data.apps.splice(orderFormCfg.appId, 1)
  config.data.taxConfiguration = {}
  await setOrderFormConfig(config, secrets)
  logger.msgOk('Released successfully')
}

async function getOrderFormConfig(config, dynamicWorkspace, secrets = null) {
  logger.msgPad('getting orderForm configuration')
  if (!secrets) secrets = config.base
  let startTime = null
  let usedInLocal = false

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
  const appId = result?.data?.apps?.findIndex((app) => app.id === 'e2e')
  const workspace = appId >= 0 ? result?.data?.apps[appId]?.fields[0] : null

  // If we are running tests in CI or dynamicWorkspace is not registered in orderForm Configuration
  // Then update startTime
  // else return startTime with null and usedInLocal as true
  if (system.isCI() || dynamicWorkspace !== workspace) {
    startTime = appId >= 0 ? result?.data?.apps[appId]?.fields[1] : null
  } else {
    // In development(local), QE will use same workspace which is already registered in taxConfiguration
    // so, we are returning usedInLocal to true
    usedInLocal = true
  }

  return { startTime, workspace, appId, data: result?.data, usedInLocal }
}

async function setOrderFormConfig(config, secrets) {
  logger.msgPad('setting orderForm configuration')
  if (!secrets) secrets = config.base
  const { account } = config.base.vtex
  const url = `https://${account}.vtexcommercestable.com.br/api/checkout/pvt/configuration/orderForm`
  const headers = {
    'X-VTEX-API-AppKey': secrets.vtex.apiKey,
    'X-VTEX-API-AppToken': secrets.vtex.apiToken,
  }

  const axiosConfig = { url, method: 'post', headers, data: config.data }

  logger.msgOk(JSON.stringify(config.data))
  const result = await http.request(axiosConfig)

  if (result?.status !== 204) {
    system.crash('Failed to set up orderForm configuration', result?.data)
  }
}

async function setAppConfig(config, secrets) {
  logger.msgOk('Configuring apps')
  if (!secrets) secrets = config.base
  const { account } = config.base.vtex
  const { prefix } = config.workspace
  const workspace = config.workspace.name
  const orderFormCfg = await getOrderFormConfig(config, workspace, secrets)
  const apps = config.workspace.reserveAccount.setup

  config.data = orderFormCfg.data
  for (const id in apps) {
    if (apps[id].toLowerCase() === 'orderform') {
      config.data.taxConfiguration = {
        url: `https://${workspace}--${account}.myvtex.com/${prefix}/checkout/order-tax`,
        authorizationHeader: secrets.vtex.authorizationHeader,
        allowExecutionAfterErrors: false,
        integratedAuthentication: false,
        appId: Date.now(),
      }
      // eslint-disable-next-line no-await-in-loop
      await setOrderFormConfig(config, secrets)
    } else if (apps[id].includes('@')) {
      logger.msgPad(`configuring ${apps[id]}`)
      const [app, version] = apps[id].split('@')
      const graphQLApp = 'vtex.apps-graphql@3.x'
      const url = `https://${account}.myvtex.com/_v/private/admin-graphql-ide/v0/${graphQLApp}`
      // eslint-disable-next-line no-await-in-loop
      const user = await toolbelt.getLocalToken()
      const headers = { Cookie: `${secrets.vtex.authCookieName}=${user.token}` }
      let check = null

      const query =
        'mutation' +
        '($app:String, $version:String, $settings:String)' +
        '{saveAppSettings(app:$app, version:$version, settings:$settings){message}}'

      const variables = {
        app,
        version,
        settings: `{"targetWorkspace": "${workspace}"}`,
      }

      const axiosConfig = {
        url,
        method: 'post',
        headers,
        data: { query, variables },
      }

      try {
        // eslint-disable-next-line no-await-in-loop
        const result = await http.request(axiosConfig)

        check = RegExp(workspace).test(
          result?.data?.data?.saveAppSettings?.message
        )
      } catch (_e) {
        check = false
      }

      if (!check) {
        logger.msgError(`Failed to configure ${apps[id]}`, true)
        logger.msgPad('Releasing account level resources')
        // eslint-disable-next-line no-await-in-loop
        await this.releaseAccount(config, secrets)
        system.crash('Failed to configure app', apps[id])
      }
    }
  }
}

// If called outside cy-runner, let's deal with it
if (action) checkAccount().then((r) => r)
