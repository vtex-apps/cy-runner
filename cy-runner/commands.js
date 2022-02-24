// Configure it to preserve cookies
Cypress.Cookies.defaults({
  preserve: /VtexIdclientAutCookie/,
})

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
  const LONG_TIME_OUT = 100000
  const SHORT_TIME_OUT = 10000
  switch (command.split(' ')[0]) {
    case 'workspace':
      return cy.exec(`echo y | ${VTEX_BIN} ${command} --no-color`, {
        timeout: SHORT_TIME_OUT,
      })
    case 'link':
      return cy.exec(`echo y | ${VTEX_BIN} ${command} --no-watch --no-color`, {
        timeout: LONG_TIME_OUT,
      })
    case 'uninstall':
      return cy.exec(`echo y | ${VTEX_BIN} ${command} --no-color`, {
        timeout: SHORT_TIME_OUT,
      })
    default:
      return cy.exec(`${VTEX_BIN} ${command} --no-color`, {
        timeout: SHORT_TIME_OUT,
        failOnNonZeroExit: false,
      })
  }
})

// Get Twilio OTP
Cypress.Commands.add('getTwilioOTP', (url, sid, token, wait) => {
  cy.wait(wait) // eslint-disable-line cypress/no-unnecessary-waiting
  cy.request({
    method: 'GET',
    url: url,
    form: true,
    auth: {
      username: sid,
      password: token,
    },
    failOnStatusCode: false,
  }).then((response) => {
    let code = response.body.messages[0].body
    return code.substring(0, 6)
  })
})
