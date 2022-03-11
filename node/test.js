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
        const check = intersection(dependency, testsPassed)

        if (check.length === dependency.length) {
          qe.msg(`As strategy ${check} passed, running strategy ${strategy}`)
          await runTest(test, config, group)
        } else {
          qe.msg(
            `As strategy ${dependency} not pass, skipping strategy ${strategy}`,
            'warn'
          )
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
        `Running try ${ht + 1} of ${test.hardTries + 1} for strategy ${
          test.name
        },`,
        'warn'
      )
      if (test.runInOrder) {
        const passSpec = []

        for (let i = 0; i < test.specs.length; i++) {
          addOptions.group = `${group}-try-${ht + 1}-spec-${i}`
          test.spec = test.specs[i]
          passSpec.push(await qe.runCypress(test, config, addOptions))
        }

        testPassed = !/false/.test(passSpec.toString())
      } else {
        addOptions.group = `${group}-try-${ht + 1}`
        test.spec = test.specs
        testPassed = await qe.runCypress(test, config, addOptions)
      }
    }
  }

  if (!testPassed) {
    qe.msg(`strategy ${test.name} failed`, 'error')
    testsFailed.push(test.name)
    if (test.stopOnFail) await qe.stopOnFail(config, `strategy ${test.name}`)
  } else {
    qe.msg(`strategy ${test.name} succeeded`)
    testsPassed.push(test.name)
  }
}
