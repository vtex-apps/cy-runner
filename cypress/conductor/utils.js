const cypress = require('cypress')
const { execSync } = require('child_process')
const fs = require('fs')
const { promises: pfs } = require('fs')

const QE = '[QE] ===> '
const SP = '          '

exports.errMsg = (msg, notr) => {
  let end = notr ? '' : '\n'
  process.stderr.write(QE + msg + end)
  return null
}

exports.errFixMsg = (msg, notr) => {
  let end = notr ? '' : '\n'
  process.stderr.write(SP + msg + end)
  return null
}

exports.outMsg = (msg, notr) => {
  let end = notr ? '' : '\n'
  process.stdout.write(QE + msg + end)
  return null
}

exports.outFixMsg = (msg, notr) => {
  let end = notr ? '' : '\n'
  process.stdout.write(SP + msg + end)
  return null
}

exports.statusMsg = (msg, notr) => {
  let end = notr ? '' : '\n'
  process.stdout.write(msg + end)
  return null
}

exports.crash = (msg) => {
  this.errMsg('ERROR: ' + msg + '!\n')
  process.exit(99)
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
    this.errMsg(e)
  }
}

exports.openCypress = async (env = {}) => {
  await cypress.open({ env: env })
}

exports.runCypress = async (specFile, stopOnFail, env = {}) => {
  await cypress
    .run({ spec: specFile, env: env })
    .then((result) => {
      if (result.failures) {
        this.crash(result.message)
      }
      if ((result.totalFailed > 0) & stopOnFail) {
        this.crash('Test failed and stopOnFail is true, stopping the execution')
      }
      this.outMsg(
        `Test done sucessfully with ${result.totalPassed} passed test(s)!`
      )
    })
    .catch((err) => {
      this.crash(err.message)
    })
}
