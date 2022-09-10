// const path = require('path')
//
// const qe = require('./utils')
// const toolbelt = require('./toolbelt')

// const PATH_HOME = process.env.HOME
// const PATH_CACHE = path.resolve(PATH_HOME, '.cache')
// const PATH_VTEX = path.resolve(PATH_CACHE, 'vtex')
//
// exports.vtexLogin = async (config) => {
//   if (config.base.vtex.deployCli) {
//     qe.msgSection('Toolbelt deployment and authentication')
//     qe.msg('deployCli is deprecated, you can safely remove it', 'warn')
//     qe.msg('Toolbelt version', 'ok', true, true)
//     qe.exec(`${config.base.vtex.bin} --version`, 'inherit')
//   }
//
//   let tlb = await toolbelt.whoami()
//   const isLogged = /Logged/.test(tlb.stdout)
//
//   // Return actual user if logged already
//   if (tlb.success && isLogged) return tlb.stdout.split(' ')[7]
//
//   // User not logged, let's log in
//   try {
//     qe.msg(`Trying to login on account ${vtex.account}`, true, true)
//   } catch (e) {
//     qe.crash('Failed to authenticate', e)
//   }
//
//   // Test if the user is really logged in
//   tlb = await qe.toolbelt(vtex.bin, 'whoami')
//   if (!tlb.success) qe.crash(`Error to login on ${vtex.account}`, tlb.stdout)
//   qe.msg(`Log in with ${vtex.account} completed successfully`)
// }
