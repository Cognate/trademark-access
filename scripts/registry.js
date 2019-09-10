const contract = require('truffle-contract');
const Bluebird = require('bluebird');
const Web3 = require('web3');
const ProviderEngine = require('web3-provider-engine');
const Web3SubProvider = require('web3-provider-engine/subproviders/web3.js');
const Util = require('../src/util');

/** url to access Ethereum */
const ethereumUrl = 'https://mainnet.infura.io/v3/6c62a9b1a3b640d587a70b105cbc3be9';
const engine = new ProviderEngine();
const web3 = new Web3(engine);

web3.eth = Bluebird.promisifyAll(web3.eth);

engine.addProvider(new Web3SubProvider(new Web3.providers.HttpProvider(ethereumUrl)));
engine.start();

// noinspection SpellCheckingInspection
const addressV1 = '0x3107d31dbe7b47bdbf1d50d2f33372c3bdeb7236';
const RegistryV1 = contract(require('../src/contracts/builds-versioned/v1/contracts/CognateRegistry'));
// noinspection JSUnresolvedFunction
RegistryV1.defaults({
  from: '88a80b35014fe7c33b4568cb818f2e16ba799b23',
});
// noinspection JSUnresolvedFunction
RegistryV1.setProvider(web3.currentProvider);

const addressV2 = '0x20Ee69BEd924bd93F6252aB17784867674bB636b';
const RegistryV2 = contract(require('../src/contracts/builds-versioned/v2/contracts/CognateRegistry'));
// noinspection JSUnresolvedFunction
RegistryV2.defaults({
  from: '88a80b35014fe7c33b4568cb818f2e16ba799b23',
});
// noinspection JSUnresolvedFunction
RegistryV2.setProvider(web3.currentProvider);

async function run() {
  // noinspection JSUnresolvedFunction
  const registryV1 = await RegistryV1.at(addressV1);
  // noinspection JSUnresolvedFunction
  const registryV2 = await RegistryV2.at(addressV2);

  for (const string of listings) {
    const parts = string.split('|');
    const listing = {};
    // id
    listing.id = parseInt(parts[0].trim());
    // word
    const word = parts[1].trim();
    if (word !== '') {
      listing.word = word;
    }
    // design id
    const design = parts[2].trim();
    if (design !== '') {
      const fs = require('fs');
      const data = fs.readFileSync(`./design_marks/${design}`);
      listing.design = Util.sha256(data);
    }
    // date of first use
    const dateOfFirstUse = parts[3].trim();
    if (dateOfFirstUse !== '') {
      listing.dateOfFirstUse = new Date(dateOfFirstUse).getTime() / 1000;
    }
    // last name
    listing.lastName = parts[4].trim();
    // blockchain address
    const address = parts[5].trim();
    if (address !== '') {
      listing.address = address;
    }
    await checkV1(registryV1, listing);
    await checkV2(registryV2, listing);
  }
  return {};
}

async function checkV1(registry, listing) {
  if (listing.word && listing.dateOfFirstUse) {
    const lookup = listing.word.replace(new RegExp(' ', 'g'), '') + listing.dateOfFirstUse + listing.lastName;
    console.log(`looking up: ${lookup}`);
    // noinspection JSUnresolvedFunction
    const result = await registry.getListing(lookup);
    if (result !== '0x0000000000000000000000000000000000000000') {
      console.log(`v1 ${listing.id} : ${result}`);
    }
  }
}

async function checkV2(registry, listing) {
  const lookup = listing.word ? listing.word : listing.design;
  console.log(`looking up: ${lookup}`);
  const result = await registry.get(lookup);
  if (result.length > 0) {
    console.log(`v2 ${listing.id} : ${result}`);
  }
}

