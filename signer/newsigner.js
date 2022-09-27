const SignedXml = require('xml-crypto').SignedXml
const FileKeyInfo = require('xml-crypto').FileKeyInfo;

let utils = {
  keyInfo: function () {

  }
}
module.exports = function (p12) {
  let sign = function (xml) {
    let sig = new SignedXml()
    sig.addReference(
      // what if not RacunZahtjev
      "//*[local-name(.)='RacunZahtjev']", 
      ["http://www.w3.org/2000/09/xmldsig#enveloped-signature",'http://www.w3.org/2001/10/xml-exc-c14n#'],
      "http://www.w3.org/2000/09/xmldsig#sha1",
    );
    
    sig.keyInfoProvider = keyInfo()
    sig.signingKey = p12.key
    sig.computeSignature(xml, {
      location: { reference: "//*[local-name(.)='Racun']", action: "after" } 
      // this will place the signature after the racun element
    })
    signed = sig.getSignatureXml()
    withIds = sig.getOriginalXmlWithIds()
    fs.writeFileSync("signed.xml", sig.getSignedXml())
    return sig.getSignedXml()
  }
  return {
    sign,
    keyInfo,
    verify
  }
}