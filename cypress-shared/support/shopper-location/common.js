import selectors from '../common/selectors'
import { scroll, updateRetry } from '../common/support'
import shopperLocationSelectors from './selectors'
import shopperLocationConstants from './constants'
import { mockLocation } from './geolocation'

export function verifyShopperLocation() {
  cy.get(shopperLocationSelectors.verifyLocationInHome).should('be.visible')
  // eslint-disable-next-line cypress/no-force
  cy.get(shopperLocationSelectors.AddToCart)
    .contains('Add to cart')
    .click({ force: true })
  cy.get(shopperLocationSelectors.ProceedToCheckOut).click()
  cy.get(shopperLocationSelectors.orderButton).should('be.visible').click()
}

export function addLocation(data) {
  cy.intercept('**/rc.vtex.com.br/api/events').as('events')
  cy.visit('/', mockLocation(data.lat, data.long))
  cy.wait('@events')
  cy.get(selectors.ProfileLabel, { timeout: 20000 })
    .should('be.visible')
    .should('have.contain', `Hello,`)
  scroll()
  cy.get(shopperLocationSelectors.addressContainer).click()
  cy.get(shopperLocationSelectors.countryDropdown).select(data.country)
  cy.get(shopperLocationSelectors.addressInputContainer)
    .find('input')
    .first()
    .clear()
    .should('be.visible')
    .type(data.postalCode)
  cy.getVtexItems().then((vtex) => {
    cy.intercept('POST', `${vtex.baseUrl}/**`, (req) => {
      if (req.body.operationName === 'setRegionId') {
        req.continue()
      }
    }).as('setRegionId')
    cy.once('uncaught:exception', () => {
      return false
    })
    cy.get(shopperLocationSelectors.SaveButton).should('be.visible').click()
    cy.wait('@setRegionId', { timeout: 20000 })
  })
}

export function verifyLocation(lat, long) {
  cy.intercept('**/rc.vtex.com.br/api/events').as('events')
  cy.visit('/', mockLocation(lat, long))
  cy.wait('@events')
  cy.get(selectors.ProfileLabel, { timeout: 20000 })
    .should('be.visible')
    .should('have.contain', `Hello,`)
  scroll()
  cy.get(shopperLocationSelectors.addressContainer).should('be.visible')
  cy.get(shopperLocationSelectors.addressContainer).click()
  cy.get(shopperLocationSelectors.AddressModelLayout).should('be.visible')
  cy.get(shopperLocationSelectors.ChangeLocationButton).click()
}

export function addAddress({ country, postalCode, lat, long }) {
  it(
    'Go to store front and add canada shipping address',
    updateRetry(1),
    () => {
      cy.intercept('**/rc.vtex.com.br/api/events').as('events')
      cy.visit('/', mockLocation(lat, long))
      cy.wait('@events')
      cy.get(selectors.ProfileLabel, { timeout: 20000 })
        .should('be.visible')
        .should('have.contain', `Hello,`)
      scroll()
      cy.get(shopperLocationSelectors.addressContainer)
        .should('be.visible')
        .click()
      cy.get(shopperLocationSelectors.findMyLocation).click()
      cy.get(shopperLocationSelectors.AddressErrorContainer).contains(
        shopperLocationConstants.locationNotAvailable
      )
      cy.get(shopperLocationSelectors.closeButton).click()
      scroll()
      cy.get(shopperLocationSelectors.verifyLocationInHome).should('be.visible')
      // .contains('Add Location')
      cy.get(shopperLocationSelectors.addressContainer)
        .should('be.visible')
        .click()
      cy.get(shopperLocationSelectors.countryDropdown).select(country)
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.get(shopperLocationSelectors.addressInputContainer)
        .find('input')
        .first()
        .clear()
        .type(postalCode)
        .wait(500)
      autocomplete('Essex County', 'Ontario')
      cy.get(shopperLocationSelectors.saveButton)
        .find('button')
        .click()
        .should(() => {
          expect(localStorage.getItem('orderform')).not.to.be.empty
        })
    }
  )
}

export function autocomplete(city, province) {
  cy.getVtexItems().then((vtex) => {
    cy.intercept('POST', vtex.baseUrl).as('events')
    cy.wait('@events')
    cy.get(shopperLocationSelectors.addressInputContainer)
      .find('input')
      .last()
      .invoke('val')
      .should('equal', city)
    cy.get(shopperLocationSelectors.province)
      .find('option:selected')
      .should('have.text', province)
  })
}

export function orderProductTestCase(data) {
  it('Adding Location', updateRetry(3), () => {
    addLocation(data)
  })

  it('Verifying Address in home page & checkout page', updateRetry(3), () => {
    verifyShopperLocation()
  })

  it('Ordering the product', updateRetry(3), () => {
    cy.orderProduct()
  })
}
