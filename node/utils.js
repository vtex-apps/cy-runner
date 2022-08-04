/* eslint-disable no-await-in-loop */
/* eslint-disable vtex/prefer-early-return */
const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const cypress = require('cypress')
const axios = require('axios')
const { merge, get } = require('lodash')
const yaml = require('js-yaml')

const { teardown } = require('./teardown')
const schema = require('./schema')

const delay = (ms) => new Promise((res) => setTimeout(res, ms))
const logPath = path.join('.', 'logs')
const logFile = path.join(logPath, 'cy-runner.log')
const ciNumber = Date.now().toString().substring(6, 13)
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

exports.stdWrite = (msg) => {
  process.stdout.write(msg)
  this.storage(logFile, 'append', msg)
}

// eslint-disable-next-line max-params
exports.msg = (msg, type = 'ok', pad = false, wait = false) => {
  const ICO = pad ? icon().padStart(8) : icon(type).padStart(8)
  const MSG = `${ICO} ${msg}${wait ? '... ' : '\n'}`

  type === 'complete' ? this.stdWrite(`${msg}\n`) : this.stdWrite(MSG)
}

exports.msgSection = (msg) => {
  const END = '\n'

  msg = `${QE}${msg} `.padEnd(100, '=')
  this.stdWrite(END + msg + END)
  this.stdWrite(''.padStart(5, ' ').padEnd(100, '=') + END + END)
}

exports.msgEnd = (msg) => {
  const END = '\n'

  msg = `${QE}${msg} `.padEnd(100, '=')
  this.stdWrite(END + msg + END + END)
}

exports.newLine = () => {
  this.stdWrite('\n')
}

