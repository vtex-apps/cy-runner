import { FAIL_ON_STATUS_CODE, VTEX_AUTH_HEADER } from '../common/constants'
import selectors from '../common/selectors'
import { updateRetry } from '../common/support'
import { getPickupPoints, deletePickupPoint } from './pickup-points.api'

export function verifyUpdatedAddress(postalCode) {
  it('Verify on click to postal code it opens the location popup', () => {
    cy.get(selectors.AvailabilityHeader).click()
    cy.get(selectors.AddressModelLayout).should('be.visible')
    cy.get(selectors.countryDropdown).select('USA')
    cy.get(selectors.addressInputContainer).eq(0).clear().type(postalCode)
    cy.waitForGraphql('address', selectors.SaveButton)
    cy.once('uncaught:exception', () => {
      return false
    })
  })
  it('Verify updated address is shown in the screen', updateRetry(2), () => {
    cy.get(selectors.AvailabilityHeader).should('have.text', postalCode)
    cy.get(selectors.AddtoCart).contains('Add to cart').click({ force: true })
    cy.get(selectors.ProceedtoCheckout).click()
    cy.get(selectors.orderButton).should('be.visible').click()
  })
}

export function addPickUpPoint(pickPointName, pickUpId) {
  cy.contains('Add pickup point').click()
  cy.get(selectors.PickUpPointName).clear().type(pickPointName)
  cy.get(selectors.PickUpPointId).should('be.visible').type(pickUpId)
  cy.get('select')
    .select('United States of America')
    .should('have.value', 'USA')
  /* eslint-disable cypress/no-unnecessary-waiting */
  cy.wait(1000)
  /* eslint-disable cypress/no-unnecessary-waiting */
  cy.get(selectors.PickUpAddress)
    .type('1481 Maple View Dr,Promona,CA,USA', { delay: 50 })
    .wait(500)
    .type('{downarrow}{enter}')
  cy.get(selectors.CheckBox).click()
  cy.get(selectors.WorkStartTime).eq(1).type('10:00')
  cy.get(selectors.WorkEndTime).eq(1).type('19:00')
  cy.get(selectors.SaveChanges).click()
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
              cy.request({
                method: 'DELETE',
                url: deletePickupPoint(vtex.baseUrl, element.id),
                headers: {
                  ...VTEX_AUTH_HEADER(vtex.apiKey, vtex.apiToken),
                },
                ...FAIL_ON_STATUS_CODE,
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
