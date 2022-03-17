// Files to save state
// MUST exist on the plase EMPTY
const ordersJson = '.orders.json'

// Save orders
Cypress.Commands.add('setOrderItem', (orderItem, orderValue) => {
  cy.readFile(ordersJson).then((items) => {
    items[orderItem] = orderValue
    cy.writeFile(ordersJson, items)
  })
})

// Get orders
Cypress.Commands.add('getOrderItems', () => {
  cy.readFile(ordersJson).then((items) => {
    return items
  })
})
