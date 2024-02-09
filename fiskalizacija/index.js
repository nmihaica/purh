const PrepareEchoRequest = require('./PrepareEchoRequest')
const PrepareInvoiceRequest = require('./PrepareInvoiceRequest')
const PrepareInvoiceCheckRequest = require('./PrepareInvoiceCheckRequest')

const axios = require('axios')
const fs = require('fs')
const https = require('https')
const builder = require('xmlbuilder')

const Signer = require('../signer/signer')

let rawdata = fs.readFileSync('purh.json');
let config = JSON.parse(rawdata);

/* var rootCas = require('ssl-root-cas').create();
 
rootCas
  .inject()
  .addFile(__dirname + '/certs/FinaRDCCA2020.crt')
  .addFile(__dirname + '/certs/FinaRootCA.crt')
  ;
  */
/* https.globalAgent.options.ca = require('ssl-root-cas')
  .inject()
  .addFile(__dirname + '/certs/FinaRDCCA2020.crt')
  .addFile(__dirname + '/certs/FinaRootCA.crt') */
// will work with all https requests will all libraries (i.e. request.js)
// https.globalAgent.options.ca = rootCas;

// console.log('https.globalAgent', https.globalAgent.options.ca)

module.exports = function(opt){
  let services = {
    'ECHO_REQUEST': opt.demo ? 'FiskalizacijaServiceTest' : 'FiskalizacijaService',
    'INVOICE_REQUEST': opt.demo ? 'FiskalizacijaServiceTest' : 'FiskalizacijaService',
    'INVOICE_CHECK': opt.demo ? 'FiskalizacijaServiceTest' : 'FiskalizacijaService',
  }

  let options = {}

  if (opt.demo) {
    let opts = {
      ca: fs.readFileSync(config.ca_cert.path),
      pfx: fs.readFileSync(config.client_certificate.path),
      passphrase: config.client_certificate.password
    }
    options = opts
  }
  else {
    let opts = {
      ca: fs.readFileSync(config.ca_cert.path),
      pfx: fs.readFileSync(config.client_certificate.path),
      passphrase: config.client_certificate.password,
      rejectUnauthorized: config.purh.rejectUnauthorized
    }
    options = opts
  }
  let api = axios.create({
    baseURL: opt.demo ? 'https://cistest.apis-it.hr:8449/' : 'https://cis.porezna-uprava.hr:8449/',
    httpsAgent: new https.Agent(options)
  })
  console.log('baseurl', api.baseurl)
  console.log('demo', opt.demo)
  console.log('ca', config.ca_cert.path)
  console.log('pfx', config.client_certificate.path)
  console.log('reject_unauthorized', config.purh.rejectUnauthorized)
  // console.log('options', api.defaults.httpsAgent)

  /* httpsAgent: new https.Agent({
    //True or false
    rejectUnauthorized: true,
    ca: fs.readFileSync('./certs/demoCAfile.pem'),
    //key: fs.readFileSync('./certs/key.pem'),
    //cert: fs.readFileSync('./certs/cert.pem'),
    pfx: fs.readFileSync('test/fixtures/test_cert.pfx'),
    passphrase: 'sample'
  }) */

  return {
    echoRequest: function(text){
      let echo = new PrepareEchoRequest(text)
      
      let xml = builder.create(echo, {
        encoding: 'utf-8'
      }).end({ pretty: true })

      return api.post(services['ECHO_REQUEST'], xml, {
        headers: {
          'Content-Type': 'text/xml',
        }
      })
    },
    
    invoiceCheck: function(){
      let inv = new PrepareInvoiceCheckRequest(invoice)
      
      let xml = builder.create(inv, {
        encoding: 'utf-8'
      }).end({ pretty: true})
      
      return api.post(services['INVOICE_CHECK'], xml, {
        headers: {
          'Content-Type': 'text/xml',
        }
      })
    },

    invoiceRequest: function(invoice){
      let inv = new PrepareInvoiceRequest(invoice)
      

      let brojRacuna = inv['tns:RacunZahtjev']['tns:Racun']['tns:BrRac']['tns:BrOznRac']['#text']

      let xml = builder.create(inv, {
        encoding: 'utf-8'
      }).end({ pretty: true})
      
      // Begin instead of create to remove xml header
      //let xml = builder.begin(inv, 
      //).end({ pretty: true })
      /* console.log('MY inv', inv) */
      
      let signer = new Signer()
      let signedXML = signer.sign(xml)
      // console.log("xml:",signedXML)
      

      /* fs.writeFileSync(`./logs/RacunZahtjev/${brojRacuna}.txt`, JSON.stringify(inv, null, 2), 'utf8'); */
      fs.writeFileSync(`./logs/RacunZahtjev/${brojRacuna}.xml`, xml, 'utf8');
      
      /*Make soap envelope*/


      //FIX this here. Strip XML version beggining from signedXML and wrap around
      xml = `<?xml version="1.0" encoding="utf-8"?><soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"><soapenv:Body>`
      + signedXML.substring(38,signedXML.length) + `</soapenv:Body></soapenv:Envelope>`
      /* console.log("INSIDE INVOICE: ",xml)   */    
      

      // fs.writeFileSync(`./logs/RacunZahtjev/${brojRacuna}-withSignature.xml`, xml, 'utf8');
      /* console.log('API', api) */
      return api.post(services['INVOICE_REQUEST'], xml, {
        headers: {
          'Content-Type': 'text/xml',
        }
      })
    }
  }
}
