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

  // Export envs to make debug easier inside GitHub
  for (const ENV in config.envs) process.env[ENV] = config.envs[ENV]

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


}
