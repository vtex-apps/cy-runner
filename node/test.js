/* eslint-disable no-await-in-loop */
const { intersection } = require('lodash')

const qe = require('./utils')

const strategiesFailed = []
const strategiesSkipped = []
const strategiesPassed = []

module.exports.strategy = async (config) => {
  const START = qe.tick()
  const wrk = config.workspace
  const strategies = config.strategy

  for (const strategy in strategies) {
    const test = strategies[strategy]

    test.name = strategy
    const group = `${wrk.name}/${strategy}`

    if (test.enabled) {
      const { dependency } = test

      qe.msgSection(`Strategy ${strategy}`)
      if (typeof dependency !== 'undefined') {
        // Convert all to string to avoid compare string to number
        const check = intersection(
          dependency.toString().split(','),
          strategiesPassed.toString().split(',')
        )

        if (check.length === dependency.length) {
          qe.msg(`Strategy.${check} succeeded`)
          qe.msg(`Running strategy.${strategy}`, true, true)
          qe.newLine()
          await runTest(test, config, group)
        } else {
          qe.msg(`Strategy.${dependency} not succeeded`, 'warn')
          qe.msg(`Skipping strategy.${strategy}`, true, true)
          strategiesSkipped.push(strategy)
        }
      } else {
        await runTest(test, config, group)
      }
    } else {
      strategiesSkipped.push(strategy)
    }
  }

  return {
    time: qe.toc(START),
    strategiesFailed,
    strategiesSkipped,
    strategiesPassed,
  }
}

async function runTest(test, config, group) {
  let testsPassed = false
  const hardTries = test.hardTries + 1
  let thisTry = 1
  const addOptions = {
    parallel: test.parallel,
  }

  // Remove duplicates
  test.specs = [...new Set(test.specs)]

  while (thisTry <= hardTries && !testsPassed && test.specs.length) {
    qe.msg(
      `Hard try ${thisTry} of ${hardTries} for strategy.${test.name}`,
      'warn'
    )
    addOptions.group = `${group}-try-${hardTries - 1}`

    const testsResult = await qe.runCypress(test, config, addOptions)

    testsPassed = true
    // eslint-disable-next-line no-loop-func
    testsResult.forEach((testResult) => {
      if (testResult.totalFailed) {
        testsPassed = false
      } else {
        for (const spec in test.specs) {
          const [search] = test.specs[spec].split('*')
          const found = testResult.runs[0].spec.relative.includes(search)

          if (found) {
            test.specs.splice(Number(spec), 1)

            break
          }
        }
      }
    })
    thisTry++
  }

  if (!testsPassed) {
    qe.msg(`strategy.${test.name} failed`, 'error')
    strategiesFailed.push(test.name)
    if (test.stopOnFail) await qe.stopOnFail(config, `strategy ${test.name}`)
  } else {
    qe.msg(`strategy.${test.name} succeeded`)
    strategiesPassed.push(test.name)
  }
}
