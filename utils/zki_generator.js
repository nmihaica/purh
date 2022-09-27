const crypto = require('crypto')
const fs = require('fs')
const dayjs = require('dayjs')
const forge = require('node-forge')

module.exports = class {
  constructor(data){
  }
  generate(data){
    let pub = this.getPublicKey() 
    let key = this.getPrivateKey() 
    
    let total;
    // oib obveznika fiskalizacije
    total = data.oib
    // datVrij - datum i vrijeme izdavanja računa zapisani kao
    // tekst u formatu 'dd.MM.gggg hh:mm:ss'
    total += dayjs(data.datVrij).format('DD.MM.YYYY HH:mm:ss')
    // bor - brojčana oznaka računa
    total += data.bor
    // opp - oznaka poslovnog prostora
    total += data.opp
    // onu - oznaka naplatnog uređaja
    total += data.onu
    // uir - ukupan iznos računa
    total += data.uir
    
    let signature = this.sign(total, key)

    let hash = this.hash(signature)

    let verify = this.verify(total, pub, signature)
    console.log("verify: ", verify)

    return hash;
  }
  getPublicKey() {
    let file = fs.readFileSync('./certs/public.pem').toString()
    // console.log('publickey\n', file)
    return file
  }
  getPublicKeyNEWONE(){
    // convert this to using node-forge
    let file = fs.readFileSync('./certs/public.pem').toString()
    console.log('publickey\n', file)

    const p12b64 = fs.readFileSync(
      /* config.client_certificate.path, */
      './certs/FISKAL_KORISNIK_DEMO.p12',
      'base64'
    )
    
    var p12Der = forge.util.decode64(p12b64);
    var p12Asn1 = forge.asn1.fromDer(p12Der);
    // decrypt p12 using the password 'password'
    var p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, '1234aA');
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

    // convert PEM-formatted private key to a Forge private key
    var forgePrivateKey = forge.pki.privateKeyFromPem(privateKeyPem);

    // get a Forge public key from the Forge private key
    var forgePublicKey = forge.pki.setRsaPublicKey(forgePrivateKey.n, forgePrivateKey.e);

    // convert the Forge public key to a PEM-formatted public key
    var publicKey = forge.pki.publicKeyToPem(forgePublicKey);

    // convert the Forge public key to an OpenSSH-formatted public key for authorized_keys
    var sshPublicKey = forge.ssh.publicKeyToOpenSSH(forgePublicKey);


    console.log('\nnode-forge\n', forge.pki.publicKeyToPem(certBag.cert.publicKey))
    return file
  }
  getPrivateKey(){
    let file = fs.readFileSync('./certs/key.pem').toString()
    /* console.log('privatekey:', file) */
    return file
  }
  sign(data, privateKey){
    let newData;
    let document; 
    let documentHex;
    const signer = crypto.createSign('RSA-SHA1')
    newData = Buffer.from(data.toString(), 'ascii')
    signer.update(newData)
    // if I add to hex it will not verify, however you should do hex-encoding as
    // porezna expects it like that
    document = signer.sign(privateKey)
    documentHex = document.toString('hex')  
    /* console.log("sign() document: ", document)  
    console.log("sign() documentHex: ", documentHex)   */
    return document
  }
  verify(data, publicKey, signature){
    const verifier = crypto.createVerify('RSA-SHA1')
    verifier.update(data)
    return verifier.verify(publicKey, signature)
  }
  hash(data){
    const hasher = crypto.createHash('md5')
    const hash = hasher.update(data);
    return hash.digest('hex')
  }
}
