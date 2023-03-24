import selectors from '../common/selectors'
import { updateRetry } from '../common/support'
import { getPickupPoints, deletePickupPoint } from './pickup-points.api'

export function verifyUpdatedAddress(postalCode, address, city, state) {
  it('Verify on click to postal code it opens the location popup', () => {
    cy.qe('In specification page clicking on address container')
    cy.get(selectors.AvailabilityHeader).click()
    cy.qe(
      'Once address container clicked, it will show an popup of layout to add shipping address'
    )
    cy.get(selectors.AddressModelLayout).should('be.visible')
    cy.get(selectors.countryDropdown).select('USA')
    cy.get(selectors.addressInputContainer).eq(0).clear().type(postalCode)
    if (city) {
      cy.get(selectors.Address)
        .contains('City')
        .parent()
        .within(() => {
          cy.get(selectors.InputText)
            .should('not.have.value', '')
            .clear()
            .type(city)
        })
    }

    if (address) {
      cy.get(selectors.Address)
        .contains('Address Line 1')
        .parent()
        .within(() => {
          cy.get(selectors.InputText).clear().type(address, { delay: 50 })
        })
    }

    if (state) {
      cy.get(selectors.ProvinceField).should('exist').select(state)
    }

    cy.waitForGraphql('setRegionId', selectors.SaveButtonInChangeLocationPopUp)
    cy.once('uncaught:exception', () => false)
  })
  it('Verify updated address is shown in the screen', updateRetry(2), () => {
    cy.get(selectors.AvailabilityHeader).should('have.text', postalCode)
    cy.get(selectors.AddtoCart)
      .contains(/Add to Cart/i)
      .click({ force: true })
    cy.get(selectors.ProceedtoCheckout).click()
    cy.get(selectors.orderButton).should('be.visible').click()
  })
}

export function addPickUpPoint(pickPointName, pickUpId) {
  cy.qe('Clicking Add Pickup Point button in admin')
  cy.contains(/Add Pickup Point/i).click()
  cy.qe('Type a new pickuppoint name')
  cy.get(selectors.PickUpPointName).clear().type(pickPointName)
  cy.qe('Type a new pickuppoint id')
  cy.get(selectors.PickUpPointId).should('be.visible').type(pickUpId)
  cy.qe('Select a USA country')
  cy.get('select')
    .select('United States of America')
    .should('have.value', 'USA')
  /* eslint-disable cypress/no-unnecessary-waiting */
  cy.wait(1000)
  /* eslint-disable cypress/no-unnecessary-waiting */
  cy.qe('Type a street address')
  cy.get(selectors.PickUpAddress)
    .type('1481 Maple View Dr,Promona,CA,USA', { delay: 50 })
    .wait(500)
    .type('{downarrow}{enter}')
  cy.get(selectors.CheckBox).click()
  cy.qe('Adding business hours')
  cy.get(selectors.WorkStartTime).eq(1).type('10:00')
  cy.get(selectors.WorkEndTime).eq(1).type('19:00')
  cy.get(selectors.SaveChanges).click()
  cy.qe("Once save button clicked it show an popup as 'Changes saved'")
  cy.get(selectors.ChangesSaved).should('be.visible').contains('Changes saved')
  cy.contains('Back to pickup points').click()
}

export function deleteAllPickupPoints() {
  const FILTER_PICKUP_POINT_KEY = 'Location availability'

  it(
    `Filter and delete pickup point which starts with "${FILTER_PICKUP_POINT_KEY}"`,
    updateRetry(5),
    () => {
      cy.getVtexItems().then((vtex) => {
        cy.getAPI(getPickupPoints(vtex.baseUrl)).then((response) => {
          // Pickup points created in E2E tests should start with text "pickup example"
          // If we create other pickup points then it will not be deleted in wipe
          const filterPickUpPoints = response.body.filter((b) =>
            b.name.includes(FILTER_PICKUP_POINT_KEY)
          )

          if (filterPickUpPoints.length > 0) {
            for (const element of filterPickUpPoints) {
              cy.callRestAPIAndAddLogs({
                method: 'DELETE',
                url: deletePickupPoint(vtex.baseUrl, element.id),
              }).then((deleteResponse) => {
                expect(deleteResponse.status).to.equal(204)
              })
            }
          }
        })
      })
    }
  )
}
