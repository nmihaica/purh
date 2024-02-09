function BuildEchoRequest(text){ 
  return {
    'soapenv:Envelope': {
      '@xmlns:soapenv': 'http://schemas.xmlsoap.org/soap/envelope/',
      '@xmlns:f73': 'http://www.apis-it.hr/fin/2012/types/f73',
      'soapenv:Body': {
        'f73:EchoRequest': {
          '#text': text
        }
      }
    }
  }
}

module.exports = BuildEchoRequest
