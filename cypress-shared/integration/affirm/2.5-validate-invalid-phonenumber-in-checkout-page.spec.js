/* eslint-disable jest/expect-expect */
import {
  preserveCookie,
  updateRetry,
  loginViaCookies,
} from '../../support/common/support'
import {
  deleteAddresses,
  getTestVariables,
} from '../../support/common/testcase'
import {
  completeThePayment,
  initiatePayment,
} from '../../support/affirm/testcase.js'
import selectors from '../../support/common/selectors'
import { discountShipping } from '../../support/common/outputvalidation'

const { productName, postalCode, prefix } = discountShipping
const discountShippingProductEnvs = getTestVariables(prefix)

describe('Order the product using Affirm payment', () => {
  loginViaCookies({ storeFrontCookie: true })

  deleteAddresses()

  it(`In ${prefix} - Adding Product to Cart`, updateRetry(3), () => {
    // Search the product
    cy.searchProduct(productName)
    // Add product to cart
    cy.addProduct(productName)
  })
  it('Add the product with invalid phone number', updateRetry(3), () => {
    cy.updateShippingInformation({ postalCode })
  })

  initiatePayment({
    prefix,
    expectedPhoneNo: '(304) 123 4556',
    completePayment: false,
  })
  // completeThePayment(prefix,{sendInvoice : false,completePayment:false})

  it('Validate with invalid phone number', updateRetry(3), () => {
    cy.intercept('POST', `https://sandbox.affirm.com/api/v2/checkout/`).as(
      'updateOrderFormShipping'
    )

    /* eslint-disable jest/valid-expect-in-promise */
    cy.wait('@updateOrderFormShipping')
      .its('response')
      .then((response) => {
        expect(response.body.message).includes('Please enter a valid mobile')
      })
  })

  it('close the pop up', updateRetry(3), () => {
    cy.getIframeBody(selectors.popUpClose).should('be.visible')
    cy.getIframeBody(selectors.popUpClose)
      .find(selectors.invalidPopUpCloseBtn)
      .should('be.visible')
      .click()
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(10000)
    cy.get(selectors.dataReviewCloseBtn).click()
  })

  completeThePayment(discountShipping, discountShippingProductEnvs)

  preserveCookie()
})
