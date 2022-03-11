const qe = require('./utils')

module.exports.wipe = async (config) => {
  const START = qe.tick()

  if (config.workspace.wipe.enabled) {
    qe.msg('Removing temporary files', 'warn')
    const tempFiles = ['cypress.env.json', 'cypress.json']

    tempFiles.forEach((file) => {
      qe.msg(file, true, true)
      qe.storage(file, 'rm')
    })
    config.base.stateFiles.forEach((file) => {
      qe.msg(file, true, true)
      qe.storage(file, 'rm')
    })
    qe.msg('Temporary files removed')
    qe.msg(`Wiping workspace [${config.workspace.name}]`)
    const { wipe } = config.workspace
    const { stopOnFail } = wipe
    const testPassed = await qe.runCypress(wipe, config)

    if (!testPassed && stopOnFail) await qe.stopOnFail(config, 'wipe')
  }

  return qe.toc(START)
}
