const purh = require('../purh')
const fs = require('fs')

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
    bor: '1',
    opp: 'POS1',
    onu: '1',
  },
  uir: '12.50',
  iznosOslobPdv: '12.00',
  iznosMarza: '13.00',
  iznosNePodlOpor: '100.00',
  iznosUkupno: '-20.50',
  nacinPlac: 'G',
  oibOper: '11111999998',
  nakDost: false,
  paragonBrRac: '123/33/22',
  specNamj: 'Navedeno kao primjer'
}

const start = async function () {
  try {
    let a = await porezna.rz(invoice)
    console.log(a)
  } catch (err) {
    console.log(err)
  }
}

start() 