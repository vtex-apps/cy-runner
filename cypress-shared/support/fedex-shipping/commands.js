const fedexJson = '.fedexPayload.json'

Cypress.Commands.add('writeAppSettingstoJSON', (data) => {
  cy.writeFile(fedexJson, data)
})

Cypress.Commands.add('hideSla', (hide) => {
  cy.readFile('.fedexPayload.json').then((items) => {
    const { slaSettings } = items.data.getAppSettings

    for (const ship in slaSettings) {
      slaSettings[ship].hidden = hide
    }

    return slaSettings
  })
})

Cypress.Commands.add('readAppSettingsFromJSON', () => {
  cy.readFile('.fedexPayload.json').then((items) => {
    const { slaSettings } = items.data.getAppSettings

    return slaSettings
  })
})
