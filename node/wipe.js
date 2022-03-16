const qe = require('./utils')

module.exports.wipe = async (config) => {
  const START = qe.tick()
  const { wipe } = config.workspace

  if (wipe.enabled) {
    const tempFiles = ['cypress.env.json', 'cypress.json']

    qe.msg(`Wiping data`, 'ok', false, true)
    const { stopOnFail } = wipe
    const result = await qe.runCypress(wipe, config, {}, true)

    if (result) {
      qe.msg('done', 'complete', true)
    } else {
      qe.msg('error', 'complete', true)
      if (stopOnFail) {
        qe.crash('Stop due to stopOnFail', 'Wipe failed')
      }
    }

    qe.msg('Removing temporary files', 'warn')
    tempFiles.forEach((file) => {
      qe.msg(file, true, true)
      qe.storage(file, 'rm')
    })
    config.base.stateFiles.forEach((file) => {
      qe.msg(file, true, true)
      qe.storage(file, 'rm')
    })
    qe.msg('Temporary files removed')
  }

  return qe.toc(START)
}
