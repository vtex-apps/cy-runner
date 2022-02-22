// File to save state, must exist beforehand
Cypress.Commands.add('addConfig', (file, key, item, value) => {
  cy.readFile(file).then((json) => {
    if (typeof json[key] == 'undefined') json[key] = {}
    json[key][item] = value
    cy.writeFile(file, json)
  })
})

// Run VTEX CLI commands
Cypress.Commands.add('vtex', (command) => {
  const VTEX_BIN = 'vtex-e2e'
  const LONG_TIME_OUT = 120000
  const SHORT_TIME_OUT = 20000
  switch (command.split(' ')[0]) {
    case 'workspace':
      return cy.exec(`echo y | ${VTEX_BIN} ${command}`, {
        timeout: SHORT_TIME_OUT,
      })
    case 'link':
      return cy.exec(`echo y | ${VTEX_BIN} ${command} --no-watch`, {
        timeout: LONG_TIME_OUT,
      })
    default:
      return cy.exec(`${VTEX_BIN} ${command}`, {
        timeout: SHORT_TIME_OUT,
      })
  }
})
