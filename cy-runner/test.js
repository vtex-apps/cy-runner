const qe = require('./utils')

module.exports.vtexTest = async (workspace, config, test, failed, skipped) => {
    let key = Object.keys(test).toString()
    test = test[key]

    qe.msg(`Running test strategy ${key}`)
    // Check for test dependency
    if (typeof test.dependency != 'undefined') {
        let checkA = null
        let checkB = null
        let skip = false
        test.dependency.forEach((dep) => {
            let depRegex = new RegExp(dep)
            checkA = depRegex.test(failed)
            checkB = depRegex.test(skipped)
            if (checkA || checkB) skip = true
        })
        if (skip) {
            qe.msgDetail(`Failed dependencies, skipping`)
            return {testPassed: 'skipped', key: key}
        }
    }
    if (!test.enabled) {
        qe.msgDetail(`Stragegy disabled, skipping`)
        return {testPassed: 'skipped', key: key}
    }
    let testPassed = await qe.runCypress(config, test, undefined, {workspace: workspace})

    return {testPassed: testPassed, key: key}
}
