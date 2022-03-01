const fs = require('fs')
const qe = require('./utils')
const path = require('path/posix')
const PATH_HOME = process.env.HOME
const PATH_CACHE = path.join(PATH_HOME, '.cache')
const PATH_CACHE_VTEX = path.join(PATH_CACHE, 'vtex')
const PATH_TOOLBELT = path.join(PATH_HOME, '.cache', 'toolbelt')
const PATH_TOOLBELT_BIN = path.join(PATH_TOOLBELT, 'bin')
const TOOLBELT_BIN = path.join(PATH_TOOLBELT_BIN, 'vtex-e2e')
const TOOLBELT_URL_OUTPUT = '.toolbelt.url'

// Needed to run vtex cli on patched mode
process.env.IN_CYPRESS = true

exports.vtexCli = async (config) => {
    const AUTH_VTEX_CLI = config.testConfig.authVtexCli
    const VTEX = config.testConfig.vtex

    if (AUTH_VTEX_CLI.enabled) {
        // Try to clean vtex cache state to avoid bugs
        try {
            fs.rmSync(PATH_CACHE_VTEX, {recursive: true})
            qe.msg(`${PATH_CACHE_VTEX} cleaned successfully`)
        } catch (e) {
            qe.msg(`${PATH_CACHE_VTEX} doesn't exist, no need to clean it`)
        }
        // Check if toolbelt is installed already
        if (fs.existsSync(TOOLBELT_BIN)) qe.msg('The patched version of toolbelt is installed already')
        else {
            try {
                qe.msg('Patched version of toolbelt not found, deploying it:')
                if (!fs.existsSync(PATH_CACHE_VTEX)) fs.mkdirSync(PATH_CACHE_VTEX)
                if (fs.existsSync(PATH_TOOLBELT)) fs.rmSync(PATH_TOOLBELT, {recursive: true})
                qe.msgDetail(`Cloning toolbelt from ${AUTH_VTEX_CLI.git}`)
                qe.exec(`cd ${PATH_CACHE} && git clone ${AUTH_VTEX_CLI.git}`)
                qe.msgDetail(`Checking out toolbelt patched branch ${AUTH_VTEX_CLI.branch}`)
                qe.exec(`cd ${PATH_TOOLBELT} && git checkout ${AUTH_VTEX_CLI.branch}`)
                qe.msgDetail('Installing yarn packages')
                qe.exec(`cd ${PATH_TOOLBELT} && yarn`)
                qe.msgDetail('Building patched toolbelt')
                qe.exec(`cd ${PATH_TOOLBELT} && yarn build`)
                qe.msgDetail('Copying binary to vtex-e2e')
                fs.copyFileSync(path.join(PATH_TOOLBELT_BIN, 'run'), TOOLBELT_BIN)
                qe.msgDetail('Calling vtex cli twice to warm it up (autofix bug)')
                try {
                    qe.exec(`${TOOLBELT_BIN} whoami`)
                } catch (_ee) {
                    qe.exec(`${TOOLBELT_BIN} whoami`)
                }
            } catch (e) {
                qe.crash(e)
            }
        }
        // Start vtex cli in background
        qe.msg('Toolbelt version: ', true)
        qe.exec(`${TOOLBELT_BIN} --version`, 'inherit')
        qe.msg(`Starting login using [${VTEX.account}] account in background... `)
        try {
            qe.msgDetail(`Removing old [${TOOLBELT_URL_OUTPUT}], if any`)
            if (fs.existsSync(TOOLBELT_URL_OUTPUT)) fs.rmSync(TOOLBELT_URL_OUTPUT)
            qe.msgDetail(`Calling [vtex-e2e login ${VTEX.account}]`)
            qe.exec(`${TOOLBELT_BIN} login ${VTEX.account} 1> ${TOOLBELT_URL_OUTPUT} &`)
            let size = 0
            while (size < 3) size = qe.fileSize(TOOLBELT_URL_OUTPUT)
            qe.msgDetail('Callback url created successfully')
        } catch (e) {
            qe.crash(e)
        }
        // Feedback to user and path to be added returned
        qe.msg('Toolbelt started in background, now you can call Cypress')
    } else if (config.testWorkspace.setup.manageApps.enabled)
        qe.msgDetail('Make sure you have vtex cli authenticated already as you plan to manage apps')

    return `${process.env.PATH}:${PATH_TOOLBELT_BIN}`
}
