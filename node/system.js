const { execSync } = require('child_process')
const path = require('path')

const logger = require('./logger')

const logPath = path.join('.', 'logs')
const logFile = path.join(logPath, 'cy-runner.log')

exports.crash = (msg, err) => {
  logger.msgEnd('ERROR')
  logger.msgError(msg, 'Crash')
  if (typeof err !== 'undefined') logger.msgPad(err)
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
  if (typeof output === 'undefined') output = 'ignore'
  const maxTimeout = 4 * 60 * 1000
  let result

  try {
    result = execSync(cmd, { stdio: output, timeout: maxTimeout })
  } catch (e) {
    const msg1 = '\n >>  Failed to run'
    const msg2 = `\n >>  Command: ${cmd}`
    const msg3 = `\n >>  Returns: ${e}`

    this.storage(logFile, 'append', msg1)
    this.storage(logFile, 'append', msg2)
    this.storage(logFile, 'append', msg3)
    result = 'error'

    // If timeout, exit
    if (/ETIMEDOUT/.test(e)) this.crash(`Timeout running ${cmd}`, e)
  }

  return result
}

exports.tick = () => {
  return Date.now()
}

exports.tock = (start) => {
  return `${(Date.now() - start) / 1000} seconds`
}

exports.traverse = (result, obj, previousKey) => {
  if (typeof obj === 'object') {
    for (const key in obj) {
      this.traverse(
        result,
        obj[key],
        (previousKey || '') + (previousKey ? `.${key}` : key)
      )
    }
  } else {
    result.push({
      key: previousKey || '',
      type: obj,
    })
  }

  return result
}
