const { intersection, startCase } = require('lodash')

const system = require('./system')
const logger = require('./logger')
const cypress = require('./cypress')

let specsFailed = []
let specsSkipped = []
let specsDisabled = []
let specsPassed = []
let runUrl = null

exports.runTests = async (config) => {
  const START = system.tick()
  const STRATEGIES = config.strategy

  // Export envs for make easier debug on GitHub Actions
  for (const env in config.exportEnvs) {
    process.env[env] = config.exportEnvs[env]
  }

  for (const strategy in STRATEGIES) {
    const test = STRATEGIES[strategy]
    const group = `${system.getId()}/${strategy}`

    test.name = startCase(strategy)

    if (test.enabled) {
      let { dependency } = test

      if (dependency?.length) {
        // Drop eventual duplications
        dependency = [...new Set(dependency)]
        specsPassed = [...new Set(specsPassed)]
        const check = intersection(dependency, specsPassed)

        // All dependencies passed?
        if (check.length === dependency.length) {
          // Yes
          // eslint-disable-next-line no-await-in-loop
          await runTest(test, config, group)
        } else {
          // No
          logger.msgSection(`[skip] Strategy ${test.name}`)
          // eslint-disable-next-line no-loop-func
          logger.msgError('Dependency failed')
          dependency.sort()
          dependency.forEach((item) => {
            logger.msgPad(cypress.specNameClean(item))
          })
          specsSkipped = specsSkipped.concat(test.specs)
        }
      } else {
        // eslint-disable-next-line no-await-in-loop
        await runTest(test, config, group)
      }
    } else {
      specsDisabled = specsDisabled.concat(test.specs)
    }
  }

  return {
    time: system.tack(START),
    specsFailed,
    specsSkipped,
    specsDisabled,
    specsPassed,
    runUrl,
  }
}

async function runTest(test, config, group) {
  let testsPassed = false
  let thisTry = 1
  const hardTries = test.hardTries + 1
  const addOptions = {
    parallel: test.parallel,
  }

  // Drop duplicates, just in case
  test.specs = [...new Set(test.specs)]

  while (thisTry <= hardTries && !testsPassed && test.specs.length) {
    logger.msgSection(`[try ${thisTry}/${hardTries}] Strategy ${test.name}`)
    addOptions.group = `${group}/${thisTry}`

    // eslint-disable-next-line no-await-in-loop
    const testsResult = await cypress.run(test, config, addOptions)

    testsPassed = true
    // eslint-disable-next-line no-loop-func
    testsResult.forEach((testResult) => {
      if (!runUrl) runUrl = testResult.runUrl
      testResult.runs.forEach((run) => {
        if (run.stats.failures) {
          testsPassed = false
        } else {
          for (const spec in test.specs) {
            const [search] = test.specs[spec].split('*')
            const found = run.spec.relative.includes(search)

            if (found) {
              specsPassed.push(test.specs[spec])
              test.specs.splice(Number(spec), 1)

              break
            }
          }
        }
      })
    })
    thisTry++
  }

  await pushResults(testsPassed, test, config)
}

async function pushResults(testsPassed, test, config) {
  if (!testsPassed) {
    logger.msgError(`Strategy ${test.name} failed`)
    specsFailed = specsFailed.concat(test.specs)
    if (test.stopOnFail) {
      await cypress.stopOnFail(
        config,
        { strategy: test.name, specsPassed, specsFailed },
        runUrl
      )
    }
  } else {
    logger.msgOk(`Strategy ${test.name} ran successfully`)
  }
}
