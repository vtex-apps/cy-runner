# Cypress Runner

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=vtex-apps_cy-runner&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=vtex-apps_cy-runner)
[![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=vtex-apps_cy-runner&metric=ncloc)](https://sonarcloud.io/summary/new_code?id=vtex-apps_cy-runner)
[![Technical Debt](https://sonarcloud.io/api/project_badges/measure?project=vtex-apps_cy-runner&metric=sqale_index)](https://sonarcloud.io/summary/new_code?id=vtex-apps_cy-runner)

Tool to orchestrate Cypress tests

# Introduction
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

## Main goal
The main goal of `cy-runner` is to run like the final user will do, following the basic recipe: install vtex `toolbelt`, create the workspace, do basic configurations, set up a basic store, install all set of application required, uninstall apps if necessary, get tokens to authenticate, run the tests, clean all data created on `masterdata`, and delete the workspace used on the tests.

Note that we said **install vtex `toolbelt`**, so we are not using any API because we want to measure the time of the process based on a user visual, a truly E2E setup. To do so we need to make a patched version on the `toolbelt` tool, and you can check the modifications [here](https://github.com/vtex/toolbelt/tree/qe/cypress). One of the modifications was to print the callback URL on console instead of open a browser with it, so se can use it to authenticate on `toolbelt` inside the Cypress browser.

To achieve the full authentication process, you need to create a user inside the master workspace with `VTEX IO Admin` rule, so this user will be able to call the API. Also, you need to set up the MFA method as SMS and configure a Twilio number for it. Then, on the `secrets template`, you can add the Twilio secrets to make possible Cy-Runner get the MFA code and do the full authentication.

# Using Cy-Runner
## Setup
To do the setup, the first thing you need to do is configure the proper section of the YAML file (snippet next). If you are curious on how this process happen, just take a look on the spec to do the login task [here](https://github.com/vtex-apps/cy-runner/blob/main/node/cypress/integration/vtex-auth.spec.js). It is just a regular Cypress spec that with the proper env variables configured do the login as any human will do.

```yaml
[...]
base:
  secrets:
    enabled: true
    name: MY_SUPER_ENV_NAME
  vtex:
    account: my_robot_account_with_VTEX_IO_Admin_privileges
    domain: my_qa_env_name.com.br
    vtexIdUrl: https://vtexid.vtex.com.br/api/vtexid/pub/authenticate/default
    deployCli:
      enabled: true
      git: https://github.com/vtex/toolbelt.git
      branch: qe/cypress
  twilio:
    enabled: true
  [...]
```

Another important part on your setup, is the installation, uninstallation and link packages. To generate a name for your new workspace on every run, keep the name of it as `random`. If you want to use a created workspace because you don't need to install, uninstall or link any app, you can fill the name with your workspace here. There is a snipped of this kind of configuration:

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
After a successful setup, `cypress-runner` will take care of your tests, it will start one by one or in parallel (max 3 jobs in parallel at this point), and make sure that dependent tests only run if the dependencies pass first. If you are planing to run tests in parallel locally, then you can use more than three jobs (if your machine has power to do so), but in this case you'll need to set `base.cypress.sorry` as `true` and make sure that you have a [Sorry Cypress](https://sorry-cypress.dev/) up and running locally. 

On the tests you can add as many specs as you need, and if you have no dependency at all, you can create just one instance like the snippets bellow.

### To run all tests without any dependency with local parallelization

In this case, we are configuring the parallelization with five jobs (we have at least 16 GB of RAM and 6 cores CPU on this example), we want the output to be quiet as possible, we will save the videos, use Chrome as browser and do the parallelization using [Sorry Cypress](https://sorry-cypress.dev/). Also, we want the tests to run again (`hardTries`) the failed specs one more time. For example, if you have `specA`, `specB`, and `specC` and the `specB` fails during the tests, Cypress will try again one more time just the failed one (`specB`). Please, observe on the next example that all five specs will run in parallel. If you have seven specs and set `maxJobs` to 5, `cypress runnner` will start five jobs in parallel and soon as one of them finishes start the remained tests until all of them run one time. If some test fail, then try again just those: if two test fails, then the two tests will be executed in parallel on the next try.

```yaml
[...]
cypress:
  maxJobs: 5
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

### To run test with dependency using Cypress Dashboard for parallelization

Even when saving it on [Cypress Dashboard](https://dashboard.cypress.io/), if you are running the test on your superpower local machine (at least 16 GB of RAM and 6 cores CPU on this example), you can take advantage of more than three jobs. On GitHub Actions, please, never try bigger numbers. We are working on `cypress runner` to make it compatible with jobs, but at this point this feature is not fully supported yet.

On the next example, please, take note of the option `strategy.buyItems.stopOnFail` as configured as `true`. The reason is that if the buy items fail, there's nos sense to check the inventory or orders on the system. Even if you make the `strategy.buyItems.stopOnFail` as `false`, the `strategy.checkInventory` will run only if the two dependencies specs pass. Also, we are trying `strategy.checkOrders` three times as the API can take longer to process. 

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
After run your tests, you'll get a `logs` folder inside the `cy-runner` folder with the output results. If you are using GitHub Actions, you can save this folder as artifact, so you can download it and get easily what goes right or wrong with your tests. On this folder you're going to have:

1. YAML output with detailed report of each run for each test, even the hard tried ones
2. The app versions used on the test (JSON)
3. The app dependency versions used on the test (JSON)
4. The `screenshots` folder with the errors screens (if any)
5. The `videos` folder with the records (if enabled)
6. The `toolbelt` folder with the records for login (to debug errors)

Also, you have the `cy-runner.log` file, that will show you how the tests were conducted, the main failures and the time to do each task. Next we'll show one example of it:
```txt
[QE] === Cypress Runner ============================================================================
     ===============================================================================================

     [!] Checking configuration
     [✓] ../cy-runner.yml loaded and validated successfully
     [✓] Secrets loaded from file .VTEX_QE.json successfully
     [✓] Workspace to be used on this run: cybersource4532095
     [✓] cypress.env.json updated
     [✓] cypress.json created successfully
     [✓] 1 empty state file created successfully
     [✓] Local cypress detected, common links created

[QE] === Sections to run ===========================================================================
     ===============================================================================================

     [✓] base.secrets
     [✓] base.twilio
     [✓] workspace.linkApp
     [✓] workspace.wipe
      -  runs cypress/integration/wipe.spec.js
     [✓] workspace.teardown
     [✓] strategy.config
      -  runs cypress/integration/post_setup.spec.js
     [✓] strategy.basicTests
      -  runs cypress/integration/sku*
      -  runs cypress/integration/2.1-singleProduct*
      -  runs cypress/integration/2.2-multiProduct*
      -  runs cypress/integration/2.3-promotionalProduct*
      -  runs cypress/integration/2.4-discountProduct*
      -  runs cypress/integration/2.5-discountShipping*
      -  runs cypress/integration/2.6-externalSeller*
      -  deps cypress/integration/post_setup.spec.js
     [✓] strategy.refund
      -  runs cypress/integration/2.7-fullRefund*
      -  runs cypress/integration/2.8-partialRefund*
      -  runs cypress/integration/2.9-settlements*
      -  deps cypress/integration/2.1-singleProduct*
      -  deps cypress/integration/2.2-multiProduct*
      -  deps cypress/integration/2.3-promotionalProduct*
     [✓] workspace.installApps
      -  vtex.cybersource-fraud
      -  vtex.cybersource-ui

[QE] === Workspace preparation =====================================================================
     ===============================================================================================

     [✓] Toolbelt logged as robot.partnerhere@gmail.com
     [✓] Changing workspace to cybersource4532095
     [!] Installing apps
      -  vtex.cybersource-fraud
      -  vtex.cybersource-ui
     [✓] Apps installed successfully
     [!] Linking app
      -  Reading ../manifest.json
      -  Uninstalling vtex.cybersource if needed
      -  Unlinking vtex.cybersource if needed
      -  Adding cy-runner exclusions to ../.vtexignore
      -  Linking vtex.cybersource
     [✓] App linked successfully
     [✓] Listing apps to logs/appsVersions.log
     [✓] Listing deps to logs/depsVersions.log

[QE] === Cookies ===================================================================================
     ===============================================================================================

     [!] Getting cookies
      -  Requesting admin cookie
      -  Requesting user cookie
     [✓] cypress.env.json updated

[QE] === Strategy config ===========================================================================
     ===============================================================================================

     [!] Hard try 1 of 2 for strategy.config
     [✓] strategy.config succeeded

[QE] === Strategy basicTests =======================================================================
     ===============================================================================================

     [✓] As the follow specs succeeded
      -  cypress/integration/post_setup.spec.js
     [✓] Let's run strategy.basicTests
     [!] Hard try 1 of 2 for strategy.basicTests
     [!] Hard try 2 of 2 for strategy.basicTests
     [✗] strategy.basicTests failed

[QE] === Strategy refund ===========================================================================
     ===============================================================================================

     [✗] As one of the follow specs not succeeded
      -  cypress/integration/2.1-singleProduct*
      -  cypress/integration/2.2-multiProduct*
      -  cypress/integration/2.3-promotionalProduct*
     [!] Let's skip strategy.refund

[QE] === Workspace teardown ========================================================================
     ===============================================================================================

     [!] Wiping data
     [✓] Success to clean data
     [!] Removing temporary files
      -  cypress.env.json
      -  cypress.json
      -  .orders.json
     [✓] Temporary files removed
     [✓] Removing workspace cybersource4532095... done

[QE] === Execution report ==========================================================================
     ===============================================================================================

     [✓] Execution time
      -  vtexCli....................... 0 seconds
      -  workspace..................... 59.264 seconds
      -  credentials................... 2.025 seconds
      -  strategy...................... 266.801 seconds
      -  teardown...................... 18.768 seconds
      -  total......................... 346.877 seconds

     [✓] Successful specs
      -  cypress/integration/post_setup.spec.js
      -  cypress/integration/sku*

     [!] Skipped specs
      -  cypress/integration/2.7-fullRefund*
      -  cypress/integration/2.8-partialRefund*
      -  cypress/integration/2.9-settlements*

     [✗] Failed specs
      -  cypress/integration/2.1-singleProduct*
      -  cypress/integration/2.2-multiProduct*
      -  cypress/integration/2.3-promotionalProduct*
      -  cypress/integration/2.4-discountProduct*
      -  cypress/integration/2.5-discountShipping*
      -  cypress/integration/2.6-externalSeller*


[QE] === FAIL ======================================================================================

     [✗] The test failed!

```

## Teardown

Last, but not least, you need to take care of your teardown process. To do so, you can use `cypress runner` to do one part of the job, but you'll need to take care of cleaning the `masterdata`. As `cypress runner` was designed to be a multi proposal tool, it's hard to cover all possible cases that need cleaning data, so you can do this task by creating one spec to take care of it. On the next example you can see how to configure it on `cypress runner`, also you can have a code of one spec as example [here](https://github.com/vtex-apps/cy-runner/blob/main/cypress-shared/integration/b2b/wipe.spec.js). As usual, you can stop the test and make it fails if the `workspace.wipe` tasks fails by setting the `workspace.wipe.stopOnFail` to `true`.

If you used the `workspace.name` as `random`, you can enable `workspace.teardown` for sure.

### Attention
**Please, take care of disabling `workspace.teardown` if you are using a pre-configured environment, otherwise it'll be deleted**.

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
    enabled: false
    stopOnFail: false
    specs:
      # You can pass more the one spec to teardown
      - cypress-shared/integration/workspace/wipe.spec.js
  # Clean workspace and state files on the end
  teardown:
    enabled: true

strategy:
  # Short name is better
  A01:
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


# Development

## Running tests
```sh
yarn cy-r
```

## Linting
```sh
yarn lint
```

# Related Tools

* [Cypress](https://cypress.io)
* [Sorry-cypress](https://sorry-cypress.dev/)
