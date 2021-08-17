const forge = require('node-forge')
const fs = require('fs')
let rawdata = fs.readFileSync('purh.json');
let config = JSON.parse(rawdata);

function getCert(){
  const p12b64 = fs.readFileSync(
    config.client_certificate.path,
    'base64'
  )

  var p12Der = forge.util.decode64(p12b64);
  var p12Asn1 = forge.asn1.fromDer(p12Der);
  // decrypt p12 using the password 'password'
  var p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, config.client_certificate.password);
  // get bags by type
  var certBags = p12.getBags({bagType: forge.pki.oids.certBag});
  var pkeyBags = p12.getBags({bagType: forge.pki.oids.pkcs8ShroudedKeyBag});
  // fetching certBag
  var certBag = certBags[forge.pki.oids.certBag][0];
  // fetching keyBag
  var keybag = pkeyBags[forge.pki.oids.pkcs8ShroudedKeyBag][0];
  // generate pem from private key
  var privateKeyPem = forge.pki.privateKeyToPem(keybag.key);
  // generate pem from cert
  var certificate = forge.pki.certificateToPem(certBag.cert);

  // remove pem headers from certificate
  var certificate2 = forge.asn1.toDer(forge.pki.certificateToAsn1(certBag.cert));
  var certificate2b64 = forge.util.encode64(certificate2.getBytes());

  // remove pem headers from privateKey
  var pkey2 = forge.asn1.toDer(forge.pki.privateKeyToAsn1(keybag.key));
  var pkey2b64 = forge.util.encode64(pkey2.getBytes());

  let issuer;
  issuer = {
    [certBag.cert.issuer.getField('CN').shortName]: certBag.cert.issuer.getField('CN').value,
    [certBag.cert.issuer.getField('O').shortName]: certBag.cert.issuer.getField('O').value,
    [certBag.cert.issuer.getField('C').shortName]: certBag.cert.issuer.getField('C').value
  }

  // prepare serial number as integer
  let hex = certBag.cert.serialNumber
  if (hex.length % 2) { hex = '0' + hex; }
  let bn = BigInt('0x' + hex);
  let d = bn.toString(10);

  return {
    key: privateKeyPem,
    strippedCertificate: certificate2b64,
    certificate: certificate,
    serial: d,
    issuer,
  }
}

module.exports = getCert
