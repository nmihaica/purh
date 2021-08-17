const axios = require('axios')
module.exports = {
  racun: async function (obj) {
    try {
      // adress of purh-server
      let FISKALIZACIJA = 'http://localhost:3001/invoice'
      let res = await axios.post(FISKALIZACIJA, {
        invoice: obj
      })
  
      Object.assign(obj, {
        jir: res.data.jir,
        zki: res.data.zki,
        total: res.data.total
      })
    
    } catch (err) {
      console.log('here is my err', err)
    }
  },
  echo: function () { },
  provjera: function () { },
  pdo: function () { },
}