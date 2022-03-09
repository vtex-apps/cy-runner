// ***********************************************
// Keeps the variables of the environment
// ***********************************************

// File to persist env between tests
const organizationJson = '.organization.json'

// Set Organization item
Cypress.Commands.add(
  'setOrganizationItem',
  (organizationItem, organizationValue) => {
    cy.readFile(organizationJson).then((items) => {
      items[organizationItem] = organizationValue
      cy.writeFile(organizationJson, items)
    })
  }
)

// Get Organization vars
Cypress.Commands.add('getOrganizationItems', () => {
  cy.readFile(organizationJson).then((items) => {
    return items
  })
})
