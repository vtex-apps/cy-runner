# Cypress Runner

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=vtex-apps_cy-runner&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=vtex-apps_cy-runner)
[![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=vtex-apps_cy-runner&metric=ncloc)](https://sonarcloud.io/summary/new_code?id=vtex-apps_cy-runner)
[![Technical Debt](https://sonarcloud.io/api/project_badges/measure?project=vtex-apps_cy-runner&metric=sqale_index)](https://sonarcloud.io/summary/new_code?id=vtex-apps_cy-runner)

Tool to orchestrate Cypress tests at VTEX

## Features
* Automate authentication on VTEX Toolbelt (using [VTEX Toolbelt Action](https://github.com/vtex/action-toolbelt))
* Manage workspace: installing, uninstalling, creation, and deletion
* Link the application to be tested
* Orchestrate tests to run in parallel ([Cypress Dashboard](https://www.cypress.io/dashboard) or [Sorry-Cypress](https://sorry-cypress.dev/))
* Report execution time and status of each spec
* Report Cypress Dashboard link
* Create Jira tickets in case of failure
* Save artifacts to make easier debug failures
* Wipe data (needs spec to do it)
* Full teardown

## Run it on a GitHub Action
```yaml
name: '[QE] Quality Engineering'

on:
  push:
  
jobs:
  cypress:
    name: Cypress
    runs-on: ubuntu-latest
    timeout-minutes: 30
    concurrency:
      group: ${{ github.workflow }}
    steps:
      - name: Checkout App
        uses: actions/checkout@v3
      - name: Checkout Cy-Runner
        uses: actions/checkout@v3
        with:
          repository: vtex-apps/cy-runner
          ref: main
          path: cy-runner
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 16
          cache: yarn
        continue-on-error: true
      - name: Install Cy-Runner packages
        run: |
          yarn install --frozen-lockfile --prod
          yarn cypress info
        working-directory: cy-runner
      - name: Run tests
        run: node cy-runner
        working-directory: cy-runner
        env:
          VTEX_QE: ${{ secrets.cypressJSON }}
          NODE_NO_WARNINGS: 1
      - name: Save test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: cy-runner-logs
          path: |
            cy-runner/logs
            !cy-runner/logs/**/*.mp4
          retention-days: 3
```

## Run it locally
1. Clone the app repository to be tested
2. Add a `cy-runner.yml` configuration file using the configuration template
3. Create a env or local file with the secrets using the secrets template (`.VTEX_QE.json` in our example)
3. Add a `cy-r` inside your `package.json` file to make easier call cy-runner or call it directly by `node cy-runner`
```txt
scripts {
    ...,
    "cy-r": "cd cy-runner && node cy-runner",
    ...
}
```
4. If you are developing `cy-r`, maybe can be useful check it before start the tests. To do so, add another line in your `package.json`
```txt
scripts {
    ...,
    "cy-r": "cd cy-runner && node cy-runner",
    "cy-d": "cd cy-runner && git pull && node cy-runner",
    ...
}
```

## Setup
One important part of the setup is the installation, uninstallation, and link apps. To generate a name for your new workspace on every run, keep the name of it as `random`. If you want to use a created workspace because you don't need to install, uninstall or link any app, you can fill the name with your workspace:

```yaml
[...]
workspace:
  name: random
  prefix: b2b
  linkApp:
    # In this case, the app to be installed will be read by the manifest.json file
    enabled: true
  installApps:
    - vtex.mySuperCoolApp
    - vtex.myAnotherSuperCoolApp
  removeApps:
    - vtex.defaultTheme
[...]
```
## Tests
After a successful setup, `cypress-runner` will take care of your tests, it will start one by one or in parallel (max 3 jobs in parallel at this point), and make sure that dependent tests only run if the dependencies pass first. If you are planing to run tests in parallel locally, then you can use more than three jobs (if your machine has power to do so), but in this case you'll need to set `base.cypress.sorry` as `true` and make sure that you have a [Sorry Cypress](https://sorry-cypress.dev/) up and running locally. On each strategy you can add as many specs as you need.

### To run all tests without any dependency with local parallelization

To configure the parallelization with five jobs you can take advantage of the following example. Note the `hardTries`, it is useful when you wan't to try more the one time with a fresh browser start between the tries. If you have `specA`, `specB`, and `specC` and the `specB` fails during the strategy, only the `specB` will be tested on the next retry.

```yaml
[...]
cypress:
  maxJobs: 3
  quiet: true
  projectId: myProjectId
  video: true
  videoCompression: false
  browser: chrome
  chromeWebSecurity: false
  sorry: true

strategy:
  # You can call whatever you want
  myTests:
    enabled: true
    sendDashboard: false
    hardTries: 1
    stopOnFail: false
    parallel: true
    specs:
      - cypress/integration/specA.spec.js
      - cypress/integration/specB.spec.js
      - cypress/integration/specC.spec.js
      - cypress/integration/specD.spec.js
      - cypress/integration/specE.spec.js
      # You can use wildcard here:
      # It'll be the same if you have only those three specs on the same folder
      # - cypress/integration/spec?.spec.js
```

### Fail fast

The option `strategy.buyItems.stopOnFail` as `true` instruct Cy Runner to stop the test soon as it fails. 

```yaml
[...]
cypress:
  maxJobs: 3
  quiet: true
  projectId: myProjectId
  video: true
  videoCompression: false
  browser: chrome
  chromeWebSecurity: false
  sorry: true

strategy:
  buyItems:
    enabled: true
    sendDashboard: true
    hardTries: 1
    stopOnFail: true
    parallel: true
    specs:
      - cypress/integration/buyCoffee.spec.js
      - cypress/integration/buyCoffeeMaker.spec.js
  checkInventory:
    enabled: true
    sendDashboard: true
    hardTries: 1
    stopOnFail: false
    parallel: true
    specs:
      - cypress/integration/checkInventory.spec.js
    dependency:
      - cypress/integration/buyCoffee.spec.js
      - cypress/integration/buyCoffeeMaker.spec.js
  checkOrders:
    enabled: true
    sendDashboard: true
    hardTries: 3
    stopOnFail: false
    parallel: true
    specs:
      - cypress/integration/checkOrders.spec.js
    dependency:
      - cypress/integration/checkInventory.spec.js      

```

## Results

All artifacts from the test are saved on the `cy-runner/logs` folder. If you are using GitHub Actions, you can download the logs as artifacts.

1. Detailed report of each run for each test as yaml
2. The app versions used on the test in txt
3. The app dependency versions used on the test in json
4. The state files to with products IDs and invoices
5. The VTEX Toolbelt debug in json
6. The verbose linked application log in txt
7. The screenshots of the failures (if enabled)
8. The videos with the records (if enabled)
9. The Cy Runner log as the example bellow

Also, you have the `cy-runner.log` file, that will show you how the tests were conducted, the main failures and the time to do each task. Next we'll show one example of it:
```txt
[QE] === Cypress Runner ============================================================================
     ===============================================================================================

     [✓] Loading cy-runner configuration
      -  ./wordpress-integration/cy-runner.yml
     [✓] Defining workspace
      -  wordpressintegration0481942
     [✓] Loading secrets
      -  from file ./cy-runner/.VTEX_QE.json
     [✓] Cleaning debug file
      -  /home/user/.vtex/logs/debug.json
     [✗] Sorry Cypress not running
      -  disabling dashboard
      -  disabling parallelization
      -  waiting 7 seconds to you cancel and try again

[QE] === Sections to run ===========================================================================
     ===============================================================================================

     [✓] base.secrets
     [✓] base.jira
     [✓] workspace.linkApp
     [✓] workspace.teardown
     [✓] strategy.configuring_wordpress_testcase
      -  2.1-rest-api.spec.js
      -  2.5-verify-categories-filter.spec.js
     [✓] strategy.ui_testcase
      -  2.2-filter-by-tags.spec.js
      -  2.3-UI-testcase.spec.js
      -  2.4-filter-by-date.spec.js
      -  2.6-verify-search_articles.spec.js
      -  2.7-search.product.spec.js
         | 2.5-verify-categories-filter.spec.js
     [✓] strategy.disable_config_testcase
      -  2.8-disable-configurations-and-validate.spec.js
         | 2.2-filter-by-tags.spec.js
         | 2.3-UI-testcase.spec.js
         | 2.4-filter-by-date.spec.js
         | 2.5-verify-categories-filter.spec.js
         | 2.6-verify-search_articles.spec.js
         | 2.7-search.product.spec.js
     [✓] Apps to be installed
      -  vtex.wordpress-integration@2.x
      -  vtex.wordpress-integration-qa-theme@0.0.3
     [✓] Apps to be removed
      -  vtex.bitcot-qa-theme

[QE] === Cypress set up ============================================================================
     ===============================================================================================

     [✓] Getting admin cookie
     [✓] Getting user cookie
      -  user.surname@vtex.com.br
     [✓] Creating Cypress environment
      -  ./cy-runner/cypress.env.json
      -  ./cy-runner/cypress.json
     [✓] Creating state file
      -  .wordpress.json
     [✓] Linking local Cypress code on Cy-Runner
      -  ./cy-runner/cypress-shared/support/common -> ./cypress/support/common
      -  ./cypress -> ./cy-runner/cypress

[QE] === Workspace set up ==========================================================================
     ===============================================================================================

     [✓] Changing workspace
      -  wordpressintegration0481942
     [✓] Installing apps
      -  vtex.wordpress-integration@2.x
      -  vtex.wordpress-integration-qa-theme@0.0.3
     [✓] Uninstalling apps
      -  vtex.bitcot-qa-theme
     [✓] Updating ./wordpress-integration/.vtexignore
     [✓] Reading ./wordpress-integration/manifest.json
     [✓] Linking vtex.wordpress-integration@2.21.2
      -  waiting 10 seconds until link gets ready
      -  waiting 10 seconds until link gets ready
      -  waiting 10 seconds until link gets ready
      -  waiting 10 seconds until link gets ready
      -  waiting 10 seconds until link gets ready
     [✓] App linked successfully

[QE] === [try 1/1] Strategy Configuring Wordpress Testcase =========================================
     ===============================================================================================

     [✓] Strategy Configuring Wordpress Testcase ran successfully

[QE] === [try 1/2] Strategy Ui Testcase ============================================================
     ===============================================================================================

     [✓] Strategy Ui Testcase ran successfully

[QE] === [try 1/2] Strategy Disable Config Testcase ================================================
     ===============================================================================================

     [✓] Strategy Disable Config Testcase ran successfully

[QE] === Workspace teardown ========================================================================
     ===============================================================================================

     [✓] Dumping environment
      -  ./cy-runner/logs/_apps_installed.txt
      -  ./cy-runner/logs/_apps_dependency.json
      -  /home/user/.vtex/logs/debug.json -> ./cy-runner/logs/_debug.json
     [!] Moving state files
      -  .wordpress.json -> ./cy-runner/logs/.wordpress.json
     [✓] State files moved successfully
     [✓] Cleaning sensitive data
      -  cypress.env.json
      -  cypress.json
     [✓] Workspace wordpressintegration0481942 deleted

[QE] === Deprecation report ========================================================================
     ===============================================================================================

     [!] Deprecated configuration on your cy-runner.yml
      -  base.twilio
      -  base.jira.testing
      -  base.cypress.sorry
     [✓] You should remove it as soon as possible

[QE] === Execution report ==========================================================================
     ===============================================================================================

     [✓] Execution time
      -  initWorkspace................. 7.677 seconds
      -  installApps................... 8.323 seconds
      -  uninstallApps................. 5.785 seconds
      -  linkApp....................... 50.057 seconds
      -  strategy...................... 240.099 seconds
      -  teardown...................... 9.455 seconds
      -  total......................... 332.82 seconds

     [✓] Disabled spec
      -  2.9-validate-wordpress-with-no-url.spec.js

     [✓] Successful specs
      -  2.1-rest-api.spec.js
      -  2.2-filter-by-tags.spec.js
      -  2.3-UI-testcase.spec.js
      -  2.4-filter-by-date.spec.js
      -  2.5-verify-categories-filter.spec.js
      -  2.6-verify-search_articles.spec.js
      -  2.7-search.product.spec.js
      -  2.8-disable-configurations-and-validate.spec.js


[QE] === SUCCESS ===================================================================================

     [✓] The test ran successfully, well done!

```

## Teardown

As `cypress runner` was designed to be a multi proposal tool, it's hard to cover all possible cases that need cleaning data, so you can do this task by creating one or more specs to take care of it.

```yaml
[...]
workspace:
  [...]
  wipe:
    enabled: true
    stopOnFail: false
    specs:
      - cypress/integration/cleanMasterData.spec.js
      - cypress/integration/cleanSomethingElse.spec.js
  teardown:
    enabled: true
  [...]
[...]
```

# Templates

## Configuration template

Configuration is required on the root of the repository to be tested with the name `cy-runner.yml`. We are working on a feature to check by this file on main project when working with shared projects (same set of tests to different apps, like **b2b-organizations** and **b2b-organizations-graphql**).

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
    domain: myvtex.com
    vtexIdUrl: https://vtexid.vtex.com.br/api/vtexid/pub/authenticate/default
  jira:
    # If you want to report issues on Jira
    enabled: false
    account: config-dev
    board: jira-key
    issueType: task
  slack:
    # If you want to report issues on Slack
    # Not functional yet
    enabled: false
    channel: some-channel
  cypress:
    # Opens Cypress instead of running it
    devMode: false
    # Show the GUI window in run mode
    runHeaded: false
    # Get tokens to use inside tests
    getCookies: true
    # Max number of specs parallelization
    maxJobs: 3 
    # Show less information on logs
    quiet: true
    # Project run with Cypress Dashboard
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
    sorry: false
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
  # Apps to be installed
  installApps: []
  # Apps to be removed
  removeApps: []
  # Spec to wipe the data on the end
  wipe:
    enabled: true
    stopOnFail: false
    specs:
      - cypress-shared/integration/workspace/wipe.spec.js
  # Clean workspace and state files on the end
  teardown:
    enabled: true

strategy:
  # Short name is better
  byFromStore:
    enabled: true
    # Send it to Cypress Dashboard or Sorry-Cypress
    sendDashboard: false
    # How many times to try it
    hardTries: 1
    # Stop the test if it fails
    stopOnFail: false
    # Run in parallel, requires Cypress Dashboard or Sorry-Cypress
    parallel: true
    # Specs to run (order not guaranteed)
    specs:
      - cypress/integration/A01*
      - cypress/integration/A02*
  checkInvoice:
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
