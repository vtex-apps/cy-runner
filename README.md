# Cypress Runner

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=vtex-apps_cy-runner&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=vtex-apps_cy-runner)
[![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=vtex-apps_cy-runner&metric=ncloc)](https://sonarcloud.io/summary/new_code?id=vtex-apps_cy-runner)
[![Technical Debt](https://sonarcloud.io/api/project_badges/measure?project=vtex-apps_cy-runner&metric=sqale_index)](https://sonarcloud.io/summary/new_code?id=vtex-apps_cy-runner)

Tool to orchestrate Cypress tests

## Features
* Deploy a patched version of [toolbelt](https://github.com/vtex/toolbelt) to login by Cypress spec
* Create dynamic workspace, install dependencies, uninstall packages if needed
* Link the main application with the PR code to be tested
* Orchestrate tests to run in parallel (needs [Cypress Dashboard](https://www.cypress.io/dashboard) or [Sorry-Cypress](https://sorry-cypress.dev/))
* Report test to [Cypress Dashboard](https://www.cypress.io/dashboard) or [Sorry-Cypress](https://sorry-cypress.dev/)
* Wipe data (needs spec to do it) and do tear down (workspace removal)

## Run it locally
1. Clone the repository you want to run tests
2. Add a `cy-runner.yml` configuration file using the configuration template
3. Create a env or local file with the secrets using the secrets template
3. Add a `cy-r` inside your `package.json` file to make easier call cy-runner
```
scripts {
    ...,
    "cy-r": "cd cy-runner && git pull && node cy-runner",
    ...,
}
```

## Configuration template

Configuration is required on the root of the repository to be tested with the name `cy-runner.yml`.

```yaml
# cy-runner.yml
---
base:
  secrets:
    # In dev secrets can can be a local JSON with the pattern:
    # .VTEX_QE.json
    enabled: true
    name: VTEX_QE
  vtex:
    # Account to be used to login
    account: yourAccount
    # Account identification (for use in API - not mandatory)
    id: 1234567
    domain: myvtex.com
    # If you need to test external seller
    urlExternalSeller: https://productusqaseller.myvtex.com
    vtexIdUrl: https://vtexid.vtex.com.br/api/vtexid/pub/authenticate/default
    orderFormConfig: https://productusqa.vtexcommercestable.com.br/api/checkout/pvt/configuration/orderForm
    deployCli:
      # Deploy the toolbelt to provide login using the secrets
      enabled: true
      git: https://github.com/vtex/toolbelt.git
      branch: qe/cypress
  twilio:
    # You must configure it inside your account
    # It's mandatory if you enable deployCli
    enabled: true
  jira:
    # If you want to report issues on Jira
    enabled: false
    account: config-dev
    board: jira-key
    issueType: task
  slack:
    # If you want to report issues on Slack
    # Not fully functional yet
    enabled: false
    channel: some-channel
  cypress:
    # Opens Cypress instead of running it
    devMode: false
    # Show the GUI window in run mode
    runHeaded: false
    # Project to log on Cypress Dashboard
    projectId: xxzzyy
    video: false
    videoCompression: 32
    videoUploadOnPasses: false
    screenshotOnRunFailure: true
    trashAssetsBeforeRuns: false
    viewportWidth: 1440
    viewportHeight: 900
    defaultCommandTimeout: 25000
    requestTimeout: 25000
    watchForFileChanges: false
    pageLoadTimeout: 45000
    # Can be chrome, firefox or electron
    browser: chrome
    chromeWebSecurity: false
    # Set to development if you want to use
    # sorry-cypress locally
    internalEnv: development
  # If you need to create empty state
  # to use in your tests, for checking transactions
  # or for doing data wipe on the end
  stateFiles: []

workspace:
  # Set to random to get [prefix][random] (ie b2b1234567)
  # You should use an existent workspace if you disabled 
  # base.vtex.deployCly
  name: random
  prefix: b2b
  # Link the PR app for integration tests
  linkApp:
    enabled: true
    logOutput:
      enabled: false
  # Apps to be installed
  installApps: []
  # Apps to be removed
  removeApps: []
  # Spec to wipe the data on the end
  wipe:
    enabled: false
    stopOnFail: false
    spec: cypress-shared/integration/workspace/wipe.spec.js
  # Clean workspace and state files on the end
  teardown:
    enabled: false

strategy:
  # You can name it whatever pleases you
  A01:
    enabled: true
    # Send it to Cypress Dashboard or Sorry-Cypress
    sendDashboard: false
    # How many times to try it
    hardTries: 1
    # Stop the test if it fails
    stopOnFail: false
    # Run in parallel
    # Requires Cypress Dashboard or Sorry-Cypress
    parallel: true
    # Specs to run (ordered not guaranteed)
    specs:
      - cypress/integration/A01*
      - cypress/integration/A02*
  A02:
    enabled: true
    sendDashboard: true
    hardTries: 1
    stopOnFail: false
    parallel: false
    specs:
      - cypress/integration/A02*
    # Needs to pass to run this strategy
    # Must be declared on earlier strategy
    dependency:
      - cypress/integration/A02*
```

## Secrets template

Secrets to store credentials. You can create a file named `.{base.secrets.name}.json` (remember to never commit this file on your Git repository) or export it as env variable like that `export base.secrets.name=$(cat yourSecretsFile.json)`.

```json
  {
    "vtex": {
      "apiKey": "",
      "apiToken": "",
      "cookieName": "",
      "robotMail": "",
      "robotPassword": ""
    },
    "twilio": {
      "apiUser": "",
      "apiToken": ""
    },
    "jira": {
      "authorization": ""
    },
    "cypress": {
      "dashboardKey": ""
    }
  }
```
At development mode you can use a file called `.[base.secrets.name].json`
1. Remember to ignore this file on your Git
2. You can add whatever secrets you want on it


## Development

Running tests:
```sh
yarn cy-r
```

Linting:
```sh
yarn lint
```

## Related Tools

* [Cypress](https://cypress.io)
* [Sorry-cypress](https://sorry-cypress.dev/)
