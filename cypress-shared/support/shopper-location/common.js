import selectors from '../common/selectors'
import { scroll, updateRetry } from '../common/support'
import { mockLocation } from './geolocation'

export function verifyShopperLocation() {
  cy.get(selectors.verifyLocationInHome).should('be.visible')
  // eslint-disable-next-line cypress/no-force
  cy.get(selectors.AddToCart).contains('Add to cart').click({ force: true })
  cy.get(selectors.ProceedToCheckOut).click()
  cy.get(selectors.orderButton).should('be.visible').click()
}

export function addLocation(data) {
  cy.intercept('**/rc.vtex.com.br/api/events').as('events')
  cy.visit('/', mockLocation(data.lat, data.long))
  cy.wait('@events')
  cy.get(selectors.ProfileLabel, { timeout: 20000 })
    .should('be.visible')
    .should('have.contain', `Hello,`)
  scroll()
  cy.get(selectors.addressContainer).click()
  cy.get(selectors.countryDropdown).select(data.country)
  cy.get(selectors.addressInputContainer)
    // .find('input')
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
    cy.get(selectors.SaveButton).should('be.visible').click()
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
  cy.get(selectors.addressContainer).should('be.visible')
  cy.get(selectors.addressContainer).click()
  cy.get(selectors.AddressModelLayout).should('be.visible')
  cy.get(selectors.ChangeLocationButton).click()
}

export function addAddress({ address, lat, long }) {
  it('Go to store front and add shipping address', updateRetry(1), () => {
    cy.intercept('**/rc.vtex.com.br/api/events').as('events')
    cy.visit('/', mockLocation(lat, long))
    cy.wait('@events')
    cy.get(selectors.ProfileLabel, { timeout: 20000 })
      .should('be.visible')
      .should('have.contain', `Hello,`)
    scroll()
    // cy.waitForGraphql('address', selectors.addressContainer)
    cy.get(selectors.addressContainer).should('be.visible').click()
    cy.get(selectors.findMyLocation).click()

    cy.get(selectors.countryDropdown).select(address.country)
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.get(selectors.addressInputContainer)
      // .find('input')
      .first()
      .clear()
      .type(address.postalCode)
      .wait(500)
    autocomplete(address.city, address.state)
    cy.get(selectors.saveButton)
      .find('button')
      .click()
      .should(() => {
        expect(localStorage.getItem('orderform')).not.to.be.empty
      })
  })
}

export function autocomplete(city, province) {
  cy.getVtexItems().then((vtex) => {
    cy.intercept('POST', vtex.baseUrl).as('events')
    cy.wait('@events')
    cy.get(selectors.addressInputContainer)
      // .find('input')
      .eq(2)
      .invoke('val')
      .should('equal', city)
    if (province === 'IDF') {
      cy.get(selectors.addressInputContainer)
        // .find('input')
        .eq(3)
        .invoke('val')
        .should('equal', province)
    } else {
      cy.get(selectors.province)
        .find('option:selected')
        .last()
        .should('have.text', province)
    }
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
