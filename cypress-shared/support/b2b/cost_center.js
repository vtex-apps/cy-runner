import selectors from '../common/selectors.js'
import { validateToastMsg } from './utils.js'
import { GRAPHL_OPERATIONS } from '../graphql_operations.js'
import { BUTTON_LABEL, TOAST_MSG } from '../validation_text.js'
import { updateRetry } from '../common/support.js'

export function addCostCenter(organization, costCenter, costCenterAddress) {
  it(
    `Adding Cost Center ${costCenter} in ${organization}`,
    updateRetry(2),
    () => {
      cy.gotoMyOrganization()
      cy.get(selectors.AddCostCenter).should('be.visible')
      cy.get('body').then(($body) => {
        if ($body.text().includes(costCenter)) {
          cy.qe('CostCenter already added')
        } else {
          cy.qe('Click Add Cost Center')
          cy.get(selectors.AddCostCenter).click()
          cy.qe(`Type ${costCenter} in costCenterName Field`)
          cy.get(selectors.CostCenterName)
            .clear()
            .type(costCenter)
            .should('have.value', costCenter)
          cy.get(selectors.Street)
            .scrollIntoView()
            .should('be.visible')
            .should('be.enabled')
          cy.fillAddressInCostCenter(costCenterAddress)
          cy.waitForGraphql(
            GRAPHL_OPERATIONS.GetCostCentersByOrganizationIdStorefront,
            selectors.SubmitCostCenter
          ).then((req) => {
            cy.qe(
              `Store ${costCenter}:${req.response.body.data.createCostCenter.id} in organization.json`
            )
            cy.setOrganizationItem(
              costCenter,
              req.response.body.data.createCostCenter.id
            )
          })
        }
      })
    }
  )
}

export function updateCostCenter(oldcostCenterName, updatedcostcenterName) {
  it(`Update cost center ${oldcostCenterName}`, updateRetry(1), () => {
    cy.addReloadBetweenRetries()
    cy.gotoCostCenter(oldcostCenterName)
    cy.get(`input[value='${oldcostCenterName}']`)
      .should('be.visible')
      .clear()
      .type(updatedcostcenterName)
    cy.get(selectors.CostCenterHeader)
      .contains(BUTTON_LABEL.save)
      .should('be.visible')
      .click()
    cy.get(`input[value='${updatedcostcenterName}']`).should('be.visible')
  })
}

export function deleteCostCenter(costcenter) {
  it(`Delete cost center ${costcenter}`, updateRetry(1), () => {
    cy.gotoCostCenter(costcenter)
    cy.get('div').contains(BUTTON_LABEL.delete).should('be.visible').click()
    cy.get(selectors.ModalConfirmation).should('be.visible')
    cy.get(selectors.ModalConfirmation)
      .contains(BUTTON_LABEL.delete)
      .last()
      .should('be.visible')
      .click()
    cy.get(selectors.MyOrganizationCostCenterUserDiv).should('have.length', 4)
    cy.contains(costcenter, { timeout: 8000 }).should('not.exist')
  })
}

function submitAddressInCostCenter(postalCode) {
  cy.getVtexItems().then((vtex) => {
    cy.get(selectors.SubmitCostCenter).click()
    cy.get(selectors.PostalCodeInAddressList)
      .last()
      .should('have.text', postalCode)
    cy.intercept('POST', `${vtex.baseUrl}/**`, (req) => {
      if (
        req.body.operationName === GRAPHL_OPERATIONS.GetCostCenterStorefront
      ) {
        req.continue()
      }
    }).as(GRAPHL_OPERATIONS.GetCostCenterStorefront)
    cy.get(selectors.SaveChangesInCostCenter)
      .first()
      .contains(BUTTON_LABEL.save)
      .click()
    cy.wait(`@${GRAPHL_OPERATIONS.GetCostCenterStorefront}`)
    validateToastMsg(TOAST_MSG.updated)
  })
}

