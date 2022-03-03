// File to save state, must exist beforehand
Cypress.Commands.add('addConfig', (file, section, key, item, value) => {
  cy.readFile(file).then((json) => {
    if (typeof json[section] == 'undefined') json[section] = {}
    if (typeof json[section][key] == 'undefined') json[section][key] = {}
    json[section][key][item] = value
    cy.writeFile(file, json)
  })
})

// Run VTEX CLI commands
Cypress.Commands.add('vtex', (command) => {
  let config = Cypress.env()
  let authVtexCli = config.testConfig.authVtexCli
  const LONG_TIME_OUT = 100000
  const SHORT_TIME_OUT = 10000
  const VTEX_BIN = authVtexCli.enabled ? 'vtex-e2e' : 'vtex'

  switch (command.split(' ')[0]) {
    case 'workspace':
    case 'uninstall':
      return cy.exec(`echo y | ${VTEX_BIN} ${command} --no-color`, {
        timeout: SHORT_TIME_OUT,
      })
    case 'link':
      return cy.exec(`echo y | ${VTEX_BIN} ${command} --no-watch --no-color`, {
        timeout: LONG_TIME_OUT,
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
