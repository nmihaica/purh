purh
++++++++++++++++++++++++++++++++++++++++
JSON wrapper za komunikaciju sa servisima  
Porezne Uprave Republike Hrvatske
napravljen na node platformi
++++++++++++++++++++++++++++++++++++++++
1 instalacija
2 inicijalizacija
3 racun zahtjev
4 putokaz
5 dnevnik
6 preuzimanja
++++++++++++++++++++++++++++++++++++++++
1 instalacija
  npm install purh
  yarn add purh

2 inicijalizacija
  const purh = require('purh')
  
  let config = {
    ca_cert: {
      path: './certs/demoCAfile.pem'
    },  
    client_certificate: {
      path: "./certs/FISKAL_KORISNIK_DEMO.p12",
      password: "1234aA" 
    },
    purh: {
      demo: true,
      rejectUnauthorized: false
    }
  }

  const porezna = new purh({
    demo: true,
    response: 'json',
    agentOptions: {
      ca: fs.readFileSync(config.ca_cert.path),
      pfx: fs.readFileSync(config.client_certificate.path),
      passphrase: config.client_certificate.password,
      rejectUnauthorized: config.purh.rejectUnauthorized
    },
    ca_cert: config.ca_cert,
    client_certificate: config.client_certificate
  })

3 racun zahtjev
  try {
    let r = await porezna.rz(racun)
    console.log(r)
  } catch (err) {
    console.log(err)
  }

4 putokaz
++++++++++++++++++++++++++++++++++++++++
[x] račun zahtjev
[x] echo metoda
[ ] promjena načina plaćanja
[ ] prateći dokument
[ ] provjera računa

[x] log-arhiva
[x] xml-potpisivač  
[x] json odgovori
++++++++++++++++++++++++++++++++++++++++

5 dnevnik
++++++++++++++++++++++++++++++++++++++++
14. rujna 2022.
  Refactoring stare verzije koja je radila
  u produkciji


6 preuzimanja
++++++++++++++++++++++++++++++++++++++++
[14. rujna 2022.]
[0.0.2]
  Refactoring stare verzije koja je radila
  u produkciji