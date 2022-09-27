const ZKI = require('../zki')
const uuid = require('uuid')
const dayjs = require('dayjs')
const fs = require('fs')
const _ = require('lodash')

module.exports = function (invoice) {
  let Pdv = {
    'tns:Porez': []
  }

  let Pnp = {
    'tns:Porez': []
  }
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

  let basicInvoice = {
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
    _.merge(basicInvoice, {
      'tns:RacunZahtjev': {
        'tns:Racun': {
          'tns:Pdv': Pdv
        }
      }
    })
  }

  if (invoice.pnp) {
    _.merge(basicInvoice, {
      'tns:RacunZahtjev': {
        'tns:Racun': {
          'tns:Pnp': Pnp
        }
      }
    })
  }

  // PROVJERITI ŠTO S OVIM ZKI KODOM
  _.merge(basicInvoice, {
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
          '#text': new ZKI().generate(invoice)
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
    _.merge(basicInvoice, {
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
    _.merge(basicInvoice, {
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
    _.merge(basicInvoice, {
      'tns:RacunZahtjev': {
        'tns:Racun': {
          'tns:SpecNamj': {
            '#text': invoice.specNamj
          }
        }
      }
    })
  }
  /* _.merge(basicInvoice, {
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

  fs.writeFileSync(`./logs/Ostalo/${invoice.brRac.bor}.txt`, JSON.stringify(basicInvoice, null, 2), 'utf8');
  return basicInvoice
}

module.exports = InvoiceRequest