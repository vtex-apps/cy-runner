const path = require('path')

const storage = require('./storage')
const system = require('./system')

const QE = '[QE] === '
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
exports.write = (msg) => {
  process.stdout.write(msg)
  storage.append(msg, LOG_FILE)
}

exports.msgOk = (msg) => {
  this.write(`${ico('ok')} ${msg}\n`)
}

exports.msgWarn = (msg) => {
  this.write(`${ico('warn')} ${msg}\n`)
}

exports.msgError = (msg) => {
  this.write(`${ico('error')} ${msg}\n`)
}

exports.msgPipe = (msg) => {
  this.write(`${ico('pipe')} ${msg}\n`)
}

exports.msgPad = (msg, wait) => {
  this.write(`${ico()} ${msg}${wait ? '... ' : '\n'}`)
}

exports.msgSection = (msg) => {
  msg = `${QE}${msg} `.padEnd(100, '=')
  this.write(`\n${msg}\n`)
  this.write(`${''.padStart(5, ' ').padEnd(100, '=')}\n\n`)
}

exports.msgEnd = (msg) => {
  msg = `${QE}${msg} `.padEnd(100, '=')
  this.write(`\n${msg}\n\n`)
}

exports.newLine = () => {
  this.write('\n')
}
