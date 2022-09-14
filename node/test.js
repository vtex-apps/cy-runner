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

  for (const strategy in STRATEGIES) {
    const test = STRATEGIES[strategy]
    const group = `${system.getId()}/${strategy}`

    test.name = startCase(strategy)

    if (test.enabled) {
      let { dependency } = test

      logger.msgSection(`Running strategy ${startCase(strategy)}`)
      if (dependency?.length) {
        // Drop eventual duplications
        dependency = [...new Set(dependency)]
        specsPassed = [...new Set(specsPassed)]
        const check = intersection(dependency, specsPassed)

        if (check.length === dependency.length) {
          logger.msgOk('As those specs succeeded')
          // eslint-disable-next-line no-loop-func
          check.forEach((item) => {
            logger.msgPad(cypress.specNameClean(item))
          })
          logger.msgWarn(`Let's run strategy ${strategy}`)
          // eslint-disable-next-line no-await-in-loop
          await runTest(test, config, group)
        } else {
          logger.msgError('As bellow spec failed')
          // eslint-disable-next-line no-loop-func
          dependency.forEach((item) => {
            if (specsFailed.find(item)) {
              logger.msgPad(cypress.specNameClean(item))
            }
          })
          logger.msgError(`The strategy ${strategy} will be skipped`)
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

  test.parallel = config.base.cypress.maxJobs ? test.parallel : false
  const addOptions = {
    parallel: test.parallel,
  }

  // Drop duplicates, just in case
  test.specs = [...new Set(test.specs)]

  while (thisTry <= hardTries && !testsPassed && test.specs.length) {
    logger.msgOk(`${test.name}: try ${thisTry} of ${hardTries}`)
    addOptions.group = `${group}/${thisTry}`

    // eslint-disable-next-line no-await-in-loop
    const testsResult = await cypress.run(test, config, addOptions)

    testsPassed = checkTests(test, testsResult)
    thisTry++
  }

  await pushResults(testsPassed, test, config)
}

async function checkTests(test, testsResult) {
  let passed = true

  testsResult.forEach((testResult) => {
    if (!runUrl) runUrl = testResult.runUrl
    testResult.runs.forEach((run) => {
      if (run.stats.failures) passed = false
      for (const spec in test.specs) {
        const [search] = test.specs[spec].split('*')
        const found = run.spec.relative.includes(search)

        if (found) {
          specsPassed.push(test.specs[spec])
          test.specs.splice(Number(spec), 1)

          break
        }
      }
    })
  })

  return passed
}

async function pushResults(testsPassed, test, config) {
  if (!testsPassed) {
    logger.msgError(`Strategy ${test.name} failed`)
    specsFailed = specsFailed.concat(test.specs)
    if (test.stopOnFail) {
      await cypress.stopOnFail(config, `Strategy ${test.name}`, runUrl)
    }
  } else {
    logger.msgOk(`Strategy ${test.name} ran successfully`)
  }
}
