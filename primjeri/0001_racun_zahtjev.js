const purh = require('../purh')

!async function () {
  try {
    let racun = {
      oib: '18945722090',
      uSustPdv: true,
      datVrij: new Date(),
      oznSlijed: 'P',
      brRac: {
        bor: '22002',
        opp: 'blag001',
        onu: '1',
      },
      uir: '12.50',
      pdv: [{
        stopa: '25.00',
        osnovica: '10.00',
        iznos: '2.50'
      },{
        stopa: '10.00',
        osnovica: '10.00',
        iznos: '1.00'
      }],
      //pnp nije obvezan
      pnp: [{
        stopa: '25.00',
        osnovica: '10.00',
        iznos: '2.50'
      }],
      iznosOslobPdv: '12.00',
      iznosMarza: '13.00',
      iznosNePodlOpor: '100.00',
      iznosUkupno: '20.50',
      nacinPlac: 'G',
      oibOper: '18945722090',
      nakDost: false,
      specNamj: 'Navedeno kao primjer'
    }
    await purh.racun(racun)
  } catch (err) {
    console.log('pogreška', err)
  }
}()