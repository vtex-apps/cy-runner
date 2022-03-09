const cy = require('cypress')
const {execSync} = require('child_process')
const fs = require('fs')
const path = require('path')
const axios = require('axios')
const {merge} = require('lodash')
const {teardown} = require('./teardown')
const yaml = require('js-yaml')
const schema = require('./schema')

const QE = '[QE] === '

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
  type === 'complete'
    ? process.stdout.write(msg + '\n')
    : process.stdout.write(MSG)
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

exports.newLine = () => {
  process.stdout.write('\n')
}

exports.crash = (msg, e) => {
  this.msgEnd('ERROR')
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
  try {
    return execSync(cmd, {stdio: output,})
  } catch (e) {
    this.crash('Fail to exec ' + cmd, e)
  }
}

exports.toolbelt = async (bin, cmd, linkApp) => {
  const MAX_TRIES = 5
  let stdout
  let check = false
  let thisTry = 0
  switch (cmd.split(' ')[0]) {
    case 'whoami':
      stdout = this.exec(`${bin} ${cmd}`, 'pipe').toString()
      return /Logged/.test(stdout) ? stdout.split(' ')[7] : false
    case 'workspace':
      stdout = this.exec(`echo y | ${bin} ${cmd}`, 'pipe').toString()
      check = /Workspace change|deleted/.test(stdout)
      break
    case 'install':
    case 'uninstall':
      while (!check && thisTry < MAX_TRIES) {
        thisTry++
        stdout = this.exec(`echo y | ${bin} ${cmd}`, 'pipe').toString()
        check = /successfully|App not installed/.test(stdout)
      }
      break
    case 'unlink':
      while (!check && thisTry < MAX_TRIES) {
        thisTry++
        stdout = this.exec(`echo y | ${bin} ${cmd}`, 'pipe').toString()
        check = /Successfully unlinked|No linked apps/.test(stdout)
      }
      break
    case 'link':
      if (/no-watch/.test(cmd)) {
        stdout = this.exec(`echo y | ${bin} ${cmd}`, 'pipe').toString()
        check = /build finished successfully/.test(stdout)
      } else {
        linkApp = new RegExp(linkApp)
        this.exec(`cd .. && echo y | ${bin} ${cmd}`)
        while (!check && thisTry < MAX_TRIES) {
          thisTry++
          await new Promise((resolve) => setTimeout(resolve, 10000))
          stdout = this.exec(`${bin} ls`, 'pipe').toString()
          check = linkApp.test(stdout)
        }
      }
      break
    case 'local':
      stdout = this.exec(`echo y | ${bin} ${cmd}`, 'pipe').toString()
      check = !/error/.test(stdout)
  }
  if (!check) this.crash('Toolbelt command failed', `${bin} ${cmd}`)
  return stdout
}

exports.vtexCliInstallApp = (bin) => {
  let stdout = this.exec(`${bin} whoami`, 'pipe').toString()
  let isLogged = /Logged/.test(stdout)
  let user = null
  if (isLogged) user = stdout.split(' ')[7]
  return {isLogged: isLogged, user: user}
}

exports.storage = (source, action, destination = null) => {
  try {
    switch (action) {
      case 'read':
        return fs.readFileSync(source, {encoding: 'utf-8'})
      case 'size':
        let stats = fs.statSync(source)
        return stats.size
      case 'copy':
        if (destination == null) this.crash('You must pass copy destination')
        return fs.copyFileSync(source, destination)
      case 'link':
        if (destination == null) this.crash('You must pass link destination')
        return fs.linkSync(source, destination)
      case 'append':
        if (destination == null) this.crash('You must inform what to add')
        if (!this.storage(source, 'exists')) fs.writeFileSync(source, ' ')
        return fs.appendFileSync(source, destination)
      case 'rm':
        if (fs.existsSync(source)) {
          fs.rmSync(source, {recursive: true})
          return true
        }
        return false
      case 'mkdir':
        return fs.mkdirSync(source)
      default:
        // Default: test if file or dir exists
        return fs.existsSync(source)
    }
  } catch (e) {
    this.crash(`Fail to ${action} ${source}`, e)
  }
}

