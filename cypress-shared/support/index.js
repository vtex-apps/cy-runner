import './common/commands'
import './b2b/env_organization'
import './b2b/env_quotes'
import './commands'
import './common/api_commands'
import './common/env_orders'

// Configure it to preserve cookies
Cypress.Cookies.defaults({
  preserve: 'VtexIdclientAutCookie',
})

Cypress.on('uncaught:exception', (_, __) => {
  return false
})
