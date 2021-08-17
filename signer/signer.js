const getCert = require('./tls2')
const SignedXml = require('xml-crypto').SignedXml	
const FileKeyInfo = require('xml-crypto').FileKeyInfo;
const fs = require('fs')

let p12 = getCert()

let signed;
let withIds;

module.exports = function(){
  
  return { 
    sign: function(xml){
      let sig = new SignedXml()

      sig.addReference(
        "//*[local-name(.)='RacunZahtjev']", 
        ["http://www.w3.org/2000/09/xmldsig#enveloped-signature",'http://www.w3.org/2001/10/xml-exc-c14n#'],
        "http://www.w3.org/2000/09/xmldsig#sha1",
      );

    let keyInfo = function() {
      this.getKeyInfo = function(key, prefix) {
        prefix = prefix || ''
        prefix = prefix ? prefix + ':' : prefix
        return `<X509Data><X509Certificate>${p12.strippedCertificate}</X509Certificate><X509IssuerSerial><X509IssuerName>CN=${p12.issuer['CN']},O=${p12.issuer['O']},C=${p12.issuer['C']}</X509IssuerName><X509SerialNumber>${p12.serial}</X509SerialNumber></X509IssuerSerial></X509Data>`
      }
      this.getKey = function(keyInfo) {   
        return p12.key
      }
    }

      sig.keyInfoProvider = new keyInfo()
      sig.signingKey = p12.key

      sig.computeSignature(xml,{
        location: { reference: "//*[local-name(.)='Racun']", action: "after" } //This will place the signature after the racun element
      })
      signed = sig.getSignatureXml()
      withIds = sig.getOriginalXmlWithIds()
      fs.writeFileSync("signed.xml", sig.getSignedXml())
      return sig.getSignedXml()
    },
    verify: function(sign, withIds){
      let sig = new SignedXml()
      
      let MyKeyInfo = function () {
        this.getKey = function (keyInfo) {
          return p12.certificate
        }
      }

      sig.keyInfoProvider = new MyKeyInfo()
      sig.loadSignature(signed)
      let res = sig.checkSignature(withIds)
      console.log(res)
      if (!res) console.log(sig.validationErrors)
      else console.log('Valid Signature')
    }
  }
}


