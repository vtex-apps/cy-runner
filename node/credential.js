const qe = require('./utils')

exports.credentials = async (config) => {
  const START = qe.tick()

  if (config.base.secrets.enabled && config.base.cypress.getCookies) {
    // Admin cookie
    qe.msgSection('Cookies')
    qe.msg('Getting cookies', 'warn')
    const axiosConfig = {
      url: config.base.vtex.vtexIdUrl,
      method: 'get',
      params: {
        user: config.base.vtex.apiKey,
        pass: config.base.vtex.apiToken,
      },
    }

    qe.msg('Requesting admin cookie', true, true)

    try {
      const response = await qe.request(axiosConfig)

      if (response) {
        if (response.data.authStatus !== 'Success') {
          qe.crash(
            'Failed to get admin credentials',
            'Check the secrets vtex.apiToken and vtex.apiKey'
          )
        }

        const cookieName = response.data.authCookie.Name
        const cookieValue = response.data.authCookie.Value

        config.base.vtex.authCookieName = cookieName
        config.base.vtex.adminAuthCookieValue = cookieValue

        config.base.vtex.baseUrl = qe.generateBaseUrl(config)

        // User cookie
        qe.msg('Requesting user cookie', true, true)
        const vtexBin = config.base.vtex.bin
        const tlb = await qe.toolbelt(vtexBin, 'local token')

        if (tlb.success) {
          config.base.vtex.userAuthCookieValue = tlb.stdout.slice(0, -1)
          qe.writeEnvJson(config)
        } else {
          qe.crash(
            'Failed to get robot credentials',
            'You logged out from toolbelt while the test is running?'
          )
        }
      }
    } catch (e) {
      qe.crash('Fail on axios', e)
    }
  }

  return {
    config,
    time: qe.toc(START),
  }
}
