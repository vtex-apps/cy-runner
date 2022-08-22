import './common/commands'
import './b2b/env_organization'
import './b2b/env_quotes'
import './commands'
import './common/api_commands'
import './common/env_orders'

// Configure it to preserve cookies
Cypress.Cookies.defaults({
  preserve: /VtexIdclientAutCookie|csrftoken/,
})

Cypress.on('uncaught:exception', (_, __) => {
  return false
})

// // // Reference:https://stackoverflow.com/questions/48661153/cypress-seems-to-have-stalled
// Cypress.on('window:before:load', (win) => {
//   if (win.location.href.includes('sandbox')) {
//     console.log(win.location.href)
//     Object.defineProperty(win, 'self', {
//       get: () => {
//         return window.top
//       },
//     })
//   }
// })
