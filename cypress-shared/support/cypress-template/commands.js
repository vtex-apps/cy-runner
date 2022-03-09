Cypress.Commands.add('getVtexItems', () => {
  return cy.wrap(Cypress.env().base.vtex, { log: false })
})

Cypress.Commands.add('getGmailItems', () => {
  return cy.wrap(Cypress.env().base.gmail, { log: false })
})
