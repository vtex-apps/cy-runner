const { defineConfig } = require('cypress')
const { generateBaseUrl } = require('./node/utils')
const { getConfig } = require('./node/config')

const configFile = getConfig('cy-runner.yml')

const CYPRESS = configFile.base.cypress
const baseUrl = generateBaseUrl(configFile)

module.exports = defineConfig({
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
  e2e: {
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.js')(on, config)
    },
    baseUrl,
    specPattern: 'cypress/e2e/**/*.{js,jsx,ts,tsx}',
  },
})
