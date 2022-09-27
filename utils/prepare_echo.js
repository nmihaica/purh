let create = function (poruka) {
  // fs.writeFileSync(`./logs/racuni/echo/${poruka}.txt`, JSON.stringify(template, null, 2), 'utf8');
  return {
    'soapenv:Envelope': {
      '@xmlns:soapenv': 'http://schemas.xmlsoap.org/soap/envelope/',
      '@xmlns:f73': 'http://www.apis-it.hr/fin/2012/types/f73',
      'soapenv:Body': {
        'f73:EchoRequest': {
          '#text': poruka
        }
      }
    }
  }
}
module.exports = function(signer, builder, poruka) {
  // create
  let por = create(poruka)
  // build
  let xml = builder.create(por, {
    encoding: 'utf-8'
  }).end({ pretty: true })
  return xml
}
