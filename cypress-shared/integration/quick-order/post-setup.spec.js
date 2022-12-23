import { loginViaCookies } from '../../support/common/support.js'

describe('Create cypress plugin file', () => {
  loginViaCookies()

  it('Write cypress/plugins/index.js', () => {
    cy.writeFile(
      './cypress/plugins/index.js',
      `
      const readXlsx = require('../../cypress-shared/plugins/read-xlsx.js')

      module.exports = (on) => {
        on('task', {
        readXlsx: readXlsx.read,
      })
      }
    `
    )
  })
})
