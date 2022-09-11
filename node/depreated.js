const { get } = require('lodash')

const logger = require('./logger')

module.exports.deprecated = async (config) => {
  // Let's try to warn deprecated features
  const DEPRECATED = [
    'base.vtex.deployCli',
    'base.twilio',
    'base.cypress.sorry',
  ]

  const FOUND = []

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
    logger.msgWarn('You should remove it on your next commit')
  }
}
