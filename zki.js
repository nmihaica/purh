const crypto = require('crypto')
const fs = require('fs')
const dayjs = require('dayjs')

class ZKI {
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
    /* console.log("signature", signature.toString('hex')) */

    let hash = this.hash(signature)
    //console.log("md5 hash: ", hash)

    let verify = this.verify(total, pub, signature)
    console.log("verify: ", verify)
    //sign()
    //hash()
    //verify()

    return hash;
  }
  getPublicKey(){
    let file = fs.readFileSync('./certs/public.pem').toString()
    return file
  }
  getPrivateKey(){
    let file = fs.readFileSync('./certs/key.pem').toString()
    return file
  }
  sign(data, privateKey){
    let newData;
    let document; 
    let documentHex;
    const signer = crypto.createSign('RSA-SHA1')
    newData = Buffer.from(data.toString(), 'ascii')
    signer.update(newData)
    // if I add to hex it will not verify, however you should hex-encoding as
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
module.exports = ZKI

function simulateTime(){
  const zki = new ZKI({
    oib: '18945722090',
    datVrij: new Date().toISOString(),
    bor: '12345',
    opp: 'blag001',
    onu: '11245',
    uir: '20.50'
  })
  //console.log(zki)
  //console.log(zki.verify())
}
