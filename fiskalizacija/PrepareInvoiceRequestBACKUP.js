const ZKI = require('../zki')
const uuid = require('uuid')
const dayjs = require('dayjs')

function InvoiceRequest(invoice){
  let Pdv = {
    'tns:Porez': []
  }
  invoice.pdv ? invoice.pdv.map((tax) => {
    Pdv["tns:Porez"].push({
      'tns:Stopa': { '#text': tax.stopa },
      'tns:Osnovica': { '#text': tax.osnovica },
      'tns:Iznos': { '#text': tax.iznos }
    })
  }) : null

  let Pnp = {
    'tns:Porez': []
  }
  invoice.pnp ? invoice.pnp.map((tax) => {
    Pnp["tns:Porez"].push({
      'tns:Stopa': { '#text': tax.stopa },
      'tns:Osnovica': { '#text': tax.osnovica },
      'tns:Iznos': { '#text': tax.iznos }
    })
  }) : {}

  let ostaliPorezi = {
    'tns:Porez': []
  }
  invoice.ostaliPorezi ? invoice.ostaliPorezi.map((tax) => {
    ostaliPorezi["tns:Porez"].push({
      'tns:Naziv': { '#text': tax.naziv },
      'tns:Stopa': { '#text': tax.stopa },
      'tns:Osnovica': { '#text': tax.osnovica },
      'tns:Iznos': { '#text': tax.iznos }
    })
  }) : null

  let naknade = {
    'tns:Naknada': []
  }
  invoice.naknade ? invoice.naknade.map((tax) => {
    naknade["tns:Naknada"].push({
      'tns:NazivN': { '#text': tax.nazivN },
      'tns:IznosN': { '#text': tax.iznosN },
    })
  }) : null

  let basicInvoice = {
    //'soapenv:Envelope': {
    //  '@xmlns:soapenv': 'http://schemas.xmlsoap.org/soap/envelope/',
    //  'soapenv:Body': {
        'tns:RacunZahtjev': {
          'tns:Zaglavlje': {
            'tns:IdPoruke': uuid.v4(),
            'tns:DatumVrijeme': dayjs(new Date()).format('DD.MM.YYYYTHH:mm:ss')
          },
          '@xmlns:tns': 'http://www.apis-it.hr/fin/2012/types/f73',
          '@xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
          '@Id': 'racunId',
          '@xsi:schemaLocation': "http://www.apis-it.hr/fin/2012/types/f73 ../schema/FiskalizacijaSchema.xsd",
          'tns:Racun': {
            'tns:Oib': {
              '#text': invoice.oib
            },
            'tns:USustPdv': {
              '#text': invoice.uSustPdv
            },
            'tns:DatVrijeme': {
              '#text': dayjs(invoice.datVrij).format('DD.MM.YYYYTHH:mm:ss')
            },
            'tns:OznSlijed': {
              '#text': invoice.oznSlijed
            },
            'tns:BrRac': {
              'tns:BrOznRac': {
                '#text': invoice.brRac.bor
              },
              'tns:OznPosPr': {
                '#text': invoice.brRac.opp
              },
              'tns:OznNapUr': {
                '#text': invoice.brRac.onu
              }
            },

            'tns:Pdv': Pdv,
            /* 'tns:Pnp': Pnp,
            'tns:OstaliPor': ostaliPorezi, */

            'tns:IznosOslobPdv': {
              '#text': invoice.iznosOslobPdv
            },
            'tns:IznosMarza': {
              '#text': invoice.iznosMarza
            },
            'tns:IznosNePodlOpor': {
              '#text': invoice.iznosNePodlOpor
            },

            'tns:Naknade': naknade,

            'tns:IznosUkupno': {
              '#text': invoice.iznosUkupno
            },
            'tns:NacinPlac': {
              '#text': invoice.nacinPlac
            },
            'tns:OibOper': {
              '#text': invoice.oibOper
            },
            'tns:ZastKod': {
              '#text': new ZKI().generate(invoice)
            },
            'tns:NakDost': {
              '#text': invoice.nakDost
            },
            'tns:ParagonBrRac': {
              '#text': invoice.paragonBrRac
            },
            'tns:SpecNamj': {
              '#text': invoice.specNamj
            }
          }
        }
    //  }
    //}

  }



/*   console.log("Porez na potrošnju", Pnp)
  console.log("Ostali Porezi", ostaliPorezi) */
  // Ako postoji porez na potrošnju
  
  /* if(Pnp){
    basicInvoice['tns:RacunZahtjev']['tns:Racun'].push({ 'tns:Pnp': Pnp })
  }
  if(ostaliPorezi){
    basicInvoice['tns:RacunZahtjev']['tns:Racun']['tns:OstaliPor': ostaliPorezi])
  } */

  /* console.log("\n\n")
  console.log("BASIC INVOICE", basicInvoice)
  console.log("\n\n") */

  return basicInvoice
}

module.exports = InvoiceRequest
