const path = require('path')

const cypress = require('cypress')
const { merge } = require('lodash')
const jsYaml = require('js-yaml')

const storage = require(`./storage`)
const system = require('./system')
const logger = require('./logger')
const { teardown } = require('./teardown')

const CI_RANDOM = Date.now().toString().substring(6, 13)

exports.getBaseDir = () => {
  return storage.exists(path.join('cypress', 'integration'))
    ? 'cypress'
    : 'cypress-shared'
}

exports.saveCypressEnvJson = (config) => {
  storage.writeJson(config, path.join(system.basePath(), 'cypress.env.json'))
}

exports.saveCypressJson = (config) => {
  storage.writeJson(
    {
      baseUrl: config.base.vtex.baseUrl,
      chromeWebSecurity: config.base.cypress.chromeWebSecurity,
      video: config.base.cypress.video,
      videoCompression: config.base.cypress.videoCompression,
      videoUploadOnPasses: config.base.cypress.videoUploadOnPasses,
      screenshotOnRunFailure: config.base.cypress.screenshotOnRunFailure,
      trashAssetsBeforeRuns: config.base.cypress.trashAssetsBeforeRuns,
      viewportWidth: config.base.cypress.viewportWidth,
      viewportHeight: config.base.cypress.viewportHeight,
      defaultCommandTimeout: config.base.cypress.defaultCommandTimeout,
      requestTimeout: config.base.cypress.defaultCommandTimeout,
      watchForFileChanges: config.base.cypress.watchForFileChanges,
      pageLoadTimeout: config.base.cypress.pageLoadTimeout,
      browser: config.base.cypress.browser,
      projectId: config.base.cypress.projectId,
      retries: 0,
      screenshotsFolder: 'logs/screenshots',
      videosFolder: 'logs/videos',
    },
    path.join(system.basePath(), 'cypress.json')
  )
}

exports.stopOnFail = async (config, step, runUrl) => {
  this.msg(`stopOnFail enabled, stopping the test`, true, true)
  await teardown(config)
  if (runUrl != null) {
    this.msgSection('Cypress Dashboard')
    this.msg(runUrl, 'ok')
  }

  this.crash(`Prematurely exit duo a stopOnFail for ${step}`)
}

exports.open = async () => {
  const baseDir = this.getBaseDir()

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
    system.crash('Failed to open Cypress', e.message)
  }
}

exports.run = async (test, config, addOptions = {}) => {
  // If mix base path for specs, stop it
  const specPath = path.parse(test.specs[0]).dir
  const baseDir = this.getBaseDir()

  test.specs.forEach((spec) => {
    const pathToCheck = path.parse(spec).dir

    if (pathToCheck !== specPath) {
      system.crash(
        "'cypress' and 'shared-cypress' can't be mixed on the same strategy",
        `Error on strategy ${test.name}`
      )
    }
  })

  // Build options
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

  // Tune options
  if (test.sendDashboard) {
    const RUN_ID = process.env.GITHUB_RUN_ID ?? CI_RANDOM
    const RUN_ATTEMPT = process.env.GITHUB_RUN_ATTEMPT ?? 1
    const IS_CI = process.env.CI

    options.key = config.base.cypress.dashboardKey
    options.record = true
    options.ciBuildId = `${RUN_ID}-${RUN_ATTEMPT}`

    // Configure Cypress to use Sorry Cypress if not in CI
    if (!IS_CI) process.env.CYPRESS_INTERNAL_ENV = 'development'

    // Merge tune with options
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

  // Mount parallel jobs
  for (let i = 0; i < maxJobs; i++) {
    testToRun.push(
      // eslint-disable-next-line no-loop-func
      cypress.run(options).then((result) => {
        if (result.failures) logger.msgError(JSON.stringify(result))

        const output = {}
        const cleanResult = result
        const logName = result.runs[0].spec.name.replace('.js', '.yml')
        const logSpec = path.join(logger.logPath(), logName)

        delete cleanResult.config
        output[`epoc-${this.tick()}`] = cleanResult
        storage.append(jsYaml.dump(output), logSpec)
        testResult.push(cleanResult)
      })
    )
  }

  try {
    await Promise.all(testToRun)
  } catch (e) {
    system.crash('Failed to run Cypress', e.message)
  }

  return testResult
}
