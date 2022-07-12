import selectors from '../common/selectors'
import { updateRetry } from '../common/support'
import shopperLocationSelectors from './selectors'
import { mockLocation } from './geolocation'

function scroll() {
  // So, scroll first then look for selectors
  cy.scrollTo(0, 1000)
  // eslint-disable-next-line cypress/no-unnecessary-waiting
  cy.wait(1000)
  cy.scrollTo(0, -100)
}

export function verifyShopperLocation() {
  cy.get(shopperLocationSelectors.verifyLocationInHome).should('be.visible')
  // .contains('Baltimore, MD, 21287')
  cy.get(shopperLocationSelectors.AddToCart)
    .contains('Add to cart')
    .click({ force: true })
  cy.get(shopperLocationSelectors.ProceedToCheckOut).click()
  cy.get(shopperLocationSelectors.verifyLocationInCheckOut)
    .should('be.visible')
    .contains('Orleans Street')
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
  cy.get(shopperLocationSelectors.Address)
    .should('be.visible')
    .clear()
    .type('Orleans Street')
  cy.intercept('**/maps.googleapis.com/maps/api/geocode/json').as('events')
  cy.wait('@events')
  cy.once('uncaught:exception', () => {
    return false
  })
  cy.get(shopperLocationSelectors.SaveButton).should('be.visible').click()
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

export function addAddress(country, postalCode) {
  cy.intercept('**/rc.vtex.com.br/api/events').as('events')
  cy.visit('/')
  cy.wait('@events')
  cy.get(selectors.ProfileLabel, { timeout: 20000 })
    .should('be.visible')
    .should('have.contain', `Hello,`)
  scroll()
  cy.get(shopperLocationSelectors.addressContainer).should('be.visible').click()
  cy.get(shopperLocationSelectors.countryDropdown).select(country)
  // eslint-disable-next-line cypress/no-unnecessary-waiting
  cy.get(shopperLocationSelectors.addressInputContainer)
    .find('input')
    .first()
    .clear()
    .type(postalCode)
    .wait(500)
  autocomplete('Amherstburg', 'Ontario')
  cy.once('uncaught:exception', () => false)
  cy.get(shopperLocationSelectors.saveButton).find('button').click()
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
