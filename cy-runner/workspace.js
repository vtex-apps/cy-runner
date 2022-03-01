const qe = require('./utils')
const {vtexWipe} = require('./wipe')
const {vtexTeardown} = require('./teardown')

exports.vtexWorkspace = async (config) => {
    const WORKSPACE = config.testWorkspace;
    if (config.testConfig.devMode) {
        // Open Cypress en DEV/GUI mode
        qe.msg('Starting in [devmode], Cypress will be opened in GUI mode')
        qe.msgDetail('You must run the steps by yourself, including [setup]')
        qe.msgDetail('[wipe] and [teardown] will be triggered at the end if configured')
        await qe.openCypress({workspace: WORKSPACE.name})
        if (WORKSPACE.wipe.enabled) await vtexWipe(config)
        if (WORKSPACE.teardown.enabled) await vtexTeardown(config)
        qe.msg('My job finishes here, hope you did well on your tests. See you soon!')
        process.exit(0)
    } else {
        if (workspace.setup.enabled) {
            let env = {workspace: workspace}
            qe.msg(`Creating workspace "${wks}"`)
            await qe.runCypress(config, workspace.setup, undefined, env)
        } else {
            qe.msg('Workspace setup is disabled, skipping...')
        }
    }

    // Update cypres.env.json with .config.json config tokens
    const fileA = 'cypress.env.json'
    const fileB = config.stateFiles[0]
    let A = await pfs.readFile(fileA, 'utf8')
    let B = await pfs.readFile(fileB, 'utf8')
    A = JSON.parse(A)
    B = JSON.parse(B)
    if (typeof B.vtex == 'object') {
        for (att in B.vtex) A.vtex[att] = B.vtex[att]
        await pfs.writeFile(fileA, JSON.stringify(A))
        await pfs.writeFile(fileB, '{}')
    }
    return wks
}