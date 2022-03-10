# Cypress-Template

The repo contains common selectors, apis, constants, support file that can be used for test automation with VTEX apps using Cypress

Steps:

1. Install Cypress in your vtex-apps repo
   `yarn add -D cypress`
2. Open cypress `yarn cypress open` - This creates Cypress directory and Cypress.json file
3. Copy cypress.json from this repo and paste in your repo. Update the keys appropriately
4. Go into cypress/support directory
   `cd cypress/support`
5. Add cypress-template as a submodule in the cypress/support directory by executing the command below,
   `git clone --recurse-submodules git@github.com:vtex/cypress-template.git`
6. Now, you can import selectors, apis, constants in your code
7. To make cypress commands available in your test case
   `eg: loginAsAdmin`
   You need to open cypress/support/commands.js file
   Add below lines of code

   ```nodejs
    import {loginAsAdmin} from './cypress-template/common_support.js'
    Cypress.Commands.add('loginAsAdmin', loginAsAdmin)
   ```

8. Now you can call `cy.loginAsAdmin()` in your code
9. To pull latest code from Github submodule branch
   git submodule update --recursive --remote

References:

1. Cypress - https://www.cypress.io/
2. Git Submodules - https://git-scm.com/book/en/v2/Git-Tools-Submodules
