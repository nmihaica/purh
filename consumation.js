const fs = require('fs')
const path = require('path')
const purh = require('./purh')

let config = {
  ca_cert: {
    path: './certs/demoCAfile.pem'
  },
  client_certificate: {
    path: "./certs/FISKAL_KORISNIK_DEMO.p12",
    password: "1234aA" 
  },
  purh: {
    demo: true,
    rejectUnauthorized: false
  }
}

const porezna = new purh({
  demo: true,
  response: 'json',
  agentOptions: {
    rejectUnauthorized: config.purh.rejectUnauthorized,
    ca: fs.readFileSync(config.ca_cert.path),
    pfx: fs.readFileSync(config.client_certificate.path),
    passphrase: config.client_certificate.password,
    rejectUnauthorized: config.purh.rejectUnauthorized
  },
  ca_cert: config.ca_cert,
  client_certificate: config.client_certificate
})

const invoice = {
  oib: '11111999998',
  uSustPdv: true,
  datVrij: new Date(),
  //datVrij: new Date().toISOString(),
  oznSlijed: 'P',
  brRac: {
    bor: '22002',
    opp: 'blag001',
    onu: '1',
  },
  uir: '12.50',
  //pdv nije obvezan
  pdv: [{
    stopa: '25.00',
    osnovica: '10.00',
    iznos: '2.50'
  },{
    stopa: '10.00',
    osnovica: '10.00',
    iznos: '1.00'
  }],
  //pnp nije obvezan
  pnp: [{
    stopa: '25.00',
    osnovica: '10.00',
    iznos: '2.50'
  }],
  // ostaliPorezi nije obvezan
/*   ostaliPorezi: [{
    naziv: 'Porez na luksuz',
    stopa: '15.00',
    osnovica: '10.00',
    iznos: '1.50'
  }], */
  iznosOslobPdv: '12.00',
  iznosMarza: '13.00',
  iznosNePodlOpor: '100.00',
  //naknade nije obvezan
  naknade: [{
    nazivN: 'Povratna Naknada',
    iznosN: '1.00'
  }],
  iznosUkupno: '-20.50',
  nacinPlac: 'G',
  oibOper: '11111999998',
  nakDost: false,
  paragonBrRac: '123/33/22',
  specNamj: 'Navedeno kao primjer'
}

const poruka = "pozdrav"
// ECHO
/* const start = async function () {
  try {
    let a = await porezna.em(poruka)
    console.log(a)
  } catch (err) {
    console.log(err)
  }
}

start() */

const start = async function () {
  try {
    let a = await porezna.rz(invoice)
    console.log(a)
  } catch (err) {
    console.log(err)
  }
}

start() 




/* const { dirname } = require('path');
const appDir = dirname(require.main.filename);

const ZKI = require(appDir + '/utils/zki_generator');
console.log(new ZKI().generate(invoice))
 */