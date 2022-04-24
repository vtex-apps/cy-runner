/* eslint-disable no-await-in-loop */
const { intersection } = require('lodash')

const qe = require('./utils')

let specsFailed = []
let specsSkipped = []
let specsPassed = []

module.exports.strategy = async (config) => {
  const START = qe.tick()
  const wrk = config.workspace
  const strategies = config.strategy

  for (const strategy in strategies) {
    const test = strategies[strategy]

    test.name = strategy
    const group = `${wrk.name}/${strategy}`

    if (test.enabled) {
      let { dependency } = test

      qe.msgSection(`Strategy ${strategy}`)
      if (typeof dependency !== 'undefined') {
        // Take out possible duplications
        dependency = [...new Set(dependency)]
        specsPassed = [...new Set(specsPassed)]
        const check = intersection(dependency, specsPassed)

        if (check.length === dependency.length) {
          qe.msg('As the follow specs succeeded')
          check.forEach((item) => {
            qe.msg(item, true, true)
          })
          qe.msg(`Let's run strategy.${strategy}`)
          await runTest(test, config, group)
        } else {
          qe.msg('As one of the follow specs not succeeded', 'error')
          dependency.forEach((item) => {
            qe.msg(item, true, true)
          })
          qe.msg(`Let's skip strategy.${strategy}`, 'warn')
          specsSkipped = specsSkipped.concat(test.specs)
        }
      } else {
        await runTest(test, config, group)
      }
    } else {
      specsSkipped = specsSkipped.concat(test.specs)
    }
  }

  return {
    time: qe.toc(START),
    specsFailed,
    specsSkipped,
    specsPassed,
  }
}

async function runTest(test, config, group) {
  let testsPassed = false
  const hardTries = test.hardTries + 1
  let thisTry = 1
  const addOptions = {
    parallel: test.parallel,
  }

  // If needed, remove duplicates
  test.specs = [...new Set(test.specs)]

  while (thisTry <= hardTries && !testsPassed && test.specs.length) {
    qe.msg(
      `Hard try ${thisTry} of ${hardTries} for strategy.${test.name}`,
      'warn'
    )
    addOptions.group = `${group}/${thisTry}`

    const testsResult = await qe.runCypress(test, config, addOptions)

    testsPassed = true
    // eslint-disable-next-line no-loop-func
    testsResult.forEach((testResult) => {
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
    qe.msg(`strategy.${test.name} failed`, 'error')
    specsFailed = specsFailed.concat(test.specs)
    if (test.stopOnFail) await qe.stopOnFail(config, `strategy ${test.name}`)
  } else {
    qe.msg(`strategy.${test.name} succeeded`)
  }
}
