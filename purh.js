const axios = require('axios');
const https = require('https');
const path = require('path');
const pino = require('pino');
const boom = require('boom')
const builder = require('xmlbuilder')
const dayjs = require('dayjs')
const fs = require('fs')
const uuid = require('uuid')
const xml2js = require('xml2js')
const zki = require('zki')
var customParseFormat = require('dayjs/plugin/customParseFormat')

const { dirname } = require('path');
const appDir = dirname(require.main.filename);

const logger = pino(
  {
    target: 'pino-pretty',
    options: {
      colorize: true,
      levelFirst: true,
      translateTime: "yyyy-dd-mm, h:MM:ss TT",
    },
  },
  pino.destination(appDir + "/journal.log")
);
// demo okruženje         - https://cistest.apis-it.hr:8449/
// produkcijsko okruženje - https://cis.porezna-uprava.hr:8449/

/* sa appDirom */
/* const priprema_pdo = require(appDir + '/utils/priprema_pdo');
const priprema_racun = require(appDir + '/utils/priprema_racun'); */
/* 
const priprema_echo = require(appDir + '/utils/priprema_echo');
const parse_xml_to_json = require(appDir + '/utils/parse_xml_to_json'); */

/* sa relativnom putanjom */
const priprema_pdo = require('./utils/priprema_pdo');
const priprema_racun = require('./utils/prepare_invoice');
const priprema_echo = require('./utils/prepare_echo');
const parse_xml_to_json = require('./utils/parse_xml_to_json');

/* const signer = require(appDir + '/signer/signer'); */
const signer = require('./signer/signer')

/* const RacunZahtjev = require(appDir + '/servisi/racun_zahtjev');
const EchoMetoda = require(appDir + '/servisi/echo_metoda'); */
const RacunZahtjev = require('./servisi/racun_zahtjev');
const EchoMetoda = require('./servisi/echo_metoda');
/* const PromjenaNacinaPlacanja = require(appDir + '/servisi/echo_metoda'); */
/* const Pdo = require(appDir + '/servisi/echo_metoda'); */
module.exports = class {
  constructor(obj) {
    // initiate api
    let api = axios.create({
      baseURL: obj.demo
        ? 'https://cistest.apis-it.hr:8449/' 
        : 'https://cis.porezna-uprava.hr:8449/',
      httpsAgent: new https.Agent(obj.agentOptions)
    })

    // zki generator
    const p12b64 = fs.readFileSync(
      obj.client_certificate.path,
      'base64'
    )
    let generator = new zki(
      p12b64,
      obj.agentOptions.passphrase
    )
    /* console.log(generator) */
    this.env = obj
    this.env.api = Object.assign({}, api)
    this.env.signer = new signer()
    this.env.builder = builder
    this.env.generator = generator
    this.env.ROOT_PATH = appDir
  }
  async rz (invoice) {
    try {
      let response = await RacunZahtjev(
        this.env,
        invoice
      )
      return response
    } catch (err) {
      console.log('err', err)
    }
  }
  async rzold(racun) {
    try {
      /* 
      [servis][oib][vrijeme][plaćanje]
      [RZ][11929192911][12:30][G][]
      [SERVIS][RA] */
      /* logger.info(`RZ:${racun.oib}:${racun.oibOper}:${racun.nacinPlac}`) */
      let servis = this.env.demo ? 'FiskalizacijaServiceTest' : 'FiskalizacijaService'
      let r = priprema_racun(racun)
      let brojRacuna = r['tns:RacunZahtjev']['tns:Racun']['tns:BrRac']['tns:BrOznRac']['#text']
      let xml = builder.create(r, {
        encoding: 'utf-8'
      }).end({ pretty: true })
      
      // iniciraj potpisivac
      // prebaci u konstruktor
      let potp = new signer()
      let potpisani_XML = potp.sign(xml)

      // zapis zahtjeva
      fs.writeFileSync(`./logs/racuni/${brojRacuna}.xml`, xml, 'utf8');

      //FIX this here. Strip XML version beggining from signedXML and wrap around
      xml = `<?xml version="1.0" encoding="utf-8"?><soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"><soapenv:Body>`
      + potpisani_XML.substring(38,potpisani_XML.length) + `</soapenv:Body></soapenv:Envelope>`

      let res = await this.env.api.post(servis, xml, {
        'Content-Type': 'text/xml',
      })
      let dt = dayjs(new Date()).format('YYYYMMDD-HHmmss')
      fs.writeFileSync(`./logs/racuni/requests/${brojRacuna}.xml`, xml, 'utf8');

      /* let data = parse_xml_to_json(res.data) */
      var parseString = xml2js.parseString;
      let data = ''
      parseString(res.data, function (err, result) {
          data = result
      });

      let IdPoruke = data['soap:Envelope']['soap:Body'][0]['tns:RacunOdgovor'][0]['tns:Zaglavlje'][0]['tns:IdPoruke'][0]
      let DatumVrijeme = data['soap:Envelope']['soap:Body'][0]['tns:RacunOdgovor'][0]['tns:Zaglavlje'][0]['tns:DatumVrijeme'][0]
      /* console.log(DatumVrijeme) */

      /* 
        header: {
          id:
          datetime: 
        }
      */

      dayjs.extend(customParseFormat)
      
      // Returns an instance containing '1969-05-02T18:02:03.000Z'
      let d3 = dayjs(DatumVrijeme, 'DD.MM.YYYY HH:mm:ss')

      // rt - response time
     /*  let rt = dayjs(DatumVrijeme, 'DD.MM.YYYY HH:mm:ss')
      fs.writeFileSync(`./logs/racuni/responses/${rt.format('YYYYMMDD-HHmmss')}.xml`, res.data, 'utf8'); */
      
      fs.writeFileSync(`./logs/racuni/responses/${brojRacuna}.xml`, res.data, 'utf8');
      return {
        IdPoruke,
        DatumVrijeme,
        d3: d3.format('DD/MM/YYYY HH:mm:ss')
      };
    } catch (err) {
      throw boom.boomify(err)
    }
  }
  async em (poruka) {
    try {
      let response = await EchoMetoda(
        this.env,
        poruka
      )
      return response
    } catch (err) {
      console.log('err', err)
    }
  }
  async emOLD(poruka) {
    try {
      let servis = this.env.demo ? 'FiskalizacijaServiceTest' : 'FiskalizacijaService'
      let echo = priprema_echo(poruka)

      let dt = dayjs(new Date()).format('YYYYMMDD-hhmm')
      let id = uuid.v4()
      let xml = builder.create(echo, {
        encoding: 'utf-8'
      }).end({ pretty: true })
      
      let res = await this.env.api.post(servis, xml, {
        'Content-Type': 'text/xml',
      })

      fs.writeFileSync(`./logs/echo/requests/${dt}-${id}.xml`, xml, 'utf8');
      fs.writeFileSync(`./logs/echo/responses/${dt}-${id}.xml`, res.data, 'utf8');
      return res.data;
    } catch (err) {
      throw boom.boomify(err)
    }
  }
}
