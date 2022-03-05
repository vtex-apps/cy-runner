const cypress = require('cypress')
const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')
const axios = require('axios')
const { merge } = require('lodash')
const { wipe } = require('./wipe')
const { teardown } = require('./teardown')

const QE = '[QE] === '
const SP = ''.padStart(9)

function icon(type) {
  switch (type) {
    case 'warn':
      return '[!]'
    case 'error':
      return '[✗]'
    case 'ok':
      return '[✓]'
    default:
      return '- '
  }
}

exports.msg = (msg, type = 'ok', pad = false, wait = false) => {
  const ICO = pad ? icon().padStart(8) : icon(type).padStart(8)
  const MSG = `${ICO} ${msg}${wait ? '... ' : '\n'}`
  process.stdout.write(MSG)
}

exports.msgSection = (msg) => {
  const END = '\n'
  msg = `${QE}${msg} `.padEnd(100, '=')
  process.stdout.write(END + msg + END)
  process.stdout.write(''.padStart(5, ' ').padEnd(100, '=') + END + END)
}

exports.msgEnd = (msg) => {
  const END = '\n'
  msg = `${QE}${msg} `.padEnd(100, '=')
  process.stdout.write(END + msg + END + END)
}

exports.msgDetail = (msg, noNewLine = false) => {
  let end = noNewLine ? '' : '\n'
  process.stdout.write(SP + msg + end)
}

exports.newLine = () => {
  process.stdout.write('\n')
}

exports.crash = (msg, e) => {
  this.msgEnd('Error')
  this.msg(msg, 'error')
  if (typeof e != 'undefined') this.msg(e, true, true)
  this.newLine()
  process.exit(99)
}

exports.success = (msg) => {
  this.msgEnd('SUCCESS')
  this.msg(msg)
  this.newLine()
  process.exit(0)
}

exports.fail = (msg) => {
  this.msgEnd('FAIL')
  this.msg(msg, 'error')
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
    this.catch(e)
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
  this.msgSection('Sections enabled/disabled')
  this.traverse([], config).forEach((item) => {
    if (/enabled/.test(item.key) && /true/.test(item.type)) {
      let itemEnabled = item.key.split('.enabled')[0]
      this.msg(itemEnabled)
    }
    if (/enabled/.test(item.key) && /false/.test(item.type)) {
      let itemEnabled = item.key.split('.enabled')[0]
      this.msg(itemEnabled, 'error')
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
  // If for authentication, run in most basic way
  let spec = path.parse(test.spec[0])
  let cyPath = spec.dir.split(path.sep)[0]
  let options = {
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

exports.request = async (config) => {
  let response
  await axios(config)
    .then((result) => {
      response = result
    })
    .catch((e) => {
      this.crash('Request failed', e)
    })
  return response
}
