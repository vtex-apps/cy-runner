const cypress = require('cypress')
const {execSync} = require('child_process')
const fs = require('fs')
const path = require('path')
const {merge} = require('lodash')
const {vtexWipe} = require("./wipe");
const {vtexTeardown} = require("./teardown");

const QE = '[QE] ===> '
const SP = '          - '
const BR = '[QE] ==============================================================================================='

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

exports.msgTestStrategy = (msg) => {
  let end = '\n'
  process.stdout.write(end + '[QE] ' + msg + end)
  process.stdout.write(BR + end + end)
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
  let end = '\n'
  process.stdout.write(end + '[QE] ' + msg + end)
  process.stdout.write(BR + end + end)

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
  return stats.size
}

exports.updateCyEnvJson = (data) => {
  let fileName = 'cypress.env.json'
  try {
    let json = fs.readFileSync(fileName)
    let newJson = {...json, ...data}
    fs.writeFileSync(fileName, JSON.stringify(newJson))
  } catch (e) {
    this.msgErr(e)
  }
}

exports.tick = () => {
  return Date.now()
}

exports.toc = (start) => {
  return (Date.now() - start) / 1000 + ' seconds'
}

exports.traverse = (result, obj, previousKey) => {
  if (typeof obj == 'object') {
    for (const key in obj)
      this.traverse(result, obj[key], (previousKey || '') + (previousKey ? '.' + key : key))
  } else {
    result.push({
      key: previousKey || '',
      type: obj,
    })
  }
  return result
}

exports.reportSetup = async (config) => {
  this.msg('Configuration enabled for this Cypress Runner:')
  this.traverse([], config).forEach(item => {
    if (/enabled/.test(item.key) && /true/.test(item.type)) {
      let itemEnabled = item.key.split('.enabled')[0]
      this.msgDetail(itemEnabled)
    }
  })
  this.msg(`Workspace to be used on the tests: ${config.testWorkspace.name}`)
}

exports.stopOnFail = async (config, step) => {
  this.msg(`[${step}] failed`)
  this.msgDetail(`[${step}.stopOnFail] enabled, stopping the tests`)
  if (config.testWorkspace.wipe.enabled) await vtexWipe(config)
  if (config.testWorkspace.teardown.enabled) await vtexTeardown(config)
  this.crash('Prematurely exit duo a [stopOnFail]')
}

exports.openCypress = async (test, step) => {
  if (typeof test === 'undefined') {
    this.msg(`Opening [testStrategy]`)
    await cypress.open()
  } else {
    const spec = path.parse(test.spec)
    const baseDir = /cy-runner/.test(spec.dir) ? 'cy-runner' : 'cypress'
    const options = {
      config: {
        integrationFolder: spec.dir,
        supportFile: baseDir + '/support',
      },
      spec: `${spec.dir}/${spec.base}`,
    }
    // Open Cypress
    this.msg(`Opening [${step}]`)
    try {
      await cypress.open(options)
    } catch (e) {
      this.crash(e.message)
    }
  }
}

exports.runCypress = async (test, config, addOptions = {}) => {
  if (typeof test.spec === 'string')
    test.spec = [test.spec]
  const spec = path.parse(test.spec[0])
  const baseDir = /cy-runner/.test(spec.dir) ? 'cy-runner' : 'cypress'
  const options = {
    config: {
      integrationFolder: spec.dir,
      supportFile: baseDir + '/support',
    },
    spec: test.spec,
    runHeaded: config.testConfig.runHeaded,
    browser: config.testConfig.cypress.browser
  }
  // Options tuning
  if (test.sendDashboard) {
    options['key'] = config.testConfig.cypress.dashboardKey
    options['record'] = true
    merge(options, addOptions)
    console.log(options)
  }
  // Run Cypress
  let testPassed = true
  try {
    await cypress.run(options).then((result) => {
      if (result.failures) this.crash(result.message)
      if (result.totalPassed < result.totalTests) testPassed = false
    })
  } catch (e) {
    this.crash(e.message)
  }
  return testPassed
}
