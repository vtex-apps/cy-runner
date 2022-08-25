/* eslint-disable jest/expect-expect */
import {
  loginViaCookies,
  preserveCookie,
  updateRetry,
  saveOrderId,
} from '../../support/common/support.js'
import { singleProduct } from '../../support/affirm-payment/outputvalidation'
import selectors from '../../support/common/selectors.js'

const { prefix, productName, postalCode } = singleProduct

describe(`${prefix} Scenarios`, () => {
  loginViaCookies()

  it(`In ${prefix} - Adding Product to Cart`, updateRetry(3), () => {
    cy.clearLocalStorage()
    // Search the product
    cy.searchProduct(productName)
    // Add product to cart
    cy.addProduct(productName, { proceedtoCheckout: true })
  })

  it(`In ${prefix} - Updating Shipping Information`, updateRetry(3), () => {
    // Update Shipping Section
    cy.updateShippingInformation({
      postalCode,
      phoneNumber: '(312) 310 3249',
      timeout: 10000,
    })
  })

  it(`In ${prefix} - Initiate payment`, updateRetry(3), () => {
    cy.get(selectors.Profile).should('be.visible').click()
    cy.get(selectors.Phone)
      .invoke('val')
      .then((phone) => {
        if (phone !== '(312) 310 3249') {
          cy.get(selectors.Phone).clear().type('(312) 310 3249', {
            delay: 100,
          })
        }
      })

    cy.get(selectors.ProceedtoShipping).should('be.visible').click()
    cy.get(selectors.AffirmPaymentOption).should('be.visible').click()
    cy.get(selectors.InstallmentContainer)
      .should('be.visible')
      .contains('Total')
    cy.get(selectors.BuyNowBtn).last().should('be.visible').click()
  })

  it(`In ${prefix} - Complete payment`, () => {
    cy.getIframeBody('#checkout-application')
      .find(selectors.AffirmPhoneNumberField, { timeout: 45000 })
      .should('be.visible')
      .type('3123103249')

    cy.getIframeBody('#checkout-application')
      .find(selectors.AffirmSubmit)
      .should('be.visible')
      .click()

    cy.getIframeBody('#checkout-application')
      .find(selectors.AffirmPhonePin)
      .type('1234')

    cy.getIframeBody('#checkout-application')
      .find('h1')
      .should('have.text', "You're approved!")

    cy.getIframeBody('#checkout-application')
      .find(selectors.AffirmInstallmentOption)
      .first()
      .click()

    cy.getIframeBody('#checkout-application')
      .find(selectors.AffirmIndicatorOption)
      .first()
      .click()

    cy.getIframeBody('#checkout-application')
      .find(selectors.AffirmIndicatorOption)
      .last()
      .click()

    cy.getIframeBody('#checkout-application')
      .find(selectors.AffirmSubmit)
      .click()

    cy.getIframeBody('#checkout-application')
      .contains('Thanks')
      .should('be.visible')
    saveOrderId(prefix)
  })

  preserveCookie()
})
// A https://sandbox.affirm.com/checkout/84971L7SGAB1MVTX/new/GGJZFRF9QXF6I48L/?skip_to_pin=0&use_headers=0&locale=en_US&external_modal=0&country_code=USA&fs=1&
// A https://sandbox.affirm.com/checkout/84971L7SGAB1MVTX/new/O3LYKMNL23FNYFSO/?skip_to_pin=0&use_headers=0&locale=en_US&external_modal=0&country_code=USA&fs=1&device_id=f4530555-8a0b-4304-bb8c-3a459ef178ed&origin=https%3A%2F%2Fsyedaffirm--productusqa.myvtex.com&frameId=checkout-application
// BCypress https://sandbox.affirm.com/checkout/84971L7SGAB1MVTX/new/GGJZFRF9QXF6I48L/?skip_to_pin=0&use_headers=0&locale=en_US&external_modal=0&country_code=USA
