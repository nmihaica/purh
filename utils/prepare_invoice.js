const { dirname } = require('path');
const appDir = dirname(require.main.filename);
/* const ZKI = require(appDir + '/utils/zki_generator'); */
const uuid = require('uuid')
const dayjs = require('dayjs')
const fs = require('fs')
const _ = require('lodash')

let create = function(invoice) {
  // console.log('invoice', invoice)
  let Pdv = { 'tns:Porez': [] }
  let Pnp = { 'tns:Porez': [] }
  // pdv porezi
  invoice.pdv ? invoice.pdv.map((tax) => {
    Pdv["tns:Porez"].push({
      'tns:Stopa': {
        '#text': tax.stopa
      },
      'tns:Osnovica': {
        '#text': tax.osnovica
      },
      'tns:Iznos': {
        '#text': tax.iznos
      }
    })
  }) : {}

  // pnp porezi
  invoice.pnp ? invoice.pnp.map((tax) => {
    Pnp["tns:Porez"].push({
      'tns:Stopa': {
        '#text': tax.stopa
      },
      'tns:Osnovica': {
        '#text': tax.osnovica
      },
      'tns:Iznos': {
        '#text': tax.iznos
      }
    })
  }) : {}

  let ostaliPorezi = {
    'tns:Porez': []
  }
  invoice.ostaliPorezi ? invoice.ostaliPorezi.map((tax) => {
    ostaliPorezi["tns:Porez"].push({
      'tns:Naziv': {
        '#text': tax.naziv
      },
      'tns:Stopa': {
        '#text': tax.stopa
      },
      'tns:Osnovica': {
        '#text': tax.osnovica
      },
      'tns:Iznos': {
        '#text': tax.iznos
      }
    })
  }) : null

  let naknade = {
    'tns:Naknada': []
  }
  invoice.naknade ? invoice.naknade.map((tax) => {
    naknade["tns:Naknada"].push({
      'tns:NazivN': {
        '#text': tax.nazivN
      },
      'tns:IznosN': {
        '#text': tax.iznosN
      },
    })
  }) : null

  let template = {
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
        /* 'tns:Pdv': Pdv,
        'tns:Pnp': Pnp,
        /* 
        'tns:OstaliPor': ostaliPorezi, */

        /* 'tns:IznosOslobPdv': {
          '#text': invoice.iznosOslobPdv
        },
        'tns:IznosMarza': {
          '#text': invoice.iznosMarza
        },
        'tns:IznosNePodlOpor': {
          '#text': invoice.iznosNePodlOpor
        }, */
        /* 
        'tns:Naknade': naknade, 
        */

        /* 'tns:ParagonBrRac': {
          '#text': invoice.paragonBrRac
        },
        'tns:SpecNamj': {
          '#text': invoice.specNamj
        } */
      }
    }
  }

  if (invoice.pdv) {
    _.merge(template, {
      'tns:RacunZahtjev': {
        'tns:Racun': {
          'tns:Pdv': Pdv
        }
      }
    })
  }

  if (invoice.pnp) {
    _.merge(template, {
      'tns:RacunZahtjev': {
        'tns:Racun': {
          'tns:Pnp': Pnp
        }
      }
    })
  }

  // PROVJERITI ŠTO S OVIM ZKI KODOM
  _.merge(template, {
    'tns:RacunZahtjev': {
      'tns:Racun': {
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
          '#text': invoice.zki
        },
        'tns:NakDost': {
          '#text': invoice.nakDost
        },
      }
    }
  })

  // Nadovezati dodatne stavke ukoliko one postoje
  // !!! bitno je po redu poredati
  // ukoliko postoji iznos koji ne podliježe oporezivanju
  /* if (invoice.iznosNePodlOpor) {
    _.merge(template, {
      'tns:RacunZahtjev': {
        'tns:Racun': {
          'tns:IznosNePodlOpor': {
            '#text': invoice.iznosNePodlOpor
          }
        }
      }
    })
  } */

  // ukoliko postoji paragon broj računa
  if (invoice.paragonBrRac) {
    _.merge(template, {
      'tns:RacunZahtjev': {
        'tns:Racun': {
          'tns:ParagonBrRac': {
            '#text': invoice.paragonBrRac
          }
        }
      }
    })
  }
  // ukoliko postoji specijalna namjena
  if (invoice.specNamj) {
    _.merge(template, {
      'tns:RacunZahtjev': {
        'tns:Racun': {
          'tns:SpecNamj': {
            '#text': invoice.specNamj
          }
        }
      }
    })
  }
  /* _.merge(template, {
    // 'tns:OstaliPor': ostaliPorezi,

    'tns:IznosOslobPdv': {
      '#text': invoice.iznosOslobPdv
    },
    'tns:IznosMarza': {
      '#text': invoice.iznosMarza
    },
    'tns:IznosNePodlOpor': {
      '#text': invoice.iznosNePodlOpor
    },
    // 'tns:Naknade': naknade, 
    'tns:ParagonBrRac': {
      '#text': invoice.paragonBrRac
    },
    'tns:SpecNamj': {
      '#text': invoice.specNamj
    }
  }) */

  fs.writeFileSync(`./logs/racuni/requests/${invoice.brRac.bor}.txt`, JSON.stringify(template, null, 2), 'utf8');
  return template
}

module.exports = function(signer, builder, invoice) {
    // create
    let i = create(invoice)
    // build
    let xml = builder.create(i, {
      encoding: 'utf-8'
    }).end({ pretty: true })
    // sign
    let xml_signed = signer.sign(xml)
    // cleaning soap envelope
    // Fix this here. Strip XML version beggining from signedXML and wrap around
    xml = `<?xml version="1.0" encoding="utf-8"?><soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"><soapenv:Body>`
    + xml_signed.substring(38, xml_signed.length) + `</soapenv:Body></soapenv:Envelope>`
    return xml
}
