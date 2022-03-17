import './common/commands'
import './b2b/env_organization'
import './b2b/env_quotes'
import './commands'

// Configure it to preserve cookies
Cypress.Cookies.defaults({
  preserve: 'VtexIdclientAutCookie',
})

// Cypress.on('uncaught:exception', () => {
//   // returning false here prevents Cypress from
//   // failing the test
//   return false
// })

// Alternatively you can use CommonJS syntax:
// require('./commands')
