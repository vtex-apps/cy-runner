const cypress = require('cypress')
const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')
const { merge } = require('lodash')
const { wipe } = require('./wipe')
const { teardown } = require('./teardown')

const QE = '[QE] === '
const SP = ''.padStart(9)
const NM = '- '.padStart(7)
const PNM = '- '.padStart(12)
const SM = '[✓] '.padStart(9)
const PSM = '[✓] '.padStart(14)
const FM = '[✗] '.padStart(9)
const PFM = '[✗] '.padStart(14)
const END = '\n'

exports.err = (msg, noNewLine = false) => {
  let end = noNewLine ? '' : '\n'
  process.stderr.write(QE + msg + end)
}

exports.msgErrDetail = (msg, noNewLine = false) => {
  let end = noNewLine ? '' : '\n'
  process.stderr.write(FM + msg + end)
}

exports.msg = (msg, noNewLine = false) => {
  let end = noNewLine ? '' : '\n'
  process.stdout.write(NM + msg + end)
}

exports.msgOk = (msg) => {
  process.stdout.write(SM + msg + END)
}

exports.msgErr = (msg) => {
  process.stdout.write(FM + msg + END)
}

exports.msgSection = (msg) => {
  let end = '\n'
  msg = `${QE}${msg} `.padEnd(100, '=')
  process.stdout.write(end + msg + end)
  process.stdout.write(''.padStart(5, ' ').padEnd(100, '=') + end + end)
}

exports.msgEnd = (msg) => {
  let end = '\n'
  msg = `${QE}${msg} `.padEnd(100, '=')
  process.stdout.write(''.padStart(5, ' ').padEnd(100, '=') + end)
  process.stdout.write(end + msg + end + end)
}

exports.msgDetail = (msg, noNewLine = false) => {
  let end = noNewLine ? '' : '\n'
  process.stdout.write(SP + msg + end)
}

exports.statusMsg = (msg, noNewLine = false) => {
  let end = noNewLine ? '' : '\n'
  process.stdout.write(msg + end)
}

exports.newLine = () => {
  process.stdout.write('\n')
}

exports.crash = (msg) => {
  this.msgEnd('ERROR')
  this.msgErr(msg)
  this.newLine()
  process.exit(99)
}

exports.success = (msg) => {
  this.msgEnd('SUCCESS')
  this.msgOk(msg)
  this.newLine()
  process.exit(0)
}

exports.fail = (msg) => {
  this.msgEnd('FAIL')
  this.msgErr(msg)
  this.newLine()
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
    let newJson = { ...json, ...data }
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
      this.traverse(
        result,
        obj[key],
        (previousKey || '') + (previousKey ? '.' + key : key)
      )
  } else {
    result.push({
      key: previousKey || '',
      type: obj,
    })
  }
  return result
}

exports.sectionsToRun = async (config) => {
  this.msgSection('Sections to run')
  this.traverse([], config).forEach((item) => {
    if (/enabled/.test(item.key) && /true/.test(item.type)) {
      let itemEnabled = item.key.split('.enabled')[0]
      this.msgOk(itemEnabled)
    }
    if (/enabled/.test(item.key) && /false/.test(item.type)) {
      let itemEnabled = item.key.split('.enabled')[0]
      this.msgErr(itemEnabled)
    }
  })
}

exports.stopOnFail = async (config, step) => {
  this.msg(`[${step}] failed`)
  this.msgDetail(`[${step}.stopOnFail] enabled, stopping the tests`)
  if (config.workspace.wipe.enabled) await wipe(config)
  if (config.workspace.teardown.enabled) await teardown(config)
  this.crash('Prematurely exit duo a [stopOnFail]')
}

exports.openCypress = async (test, step) => {
  if (typeof test === 'undefined') {
    this.msg(`Opening [strategy]`)
    await cypress.open()
  } else {
    const spec = path.parse(test.spec)
    const baseDir = /node/.test(spec.dir) ? 'node' : 'cypress'
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
  if (typeof test.spec === 'string') test.spec = [test.spec]
  const spec = path.parse(test.spec[0])
  const cyPath = spec.dir.split(path.sep)[0]
  const options = {
    config: {
      integrationFolder: spec.dir,
      supportFile: cyPath + '/support',
    },
    spec: test.spec,
    headed: config.workspace.runHeaded,
    browser: config.base.cypress.browser,
  }
  // Options tuning
  if (test.sendDashboard) {
    options['key'] = config.base.cypress.dashboardKey
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
