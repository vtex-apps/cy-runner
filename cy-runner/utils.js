const cypress = require('cypress')
const {execSync} = require('child_process')
const fs = require('fs')
const {promises: pfs} = require('fs')
const {vtexTeardown} = require('./teardown')

const QE = '[QE] ===> '
const SP = '          '

exports.msgErr = (msg, notr = false) => {
    let end = notr ? '' : '\n'
    process.stderr.write(QE + msg + end)
}

exports.msgErrDetail = (msg, notr = false) => {
    let end = notr ? '' : '\n'
    process.stderr.write(SP + msg + end)
}

exports.msg = (msg, notr = false) => {
    let end = notr ? '' : '\n'
    process.stdout.write(QE + msg + end)
}

exports.msgDetail = (msg, notr = false) => {
    let end = notr ? '' : '\n'
    process.stdout.write(SP + msg + end)
}

exports.statusMsg = (msg, notr = false) => {
    let end = notr ? '' : '\n'
    process.stdout.write(msg + end)
}

exports.crash = (msg) => {
    this.msgErr('ERROR: ' + msg + '!\n')
    process.exit(99)
}

exports.report = (msg) => {
    process.stdout.write('\n[QE] ===> ' + msg + '\n\n')
}

exports.success = (msg) => {
    process.stdout.write('\n[QE] ===> SUCCESS: ' + msg + '!\n\n')
    process.exit(0)
}

exports.fail = (msg) => {
    process.stdout.write('\n[QE] ===> FAILED: ' + msg + '!\n\n')
    process.exit(17)
}

exports.exec = (cmd, output) => {
    if (typeof output == 'undefined') output = 'ignore'
    execSync(cmd, {
        stdio: output,
    })
}

exports.fileSize = (file) => {
    let stats = fs.statSync(file)
    return stats.size
}

exports.updateCyEnvJson = (data) => {
    let fileName = 'cypress.env.json'
    try {
        let json = pfs.readFile(fileName)
        let newJson = {...json, ...data}
        pfs.writeFile(fileName, JSON.stringify(newJson))
    } catch (e) {
        this.msgErr(e)
    }
}

exports.tick = () => {
    return Date.now()
}

exports.openCypress = async (workspace = {}) => {
    await cypress.open({env: workspace})
}

exports.runCypress = async (config, test, group, workspace = {}) => {
    let stopOnFail = test.stopOnFail
    let key
    let spec =
        typeof test.files == 'undefined' ? test.path + test.file : test.files
    const options = {
        spec: spec,
        runHeaded: config.runHeaded,
        browser: config.browser,
        env: workspace,
    }

    // Options tunning
    if (test.sendDashboard && typeof group == 'undefined')
        this.crash('Cypress Dashboard enabled without a group name')
    if (test.parallel) options['paralell'] = true
    if (typeof group != 'undefined') options['group'] = group
    if (test.sendDashboard) {
        key = fs.readFileSync('cypress.env.json')
        key = JSON.parse(key).cypress.dashboardKey
        if (typeof key == 'undefined')
            this.crash('Cypress Dashboard enabled without a key')
        options['key'] = key
        options['record'] = true
    }

    // Run Cypress
    let testPassed = false
    let endTests = false
    let isTeardown = /teardown/.test(spec)
    try {
        await cypress.run(options).then((result) => {
            if (result.failures) this.crash(result.message)
            if (result.totalFailed > 0 && stopOnFail) endTests = true
            else this.msg(`Spec done with ${result.totalPassed} passed test(s)!`)
            if (result.totalPassed < result.totalTests && !endTests)
                this.msg('Some test failed, but stopOnFail is disabled')
            else testPassed = true
        })
    } catch (e) {
        this.crash(e.message)
    }
    if (endTests) {
        this.msg('Some test failed and stopOnFail is enabled, ending tests')
        // Reduncing workspace back
        workspace = workspace.workspace
        if (!isTeardown && workspace.teardown.enabled) {
            this.msg('Teardown is enabled, calling it')
            await vtexTeardown(workspace, config)
        } else {
            this.msg('Teardown is disabled, skipping it')
        }
        this.crash('Test ended due a stopOnFail strategy')
    }
    return testPassed
}
