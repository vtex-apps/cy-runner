const qe = require('./utils')
const { wipe } = require('./wipe')

module.exports.teardown = async (config) => {
  const START = qe.tick()
  const wrk = config.workspace

  if (wrk.wipe.enabled || wrk.teardown.enabled) {
    qe.msgSection('Workspace teardown')
    await wipe(config)

    if (config.workspace.teardown.enabled) {
      qe.msg(`Removing workspace ${config.workspace.name}`, 'ok', false, true)
      await qe.toolbelt(config.base.vtex.bin, `workspace delete -f ${wrk.name}`)
      qe.msg('done', 'complete', true)
    }
  }

  return qe.toc(START)
}
