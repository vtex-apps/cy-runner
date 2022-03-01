const qe = require('./cy-runner/utils')
const {config} = require('./cy-runner/config')
const {vtexCli} = require('./cy-runner/cli')
const {vtexSetup} = require('./cy-runner/setup')
const {vtexTest} = require('./cy-runner/test')
const {vtexWipe} = require('./cy-runner/wipe')
const {vtexTeardown} = require('./cy-runner/teardown')

// Variables to control the overall
let timing = {start: qe.tick()}
let failed = []
let skipped = []
let success = []

async function main() {

    // Report configuration to help understand that'll run
    qe.reportSetup(config)

    // Setup and run VTEX CLI on background
    process.env.PATH = await vtexCli(config)

    // Setup workspace (create, install apps, etc)
    await vtexSetup(config)
    timing['setup'] = qe.tick()

    // Wipe
    if (config.workspace.wipe.enabled) {
        await vtexWipe(config.workspace, config.configuration)
        timing['wipe'] = qe.tick()
    } else {
        qe.msg('Wipe is disabled, skipping...')
    }

    // Tests
    const STRATEGY = config.testStrategy
    for (let item in STRATEGY) {
        let test = STRATEGY[item]
        let result = await vtexTest(
            config.workspace,
            config.configuration,
            test,
            failed,
            skipped
        )
        switch (result.testPassed) {
            case true:
                success.push(result.key)
                break
            case false:
                failed.push(result.key)
                break
            default:
                skipped.push(result.key)
                break
        }
    }
    timing['testing'] = qe.tick()

    // Teardown
    if (config.workspace.teardown.enabled) {
        await vtexTeardown(config.workspace, config.configuration)
        timing['teardown'] = qe.tick()
    } else {
        qe.msg('Teardown is disabled, skipping...')
    }

    // Final Report
    qe.report('Execution report')
    if (success.length > 0) qe.msgDetail('Succeed tests: ' + success)
    if (skipped.length > 0) qe.msgDetail('Skipped tests: ' + skipped)
    if (failed.length > 0) qe.msgDetail('Failed tests: ' + failed)
    let partialTime = 0
    let lastTime = 0
    for (item in timing) {
        let seconds = 0
        if (item === 'start') partialTime = timing[item]
        else {
            seconds = (timing[item] - partialTime) / 1000
            qe.msgDetail(`Time on ${item}: ${seconds} seconds`)
        }
        lastTime = timing[item]
    }
    let totalTime = (lastTime - timing.start) / 1000
    qe.msgDetail(`Total time: ${totalTime} seconds`)
    qe.msgDetail(`Note: Setup and teardown aren't counted as success or failure`)
    if (failed.length < 1) {
        qe.success('The test ran sucessfuly, well done')
    } else {
        qe.fail(`The test was skipped on ${skipped} and failed on ${failed}`)
    }
}

main()