exports.readSecrets = (config) => {
  let secretName = config.base.secrets.name
  let secretFile = `.${secretName}.json`
  let secrets = null
  let loadedFrom = null
  if (this.storage(secretFile)) {
    try {
      secrets = yaml.load(this.storage(secretFile, 'read'), 'utf-8')
    } catch (e) {
      this.crash(`Check if your JSON secrets ${secretFile} is well formatted`)
    }
    loadedFrom = 'file ' + secretFile
  } else {
    if (typeof process.env[secretName] == 'undefined') {
      this.crash(`Neither ${secretFile} or ${secretName} env found`)
    }
    try {
      secrets = yaml.load(process.env[secretName], 'utf-8')
      loadedFrom = 'env variable ' + secretName
    } catch (e) {
      this.crash(`Check if your env variable ${secretName} is well formatted`)
    }
  }
  schema.validateSecrets(secrets, config)
  this.msg(`Secrets loaded from ${loadedFrom} successfully`)
  return secrets
}

exports.loadYmlConfig = (file) => {
  let parentFile = path.join('..', file)
  if (this.storage(parentFile)) file = parentFile
  if (!this.storage(file)) this.crash(`File ${file} not found`)
  try {
    let ymlFile = this.storage(file, 'read')
    let ymlConfig = yaml.load(ymlFile)
    schema.validateConfig(ymlConfig, file)
    return ymlConfig
  } catch (e) {
    this.crash(`Fail to validate ${file} file`, e)
  }
}

exports.loadSecrets = (config) => {
  if (config.base.vtex.deployCli.enabled) {
    if (!config.base.secrets.enabled || !config.base.twilio.enabled) {
      this.msg('base.vtex.deployCli is enabled, but', 'warn')
      if (!config.base.secrets.enabled)
        this.msg('base.secrets is disabled', true, true)
      if (!config.base.twilio.enabled)
        this.msg('base.twilio is disabled', true, true)
      this.msg("Hope you know what you're doing ;)", true, true)
    }
  }
  if (config.base.secrets.enabled) return this.readSecrets(config)
  this.msg('base.secrets is disabled, in this mode you can not', 'warn')
  this.msg('Automate auth on vtex cli', true, true)
  this.msg('Login on frontend portal', true, true)
  this.msg('Login on admin portal', true, true)
  if (config.base.twilio.enabled) {
    this.msg('base.twilio is enabled, loading secrets for it', 'warn')
    return this.readSecrets(config)
  }
  return false
}

exports.mergeSecrets = (config, secrets) => {
  merge(config.base, secrets)
  return config
}

exports.getWorkspaceName = (config) => {
  let workspace = config.workspace.name
  config.workspace['random'] = false
  if (workspace === 'random') {
    let seed = this.tick()
    let prefix = config.workspace.prefix
    config.workspace['random'] = true
    workspace = `${prefix}${seed.toString().substring(6, 13)}`
  }
  this.msg(`Workspace to be used on this run: ${workspace}`)
  return workspace
}

exports.writeEnvJson = (config) => {
  const ENV_FILE = 'cypress.env.json'
  try {
    fs.writeFileSync(ENV_FILE, JSON.stringify(config))
    this.msg(`${ENV_FILE} updated`)
  } catch (e) {
    this.crash('Fail to create Cypress env file', e)
  }
}

