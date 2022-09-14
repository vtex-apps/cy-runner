const path = require('path')

const { merge } = require('lodash')
const jsYaml = require('js-yaml')

const http = require('./http')
const logger = require('./logger')
const schema = require('./schema')
const system = require('./system')
const toolbelt = require('./toolbelt')
const storage = require('./storage')

exports.getCookies = async (config) => {
  // eslint-disable-next-line vtex/prefer-early-return
  if (config.base.cypress.getCookies) {
    // Admin cookie
    logger.msgOk('Getting admin cookie')
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
        'Check your apiToken and apiKey on your secrets and enable it'
      )
    }

    config.base.vtex.authCookieName = response.data.authCookie.Name
    config.base.vtex.adminAuthCookieValue = response.data.authCookie.Value

    // User cookie
    logger.msgOk('Getting user cookie')
    const userOrRobot = await toolbelt.getLocalToken()

    config.base.vtex.userAuthCookieValue = userOrRobot.token
    if (userOrRobot.mailOrKey.split('@').length === 2) {
      config.base.vtex.robotMail = userOrRobot.mailOrKey
    }

    logger.msgPad(userOrRobot.mailOrKey)

    return config
  }
}

exports.readSecrets = (config) => {
  if (!config.base.secrets.enabled) {
    logger.msgWarn('Secrets disabled')

    return
  }

  logger.msgOk('Loading secrets')
  const SECRET_NAME = config.base.secrets.name
  const SECRET_FILE = path.join(system.cyRunnerPath(), `.${SECRET_NAME}.json`)
  let secrets = process.env.SECRET_NAME
  let loadedFrom = null

  if (storage.exists(SECRET_FILE)) {
    secrets = storage.readYaml(SECRET_FILE)
    loadedFrom = `file ${SECRET_FILE}`
  } else {
    if (!secrets) {
      system.crash(
        'Secrets missing',
        `You should disable secrets, create a '.${SECRET_NAME}.json' or set a '${SECRET_NAME}' env`
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
  logger.msgPad(`from ${loadedFrom.replace(system.basePath(), '.')}`)

  return secrets
}

exports.mergeSecrets = (config, secrets) => {
  merge(config.base, secrets)

  return config
}