export function addAddressinCostCenter(
  costCenter,
  costCenterAddress,
  updatedAddress = false
) {
  it(`Adding New Address for ${costCenter}`, updateRetry(2), () => {
    cy.qe(`Adding New Address for ${costCenter}`)
    cy.gotoCostCenter(costCenter)
    const { postalCode } = costCenterAddress

    cy.get(selectors.PostalCodeInAddressList).then(($els) => {
      const postalCodes = [...$els].map((el) => el.innerText)

      if (updatedAddress) {
        const updatedAddressLoc = postalCodes.indexOf(updatedAddress.postalCode)

        if (updatedAddressLoc !== -1) {
          cy.qe('Address already updated')
        }
      } else {
        cy.get(selectors.PostalCodeInAddressList)
          .last()
          .invoke('text')
          .then((code) => {
            if (code === postalCode) {
              cy.qe('Address already added in CostCenter')
            } else {
              cy.get(selectors.AddAddress).click()
              cy.fillAddressInCostCenter(costCenterAddress)
              submitAddressInCostCenter(postalCode)
            }
          })
      }
    })
  })
}

export function openOptionsForAddress(costCenterAddress) {
  const { postalCode } = costCenterAddress

  cy.get(selectors.PostalCodeInAddressList).then(($els) => {
    const postalCodes = [...$els].map((el) => el.innerText)
    const child = postalCodes.indexOf(postalCode)

    cy.get(selectors.PostalCodeInAddressList)
      .eq(child)
      .should('have.text', postalCode)
    cy.get(selectors.CostCenterOption).eq(child).click()
  })
}

export function updateAddress(
  costCenter,
  currentCostCenterAddress,
  newCostCenterAddress
) {
  it(
    `Updating address & receiver in ${costCenter} for this postalCode ${currentCostCenterAddress.postalCode} to ${newCostCenterAddress.postalCode}`,
    updateRetry(1),
    () => {
      cy.gotoCostCenter(costCenter)
      cy.get(selectors.PostalCodeInAddressList).then(($els) => {
        const postalCodes = [...$els].map((el) => el.innerText)
        const newCostCenterAddressLoc = postalCodes.indexOf(
          newCostCenterAddress.postalCode
        )

        if (newCostCenterAddressLoc !== -1) {
          cy.log('Address already updated')
        } else {
          openOptionsForAddress(currentCostCenterAddress)
          cy.get(selectors.CostCenterAddressEditOption).click()
          const { postalCode } = newCostCenterAddress

          cy.fillAddressInCostCenter(newCostCenterAddress)
          submitAddressInCostCenter(postalCode)
        }
      })
    }
  )
}

export function deleteAddressFromCostCenter(costCenter, costCenterAddress) {
  const { postalCode } = costCenterAddress

  it(
    `Delete Address ${postalCode} from cost center ${costCenter}`,
    updateRetry(1),
    () => {
      cy.gotoCostCenter(costCenter)
      openOptionsForAddress(costCenterAddress)
      cy.get(selectors.CostCenterAddressDeleteOption).click()
      cy.get(selectors.ModalConfirmation).should('be.visible')
      cy.get(selectors.ModalConfirmation)
        .contains(BUTTON_LABEL.delete)
        .last()
        .should('be.visible')
        .click()
      cy.get(selectors.PostalCodeInAddressList).should(
        'not.have.text',
        postalCode
      )
      cy.contains(BUTTON_LABEL.save).should('be.visible').click()
      cy.gotoMyOrganization()
    }
  )
}

export function updatePaymentTermsinCostCenter(
  organization,
  costCenter,
  paymentTerms
) {
  it(
    `Verify Organization Admin is able to disable ${costCenter} the payment terms ${paymentTerms} in ${organization}`,
    updateRetry(2),
    () => {
      cy.qe(
        `Verify Organization Admin is able to disable ${costCenter} the payment terms ${paymentTerms} in ${organization}`
      )
      cy.addReloadBetweenRetries()
      cy.gotoCostCenter(costCenter)
      cy.get(selectors.PromissoryCheckbox)
        .invoke('prop', 'checked')
        .then((checked) => {
          if (checked) {
            cy.qe(`Click PromissoryCheckbox`)
            cy.get(selectors.PromissoryCheckbox).click()
          }
        })
      cy.waitForGraphql(
        GRAPHL_OPERATIONS.GetCostCenterStorefront,
        selectors.SaveChangesInCostCenter
      )
      validateToastMsg(TOAST_MSG.updated)
    }
  )
}
