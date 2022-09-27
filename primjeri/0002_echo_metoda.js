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

const poruka = "ECHO"

const start = async function () {
  try {
    let a = await porezna.em(poruka)
    console.log(a)
  } catch (err) {
    console.log(err)
  }
}

start() 