const qe = require('./utils')

module.exports.wipe = async (config) => {
  const START = qe.tick()
  const { wipe } = config.workspace

  if (wipe.enabled) {
    const sensitiveFiles = ['cypress.env.json', 'cypress.json']

    qe.msg(`Wiping data`, 'warn')
    const { stopOnFail } = wipe
    const result = await qe.runCypress(wipe, config, {}, true)

    if (result[0].totalFailed) {
      qe.msg('Failed to clean data', 'error')
      if (stopOnFail) {
        qe.crash('Stop due to stopOnFail', 'Wipe failed')
      }
    } else {
      qe.msg('Success to clean data')
    }

    qe.msg('Removing sensitive files', 'warn')
    sensitiveFiles.forEach((file) => {
      qe.msg(file, true, true)
      qe.storage(file, 'rm')
    })
    qe.msg('Sensitive files removed')
  }

  return qe.tock(START)
}