exports.crash = (msg, e) => {
  this.msgEnd('ERROR')
  this.msg(msg, 'error')
  if (typeof e !== 'undefined') this.msg(e, true, true)
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

exports.toolbelt = async (bin, cmd) => {
  const MAX_TRIES = 3
  let stdout
  let check = false
  let thisTry = 0

  switch (cmd.split(' ')[0]) {
    case 'whoami':
      stdout = this.exec(`${bin} ${cmd}`, 'pipe').toString()
      check = /Logged/.test(stdout)
      break

    case 'workspace':
      stdout = this.exec(`echo y | ${bin} ${cmd}`, 'pipe').toString()
      check = /Workspace change|deleted/.test(stdout)
      break

    case 'install':
    /* falls through */

    case 'uninstall':
      // Check if we are on workspace master
      stdout = this.exec(`${bin} whoami`, 'pipe').toString()
      check = /master/.test(stdout)
      if (check) {
        this.crash(
          'You should not install or uninstall apps on workspace master',
          `${bin} ${cmd}\n${stdout}`
        )
      }
    /* falls through */

    case 'unlink':
      while (!check && thisTry < MAX_TRIES) {
        thisTry++
        stdout = this.exec(`echo y | ${bin} ${cmd}`, 'pipe').toString()
        check = /uccessfully|App not installed| unlinked|No linked apps/.test(
          stdout
        )
        if (!check) await delay(thisTry * 3000)
      }

      break

    case 'link':
      cmd = `cd .. && echo y | ${bin} ${cmd}`
      while (!check && thisTry < MAX_TRIES) {
        thisTry++
        stdout = this.exec(cmd, 'pipe').toString()
        check = stdout !== 'error'
        if (!check) await delay(thisTry * 3000)
      }

      break

    case 'local':
      stdout = this.exec(`echo y | ${bin} ${cmd}`, 'pipe').toString()
      check = !/error/.test(stdout)
      break

    default:
      stdout = this.exec(`${bin} ${cmd}`, 'pipe').toString()
      check = true
  }

  return { success: check, stdout }
}

exports.vtexCliInstallApp = (bin) => {
  const stdout = this.exec(`${bin} whoami`, 'pipe').toString()
  const isLogged = /Logged/.test(stdout)
  let user = null

  if (isLogged) user = stdout.split(' ')[7]

  return { isLogged, user }
}

exports.storage = (source, action, destination = null) => {
  try {
    switch (action) {
      case 'read':
        return fs.readFileSync(source, { encoding: 'utf-8' })

      case 'size':
        return fs.statSync(source).size

      case 'copy':
        if (destination == null) this.crash('You must pass copy destination')

        return fs.copyFileSync(source, destination)

      case 'link':
        if (destination == null) this.crash('You must pass link destination')

        return fs.symlinkSync(source, destination)

      case 'append':
        if (destination == null) this.crash('You must inform what to add')
        if (!this.storage(source, 'exists')) fs.writeFileSync(source, '')

        return fs.appendFileSync(source, destination)

      case 'rm':
        if (fs.existsSync(source)) {
          fs.rmSync(source, { recursive: true })

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
  const secretName = config.base.secrets.name
  const secretFile = `.${secretName}.json`
  let secrets = null
  let loadedFrom = null

  if (this.storage(secretFile)) {
    try {
      secrets = yaml.load(this.storage(secretFile, 'read'), 'utf-8')
    } catch (e) {
      this.crash(`Check if your JSON secrets ${secretFile} is well formatted`)
    }

    loadedFrom = `file ${secretFile}`
  } else {
    if (typeof process.env[secretName] === 'undefined') {
      this.crash(`Neither ${secretFile} or ${secretName} env found`)
    }

    try {
      secrets = yaml.load(process.env[secretName], 'utf-8')
      loadedFrom = `env variable ${secretName}`
    } catch (e) {
      this.crash(`Check if your env variable ${secretName} is well formatted`)
    }
  }

  schema.validateSecrets(secrets, config)
  this.msg(`Secrets loaded from ${loadedFrom} successfully`)

  return secrets
}

exports.loadYmlConfig = (file) => {
  const parentFile = path.join('..', file)

  if (this.storage(parentFile)) file = parentFile
  if (!this.storage(file)) this.crash(`File ${file} not found`)
  try {
    const ymlFile = this.storage(file, 'read')
    const ymlConfig = yaml.load(ymlFile)

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
      if (!config.base.secrets.enabled) {
        this.msg('base.secrets is disabled', true, true)
      }

      if (!config.base.twilio.enabled) {
        this.msg('base.twilio is disabled', true, true)
      }

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
  const { workspace } = config

  workspace.random = false
  if (workspace.name === 'random') {
    const seed = this.tick()
    const { prefix } = workspace

    workspace.random = true
    workspace.name = `${prefix}${seed.toString().substring(6, 13)}`
  }

  this.msg(`Workspace to be used on this run: ${workspace.name}`)

  return workspace.name
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

function generateBaseUrl(config) {
  const WORKSPACE = config.workspace.name
  const ACCOUNT = config.base.vtex.account
  const DOMAIN = config.base.vtex.domain

  return `https://${WORKSPACE}--${ACCOUNT}.${DOMAIN}`
}

exports.generateBaseUrl = generateBaseUrl

function getBaseDir(storage) {
  if (storage(path.join('cypress', 'integration'))) return 'cypress'

  return 'cypress-shared'
}

exports.writeCypressJson = (config) => {
  const CYPRESS_JSON_FILE = 'cypress.json'
  const CYPRESS = config.base.cypress
  const baseUrl = generateBaseUrl(config)

  try {
    fs.writeFileSync(
      CYPRESS_JSON_FILE,
      JSON.stringify({
        baseUrl,
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
        screenshotsFolder: 'logs/screenshots',
        videosFolder: 'logs/videos',
      })
    )
    this.msg(`${CYPRESS_JSON_FILE} created successfully`)
  } catch (e) {
    this.crash('Fail to create Cypress JSON file', e)
  }
}

exports.createStateFiles = (config) => {
  try {
    const { stateFiles } = config.base
    const SIZE = stateFiles.length
    const PLURAL = SIZE > 1 ? 'files' : 'file'

    if (SIZE) {
      this.msg(`Creating state ${PLURAL}`, 'warn')
      stateFiles.forEach((stateFile) => {
        this.msg(stateFile, true, true)
        fs.writeFileSync(stateFile, '{}')
      })
    }
  } catch (e) {
    this.crash('Fail to create a empty state file', e)
  }
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

exports.sectionsToRun = async (config) => {
  this.msgSection('Sections to run')
  const getList = (item, property) => {
    const list = get(config, `${item}.${property}`)

    return list !== undefined ? list : []
  }

  this.traverse([], config).forEach((item) => {
    // Items enabled
    if (/enabled/.test(item.key) && /true/.test(item.type)) {
      const [itemEnabled] = item.key.split('.enabled')

      this.msg(itemEnabled)
      getList(itemEnabled, 'specs').forEach((spec) => {
        this.msg(`runs ${spec}`, true, true)
      })
      getList(itemEnabled, 'dependency').forEach((dep) => {
        this.msg(`deps ${dep}`, true, true)
      })
    }
  })

  const appsToInstall = config.workspace.installApps.length
  const appsToRemove = config.workspace.removeApps.length

  if (appsToInstall) {
    this.msg('workspace.installApps')
    getList('workspace', 'installApps').forEach((app) => {
      this.msg(`${app}`, true, true)
    })
  }

  if (appsToRemove) {
    this.msg('workspace.removeApps')
    getList('workspace', 'removeApps').forEach((app) => {
      this.msg(`${app}`, true, true)
    })
  }
}

exports.stopOnFail = async (config, step) => {
  this.msg(`stopOnFail enabled, stopping the test`, true, true)
  await teardown(config)
  this.crash(`Prematurely exit duo a stopOnFail for ${step}`)
}

exports.openCypress = async () => {
  const baseDir = getBaseDir(this.storage)

  const options = {
    config: {
      integrationFolder: `${baseDir}/integration`,
      supportFile: `${baseDir}/support`,
      fixturesFolder: `${baseDir}/fixtures`,
    },
  }

  // Open Cypress
  try {
    await cypress.open(options)
  } catch (e) {
    this.crash('Fail to open Cypress', e.message)
  }
}

exports.runCypress = async (test, config, addOptions = {}) => {
  // If mix base path for specs, stop it
  const specPath = path.parse(test.specs[0]).dir
  const baseDir = getBaseDir(this.storage)

  test.specs.forEach((spec) => {
    const pathToCheck = path.parse(spec).dir

    if (pathToCheck !== specPath) {
      this.msg('Cypress path must be unique among specs', 'error')
      test.specs.forEach((specDef) => {
        this.msg(specDef, true, true)
      })
      this.crash(
        'Test stopped due a strategy misconfiguration',
        `strategy.${test.name}`
      )
    }
  })

  const options = {
    config: {
      integrationFolder: specPath,
      supportFile: `${specPath.split(path.sep)[0]}/support`,
      fixturesFolder: `${baseDir}/fixtures`,
    },
    env: {
      DISPLAY: '',
    },
    spec: test.specs,
    headed: config.base.cypress.runHeaded,
    browser: config.base.cypress.browser,
    quiet: config.base.cypress.quiet,
  }

  // Options tuning
  if (test.sendDashboard) {
    const RUN_ID = process.env.GITHUB_RUN_ID
    const RUN_ATTEMPT = process.env.GITHUB_RUN_ATTEMPT

    options.key = config.base.cypress.dashboardKey
    options.record = true
    options.ciBuildId =
      typeof RUN_ID === 'undefined' ? ciNumber : `${RUN_ID}-${RUN_ATTEMPT}`
    if (config.base.cypress.sorry) {
      process.env.CYPRESS_INTERNAL_ENV = 'development'
    }

    merge(options, addOptions)
  }

  // Run Cypress
  const testToRun = []
  const testResult = []
  let maxJobs = 1

  // Set the number of runners
  if (test.parallel) {
    maxJobs =
      test.specs.length < config.base.cypress.maxJobs
        ? test.specs.length
        : config.base.cypress.maxJobs
  }

  for (let i = 0; i < maxJobs; i++) {
    testToRun.push(
      cypress.run(options).then((result) => {
        if (result.failures) this.msg(JSON.stringify(result), 'error')

        const output = {}
        const cleanResult = result
        const logName = result.runs[0].spec.name.replace('.js', '.yml')
        const logSpec = path.join(logPath, logName)

        delete cleanResult.config
        output[`epoc-${this.tick()}`] = cleanResult
        this.storage(logSpec, 'append', yaml.dump(output))
        testResult.push(cleanResult)
      })
    )
  }

  try {
    await Promise.all(testToRun)
  } catch (e) {
    this.crash('Fail to run Cypress', e.message)
  }

  return testResult
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
