const { merge } = require('lodash')
const jsYaml = require('js-yaml')

const http = require('./http')
const logger = require('./logger')
const schema = require('./schema')
const system = require('./system')
const toolbelt = require('./toolbelt')
const cypress = require('./cypress')
const storage = require('./storage')

exports.getCookies = async (config) => {
  // eslint-disable-next-line vtex/prefer-early-return
  if (config.base.secrets.enabled && config.base.cypress.getCookies) {
    // Admin cookie
    logger.msgSection('Cookies')
    logger.msgWarn('Getting cookies')
    logger.msgPad('Requesting admin cookies')
    const axiosConfig = {
      url: config.base.vtex.vtexIdUrl,
      method: 'get',
      params: {
        user: config.base.vtex.apiKey,
        pass: config.base.vtex.apiToken,
      },
    }

    const response = await http.request(axiosConfig)

    if (response?.data?.authStatus !== 'Success') {
      system.crash(
        'Failed to get admin credentials',
        'Check apiToken and apiKey on your secrets'
      )
    }

    const cookieName = response.data.authCookie.Name
    const cookieValue = response.data.authCookie.Value

    config.base.vtex.authCookieName = cookieName
    config.base.vtex.adminAuthCookieValue = cookieValue

    // User cookie
    logger.msgPad('Requesting user cookie')
    config.base.vtex.userAuthCookieValue = await toolbelt.getLocalToken()

    // Save Cypress env JSON
    cypress.saveCypressEnvJson(config)
  }
}

exports.readSecrets = (config) => {
  const SECRET_NAME = config.base.secrets.name
  const SECRET_FILE = `.${SECRET_NAME}.json`
  let secrets = process.env.SECRET_NAME ?? false
  let loadedFrom = null

  if (storage.exists(SECRET_FILE)) {
    secrets = storage.readYaml(SECRET_FILE)
    loadedFrom = `file ${SECRET_FILE}`
  } else {
    if (!secrets) {
      system.crash(
        'Secret missing',
        `You should disable secrets, create a ${SECRET_FILE} or set a ${SECRET_NAME} env`
      )
    }

    try {
      secrets = jsYaml.load(process.env.SECRET_NAME, 'utf-8')
      loadedFrom = `env variable ${SECRET_NAME}`
    } catch (e) {
      this.crash(`Check if your env variable ${SECRET_NAME} is well formatted`)
    }
  }

  schema.validateSecrets(secrets, config)
  this.msg(`Secrets loaded from ${loadedFrom} successfully`)

  return secrets
}

exports.mergeSecrets = (config, secrets) => {
  merge(config.base, secrets)

  return config
}
