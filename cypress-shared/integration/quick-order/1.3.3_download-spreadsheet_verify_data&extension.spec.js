import {
  loginViaCookies,
  preserveCookie,
  updateRetry,
} from '../../support/common/support.js'
import { verifyExcelFile } from '../../support/quick-order/testcase'
import { products } from '../../support/quick-order/product.js'

const fileName = 'cypress/downloads/model-quickorder.xls'

describe('Quickorder - Verify the data and extension in the spreadsheet', () => {
  loginViaCookies()

  it('Download the quickOrder spreadsheet', updateRetry(3), () => {
    cy.gotoQuickOrder()
    cy.contains('Click here to download a spreadsheet model').click()
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

  verifyExcelFile(fileName, products)

  preserveCookie()
})
