const path = require('path')

const { startCase, difference, intersection } = require('lodash')

const system = require('./system')
const logger = require('./logger')
const cypress = require('./cypress')

let specsFailed = []
let specsSkipped = []
let specsDisabled = []
let specsPassed = []
let runUrl = null

exports.runTests = async (config) => {
  // Control time and load strategies
  const START = system.tick()
  const STRGS = config.strategy

  // Start Xvfb
  logger.msgOk('Starting Xvfb on port 99')
  const displayLog = path.join(logger.logPath(), '_display.log')
  const xvfb = system.spawn(
    'Xvfb',
    ['-screen', '0', '1024x768x24', ':99'],
    displayLog
  )

  // Loop strategies
  for (const strategy in STRGS) {
    const test = STRGS[strategy]
    const group = `${system.getId()}/${strategy}`

    test.name = startCase(strategy)

    // If test disabled, just flag and continue
    if (!test.enabled) {
      specsDisabled = specsDisabled.concat(test.specs)
      continue
    }

    // If it has dependencies, and they don't meet, flag and continue
    if (test.dependency?.length) {
      // Set to drop eventual user duplications by mistaken
      const deps = [...new Set(test.dependency)].sort()
      const pass = [...new Set(specsPassed)].sort()
      const miss = difference(deps, pass)

      // Dependencies don't meet
      if (miss?.length) {
        logger.msgSection(`[skip] Strategy ${test.name}`)
        const loopPass = intersection(deps, pass)
        const loopMiss = intersection(deps, miss)
        const loopSkip = intersection(deps, specsSkipped)

        // Show feedback to user
        loopPass.forEach((spec) => {
          logger.msgOk(cypress.specNameClean(spec))
        })
        loopSkip.forEach((spec) => {
          logger.msgWarn(cypress.specNameClean(spec))
        })
        loopMiss.forEach((spec) => {
          logger.msgError(cypress.specNameClean(spec))
        })

        // Feed skipped list
        specsSkipped = specsSkipped.concat(test.specs)

        continue
      }
    }

    // All set, let's run the test
    // eslint-disable-next-line no-await-in-loop
    await runTest(test, config, group)
  }

  // Stops Xvfb
  logger.msgOk('Killing Xvfb')
  xvfb.kill()

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
  const cypressOptions = { parallel: test.parallel }
  const tries = test.hardTries + 1
  let testTry = 1

  test.specs = [...new Set(test.specs)] // Sanitize
  while (testTry <= tries && test.specs.length) {
    logger.msgSection(`[try ${testTry}/${tries}] Strategy ${test.name}`)
    cypressOptions.group = `${group}/${testTry}`
    // eslint-disable-next-line no-await-in-loop
    const results = await cypress.run(test, config, cypressOptions)

    // eslint-disable-next-line no-loop-func
    results.forEach((result) => {
      if (!runUrl) runUrl = result.runUrl
      if (result.success) {
        test.specs = difference(test.specs, result.specsPassed)
        specsPassed = specsPassed.concat(result.specsPassed)
      }
    })
    testTry++
  }

  if (!test.specs.length) {
    logger.msgOk(`Strategy ${test.name} ran successfully`)
    specsPassed = [...new Set(specsPassed)].sort() // Sanitization
  } else {
    logger.msgError(`Strategy ${test.name} failed`)
    specsFailed = specsFailed.concat(test.specs)
    specsFailed = [...new Set(specsFailed)].sort() // Sanitization
    if (test.stopOnFail) {
      await cypress.stopOnFail(
        config,
        { strategy: test.name, specsPassed, specsFailed },
        runUrl
      )
    }
  }
}
