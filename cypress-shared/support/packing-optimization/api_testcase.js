import { packAll } from './apis.js'
import { updateRetry } from '../common/support'

const config = Cypress.env()

const { baseUrl, AccessKey } = config.base.vtex

export function pack(data) {
  it('Pack All', updateRetry(3), () => {
    cy.callRestAPIAndAddLogs({
      url: packAll(baseUrl),
      headers: {
        AccessKey,
      },
      body: data,
    }).then((response) => {
      expect(response.status).to.have.equal(200)
      expect(response.body.packedResults)
        .to.be.an('array')
        .and.to.have.lengthOf.above(0)
    })
  })
}
