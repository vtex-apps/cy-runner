/* eslint-disable no-await-in-loop */
const { intersection } = require('lodash')

const qe = require('./utils')

const testsFailed = []
const testsSkipped = []
const testsPassed = []

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
          testsPassed.toString().split(',')
        )

        if (check.length === dependency.length) {
          qe.msg(`Strategy.${check} succeeded`)
          qe.msg(`Running strategy.${strategy}`, true, true)
          qe.newLine()
          await runTest(test, config, group)
        } else {
          qe.msg(`Strategy.${dependency} not succeeded`, 'warn')
          qe.msg(`Skipping strategy.${strategy}`, true, true)
          testsSkipped.push(strategy)
        }
      } else {
        await runTest(test, config, group)
      }
    } else {
      testsSkipped.push(strategy)
    }
  }

  return {
    time: qe.toc(START),
    testsFailed,
    testsSkipped,
    testsPassed,
  }
}

async function runTest(test, config, group) {
  let testPassed = false
  const addOptions = {
    parallel: test.parallel,
  }

  for (let ht = 0; ht <= test.hardTries; ht++) {
    if (!testPassed) {
      qe.msg(
        `Starting try ${ht + 1} of ${test.hardTries + 1} for strategy.${
          test.name
        }`,
        'warn'
      )
      addOptions.group = `${group}-try-${ht + 1}`
      test.spec = test.specs
      testPassed = await qe.runCypress(test, config, addOptions)
    }
  }

  if (!testPassed) {
    qe.msg(`strategy.${test.name} failed`, 'error')
    testsFailed.push(test.name)
    if (test.stopOnFail) await qe.stopOnFail(config, `strategy ${test.name}`)
  } else {
    qe.msg(`strategy.${test.name} succeeded`)
    testsPassed.push(test.name)
  }
}
