const { get } = require('lodash')

const logger = require('./logger')

module.exports.deprecated = async (config) => {
  // Let's try to warn deprecated features
  const FOUND = []
  const DEPRECATED = [
    'base.vtex.deployCli',
    'base.twilio',
    'base.jira.testing',
    'base.cypress.sorry',
    'workspace.linkApp.logOutput',
  ]

  DEPRECATED.forEach((flag) => {
    if (get(config, flag)) FOUND.push(flag)
  })

  // eslint-disable-next-line vtex/prefer-early-return
  if (FOUND.length) {
    logger.msgSection('Deprecation report')
    logger.msgWarn('Deprecated configuration on your cy-runner.yml')
    FOUND.forEach((flag) => {
      logger.msgPad(flag)
    })
    logger.msgOk('You should remove it as soon as possible')
  }
}
