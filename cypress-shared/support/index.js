import './commands'
import './cypress-template/commands'
import './organization-env'
import './quotes-env'

// Configure it to preserve cookies
Cypress.Cookies.defaults({
  preserve: 'VtexIdclientAutCookie',
})

Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from
  // failing the test
  return false
})

// Alternatively you can use CommonJS syntax:
// require('./commands')