exports.writeCypressJson = (config) => {
  const CYPRESS_JSON_FILE = 'cypress.json'
  const CYPRESS = config.base.cypress
  const WORKSPACE = config.workspace.name
  const ACCOUNT = config.base.vtex.account
  const DOMAIN = config.base.vtex.domain
  try {
    fs.writeFileSync(
      CYPRESS_JSON_FILE,
      JSON.stringify({
        baseUrl: `https://${WORKSPACE}--${ACCOUNT}.${DOMAIN}`,
        chromeWebSecurity: CYPRESS.chromeWebSecurity,
        video: CYPRESS.video,
        videoCompression: CYPRESS.videoCompression,
        videoUploadOnPasses: CYPRESS.videoUploadOnPasses,
        screenshotOnRunFailure: CYPRESS.screenshotOnRunFailure,
        trashAssetsBeforeRuns: CYPRESS.trashAssetsBeforeRuns,
        viewportWidth: CYPRESS.viewportWidth,
        viewportHeight: CYPRESS.viewportHeight,
        defaultCommandTimeout: CYPRESS.defaultCommandTimeout,
        requestTimeout: CYPRESS.defaultCommandTimeout,
        watchForFileChanges: CYPRESS.watchForFileChanges,
        pageLoadTimeout: CYPRESS.pageLoadTimeout,
        browser: CYPRESS.browser,
        projectId: CYPRESS.projectId,
        retries: 0,
        screenshotsFolder: "logs/screenshots",
        videosFolder: "logs/videos",
      })
    )
    this.msg(`${CYPRESS_JSON_FILE} created successfully`)
  } catch (e) {
    this.crash('Fail to create Cypress JSON file', e)
  }
}

exports.createStateFiles = (config) => {
  try {
    const STATE_FILES = config.base.stateFiles
    const SIZE = STATE_FILES.length
    let plural = SIZE > 1 ? 'files' : 'file'
    STATE_FILES.forEach((stateFile) => {
      fs.writeFileSync(stateFile, '{}')
    })
    this.msg(`${SIZE} empty state ${plural} created successfully`)
  } catch (e) {
    this.crash('Fail to create a empty state file', e)
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
  let linkApp = false
  this.traverse([], config).forEach((item) => {
    if (/enabled/.test(item.key) && /true/.test(item.type)) {
      let itemEnabled = item.key.split('.enabled')[0]
      if (itemEnabled === 'workspace.linkApp') linkApp = true
      if (linkApp && itemEnabled === 'workspace.linkApp.logOutput') {
        this.msg(itemEnabled)
        this.msg('This output may contain credentials', true, true)
        this.msg('Never enable it on CI environments', true, true)
      } else this.msg(itemEnabled)
    }
    if (/enabled/.test(item.key) && /false/.test(item.type)) {
      let itemEnabled = item.key.split('.enabled')[0]
      this.msg(itemEnabled, 'error')
    }
  })
}

exports.stopOnFail = async (config, step) => {
  this.msg(`stopOnFail enabled, stopping the test`, true, true)
  await teardown(config)
  this.crash('Prematurely exit duo a stopOnFail for ' + step)
}

exports.openCypress = async () => {
  let baseDir = 'cypress-shared'
  if (this.storage(path.join('cypress', 'integration'))) baseDir = 'cypress'
  const options = {
    config: {
      integrationFolder: baseDir + '/integration',
      supportFile: baseDir + '/support',
    },
  }
  // Open Cypress
  try {
    await cy.open(options)
  } catch (e) {
    this.crash('Fail to open Cypress', e.message)
  }
}

exports.runCypress = async (
  test,
  config,
  addOptions = {},
  noOutput = false
) => {
  if (typeof test.spec === 'string') test.spec = [test.spec]
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
    if (noOutput) {
      let cfg =
        `integrationFolder='${options.config.integrationFolder}',` +
        `supportFile='${options.config.supportFile}'`
      let stdout = this.exec(
        `yarn cypress run -s ${config.workspace.wipe.spec} -c ${cfg}`,
        'pipe'
      ).toString()
      testPassed = /All specs passed/.test(stdout)
    } else {
      await cy.run(options).then((result) => {
        if (result.failures) this.crash(result.message)
        if (result.totalPassed < (result.totalTests - result.skipped)) testPassed = false
      })
    }
  } catch (e) {
    this.crash('Fail to run Cypress', e.message)
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
