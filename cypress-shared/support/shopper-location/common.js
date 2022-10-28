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
  cy.get(selectors.ProfileLabel, { timeout: 10000 })
    .should('be.visible')
    .should('have.contain', `Hello,`)
  scroll()
  cy.get(selectors.addressContainer).click()
  cy.get(selectors.countryDropdown).select(data.country)
  cy.get(selectors.addressInputContainer)
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
    cy.wait('@setRegionId', { timeout: 10000 })
  })
}

export function verifyLocation(lat, long) {
  cy.intercept('**/rc.vtex.com.br/api/events').as('events')
  cy.visit('/', mockLocation(lat, long))
  cy.wait('@events')
  cy.get(selectors.ProfileLabel, { timeout: 10000 })
    .should('be.visible')
    .should('have.contain', `Hello,`)
  scroll()
  cy.get(selectors.addressContainer).should('be.visible')
  cy.get(selectors.addressContainer).click()
  cy.get(selectors.AddressModelLayout).should('be.visible')
  cy.get(selectors.ChangeLocationButton).click()
}

export function addAddress(prefix, { address, lat, long }) {
  it(
    `${prefix} - Go to store front and add shipping address`,
    updateRetry(1),
    () => {
      cy.intercept('**/rc.vtex.com.br/api/events').as('events')
      cy.visit('/', mockLocation(lat, long))
      cy.wait('@events')
      cy.get(selectors.ProfileLabel, { timeout: 10000 })
        .should('be.visible')
        .should('have.contain', `Hello,`)
      scroll()
      cy.get(selectors.addressContainer, { timeout: 20000 })
        .should('be.visible')
        .click()
      cy.get(selectors.findMyLocation).click()

      cy.get(selectors.countryDropdown).select(address.country)
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.get(selectors.addressInputContainer)
        .first()
        .should('not.be.disabled')
        .clear()
        .type(address.postalCode, { delay: 100 })
      autocomplete(address.city, address.state)
      cy.get(selectors.saveButton)
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
    cy.get(`div[class*=addressInputContainer] input[value="${city}"]`)
      .invoke('val')
      .should('equal', city)
    cy.get(selectors.ProvinceField).should('exist').select(province)
  })
}

export function orderProductTestCase(prefix, data) {
  it(`${prefix} - Adding Location`, updateRetry(2), () => {
    addLocation(data)
  })

  it(
    `${prefix} - Verifying Address in home page & checkout page`,
    updateRetry(2),
    () => {
      verifyShopperLocation()
    }
  )

  it(`${prefix} - Ordering the product`, updateRetry(2), () => {
    cy.orderProduct()
  })
}

export function verifyHomePage(city, postalCode) {
  // cy.get('div[class*=vtex-modal-layout]').should('not.be.visible')
  cy.scrollTo(0, 500)
  cy.getVtexItems().then((vtex) => {
    cy.intercept('POST', `${vtex.baseUrl}/**`, (req) => {
      if (req.body.operationName === 'updateOrderFormShipping') {
        req.continue()
      }
    }).as('updateOrderFormShipping')
    cy.get(selectors.addressContainer).should('be.visible')
    cy.get(selectors.AddressCity).contains(city)
    cy.get(selectors.AddressZip).contains(postalCode)
    cy.get(selectors.Distance).contains('Distance:')
    cy.wait('@updateOrderFormShipping', { timeout: 20000 })
  })
}
