const { execSync, spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

const logger = require('./logger')
const storage = require('./storage')

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
  return !!process.env.CI
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

  // kill any subprocesses created by cy-runner
  const PID_FILE = path.join(logger.logPath(), '_pid')

  if (storage.exists(PID_FILE)) {
    const PID = storage.read(PID_FILE)

    logger.msgPad(`Killing pid ${PID} [vtex link]`)
    process.kill(Number(PID.toString()), 9)
  }

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
exports.spawn = (bin, cmd, logFile, cwd = process.cwd()) => {
  const out = fs.openSync(logFile, 'a')
  const err = fs.openSync(logFile, 'a')

  try {
    const subprocess = spawn(bin, cmd, {
      cwd,
      detached: true,
      stdio: ['ignore', out, err],
    })

    subprocess.unref()

    return subprocess
  } catch (e) {
    logger.msgError(`Failed to spawn ${cmd}`)
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

// Init ID
exports.initId = () => {
  const ID = this.tick().toString().substring(6, 13)
  const FILE_ID = path.join(logger.logPath(), '_id')

  storage.delete(FILE_ID)
  storage.write(ID, FILE_ID)
}

// Get ID
exports.getId = () => {
  const FILE_ID = path.join(logger.logPath(), '_id')

  if (storage.exists(FILE_ID)) return storage.read(FILE_ID)

  this.initId()

  return storage.read(FILE_ID)
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