// commented out entries have been resolved
// noinspection SpellCheckingInspection
const listings = [
  '1018297 | Nosrac productions                                | 1018297_design | 2012-12-12        | carson           | ',
  '1018474 | San Juan Worm                                     |                | 2016-01-30        | gould            | ',
  '1018520 | Munchiees                                         |                | 2015-01-01        | German           | ',
  '1018435 | Cognate Monitoring Service                        |                | 2016-02-20        | Collen           | ',
  '1018453 | Triple Aim Technologies                           | 1018453_design | 2015-06-01        | Harrison         | ',
  // '1018748 | FORMcard Ltd                                      |                | 2015-11-01        | Marigold         | ',
  '1018442 | WGROUP & DESIGN                                   |                | 2014-01-01        | Murdock          | ',
  '1018311 | 3 Broke Girls                                     |                | 2014-04-15        | Murar            | ',
  '1018312 | Mobile TekForce                                   | 1018312_design | 2014-05-24        | Hoffer           | ',
  '1018327 | Bow Ties By Shaun                                 | 1018327_design | 2014-02-01        | Pfeiffer         | ',
  '1018331 | Miss Murder                                       |                | 2014-06-01        | Delfino          | ',
  '1018333 | ViperNet Gaming                                   | 1018333_design | 2011-01-16        | GRIGGS           | ',
  '1018443 | GOGA & DESIGN                                     |                | 2009-01-01        | Murdock          | ',
  '1018476 | Tall Brews                                        |                | 2016-01-01        | Michaud          | ',
  '1018473 | Kevarta                                           |                | 2016-01-16        | gould            | ',
  // '1018559 | DatNap                                            |                | 2016-09-01        | Leaf             | ',
  "1018451 | A's before J's                                    | 1018451_design | 2015-06-01        | Debrito          | ",
  '1018345 | Artistry Dance Project                            | 1018345_design | 2013-07-01        | Wozniak          | ',
  // '1018518 | Peel To Track                                     |                | 2014-12-19        | Steckler         | ',
  '1018522 | Keycharm                                          | 1018522_design | 2014-09-01        | Zuker            | ',
  '1018523 | My-Storytellers                                   | 1018523_design | 2014-09-01        | Zuker            | ',
  // '1018584 | AppMap                                            |                | 2016-05-01        | Leaf             | ',
  '1018854 | COG                                               | 1018854_design | 2012-12-27        | Collen           | ',
  '1018414 | Rescuing Leftover Cuisine, Inc.                   | 1018414_design | 2013-07-03        | Lee              | ',
  '1018508 | ForwardJump                                       | 1018508_design | 2013-01-01        | Fialkoff         | ',
  '1018403 | Una Chispa Más                                    | 1018403_design | 2015-10-19        | Dominguez        | ',
  '1018446 | Franklin Robotics                                 | 1018446_design | 2015-10-01        | MacKean          | ',
  '1018359 | Cognate Product Listing                           | 1018359_design | 2015-04-01        | Collen           | ',
  '1018357 | LeftyandRighty                                    | 1018357_design | 2015-04-01        | Collen           | ',
  '1018445 | BLOCK TECH & DESIGN                               |                | 2012-01-01        | Murdock          | ',
  '1018315 | The Headlinez Collection Custom Design and Prints | 1018315_design |                   | sarina           | ',
  '1018454 | Foresight Care                                    | 1018454_design | 2015-06-01        | Harrison         | ',
  '1018438 | Loil                                              | 1018438_design | 2016-02-17        | Martin           | ',
  '1018497 | Bronze Big Papi                                   |                | 2016-04-30        | Phelan           | ',
  // '1018564 | Psychic Paper                                     |                | 2016-01-01        | Leaf             | ',
  // '1018560 | PenSe                                             |                | 2016-01-01        | Leaf             | ',
  // '1018583 | Evolve Law                                        |                | 2014-03-25        | Juetten          | ',
  // '1018588 | eCopters                                          |                | 2013-07-01        | Morrison         | ',
  // '1018653 | badass                                            |                | 2015-09-01        | Hing             | ',
  // '1018654 | BAD                                               |                | 2015-09-01        | Hing             | ',
  // '1018656 | Badass Yoga Mats                                  |                | 2015-08-01        | Hing             | ',
  // '1018657 | BAD Yoga Mats                                     |                | 2015-08-01        | Hing             | ',
  '1018510 | Rep Appeal Clothing                               | 1018510_design | 2016-06-29        | Jones            | ',
  // '1018724 | Activisor                                         |                | 2016-07-29        | Wu               | ',
  '1018346 | ProperSee                                         | 1018346_design | 2012-07-15        | Vannoni          | ',
  // '1018720 | HABIT                                             |                | 2016-12-01        | Hing             | ',
  // '1018721 | Mitsy Kit                                         |                | 2015-03-23        | Roussell         | ',
  // '1018723 | nohmii                                            |                | 2016-09-01        | Shottes Bouchard | ',
  // '1018725 | Cognate                                           |                | 2014-07-01        | Collen           | ',
  // '1018726 | KATRIS                                            |                | 2014-04-01        | Lin              | ',
  // '1018751 | SMARTBLANKET.COM                                  |                | 2013-10-01        | CHANG            | ',
  // '1018752 | Tertill                                           |                | 2016-07-21        | MacKean          | ',
  // '1018769 | Three Point Group, LLC                            |                | 2008-02-01        | Jaffe            | ',
  '1018444 | AIRISLED                                          |                | 2011-01-01        | Murdock          | ',
  '1018417 | Athletics Recruiting                              | 1018417_design | 2015-11-29        | Pereira          | ',
  '1018512 | Tick Tock                                         | 1018512_design | 2012-02-14        | Steckler         | ',
  // '1018665 | Yogatini                                          |                | 2016-12-01        | Kuliga           | ',
  '1023403 | Carson Carrington                                 |                | 2017-12-14        | Lancaster        | ',
  '1023404 | Porch & Den                                       |                | 2017-08-29        | Lancaster        | ',
  '1023456 | HP                                                |                | 1939-01-01        | Keen             | ',
  '1023465 | British American Tobacco                          | 1023465_design | 1950-01-01        | Juras            | ',
  '1023475 | Pinterest                                         |                | 2010-03-01        | Rowe             | ',
  '1018440 | TenTheApp                                         | 1018440_design | 2014-08-15        | Lopes            | ',
  '1018452 | Studio 26 Associates, LLC                         | 1018452_design | 2015-01-06        | Nganga           | ',
];

run()
  .then(results => {
    console.log(JSON.stringify(results, null, 2));
    process.exit(0);
  })
  .catch(err => {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  });
