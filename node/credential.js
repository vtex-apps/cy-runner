const qe = require('./utils')

exports.credentials = async (config) => {
  const START = qe.tick()
  if (config.base.secrets.enabled) {
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
    const response = await qe.request(axiosConfig)
    try {
      if (response.data.authStatus !== 'Success')
        qe.crash('Failed to get credentials',
          'Check your secrets vtex.apiToken and vtex.apiKey')
    } catch (e) {
      qe.crash('Fail on axios', e)
    }
    let cookieName = response.data.authCookie.Name
    let cookieValue = response.data.authCookie.Value
    config.base.vtex['authCookieName'] = cookieName
    config.base.vtex['adminAuthCookieValue'] = cookieValue
    // User cookie
    qe.msg('Requesting user cookie', true, true)
    let vtexBin = config.base.vtex.bin
    let cookieRobot = await qe.toolbelt(vtexBin, 'local token')
    config.base.vtex['userAuthCookieValue'] = cookieRobot.slice(0, -1)
    qe.writeEnvJson(config)
  }
  return {
    config: config, time: qe.toc(START),
  }
}
