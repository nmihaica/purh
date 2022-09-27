const { dirname } = require('path');
const root = dirname(require.main.filename);
/* const prepare = require(root + '/utils/prepare_invoice'); */
const prepare = require('../utils/prepare_invoice');
const xml2js = require('xml2js')
/* const dayjs = require('dayjs')
const customParseFormat = require('dayjs/plugin/customParseFormat')
const fs = require('fs') */

let responseTypes = {
  // return as it is
  xml: function (data) {
    return data
  },
  json: function (data) {
    var parseString = xml2js.parseString;
    let d = '';
    parseString(data, function (err, result) {
        d = result
    });
    let parsed = {
      header: {
        id: d['soap:Envelope']['soap:Body'][0]['tns:RacunOdgovor'][0]['tns:Zaglavlje'][0]['tns:IdPoruke'][0],
        datetime: d['soap:Envelope']['soap:Body'][0]['tns:RacunOdgovor'][0]['tns:Zaglavlje'][0]['tns:DatumVrijeme'][0]
      },
      data: {
        jir: d['soap:Envelope']['soap:Body'][0]['tns:RacunOdgovor'][0]['tns:Jir'][0]
      }
    }
    return parsed
  }
}

let response = function (type) {
  console.log(responseTypes[type])
}

module.exports = async function (env, invoice) {
  // env.signer    - signer module
  // env.builder   - builder module
  // env.api       - api module
  // env.generator - zki generator
  try {
    let servis = env.demo ? 'FiskalizacijaServiceTest' : 'FiskalizacijaService'
    // generiraj zki
    invoice.zki = env.generator.algorithm(invoice)
    let xml = prepare(
      env.signer,
      env.builder,
      invoice
    )
    let res = await env.api.post(servis, xml, { 
      'Content-Type': 'text/xml'
    })
    return responseTypes[
      env.response
    ](res.data) 
  } catch (err) {
    console.log(err)
  }
}
