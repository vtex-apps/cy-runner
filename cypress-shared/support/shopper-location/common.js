import selectors from '../common/selectors'
import { scroll, updateRetry } from '../common/support'
import { mockLocation } from './geolocation'

export function verifyShopperLocation() {
  cy.get(selectors.SaveButtonInChangeLocationPopUp).should('not.exist')
  cy.get(selectors.verifyLocationInHome).should('be.visible')
  // eslint-disable-next-line cypress/no-force
  cy.get(selectors.AddToCart)
    .contains(/Add to Cart/i)
    .should('be.visible')
    .click({ force: true })
  cy.get(selectors.ProceedToCheckOut).should('be.visible').click()
  cy.get(selectors.orderButton).click()
}

export function addLocation(data) {
  cy.intercept('**/event-api/v1/*/event').as('events')
  cy.qe('Visit Store frontend')
  cy.visit('/', mockLocation(data.lat, data.long))
  cy.wait('@events')
  cy.get(selectors.ProfileLabel, { timeout: 10000 })
    .should('be.visible')
    .should('have.contain', `Hello,`)
  scroll()
  cy.qe(
    'Address container should be visible in the top left of the home page & click on it'
  )
  cy.get(selectors.addressContainer).click()
  cy.qe('Add shipping address')
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
    cy.intercept('POST', `${vtex.baseUrl}/**`, (req) => {
      if (req.body.operationName === 'updateOrderFormShipping') {
        req.continue()
      }
    }).as('updateOrderFormShipping')
    cy.once('uncaught:exception', () => {
      return false
    })
    cy.get(selectors.SaveButtonInChangeLocationPopUp)
      .should('be.visible')
      .click()
    cy.wait('@setRegionId', { timeout: 10000 })
    cy.wait('@updateOrderFormShipping', { timeout: 10000 })
  })
}

export function verifyLocation(lat, long) {
  cy.intercept('**/event-api/v1/*/event').as('events')
  cy.qe(`${lat ? 'Enable' : 'Disable'} location permission in the browser`)
  cy.visit('/', mockLocation(lat, long))
  cy.qe('Visit store front')
  cy.wait('@events')
  cy.get(selectors.ProfileLabel, { timeout: 10000 })
    .should('be.visible')
    .should('have.contain', `Hello,`)
  scroll()
  cy.qe('Address container should be visible in the top left of the home page')
  cy.get(selectors.addressContainer).should('be.visible')
  cy.qe('On click to address container should open a popup')
  cy.get(selectors.addressContainer).click()
  cy.get(selectors.AddressModelLayout).should('be.visible')
  cy.qe('Now user should see change location button inside the popup')
  cy.get(selectors.ChangeLocationButton).click()
}

export function addAddress(prefix, { address, lat, long }) {
  it(
    `${prefix} - Go to store front and add shipping address`,
    updateRetry(1),
    () => {
      cy.intercept('**/event-api/v1/*/event').as('events')
      cy.qe(
        'Visiting store front and using mocklocation function to setting the location'
      )
      cy.visit('/', mockLocation(lat, long))
      cy.wait('@events')
      cy.get(selectors.ProfileLabel, { timeout: 10000 })
        .should('be.visible')
        .should('have.contain', `Hello,`)
      scroll()
      cy.qe(
        'Address container should be visible in the top left of the home page & on click to address container should open a popup'
      )
      cy.get(selectors.addressContainer, { timeout: 20000 })
        .should('be.visible')
        .click()
      cy.qe('Adding the shipping address')
      cy.get(selectors.findMyLocation).click()
      cy.qe('Adding the shipping address')
      cy.get(selectors.countryDropdown).select(address.country)
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.get(selectors.addressInputContainer)
        .first()
        .should('not.be.disabled')
        .clear()
        .type(address.postalCode, { delay: 100 })
      autocomplete(address.city, address.state)
      cy.get(selectors.SaveButtonInChangeLocationPopUp)
        .should('be.visible')
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
    cy.intercept('GET', '**=US').as('maps')
    cy.get(`div[class*=addressInputContainer] input[value="${city}"]`)
      .invoke('val')
      .should('equal', city)
    cy.wait('@maps').its('response.statusCode').should('equal', 200)
    cy.get(selectors.ShopperLocationTextFields).should('be.visible')
    cy.get(selectors.ShopperLocationTextFields).then((elements) => {
      if (elements.length === 4) {
        cy.get(selectors.ProvinceField).should('exist').select(province)
      } else {
        cy.get(selectors.ShopperLocationTextFields)
          .last()
          .should('not.have.value', '')
          .clear()
          .type(province)
      }
    })
  })
}

export function orderProductTestCase(
  prefix,
  { country, postalCode, address, city }
) {
  it(`${prefix} - Adding Location`, updateRetry(2), () => {
    cy.qe(
      `Here it shows the browser popup of location allow or disable.Have to click on ${prefix}.Add the shipping address`
    )
    cy.addNewLocation(country, postalCode, address, city)
  })

  it(
    `${prefix} - Verifying Address in home page & checkout page`,
    updateRetry(2),
    () => {
      cy.qe(
        'Verifying the address container in homepage and in checkout page of the saved address is showing'
      )
      verifyShopperLocation()
    }
  )

  it(`${prefix} - Ordering the product`, updateRetry(2), () => {
    cy.qe(
      'After veriying the address in checkout page,have to make promissory payment and ordering a product'
    )
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
    cy.qe('Verify address container is visible under product')
    cy.get(selectors.addressContainer).should('be.visible')
    cy.qe('Verify city is visible under the product')
    cy.get(selectors.AddressCity).contains(city)
    cy.qe('Verify postal code under the product')
    cy.get(selectors.AddressZip).contains(postalCode)
    cy.get(selectors.Distance).contains('Distance:')
    cy.wait('@updateOrderFormShipping', { timeout: 20000 })
  })
}
