const path = require('path')

const storage = require('./storage')
const system = require('./system')

const LOG_PATH = path.join(system.cyRunnerPath(), 'logs')
const LOG_FILE = path.join(LOG_PATH, '_cy-runner.log')
const PUL_FILE = path.join(LOG_PATH, '_cy-decorator.txt')

function ico(type) {
  switch (type) {
    case 'section':
      return '####'

    case 'ok':
      return '[✓]'.padStart(8)

    case 'warn':
      return '[!]'.padStart(8)

    case 'error':
      return '[✗]'.padStart(8)

    case 'pipe':
      return '  ☍'.padStart(10)

    default:
      return '- '.padStart(8)
  }
}

// Init logs, clean before each run if local
exports.init = () => {
  if (system.isCI()) return storage.makeDir(LOG_PATH)
  storage.delete(PUL_FILE)
  storage.delete(LOG_PATH)
  storage.makeDir(LOG_PATH)
}

// Return log path
exports.logPath = () => {
  return LOG_PATH
}

// Return log file
exports.logFile = () => {
  return LOG_FILE
}

// Write messages to log file and console
exports.write = (msg, pr = false) => {
  process.stdout.write(msg)
  storage.append(msg, LOG_FILE)
  // Send pr messages to be printed in GitHub PR
  if (pr) {
    storage.append(
      storage.exists(PUL_FILE) ? msg : `### Cypress Runner\n\n${msg}`,
      PUL_FILE
    )
  }
}

exports.msgOk = (msg, pr = false) => {
  this.write(`\n${ico('ok')} ${msg}`, pr)
}

exports.msgWarn = (msg, pr = false) => {
  this.write(`\n${ico('warn')} ${msg}`, pr)
}

exports.msgError = (msg, pr = false) => {
  this.write(`\n${ico('error')} ${msg}`, pr)
}

exports.msgPipe = (msg) => {
  this.write(`\n${ico('pipe')} ${msg}`)
}

exports.msgPad = (msg, pr = false) => {
  this.write(`\n${ico()} ${msg}`, pr)
}

exports.msgSection = (msg, pr = false) => {
  if (system.isCI()) {
    // If first section, don't close group
    // eslint-disable-next-line no-console
    if (msg !== 'Cypress Runner') console.log(`::endgroup::`)

    // Open group for each new section
    // eslint-disable-next-line no-console
    console.log(`::group::${msg}`)
  }

  this.write(`\n\n${ico('section')} ${msg}\n`, pr)
}

exports.msgEnd = (msg, pr = false) => {
  this.write(`\n\n${ico('section')} ${msg}\n`, pr)
}

exports.newLine = (n = 1, pr = false) => {
  for (let i = 0; i < n; i++) {
    this.write('\n', pr)
  }
}
