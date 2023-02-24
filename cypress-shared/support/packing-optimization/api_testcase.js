import { packAll } from './apis.js'
import { updateRetry } from '../common/support'
import { FAIL_ON_STATUS_CODE } from '../common/constants'

const config = Cypress.env()

const { baseUrl, AccessKey } = config.base.vtex

export function pack(data) {
  it('Pack All', updateRetry(3), () => {
    cy.qe(
      `curl --location --request POST "https://${baseUrl}/vtexid/pub/authentication/startlogin"`
    )
    cy.request({
      method: 'POST',
      url: packAll(baseUrl),
      headers: {
        AccessKey,
      },
      ...FAIL_ON_STATUS_CODE,
      body: data,
    }).then((response) => {
      expect(response.status).to.have.equal(200)
      expect(response.body.packedResults)
        .to.be.an('array')
        .and.to.have.lengthOf.above(0)
    })
  })
}
