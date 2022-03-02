const qe = require('./utils')
const { intersection } = require('lodash')
let testsFailed = []
let testsSkipped = []
let testsPassed = []

module.exports.vtexTestStrategy = async (config) => {
  const START = qe.tick()
  const WORKSPACE = config.testWorkspace
  const STRATEGIES = config.testStrategy

  for (let strategy in STRATEGIES) {
    const test = STRATEGIES[strategy]
    test['name'] = strategy
    let group = `${WORKSPACE.name}/${strategy}`
    if (test.enabled) {
      let dependency = test.dependency
      qe.msgTestStrategy(`Processing [testStrategy.${strategy}]`)
      if (typeof dependency != 'undefined') {
        let check = intersection(dependency, testsPassed)
        if (check.length === dependency.length) {
          qe.msg(
            `As testStrategy [${check}] passed, running [testStrategy.${strategy}]`
          )
          await runTest(test, config, group)
        } else {
          qe.msg(
            `One of its dependencies [${dependency}] not pass, skipping [testStrategy.${strategy}]`
          )
          testsSkipped.push(strategy)
        }
      } else {
        await runTest(test, config, group)
      }
    } else {
      qe.msg(`[testStrategy.${strategy}] is disabled`)
      testsSkipped.push(strategy)
    }
  }

  return {
    time: qe.toc(START),
    testsFailed: testsFailed,
    testsSkipped: testsSkipped,
    testsPassed: testsPassed,
  }
}

async function runTest(test, config, group) {
  let testPassed = false
  let addOptions = {
    parallel: test.parallel,
  }
  for (let ht = 0; ht <= test.hardTries; ht++) {
    if (!testPassed) {
      qe.msg(
        `Running try [${ht + 1}] of [${test.hardTries + 1}] for [testStrategy.${
          test.name
        }]`
      )
      if (test.runInOrder) {
        let passSpec = []
        for (let i = 0; i < test.specs.length; i++) {
          addOptions['group'] = `${group}-try-${ht + 1}-spec-${i}`
          test['spec'] = test.specs[i]
          passSpec.push(await qe.runCypress(test, config, addOptions))
        }
        testPassed = !/false/.test(passSpec.toString())
      } else {
        addOptions['group'] = `${group}-try-${ht + 1}`
        test['spec'] = test.specs
        testPassed = await qe.runCypress(test, config, addOptions)
      }
    }
  }
  if (!testPassed) {
    qe.msg(`[testStrategy.${test.name}] failed`)
    testsFailed.push(test.name)
    if (test.stopOnFail)
      await qe.stopOnFail(config, `testStrategy.${test.name}`)
  } else {
    qe.msg(`[testStrategy.${test.name}] succeeded`)
    testsPassed.push(test.name)
  }
}
