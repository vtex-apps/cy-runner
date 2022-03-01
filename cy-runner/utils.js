const cypress = require('cypress')
const {execSync} = require('child_process')
const fs = require('fs')
const path = require('path')

const QE = '[QE] ===> '
const SP = '          - '

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

exports.reportSetup = (config) => {
  this.msg('Configuration enabled for this Cypress Runner:')
  this.traverse([], config).forEach(item => {
    if (/enabled/.test(item.key) && /true/.test(item.type)) {
      let itemEnabled = item.key.split('.enabled')[0]
      this.msgDetail(itemEnabled)
    }
  })
  this.msg(`Workspace to be used on the tests: ${config.testWorkspace.name}`)
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

exports.runCypress = async (test, config, group) => {
  const spec = path.parse(test.spec)
  const baseDir = /cy-runner/.test(spec.dir) ? 'cy-runner' : 'cypress'
  const options = {
    config: {
      integrationFolder: spec.dir,
      supportFile: baseDir + '/support',
    },
    spec: `${spec.dir}/${spec.base}`,
    runHeaded: config.testConfig.runHeaded,
    browser: config.testConfig.cypress.browser
  }
  // Options tuning
  if (test.sendDashboard && typeof group == 'undefined')
    this.crash('Cypress Dashboard enabled without a group name')
  if (typeof group != 'undefined') options['group'] = group
  if (test.parallel) options['parallel'] = true
  if (test.sendDashboard) {
    options['key'] = config.testConfig.cypress.dashboardKey
    options['record'] = true
  }

  // Run Cypress
  let testPassed = true
  try {
    await cypress.open(options).then((result) => {
      if (result.failures) this.crash(result.message)
      if (result.totalPassed < result.totalTests) testPassed = false
      this.msg(`Spec done with ${result.totalPassed} passed and ${result.totalFailed} failed tests`)
    })
  } catch (e) {
    this.crash(e.message)
  }
  return testPassed
}
