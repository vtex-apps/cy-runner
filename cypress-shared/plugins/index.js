const readXlsx = require('./read-xlsx.js')

module.exports = (on) => {
  on('task', {
    readXlsx: readXlsx.read,
  })
}
