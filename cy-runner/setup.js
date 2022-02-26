const {promises: pfs} = require('fs')
const qe = require('./utils')
const {vtexTeardown} = require('./teardown')

async function vtexSetup(workspace, config, start) {
    let wks = workspace.name
    let createWks = wks == null ? true : false

    // Prepare cypress.json
    if (createWks) wks = `e2e${start.toString().substr(-7)}`
    const CY_CFG = config.cypress
    const CY_JSON = {
        baseUrl: `https://${wks}--${config.vtex.account}.${config.vtex.domain}`,
        chromeWebSecurity: CY_CFG.chromeWebSecurity,
        video: CY_CFG.video,
        videoCompression: CY_CFG.videoCompression,
        videoUploadOnPasses: CY_CFG.videoUploadOnPasses,
        screenshotOnRunFailure: CY_CFG.screenshotOnRunFailure,
        trashAssetsBeforeRuns: CY_CFG.trashAssetsBeforeRuns,
        viewportWidth: CY_CFG.viewportWidth,
        viewportHeight: CY_CFG.viewportHeight,
        defaultCommandTimeout: CY_CFG.defaultCommandTimeout,
        requestTimeout: CY_CFG.defaultCommandTimeout,
        watchForFileChanges: CY_CFG.watchForFileChanges,
        pageLoadTimeout: CY_CFG.pageLoadTimeout,
        browser: CY_CFG.browser,
        projectId: CY_CFG.projectId,
        retries: 0,
    }
    pfs.writeFile('cypress.json', JSON.stringify(CY_JSON))

    // Define workspace name
    if (createWks) {
        qe.msg(`Defining workspace name as "${wks}"`)
    } else {
        qe.msg(`Using workspace named "${wks}" `)
        qe.msgDetail("It must exists with apps you'll need!")
    }

    // Updanting values to expose to Cypress
    workspace.name = wks
    workspace.stateFiles = config.stateFiles

    // Open or Run cypress
    if (config.devMode) {
        qe.msgDetail('Running in dev mode')
        await qe.openCypress({workspace: workspace})
        if (workspace.teardown.enabled) await vtexTeardown(workspace, config)
        qe.msg('Hope you did well on your tests, see you soon!')
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

// Expose
module.exports = {
    vtexSetup: vtexSetup,
}
