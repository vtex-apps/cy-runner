/** ********************************************
 Validate schema on cy-runner.yml
 Test only mandatory fields cy-runner works
 0 = String not null
 1 = Integer not null
 2 = Boolean not null
 3 = String
 4 = Integer
 5 = Boolean
 6 = Not null
 7 = array
 ********************************************* */

const { get } = require('lodash')

const qe = require('./utils')

function schemaValidator(schema, config, strategy = '') {
  const skip = []
  const schemaTraversed = qe.traverse([], schema)
  const ignore = (key, value) => {
    let byPass = null

    key = strategy + key
    if (/\.enabled/.test(key) && typeof value === 'boolean' && !value) {
      skip.push(key.split('.enabled')[0])
    }

    skip.forEach((disabled) => {
      byPass = !!key.includes(disabled)
    })

    return byPass
  }

  schemaTraversed.forEach((item) => {
    const value = get(config, item.key)
    let crash = false
    let msg = 'not null'

    if (ignore(item.key, value)) return
    if (/[0126]/.test(item.type) && value == null) crash = true
    switch (item.type) {
      // String
      case 0:
      /* falls through */

      case 3:
        msg = 'string'
        crash = typeof value !== msg
        break

      // Integer
      case 1:
      /* falls through */

      case 4:
        msg = 'number'
        crash = typeof value !== msg
        break

      // Boolean
      case 2:
      /* falls through */

      case 5:
        msg = 'boolean'
        crash = typeof value !== msg
        break

      // Array
      case 7:
        msg = 'array'
        try {
          // If not array, it'll fail
          // noinspection JSObjectNullOrUndefined
          value.push('isThisArray?')
          value.pop()
        } catch (e) {
          crash = true
        }

        break

      default:
        break
    }

    if (crash) {
      qe.crash(
        `Parse config file failed: ${strategy}${item.key} must be ${msg}`
      )
    }
  })
}

exports.validateConfig = (config, file) => {
  const BASE_SCHEMA = {
    base: {
      secrets: {
        enabled: 2,
        name: 0,
      },
      twilio: { enabled: 2 },
      vtex: {
        account: 0,
        id: 4,
        domain: 0,
        deployCli: { enabled: 2, git: 0, branch: 0 },
      },
      cypress: {
        devMode: 2,
        runHeaded: 2,
        projectId: 0,
        video: 2,
        videoCompression: 6,
        videoUploadOnPasses: 2,
        screenshotOnRunFailure: 2,
        trashAssetsBeforeRuns: 2,
        viewportWidth: 1,
        viewportHeight: 1,
        defaultCommandTimeout: 1,
        requestTimeout: 1,
        watchForFileChanges: 2,
        pageLoadTimeout: 1,
        browser: 0,
        chromeWebSecurity: 2,
      },
      jira: { enabled: 2, account: 0, board: 0, issueType: 0 },
      slack: { enabled: 2, channel: 3 },
      stateFiles: 7,
    },
    workspace: {
      name: 3,
      prefix: 0,
      linkApp: {
        enabled: 2,
        logOutput: {
          enabled: 2,
        },
      },
      installApps: 7,
      removeApps: 7,
      wipe: { enabled: 2, stopOnFail: 2, spec: 0 },
      teardown: { enabled: 2 },
    },
  }

  const STRATEGY_SCHEMA = {
    enabled: 2,
    sendDashboard: 2,
    stopOnFail: 2,
    hardTries: 1,
    parallel: 2,
    runInOrder: 2,
    specs: 7,
  }

  // Validate base
  schemaValidator(BASE_SCHEMA, config)

  // Validate test strategies
  const configSchema = {}

  Object.entries(config.strategy).forEach((entry) => {
    configSchema[entry[0]] = entry[1]
  })
  Object.keys(configSchema).forEach((strategy) => {
    schemaValidator(STRATEGY_SCHEMA, configSchema[strategy], `${strategy}.`)
  })

  // Validate dependencies
  checkDependency(config)

  // All set, show the user a positive feedback
  qe.msg(`${file} loaded and validated successfully`)
}

exports.validateSecrets = (secrets, config) => {
  try {
    if (config.base.vtex.deployCli.enabled) {
      const VTEX_ATTRIBUTES = [
        'apiKey',
        'apiToken',
        'authCookieName',
        'robotMail',
        'robotPassword',
      ]

      VTEX_ATTRIBUTES.forEach((att) => {
        checkSecret(`secrets.vtex.${att}`, secrets.vtex[att])
      })
    }

    // Check TWILIO secrets
    if (config.base.twilio.enabled) {
      const TWILIO_ATTRIBUTES = ['apiUser', 'apiToken', 'baseUrl']

      TWILIO_ATTRIBUTES.forEach((att) => {
        checkSecret(`secrets.twilio.${att}`, secrets.twilio[att])
      })
    }
  } catch (e) {
    qe.crash('You must set this property on your secrets', e)
  }
}

// Check secrets
function checkSecret(key, value) {
  key = key.split('secrets.')[1]
  if (typeof value !== 'string') qe.crash(`Secret must be string: ${key}`)
  if (value.length <= 0) qe.crash(`Secret can not be null: ${key}`)
}

// Check dependencies
function checkDependency(config) {
  qe.traverse([], config.strategy).forEach((item) => {
    if (/dependency/.test(item.key)) {
      const dep = get(config.strategy, item.type)

      if (dep === undefined) {
        qe.crash('Dependency not found', `strategy.${item.type}`)
      }
    }
  })
}
