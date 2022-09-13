const { execSync, spawn } = require('child_process')
const path = require('path')

const logger = require('./logger')

const BASE_PATH = path.join(__dirname, '..', '..')

// Return base path
exports.basePath = () => {
  return BASE_PATH
}

// Return root path
exports.rootPath = () => {
  return path.join(BASE_PATH, '..')
}

// Return cy-runner path
exports.cyRunnerPath = () => {
  return path.join(BASE_PATH, 'cy-runner')
}

// Detect CI
exports.isCI = () => {
  return process.env.CI ?? false
}

// Debug file
exports.debugFile = () => {
  return path.join(process.env.HOME, '.vtex', 'logs', 'debug.json')
}

// Delay
exports.delay = (ms) => new Promise((res) => setTimeout(res, ms))

// Crash and exit
exports.crash = (msg, err) => {
  logger.msgEnd('ERROR')
  logger.msgError(msg, 'Crash')
  if (typeof err !== 'undefined') logger.msgPad(err)

  logger.newLine()
  process.exit(99)
}

// Success and exit
exports.success = (msg) => {
  logger.msgEnd('SUCCESS')
  logger.msgOk(msg)
  logger.newLine()
  process.exit(0)
}

// Fail and exit
exports.fail = (msg) => {
  logger.msgEnd('FAIL')
  logger.msgError(msg)
  logger.newLine()
  process.exit(17)
}

// Run sync process
exports.exec = (cmd, output = 'ignore', cwd = process.cwd()) => {
  const timeout = 5 * 60 * 1000 // 5 minutes
  let result

  try {
    result = execSync(cmd, { stdio: output, timeout, cwd })
  } catch (e) {
    logger.msgError(`Failed to run ${cmd}`)
    logger.msgPad(e)
    result = 'error'

    // If timeout, exit
    if (/ETIMEDOUT/.test(e)) this.crash(`Timeout running ${cmd}`, e)
  }

  return result.toString()
}

// Start a background process
exports.spawn = (bin, cmd, cwd = process.cwd()) => {
  try {
    return spawn(bin, cmd, { cwd })
  } catch (e) {
    logger.msgError(`Failed to fork ${cmd}`)
    logger.msgPad(e)
  }
}

// Start timer
exports.tick = () => {
  return Date.now()
}

// Finish timer
exports.tack = (start) => {
  return `${(Date.now() - start) / 1000} seconds`
}

// Traverse YAML or JSON
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
