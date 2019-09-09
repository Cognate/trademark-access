const contract = require('truffle-contract');
const Bluebird = require('bluebird');
const Web3 = require('web3');
const ProviderEngine = require('web3-provider-engine');
const Web3SubProvider = require('web3-provider-engine/subproviders/web3.js');

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
      listing.design = design;
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
  const lookup = listing.word;
  console.log(`looking up: ${lookup}`);
  const result = await registry.get(lookup);
  if (result.length > 0) {
    console.log(`v2 ${listing.id} : ${result}`);
  }
}

// noinspection SpellCheckingInspection
const listings = [
  ' 1018297 | Nosrac productions                                 | 1018297_design | 2012-12-12        | carson                            |',
  ' 1018474 | San Juan Worm                                      |                | 2016-01-30        | gould                             |',
  ' 1018520 | Munchiees                                          |                | 2015-01-01        | German                            |',
  ' 1018496 | Jerez Electronics                                  | 1018496_design | 2015-03-16        | Jerez                             |',
  ' 1018435 | Cognate Monitoring Service                         |                | 2016-02-20        | Collen                            |',
  ' 1018453 | Triple Aim Technologies                            | 1018453_design | 2015-06-01        | Harrison                          |',
  // ' 1018748 | FORMcard Ltd                                       |                | 2015-11-01        | Marigold                          |',
  ' 1018442 | WGROUP & DESIGN                                    |                | 2014-01-01        | Murdock                           |',
  ' 1018311 | 3 Broke Girls                                      |                | 2014-04-15        | Murar                             |',
  ' 1018312 | Mobile TekForce                                    | 1018312_design | 2014-05-24        | Hoffer                            |',
  ' 1018327 | Bow Ties By Shaun                                  | 1018327_design | 2014-02-01        | Pfeiffer                          |',
  ' 1018331 | Miss Murder                                        |                | 2014-06-01        | Delfino                           |',
  ' 1018333 | ViperNet Gaming                                    | 1018333_design | 2011-01-16        | GRIGGS                            |',
  ' 1018443 | GOGA & DESIGN                                      |                | 2009-01-01        | Murdock                           |',
  ' 1018476 | Tall Brews                                         |                | 2016-01-01        | Michaud                           |',
  ' 1018473 | Kevarta                                            |                | 2016-01-16        | gould                             |',
  // ' 1018559 | DatNap                                             |                | 2016-09-01        | Leaf                              |',
  " 1018451 | A's before J's                                     | 1018451_design | 2015-06-01        | Debrito                           |",
  ' 1018345 | Artistry Dance Project                             | 1018345_design | 2013-07-01        | Wozniak                           |',
  // ' 1018479 | The Common Law Trademark Registry                  | 1018479_design | 2015-11-01        | Collen                            | 0x18677086b71635a2ed499134d53e50b521737be7',
  // ' 1018518 | Peel To Track                                      |                | 2014-12-19        | Steckler                          |',
  ' 1018522 | Keycharm                                           | 1018522_design | 2014-09-01        | Zuker                             |',
  ' 1018523 | My-Storytellers                                    | 1018523_design | 2014-09-01        | Zuker                             |',
  // ' 1018584 | AppMap                                             |                | 2016-05-01        | Leaf                              |',
  ' 1018722 | Mitsy Kit                                          |                |                   | Roussell                          |',
  ' 1018854 | COG                                                | 1018854_design | 2012-12-27        | Collen                            |',
  ' 1018414 | Rescuing Leftover Cuisine, Inc.                    | 1018414_design | 2013-07-03        | Lee                               |',
  ' 1019164 | ADJUSTABLE COMFORT AFFORDAMATIC                    |                |                   | IP                                |',
  ' 1019165 | BETHEAD                                            |                |                   | IP                                |',
  ' 1019166 | BUGHEAD                                            |                |                   | IP                                |',
  ' 1019167 | CLASSIC FOAM MATTRESS                              |                |                   | IP                                |',
  ' 1019199 | A-10 MILITARY STRENGTH                             |                |                   | IP                                |',
  ' 1019200 | AQUILA & DESIGN                                    |                |                   | IP                                |',
  ' 1019203 | CHALKFITI                                          |                |                   | IP                                |',
  ' 1019182 | UBER COOL                                          |                |                   | IP                                |',
  ' 1019183 | UBER HOT                                           |                |                   | IP                                |',
  ' 1019195 | INTERNATIONAL CONSULTING NETWORK ICON & DESIGN     |                |                   | IP                                |',
  ' 1019214 | NOUVEAU LEAVERS & DESIGN                           |                |                   | IP                                |',
  ' 1019215 | RODIAL                                             |                |                   | IP                                |',
  ' 1019226 | MADAM SATAN                                        |                |                   | IP                                |',
  ' 1019227 | MISCELLANEOUS DESIGN                               |                |                   | IP                                |',
  ' 1019192 | THERMAL CRUSHING TECHNOLOGY                        |                |                   | IP                                |',
  ' 1019194 | BISGRAF                                            |                |                   | IP                                |',
  ' 1019198 | SIMPLYSOFT TECHNOLOGY                              |                |                   | IP                                |',
  ' 1019260 | MYMEMORY                                           |                |                   | IP                                |',
  ' 1019261 | OCEAN BIKINI VILLAGE                               |                |                   | IP                                |',
  ' 1018508 | ForwardJump                                        | 1018508_design | 2013-01-01        | Fialkoff                          |',
  // ' 1018503 | Faster. More affordable. Defensible.               |                | 2016-05-01        | Collen                            | 0x041fa2cdcba1d7fd80f8c4863a784e687ef0326f',
  ' 1019189 | CLOCKWORKS PRESS                                   |                |                   | IP                                |',
  ' 1019190 | Z ZOSO & DESIGN                                    |                |                   | IP                                |',
  ' 1019191 | LVER                                               |                |                   | IP                                |',
  ' 1019205 | FIDGET CANDY                                       |                |                   | IP                                |',
  ' 1019211 | LITTLE GREEN FINGERS                               |                |                   | IP                                |',
  ' 1019222 | COUGAR HONEY                                       |                |                   | IP                                |',
  ' 1019271 | TURQUOISE COUTURE                                  |                |                   | IP                                |',
  ' 1019197 | EGOV SYSTEMS & DESIGN                              |                |                   | IP                                |',
  ' 1019174 | MISCELLANEOUS DESIGN (WISHBONE LOGO)               |                |                   | IP                                |',
  ' 1019175 | NET GENERATION & DESIGN                            |                |                   | IP                                |',
  ' 1019204 | ELEVENT                                            |                |                   | IP                                |',
  ' 1019188 | TENNIS LIKE NEVER BEFORE                           |                |                   | IP                                |',
  ' 1018485 | Vouch                                              |                |                   | Herriot                           |',
  ' 1018403 | Una Chispa Más                                     | 1018403_design | 2015-10-19        | Dominguez                         |',
  ' 1018446 | Franklin Robotics                                  | 1018446_design | 2015-10-01        | MacKean                           |',
  ' 1018359 | Cognate Product Listing                            | 1018359_design | 2015-04-01        | Collen                            |',
  ' 1018357 | LeftyandRighty                                     | 1018357_design | 2015-04-01        | Collen                            |',
  ' 1018445 | BLOCK TECH & DESIGN                                |                | 2012-01-01        | Murdock                           |',
  ' 1018315 | The Headlinez Collection Custom Design and Prints  | 1018315_design |                   | sarina                            |',
  ' 1018509 | GameFace Media                                     |                |                   | Murdock                           |',
  ' 1018519 | Tick Tock                                          |                |                   | Steckler                          |',
  ' 1018454 | Foresight Care                                     | 1018454_design | 2015-06-01        | Harrison                          |',
  ' 1018438 | Loil                                               | 1018438_design | 2016-02-17        | Martin                            |',
  ' 1018537 | Nextgengolf                                        |                |                   | Hart                              |',
  ' 1018497 | Bronze Big Papi                                    |                | 2016-04-30        | Phelan                            |',
  // ' 1018564 | Psychic Paper                                      |                | 2016-01-01        | Leaf                              |',
  // ' 1018560 | PenSe                                              |                | 2016-01-01        | Leaf                              |',
  ' 1018568 | One Spot                                           |                |                   | Weil                              |',
  // ' 1018583 | Evolve Law                                         |                | 2014-03-25        | Juetten                           |',
  // ' 1018588 | eCopters                                           |                | 2013-07-01        | Morrison                          |',
  // ' 1018653 | badass                                             |                | 2015-09-01        | Hing                              |',
  // ' 1018654 | BAD                                                |                | 2015-09-01        | Hing                              |',
  ' 1018513 | Peel To Track                                      |                |                   | Steckler                          |',
  // ' 1018656 | Badass Yoga Mats                                   |                | 2015-08-01        | Hing                              |',
  // ' 1018531 | The First Step in Trademark Protection             |                | 2015-12-01        | Collen                            | 0xfc3ce3252ef88bb8106bbe97cdb2e191bd7ed674',
  // ' 1018657 | BAD Yoga Mats                                      |                | 2015-08-01        | Hing                              |',
  ' 1018510 | Rep Appeal Clothing                                | 1018510_design | 2016-06-29        | Jones                             |',
  ' 1018536 | NCCGA                                              |                |                   | Hart                              |',
  // ' 1018724 | Activisor                                          |                | 2016-07-29        | Wu                                |',
  ' 1018346 | ProperSee                                          | 1018346_design | 2012-07-15        | Vannoni                           |',
  // ' 1018720 | HABIT                                              |                | 2016-12-01        | Hing                              |',
  // ' 1018721 | Mitsy Kit                                          |                | 2015-03-23        | Roussell                          |',
  // ' 1018723 | nohmii                                             |                | 2016-09-01        | Shottes Bouchard                  |',
  // ' 1018725 | Cognate                                            |                | 2014-07-01        | Collen                            |',
  // ' 1018726 | KATRIS                                             |                | 2014-04-01        | Lin                               |',
  // ' 1018751 | SMARTBLANKET.COM                                   |                | 2013-10-01        | CHANG                             |',
  // ' 1018752 | Tertill                                            |                | 2016-07-21        | MacKean                           |',
  // ' 1018769 | Three Point Group, LLC                             |                | 2008-02-01        | Jaffe                             |',
  ' 1018444 | AIRISLED                                           |                | 2011-01-01        | Murdock                           |',
  ' 1018417 | Athletics Recruiting                               | 1018417_design | 2015-11-29        | Pereira                           |',
  ' 1018613 | MASK MASSIVE ARRAY OF STRUCTURED KEYWORDS          |                |                   | IP                                |',
  ' 1018566 | Truetone                                           |                |                   | Weil                              |',
  ' 1019181 | THE WISHBONE COLLECTION                            |                |                   | IP                                |',
  ' 1019212 | MONKEY                                             |                |                   | IP                                |',
  ' 1018679 | LORDAE DESIGN                                      |                |                   | IP                                |',
  ' 1018715 | MUC-OFF URBAN BICYCLE CARE & DESIGN                |                |                   | IP                                |',
  ' 1018599 | COOL SLEEP JADE                                    |                |                   | IP                                |',
  ' 1018706 | DUTCH BROWN                                        |                |                   | IP                                |',
  ' 1018728 | 7TH HEAVEN NATURAL SCIENCE                         |                |                   | IP                                |',
  ' 1018729 | RODENTSTOP                                         |                |                   | IP                                |',
  ' 1018732 | FIXSIT                                             |                |                   | IP                                |',
  ' 1018745 | SANTA’S CANDY EXPRESS                              |                |                   | IP                                |',
  ' 1018696 | MISCELLANEOUS DESIGN (OR)                          |                |                   | IP                                |',
  ' 1018596 | RADO                                               |                |                   | IP                                |',
  ' 1018598 | ADJUSTABLE COMFORT                                 |                |                   | IP                                |',
  ' 1018602 | SAINT LAURENT PARIS                                |                |                   | IP                                |',
  ' 1018604 | LOILLLOOX                                          |                |                   | IP                                |',
  ' 1018567 | 1 Spot                                             |                |                   | Weil                              |',
  ' 1018594 | VIBE MATTRESS                                      |                |                   | IP                                |',
  ' 1018708 | DFC                                                |                |                   | IP                                |',
  ' 1018673 | MUSEE YSL PARIS & DESIGN                           |                |                   | IP                                |',
  ' 1018676 | NETWORK TOOLKIT & DESIGN                           |                |                   | IP                                |',
  ' 1018680 | MISCELLANEOUS DESIGN                               |                |                   | IP                                |',
  ' 1019186 | MARTELL VS SINGLE DISTILLERY JEAN MARTELL & DESIGN |                |                   | IP                                |',
  ' 1019201 | BELLHOP CIGARS                                     |                |                   | IP                                |',
  ' 1019202 | CALICO HILL                                        |                |                   | IP                                |',
  ' 1019206 | FIDGET CANDY                                       |                |                   | IP                                |',
  ' 1019184 | MISCELLANEOUS DESIGN (Roton Point Burgee)          |                |                   | IP                                |',
  ' 1019208 | GOBAGOO                                            |                |                   | IP                                |',
  ' 1019220 | BELLADAAR                                          |                |                   | IP                                |',
  ' 1019264 | RED FOX                                            |                |                   | IP                                |',
  ' 1019266 | THE MALFUNCTION                                    |                |                   | IP                                |',
  ' 1019272 | BODY MIND SOUL                                     |                |                   | IP                                |',
  ' 1019276 | LIVESYNC                                           |                |                   | IP                                |',
  ' 1019255 | LA VIE EN ROSE AQUA                                |                |                   | IP                                |',
  ' 1019269 | TITAN BED FRAME                                    |                |                   | IP                                |',
  ' 1019282 | PIZZAFIX                                           |                |                   | IP                                |',
  ' 1019284 | PIZZAFIXINGS                                       |                |                   | IP                                |',
  ' 1018512 | Tick Tock                                          | 1018512_design | 2012-02-14        | Steckler                          |',
  ' 1018744 | ORIGINAL & DESIGN                                  |                |                   | IP                                |',
  ' 1018781 | HAYK                                               |                |                   | IP                                |',
  ' 1018783 | MISCELLANEOUS DESIGN (Flik Flak boy and girl)      |                |                   | IP                                |',
  ' 1018714 | GOEN & DESIGN                                      |                |                   | IP                                |',
  ' 1018787 | 5-MINUTE FOUNDATION                                |                |                   | IP                                |',
  ' 1018788 | HUG                                                |                |                   | IP                                |',
  ' 1018786 | CREAKYTOWN                                         |                |                   | IP                                |',
  ' 1018796 | DRYLOCK                                            |                |                   | IP                                |',
  ' 1018797 | RED DRAGON                                         |                |                   | IP                                |',
  ' 1018877 | FINLAYS & DESIGN                                   |                |                   | IP                                |',
  ' 1018878 | CAMBRIDGE FAMILY ENTERPRISE GROUP & DESIGN         |                |                   | IP                                |',
  ' 1018675 | EVERRUN                                            |                |                   | IP                                |',
  ' 1018727 | BAD MONKEY                                         |                |                   | IP                                |',
  ' 1018782 | EVOLVE LAW                                         |                |                   | IP                                |',
  ' 1018670 | WILDQUEST                                          |                |                   | IP                                |',
  ' 1018678 | MACIEIRA                                           |                |                   | IP                                |',
  ' 1018681 | STREETGASM                                         |                |                   | IP                                |',
  ' 1018607 |                                                    |                |                   | IP                                |',
  ' 1018717 | STITCH                                             |                |                   | IP                                |',
  ' 1018747 | PLANIPREP                                          |                |                   | IP                                |',
  ' 1018784 | VERMONT COOKIE BUTTONS                             |                |                   | IP                                |',
  ' 1018666 | INTRA-MATIC                                        |                |                   | IP                                |',
  // ' 1018665 | Yogatini                                           |                | 2016-12-01        | Kuliga                            |',
  ' 1018667 | CAROL TONE BELLS                                   |                |                   | IP                                |',
  ' 1018668 | CONSTANT COMFORT                                   |                |                   | IP                                |',
  ' 1018740 | BLUEMED                                            |                |                   | IP                                |',
  ' 1018741 | BLUEMED & DESIGN                                   |                |                   | IP                                |',
  ' 1018789 | CRIMEBLOCK                                         |                |                   | IP                                |',
  ' 1018683 | DISTILLED QUALITY & DESIGN                         |                |                   | IP                                |',
  ' 1018718 | L?OR DE JEAN MARTELL & DESIGN                      |                |                   | IP                                |',
  ' 1018847 | 65 SAVINGS                                         |                |                   | Yospin                            |',
  ' 1019207 | FILTH                                              |                |                   | IP                                |',
  ' 1018589 | LIQUID GOLD                                        |                |                   | IP                                |',
  ' 1018872 | ODYSSEY IMPACT                                     |                |                   | IP                                |',
  ' 1018601 | GROUPDOLISTS                                       |                |                   | IP                                |',
  ' 1018595 | AMERICAN MAPLE                                     |                |                   | IP                                |',
  ' 1018868 | NET GENERATION                                     |                |                   | IP                                |',
  ' 1018874 | ENGAGE ENTERTAINMENT                               |                |                   | IP                                |',
  ' 1018875 | CAMBRIDGE FAMILY ENTERPRISE GROUP & DESIGN         |                |                   | IP                                |',
  ' 1018876 | CAMBRIDGE INSTITUTE FOR FAMILY ENTERPRISE          |                |                   | IP                                |',
  ' 1018996 | LUCY                                               |                |                   | Yospin                            |',
  ' 1019229 | PARTNER IN ART                                     |                |                   | IP                                |',
  ' 1019231 | ROUTEWORTHY                                        |                |                   | IP                                |',
  ' 1019242 | MONROSSO & DESIGN                                  |                |                   | IP                                |',
  ' 1019244 | NET GENERATION & DESIGN                            |                |                   | IP                                |',
  ' 1018669 | REL61                                              |                |                   | IP                                |',
  ' 1019239 | FABRIZIO BIANCHI NEMO CASTELLO MONSANTO & DESIGN   |                |                   | IP                                |',
  ' 1019281 | ANCILE                                             |                |                   | IP                                |',
  ' 1018863 | CREAKY JOINTS                                      |                |                   | IP                                |',
  ' 1018600 | EROXON                                             |                |                   | IP                                |',
  ' 1019217 | BAOSSANT                                           |                |                   | IP                                |',
  ' 1019218 | BARRACUDA                                          |                |                   | IP                                |',
  ' 1019277 | PILLOW PET SLEEPTIME LITE                          |                |                   | IP                                |',
  ' 1021838 | DREAM STREET                                       |                |                   | Limited Liability Company Georgia |',
  ' 1019168 | ECONSULTZ                                          |                |                   | IP                                |',
  ' 1019169 | ESSENTIA                                           |                |                   | IP                                |',
  ' 1018736 | DRAGON HONEY                                       |                |                   | IP                                |',
  ' 1023403 | Carson Carrington                                  |                | 2017-12-14        | Lancaster                         |',
  ' 1023404 | Porch & Den                                        |                | 2017-08-29        | Lancaster                         |',
  ' 1019238 | CHAINMARK                                          |                |                   | IP                                |',
  ' 1018614 | BUDGE                                              |                |                   | IP                                |',
  ' 1018693 | AEOLUS                                             |                |                   | IP                                |',
  ' 1018705 | PAN CASTLE                                         |                |                   | IP                                |',
  ' 1018521 | Cognate                                            |                |                   | Collen                            |',
  ' 1018591 | REL22                                              |                |                   | IP                                |',
  ' 1019230 | POWER BUILD                                        |                |                   | IP                                |',
  ' 1019233 | STATUS QUO                                         |                |                   | IP                                |',
  ' 1018590 | THE CATHOLIC THEOLOGICAL SOCIETY OF AMERICA        |                |                   | IP                                |',
  ' 1018592 | EURASIA GROUP                                      |                |                   | IP                                |',
  ' 1018593 | PUMA SWEDE                                         |                |                   | IP                                |',
  ' 1019240 | FRESH LOOK & DESIGN                                |                |                   | IP                                |',
  ' 1019241 | KNAPP MONARCH                                      |                |                   | IP                                |',
  ' 1019245 | THE CHILLING ADVENTURES OF SABRINA                 |                |                   | IP                                |',
  ' 1019248 | WHAT DO YOU MEME?                                  |                |                   | IP                                |',
  ' 1019249 | AQUAROSE                                           |                |                   | IP                                |',
  ' 1018731 | MAÏS SOUFFLÉ BAD MONKEY POPCORN & DESIGN           |                |                   | IP                                |',
  ' 1018619 | The Future of Trademarks                           |                |                   | Collen                            |',
  ' 1023456 | HP                                                 |                | 1939-01-01        | Keen                              |',
  ' 1018689 | 10 CORSO COMO MILANO & DESIGN                      |                |                   | IP                                |',
  ' 1018691 | LIMBERBERRY                                        |                |                   | IP                                |',
  ' 1018695 | ORNELLI Design                                     |                |                   | IP                                |',
  ' 1023465 | British American Tobacco                           | 1023465_design | 1950-01-01        | Juras                             |',
  ' 1018597 | CO-EFFICIENT                                       |                |                   | IP                                |',
  ' 1023475 | Pinterest                                          |                | 2010-03-01        | Rowe                              |',
  ' 1019216 | YFA                                                |                |                   | IP                                |',
  ' 1018716 | MUC-OFF                                            |                |                   | IP                                |',
  ' 1018719 | ELLA SIMONE                                        |                |                   | IP                                |',
  ' 1018730 | COOL CLOUD                                         |                |                   | IP                                |',
  ' 1018735 | SEMEON                                             |                |                   | IP                                |',
  ' 1018737 | TIGER  HONEY                                       |                |                   | IP                                |',
  ' 1018440 | TenTheApp                                          | 1018440_design | 2014-08-15        | Lopes                             |',
  ' 1018606 |                                                    |                |                   | IP                                |',
  ' 1018609 |                                                    |                |                   | IP                                |',
  ' 1019265 | SAFEGAUZE COTTON                                   |                |                   | IP                                |',
  ' 1019273 | SENTINEL ELIMINATOR VORTEX                         |                |                   | IP                                |',
  ' 1019274 | EYEPUTTI                                           |                |                   | IP                                |',
  ' 1019275 | VISION SUITE                                       |                |                   | IP                                |',
  ' 1018603 | Dai-ichi Life Group                                |                |                   | IP                                |',
  ' 1018686 | UDON GAMADASHI & DESIGN                            |                |                   | IP                                |',
  ' 1018545 | Drizly                                             |                |                   | Robinson                          |',
  ' 1019213 | NIP & FAB                                          |                |                   | IP                                |',
  ' 1018687 | LORDAE                                             |                |                   | IP                                |',
  ' 1018690 | 10 CORSO COMO MILANO & DESIGN                      |                |                   | IP                                |',
  ' 1018734 | TAKBO & DESIGN                                     |                |                   | IP                                |',
  ' 1019228 | NATURLITE                                          |                |                   | IP                                |',
  ' 1019278 | SLEEPTIME LITE                                     |                |                   | IP                                |',
  ' 1019279 | PHEMIUM                                            |                |                   | IP                                |',
  ' 1019270 | TROPIK                                             |                |                   | IP                                |',
  ' 1018733 | PROMARKER                                          |                |                   | IP                                |',
  ' 1019268 | THOUGHT & DESIGN                                   |                |                   | IP                                |',
  ' 1018864 | ARTHRITIS POWER                                    |                |                   | IP                                |',
  ' 1018865 | SIMPLIHOME DESIGN                                  |                |                   | IP                                |',
  ' 1018866 | SIMPLIHOME                                         |                |                   | IP                                |',
  ' 1018867 | WINSOR & NEWTON PROFESSIONAL                       |                |                   | IP                                |',
  ' 1018870 | FINANCING SMILES                                   |                |                   | IP                                |',
  ' 1019209 | HANGMAN                                            |                |                   | IP                                |',
  ' 1019210 | LEO PAUL                                           |                |                   | IP                                |',
  ' 1019219 | BATTLE BUNKERZ & DESIGN                            |                |                   | IP                                |',
  ' 1019223 | ESTELLE FOURNIER PARTNER & DESIGN                  |                |                   | IP                                |',
  ' 1019224 | GIVE MORE H.U.G.S.                                 |                |                   | IP                                |',
  ' 1019250 | BEACH CLUB                                         |                |                   | IP                                |',
  ' 1019253 | INSPR                                              |                |                   | IP                                |',
  ' 1019225 | GIVING SOULS                                       |                |                   | IP                                |',
  ' 1018674 | M YSL M & DESIGN                                   |                |                   | IP                                |',
  ' 1018743 | MISCELLANEOUS DESIGN (POD ICON)                    |                |                   | IP                                |',
  ' 1019235 | THERMIC                                            |                |                   | IP                                |',
  ' 1018795 | BONNEVAL                                           |                |                   | IP                                |',
  ' 1018605 | Dai-ichi Life Holdings                             |                |                   | IP                                |',
  ' 1018610 |                                                    |                |                   | IP                                |',
  ' 1018620 | The Future of Trademark Protection                 |                |                   | Collen                            |',
  ' 1018694 | VALENTINE                                          |                |                   | IP                                |',
  ' 1018697 | 4ROOTZ                                             |                |                   | IP                                |',
  ' 1018698 | BE CURIOUS                                         |                |                   | IP                                |',
  ' 1019267 | THE MALFUNCTION                                    |                |                   | IP                                |',
  ' 1019262 | PERFORMIND                                         |                |                   | IP                                |',
  ' 1019263 | PLANET E BY ECO-STREAM & DESIGN                    |                |                   | IP                                |',
  ' 1018684 | HEALTHEFFICIENT                                    |                |                   | IP                                |',
  ' 1019246 | THE NEXT GENERATION OF GREATS                      |                |                   | IP                                |',
  ' 1018997 | FOCUS                                              |                |                   | Yospin                            |',
  ' 1018608 | UNITED FOR THE TROOPS                              |                |                   | IP                                |',
  ' 1018611 | OCEANA POKE                                        |                |                   | IP                                |',
  ' 1018612 | ARGENTO PASTA                                      |                |                   | IP                                |',
  ' 1018452 | Studio 26 Associates, LLC                          | 1018452_design | 2015-01-06        | Nganga                            |',
  ' 1018709 | TRUE GROUT                                         |                |                   | IP                                |',
  ' 1018710 | MY MINIWORLD                                       |                |                   | IP                                |',
  ' 1018711 | NO 18 & DESIGN                                     |                |                   | IP                                |',
  ' 1018703 | H-30 FLEX                                          |                |                   | IP                                |',
  ' 1018704 | THE FUTURE OF ROLLING                              |                |                   | IP                                |',
  ' 1018707 | DENSIFIED FOAM CORE                                |                |                   | IP                                |',
  ' 1019236 | VIZISYNC                                           |                |                   | IP                                |',
  ' 1019259 | M Design                                           |                |                   | IP                                |',
  ' 1018750 | keracolor                                          |                |                   | Collen                            |',
  ' 1018712 | FANSCORE                                           |                |                   | IP                                |',
  ' 1018785 | ADRIANNA VINEYARD MUNDUS BACILLUS TERRAE           |                |                   | IP                                |',
  ' 1019034 | Money Cleanse                                      |                |                   | Feinstein Gerstley                |',
  ' 1019177 | SCIENCE SQUAD & DESIGN                             |                |                   | IP                                |',
  ' 1019237 | AFTERLIFE WITH ARCHIE                              |                |                   | IP                                |',
  ' 1019185 | MEDICALLY NECESSARY                                |                |                   | IP                                |',
  ' 1019196 | THE BUSTED KNUCKLE GARAGE & DESIGN                 |                |                   | IP                                |',
  ' 1019280 | VREST                                              |                |                   | IP                                |',
  ' 1019283 | GET YOUR PIZZAFIX                                  |                |                   | IP                                |',
  ' 1018869 | OBSTACLE COURSE RACING WORLD SERIES                |                |                   | IP                                |',
  ' 1018871 | OBSTACLE COURSE RACING WORLD CUP                   |                |                   | IP                                |',
  ' 1018685 | NET GENERATION                                     |                |                   | IP                                |',
  ' 1018692 | BABY YOURSELF                                      |                |                   | IP                                |',
  ' 1018790 | OMNITEST                                           |                |                   | IP                                |',
  ' 1018791 | REP-HAIR                                           |                |                   | IP                                |',
  ' 1018699 | HUGSTORY & DESIGN                                  |                |                   | IP                                |',
  ' 1018700 | RETURN ON HUMAN INVESTMENT                         |                |                   | IP                                |',
  ' 1018738 | SWATCH                                             |                |                   | IP                                |',
  ' 1018746 | S&B WASABI POWDER & DESIGN                         |                |                   | IP                                |',
  ' 1018792 | MAD RADISH                                         |                |                   | IP                                |',
  ' 1019247 | VIZITOUCH                                          |                |                   | IP                                |',
  ' 1018793 | AQUATILE                                           |                |                   | IP                                |',
  ' 1018873 | GAMEHEDGE & DESIGN                                 |                |                   | IP                                |',
  ' 1019170 | FAST-ED                                            |                |                   | IP                                |',
  ' 1019251 | BODY ROSE                                          |                |                   | IP                                |',
  ' 1019171 | GO PLAY! BY GRAFIX & DESIGN                        |                |                   | IP                                |',
  ' 1019172 | HOW DO YOU APÉRITIF?                               |                |                   | IP                                |',
  ' 1019252 | COTEAM                                             |                |                   | IP                                |',
  ' 1019254 | JPL TELE.COM & DESIGN                              |                |                   | IP                                |',
  ' 1018671 | VALGRANGES                                         |                |                   | IP                                |',
  ' 1019256 | LA VIE EN ROSE MUSE                                |                |                   | IP                                |',
  ' 1018794 | FROCCELLA                                          |                |                   | IP                                |',
  ' 1018677 | SEASONPROOF YOUR HOME                              |                |                   | IP                                |',
  ' 1019257 | LCM & Design                                       |                |                   | IP                                |',
  ' 1019258 | LCM PARTNERS & Design                              |                |                   | IP                                |',
  ' 1018702 | YIELD DEVELOPMENT                                  |                |                   | IP                                |',
  ' 1018742 | IFS AURENA                                         |                |                   | IP                                |',
  ' 1018713 | MARTELL EXTRAITS & DESIGN                          |                |                   | IP                                |',
  ' 1018672 | MUSEE YVES SAINT LAURENT PARIS & DESIGN            |                |                   | IP                                |',
  ' 1018682 | STREETGASM.COM & DESIGN                            |                |                   | IP                                |',
  ' 1018739 | DOMAINE MUMM                                       |                |                   | IP                                |',
  ' 1018688 | CHEESE PEARLS                                      |                |                   | IP                                |',
  ' 1018701 | ROHI                                               |                |                   | IP                                |',
  ' 1019178 | SCIENCE SQUAD                                      |                |                   | IP                                |',
  ' 1019221 | BELLOF & DESIGN                                    |                |                   | IP                                |',
  ' 1019232 | SILVERSMART                                        |                |                   | IP                                |',
  ' 1019173 | LUCA DEL FORTE                                     |                |                   | IP                                |',
  ' 1019176 | PUAROT. & DESIGN                                   |                |                   | IP                                |',
  ' 1019187 | REEVES & DESIGN                                    |                |                   | IP                                |',
  ' 1019193 | ODYSSEY IMPACT & DESIGN                            |                |                   | IP                                |',
  ' 1019243 | MONROSSO & DESIGN                                  |                |                   | IP                                |',
  ' 1019234 | THE MIGHTY CRUSADERS                               |                |                   | IP                                |',
  ' 1019179 | SIERRA PINE                                        |                |                   | IP                                |',
  ' 1019180 | SWISSMATIC                                         |                |                   | IP                                |',
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
