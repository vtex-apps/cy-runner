const cypress = require('cypress')
const { execSync } = require('child_process')
const fs = require('fs')
const { promises: pfs } = require('fs')
const { get } = require('lodash')
const { vtexTeardown } = require('./teardown')
const { isNull } = require('util')

const QE = '[QE] ===> '
const SP = '          '

exports.msgErr = (msg, notr = false) => {
  let end = notr ? '' : '\n'
  process.stderr.write(QE + msg + end)
}

exports.msgErrDetail = (msg, notr = false) => {
  let end = notr ? '' : '\n'
  process.stderr.write(SP + msg + end)
}

exports.msg = (msg, notr = false) => {
  let end = notr ? '' : '\n'
  process.stdout.write(QE + msg + end)
}

exports.msgDetail = (msg, notr = false) => {
  let end = notr ? '' : '\n'
  process.stdout.write(SP + msg + end)
}

exports.statusMsg = (msg, notr = false) => {
  let end = notr ? '' : '\n'
  process.stdout.write(msg + end)
}

exports.crash = (msg) => {
  this.msgErr('ERROR: ' + msg + '!\n')
  process.exit(99)
}

exports.report = (msg) => {
  process.stdout.write('\n[QE] ===> ' + msg + '\n\n')
}

exports.success = (msg) => {
  process.stdout.write('\n[QE] ===> SUCCESS: ' + msg + '!\n\n')
  process.exit(0)
}

exports.fail = (msg) => {
  process.stdout.write('\n[QE] ===> FAILED: ' + msg + '!\n\n')
  process.exit(17)
}

exports.exec = (cmd, output) => {
  if (typeof output == 'undefined') output = 'ignore'
  execSync(cmd, {
    stdio: output,
  })
}

exports.fileSize = (file) => {
  let stats = fs.statSync(file)
  let fileSizeInBytes = stats.size
  return fileSizeInBytes
}

exports.updateCyEnvJson = (data) => {
  let fileName = 'cypress.env.json'
  try {
    let json = pfs.readFile(fileName)
    let newJson = { ...json, ...data }
    pfs.writeFile(fileName, JSON.stringify(newJson))
  } catch (e) {
    this.msgErr(e)
  }
}

exports.tick = () => {
  return Date.now()
}

// TODO: Convert in a schema validator
exports.validate = (config) => {
  /* Test only mandatory fields cy-runner works
     0 = String not null
     1 = Integer not null
     2 = Boolean not null
     3 = String
     4 = Integer
     5 = Boolean
     6 = Not null
     7 = array
  */
  const SCHEMA = {
    secretName: 0,
    testConfig: {
      devMode: 2,
      runHeaded: 2,
      authVtexCli: { enabled: 2, git: 0, branch: 0 },
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
    testWorkspace: {
      name: 3,
      setup: {
        enabled: 2,
        stopOnFail: 2,
        path: 0,
        file: 0,
        manageApps: {
          enabled: 2,
          link: 0,
          install: 7,
          uninstall: 7,
        },
      },
      wipe: { enabled: 2, stopOnFail: 2, path: 0, file: 0 },
      teardown: { enabled: 2, stopOnFail: 2, path: 0, file: 0 },
    },
    testStrategy: 7,
  }

  // Tranverse SCHEMA
  const traverse = (result, obj, preKey) => {
    if (typeof obj == 'object') {
      for (var key in obj) {
        traverse(result, obj[key], (preKey || '') + (preKey ? '.' + key : key))
      }
    } else {
      result.push({
        key: preKey || '',
        type: obj,
      })
    }
    return result
  }
  const SCHEMA_TRAVERSED = traverse([], SCHEMA)

  // Validate SCHEMA
  let skip = []
  SCHEMA_TRAVERSED.forEach((check) => {
    let value = get(config, check.key)
    let crash = false
    let ignore = false
    let msg = `Parse cy-runner.yml failed [${check.key} must be `
    // If element is disabled, no need to check structure
    if (/\.enabled/.test(check.key) && value == false)
      skip.push(check.key.split('.enabled')[0])
    skip.forEach((disabled) => {
      if (check.key.includes(disabled)) ignore = true
    })
    if (ignore) return
    switch (check.type) {
      // String not null
      case 0:
        msg = msg + 'string not null]'
        if (value == null || typeof value != 'string') crash = true
        break
      // Integer not null
      case 1:
        msg = msg + 'number not null]'
        if (value == null || typeof value != 'number') crash = true
        break
      // Boolean not null
      case 2:
        msg = msg + 'boolean not null]'
        if (value == null || typeof value != 'boolean') crash = true
        break
      // String
      case 3:
        msg = msg + 'string]'
        if (value != null && typeof value != 'string') crash = true
        break
      // Integer
      case 4:
        msg = msg + 'number]'
        if (value != null && typeof value != 'number') crash = true
        break
      // Boolean
      case 5:
        msg = msg + 'boolean]'
        if (value != null && typeof value != 'boolean') crash = true
        break
      // Not null
      case 6:
        msg = msg + 'not null]'
        if (value == null) crash = true
        break
      // Array
      case 7:
        msg = msg + 'array]'
        if (!value.constructor.prototype.hasOwnProperty('push')) crash = true
        break
      default:
        break
    }
    if (crash) this.crash(msg)
  })
  console.log(skip)

  process.exit(0)
}

exports.openCypress = async (workspace = {}) => {
  await cypress.open({ env: workspace })
}

exports.runCypress = async (config, test, workspace = {}, group) => {
  let stopOnFail = test.stopOnFail
  let key
  let spec =
    typeof test.files == 'undefined' ? test.path + test.file : test.files
  const options = {
    spec: spec,
    runHeaded: config.runHeaded,
    browser: config.browser,
    env: workspace,
  }

  // Options tunning
  if (test.sendDashboard && typeof group == 'undefined')
    this.crash('Cypress Dashboard enabled without a group name')
  if (test.parallel) options['paralell'] = true
  if (typeof group != 'undefined') options['group'] = group
  if (test.sendDashboard) {
    key = fs.readFileSync('cypress.env.json')
    key = JSON.parse(key).cypress.dashboardKey
    if (typeof key == 'undefined')
      this.crash('Cypress Dashboard enabled without a key')
    options['key'] = key
    options['record'] = true
  }

  // Run Cypress
  let testPassed = false
  let endTests = false
  let isTeardown = /teardown/.test(spec)
  try {
    await cypress.run(options).then((result) => {
      if (result.failures) this.crash(result.message)
      if (result.totalFailed > 0 && stopOnFail) endTests = true
      else this.msg(`Spec done with ${result.totalPassed} passed test(s)!`)
      if (result.totalPassed < result.totalTests && !endTests)
        this.msg('Some test failed, but stopOnFail is disabled')
      else testPassed = true
    })
  } catch (e) {
    this.crash(e.message)
  }
  if (endTests) {
    this.msg('Some test failed and stopOnFail is enabled, ending tests')
    // Reduncing workspace back
    workspace = workspace.workspace
    if (!isTeardown && workspace.teardown.enabled) {
      this.msg('Teardown is enabled, calling it')
      await vtexTeardown(workspace, config)
    } else {
      this.msg('Teardown is disabled, skipping it')
    }
    this.crash('Test ended due a stopOnFail strategy')
  }
  return testPassed
}
