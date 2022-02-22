// / <reference types="cypress" />
import { testSetup } from '../../support/cypress-template/common_support.js'
import {
  configureTargetWorkspace,
  configureTaxConfigurationInOrderForm,
} from '../../support/cypress-template/common_testcase.js'
import {
  ordersBroadcast,
  sno,
} from '../../support/cypress-template/edition_app_list.js'

describe('Teardown the environment', () => {
  testSetup()

  // Configure tax configuration to {} in order form API,broadcast and sno application
  configureTaxConfigurationInOrderForm()

  configureTargetWorkspace(ordersBroadcast.app, ordersBroadcast.version)

  configureTargetWorkspace(sno.app, sno.version)

  // Unlink App
  it('Unlinking App', () => {
    cy.vtex('unlink -a')
      .its('stdout')
      .should('contain', 'Successfully unlinked all apps')
  })

  // Delete the workspace
  it('Deleting the workspace', () => {
    cy.getVtexItems().then((vtex) => {
      if (vtex.WORKSPACE !== 'dev') {
        cy.vtex(`workspace delete -f ${vtex.WORKSPACE}`)
          .its('stdout')
          .should('contain', 'deleted')
      }
    })
  })
})
