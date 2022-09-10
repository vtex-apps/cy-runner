const { wipe } = require('./wipe')

module.exports.teardown = async (config) => {
  const START = qe.tick()
  const { workspace } = config

  if (
    workspace.wipe.enabled ||
    workspace.teardown.enabled ||
    config.base.keepStateFiles
  ) {
    qe.msgSection('Workspace teardown')
    await wipe(config)

    if (workspace.teardown.enabled) {
      qe.msg(`Removing workspace ${workspace.name}`, 'ok', false, true)
      await qe.toolbelt(
        config.base.vtex.bin,
        `workspace delete -f ${workspace.name}`
      )
      qe.msg('done', 'complete', true)
    }

    if (config.base.keepStateFiles) qe.keepStateFiles(config) // ENGINEERS-465
  }

  return qe.tock(START)
}
