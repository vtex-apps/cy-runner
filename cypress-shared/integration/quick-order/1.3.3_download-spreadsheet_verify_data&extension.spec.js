import {
  loginViaCookies,
  preserveCookie,
  updateRetry,
} from '../../support/common/support.js'
import { verifyExcelFile } from '../../support/quick-order/testcase'
import { products } from '../../support/quick-order/product.js'

const fileName = 'cypress-shared/downloads/model-quickorder.xls'

describe('Quickorder - Verify the data and extension in the spreadsheet', () => {
  loginViaCookies()

  it('Download the quickOrder spreadsheet', updateRetry(3), () => {
    cy.qe(`Visit the Quickorder Homepage and verify the profile is visible`)
    cy.qe('Verify the url should contain quickorder')
    cy.gotoQuickOrder()
    cy.contains('Click here to download a spreadsheet model').click()
  })

  verifyExcelFile(fileName, products)

  preserveCookie()
})
