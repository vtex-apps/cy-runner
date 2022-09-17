const path = require('path')

const storage = require('./storage')
const system = require('./system')

const QE = '[QE] === '
const GB_DECOR = path.join(system.basePath(), '_gb-decorator.txt')
const LOG_PATH = path.join(system.cyRunnerPath(), 'logs')
const LOG_FILE = path.join(LOG_PATH, '_cy-runner.log')

function ico(type) {
  switch (type) {
    case 'warn':
      return '[!]'.padStart(8)

    case 'error':
      return '[✗]'.padStart(8)

    case 'ok':
      return '[✓]'.padStart(8)

    case 'pipe':
      return '  |'.padStart(10)

    default:
      return '- '.padStart(8)
  }
}

exports.init = () => {
  if (!system.isCI()) {
    storage.delete(GB_DECOR)
    storage.delete(LOG_PATH)
  }

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
  // Send pr messages to GitHub PR Decorator
  if (pr) storage.append(`    ${msg}`, GB_DECOR)
}

exports.msgOk = (msg, pr = false) => {
  this.write(`${ico('ok')} ${msg}\n`, pr)
}

exports.msgWarn = (msg, pr = false) => {
  this.write(`${ico('warn')} ${msg}\n`, pr)
}

exports.msgError = (msg, pr = false) => {
  this.write(`${ico('error')} ${msg}\n`, pr)
}

exports.msgPipe = (msg) => {
  this.write(`${ico('pipe')} ${msg}\n`)
}

exports.msgPad = (msg, pr = false) => {
  this.write(`${ico()} ${msg}\n`, pr)
}

exports.msgSection = (msg, pr = false) => {
  msg = `${QE}${msg} `.padEnd(100, '=')
  this.write(`\n${msg}\n`, pr)
  this.write(`${''.padStart(5, ' ').padEnd(100, '=')}\n\n`, pr)
}

exports.msgEnd = (msg, pr = false) => {
  msg = `${QE}${msg} `.padEnd(100, '=')
  this.write(`\n${msg}\n\n`, pr)
}

exports.newLine = (pr = false) => {
  this.write('\n', pr)
}
