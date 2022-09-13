const path = require('path')

const cypress = require('cypress')
const { merge } = require('lodash')
const jsYaml = require('js-yaml')

const storage = require(`./storage`)
const system = require('./system')
const logger = require('./logger')
const { teardown } = require('./teardown')

// Get Cypress Folder [cypress or cypress-shared]
exports.getCypressFolder = () => {
  return storage.exists(path.join(system.basePath(), 'cypress', 'integration'))
    ? 'cypress'
    : 'cypress-shared'
}

// Save Env for Cypress
exports.saveCypressEnvJson = (config) => {
  storage.writeJson(
    config,
    path.join(system.cyRunnerPath(), 'cypress.env.json')
  )
}

// Save config for Cypress
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
    path.join(system.cyRunnerPath(), 'cypress.json')
  )
}

// Deal with stop on fail
exports.stopOnFail = async (config, step, runUrl) => {
  await teardown(config)
  if (runUrl != null) this.showDashboard(runUrl)
  system.crash('Triggered stopOnFail', step)
}

// Show URL for Cypress Dashboard or Sorry Cypress
exports.showDashboard = async (url) => {
  logger.msgSection('Cypress Dashboard')
  logger.msgOk(url)
}

// Open Cypress
exports.open = async () => {
  logger.msgSection('Running in dev mode')

  const CY_FOLDER = this.getCypressFolder()
  const options = {
    config: {
      integrationFolder: `${CY_FOLDER}/integration`,
      supportFile: `${CY_FOLDER}/support`,
      fixturesFolder: `${CY_FOLDER}/fixtures`,
    },
  }

  logger.msgWarn('Verity if the workspace has the Apps you need already')

  try {
    await cypress.open(options)
  } catch (e) {
    system.crash('Failed to open Cypress', e.message)
  }
}

// Run Cypress
exports.run = async (test, config, addOptions = {}) => {
  // Mix Cypress base folder isn't allowed
  const SPEC_PATH = path.parse(test.specs[0]).dir
  const CY_FOLDER = this.getCypressFolder()

  test.specs.forEach((spec) => {
    if (path.parse(spec).dir !== SPEC_PATH) {
      system.crash(
        "'cypress' and 'shared-cypress' can't be mixed on the same strategy",
        `Fix strategy ${test.name}`
      )
    }
  })

  // Build options
  const options = {
    config: {
      integrationFolder: SPEC_PATH,
      supportFile: `${SPEC_PATH.split(path.sep)[0]}/support`,
      fixturesFolder: `${CY_FOLDER}/fixtures`,
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
  const RUN_ID_FAIL_BACK = Date.now().toString().substring(6, 13)

  if (test.sendDashboard) {
    const RUN_ID = process.env.GITHUB_RUN_ID ?? RUN_ID_FAIL_BACK
    const RUN_ATTEMPT = process.env.GITHUB_RUN_ATTEMPT ?? 1

    options.key = config.base.cypress.dashboardKey
    options.record = true
    options.ciBuildId = `${RUN_ID}-${RUN_ATTEMPT}`

    // Configure Cypress to use Sorry Cypress if not in CI
    if (!system.isCI()) process.env.CYPRESS_INTERNAL_ENV = 'development'

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
        if (result.failures) {
          logger.msgError('Got error from Cypress')
          logger.msgPad(JSON.stringify(result))
        }

        const output = {}
        const cleanResult = result
        const logName = result.runs[0].spec.name.replace('.js', '.yml')
        const logSpec = path.join(logger.logPath(), logName)

        // Remove sensitive information
        delete cleanResult.config
        output[`epoc-${system.tick()}`] = cleanResult
        storage.append(jsYaml.dump(output), logSpec)
        testResult.push(cleanResult)
      })
    )
  }

  try {
    await Promise.all(testToRun)
  } catch (e) {
    system.crash('Failed to run Cypress')
  }

  return testResult
}
