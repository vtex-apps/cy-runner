// ***********************************************
// Keeps the variables of the environment
// ***********************************************

// File to persist env between tests
const quotesJson = '.quotes.json'

// Set VTEX item
Cypress.Commands.add('setQuoteItem', (quoteItem, quoteValue) => {
  cy.readFile(quotesJson).then((items) => {
    items[quoteItem] = quoteValue
    cy.writeFile(quotesJson, items)
  })
})

// Get VTEX vars
Cypress.Commands.add('getQuotesItems', () => {
  cy.readFile(quotesJson).then((items) => {
    return items
  })
})
