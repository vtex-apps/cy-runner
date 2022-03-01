const qe = require('./utils')

module.exports.vtexWipe = async (config) => {
    qe.msg('Wipe data from test')
    await qe.runCypress(config, workspace.wipe, undefined, {workspace: workspace})
}
