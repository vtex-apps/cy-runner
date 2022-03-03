/**********************************************
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
 **********************************************/

const { get } = require('lodash')
const qe = require('./utils')

function schemaValidator(schema, config, strategy = '') {
  let skip = []
  let schemaTraversed = qe.traverse([], schema)
  const ignore = (key, value) => {
    let byPass = null
    key = strategy + key
    if (/\.enabled/.test(key) && typeof value == 'boolean' && !value) {
      skip.push(key.split('.enabled')[0])
    }
    skip.forEach((disabled) => {
      byPass = !!key.includes(disabled)
    })
    return byPass
  }
  schemaTraversed.forEach((item) => {
    let value = get(config, item.key)
    let crash = false
    let msg = 'not null'
    if (ignore(item.key, value)) return
    if (item.type in [0, 1, 2, 6] && value == null) crash = true
    switch (item.type) {
      // String
      case 0:
      case 3:
        msg = 'string'
        if (value != null && typeof value != 'string') crash = true
        break
      // Integer
      case 1:
      case 4:
        msg = 'number'
        if (value != null && typeof value != 'number') crash = true
        break
      // Boolean
      case 2:
      case 5:
        msg = 'boolean'
        if (value != null && typeof value != 'boolean') crash = true
        break
      // // Array
      // case 7:
      //     msg = msg + 'array]'
      //     if (!value.constructor.prototype.hasOwnProperty('push')) crash = true
      //     break
      default:
        break
    }
    if (crash)
      qe.crash(
        `Parse cy-runner.yml failed [${strategy}${item.key} must be ${msg}]`
      )
  })
}

exports.validate = (config) => {
  const BASE_SCHEMA = {
    config: {
      secrets: {
        enabled: 2,
        name: 0,
      },
      authVtexCli: { enabled: 2, git: 0, branch: 0 },
      twilio: { enabled: 2 },
      vtex: { account: 0, id: 4, domain: 0 },
      cypress: {
        enabled: 2,
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
      runHeaded: 2,
      runInDevMode: 2,
      prefix: 0,
      linkApp: 2,
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
  let configSchema = {}
  Object.entries(config.strategy).forEach((entry) => {
    configSchema[entry[0]] = entry[1]
  })
  Object.keys(configSchema).forEach((strategy) => {
    schemaValidator(STRATEGY_SCHEMA, configSchema[strategy], `${strategy}.`)
  })

  // All set, show the user a positive feedback
  qe.msg('cy-runner.yml loaded and validated successfully')
}
