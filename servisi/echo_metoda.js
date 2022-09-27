const { dirname } = require('path');
const root = dirname(require.main.filename);
/* const prepare = require(root + '/utils/prepare_echo'); */
const prepare = require('../utils/prepare_echo');
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
      data: {
        poruka: d['soap:Envelope']['soap:Body'][0]['tns:EchoResponse'][0]['_']
      }
    }
    return parsed
  }
}

let response = function (type) {
  console.log(responseTypes[type])
}

module.exports = async function (env, poruka) {
  // env.signer  - signer module
  // env.builder - builder module
  // env.api     - api module
  try {
    
    let servis = env.demo ? 'FiskalizacijaServiceTest' : 'FiskalizacijaService'
    let xml = prepare(
      env.signer,
      env.builder,
      poruka
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
