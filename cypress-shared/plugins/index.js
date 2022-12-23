/**
 * @type {Cypress.PluginConfig}
 */
// eslint-disable-next-line no-unused-vars
// module.exports = (on, config) => {}

Cypress.on('uncaught:exception', (_, __) => {
  // returning false here prevents Cypress from
  // failing the test
  return false
})

const readXlsx = require('./read-xlsx')

module.exports = (on) => {
  on('task', {
    readXlsx: readXlsx.read,
  })
}
