const qe = require('./utils')

module.exports.teardown = async (config) => {
  const START = qe.tick()
  const wrk = config.workspace

  if (wrk.wipe.enabled || wrk.teardown.enabled) {
    qe.msgSection('Workspace teardown')
    if (wrk.wipe.enabled) {
      qe.msg('Wiping data', 'ok', false, true)
      const passed = await qe.runCypress(wrk.wipe, config, {}, true)
      const status = passed ? 'success' : 'failed'

      qe.msg(status, 'complete', true)
      if (!passed && wrk.wipe.stopOnFail) {
        qe.crash('Fail on workspace.wipe due a stopOnFail')
      }
    }

    if (config.workspace.teardown.enabled) {
      qe.msg(`Removing workspace ${config.workspace.name}`, 'ok', false, true)
      await qe.toolbelt(config.base.vtex.bin, `workspace delete -f ${wrk.name}`)
      qe.msg('done', 'complete', true)
    }
  }

  return qe.toc(START)
}
