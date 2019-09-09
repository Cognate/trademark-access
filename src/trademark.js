const contract = require('truffle-contract');
const Bluebird = require('bluebird');
const Web3 = require('web3');
const ProviderEngine = require('web3-provider-engine');
const Web3SubProvider = require('web3-provider-engine/subproviders/web3.js');
const contractMap = require('./contracts/map');

const DEBUG = 0;
const INFO = 1;

/** base url for the deprecated S3 bucket location */
const s3Base = 'https://s3.amazonaws.com/cog-design-marks/';
/** base url for the github raw location */
const githubBase = 'https://cognate.github.io/trademark-access/design_marks/';
/** url to access Ethereum */
const ethereumUrl = 'https://mainnet.infura.io/v3/6c62a9b1a3b640d587a70b105cbc3be9';
/** level of logging */
const LEVEL = INFO;

function log(level, text) {
  if (level >= LEVEL) {
    console.log(text);
  }
}

const engine = new ProviderEngine();
const web3 = new Web3(engine);

web3.eth = Bluebird.promisifyAll(web3.eth);

engine.addProvider(new Web3SubProvider(new Web3.providers.HttpProvider(ethereumUrl)));
engine.start();

log(INFO, 'loading contracts...');

const Contracts = {};
Contracts.v4 = loadContracts('v4', web3);
Contracts.v3 = loadContracts('v3', web3);
Contracts.v2 = loadContracts('v2', web3);
Contracts.v1 = loadContracts('v1', web3);
log(INFO, 'completed loading contracts');

function loadContracts(version, web3) {
  const results = {};
  const path = version === 'v4' ? 'contracts/build/contracts' : `contracts/builds-versioned/${version}/contracts`;
  const files = contractMap[version];
  for (const file of files) {
    const name = file.split('.')[0];
    const Contract = contract(require(`./${path}/${file}`));
    // noinspection JSUnresolvedFunction
    Contract.setProvider(web3.currentProvider);
    log(DEBUG, ` - loaded: ${path}/${file}`);
    results[name] = Contract;
  }
  return results;
}

// TODO: poor mans byte map
// noinspection JSUnresolvedVariable
const ContractMap = {
  // '0x6080604052600436106100ae5763ffffffff7c01000000000000000000000000000000000000000000000000000000006000350416634589fe': {
  //   context: 'v1',
  //   contract: Contracts.v1.Listing,
  //   handler: processTrademark,
  // },
  '0x606060405236156100725763ffffffff60e060020a6000350416632f64d386811461007757806341c0e1b5146101045780634c8fe526146101': {
    context: 'v2',
    contract: Contracts.v2.Trademark,
    handler: processTrademark,
  },
  '0x6060604052600436106100a4576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff16806317': {
    context: 'v3',
    contract: Contracts.v3.Trademark,
    handler: processTrademark,
  },
  '0x6080604052600436106100825763ffffffff7c010000000000000000000000000000000000000000000000000000000060003504166317a541': {
    context: 'v4',
    contract: Contracts.v4.WordMark,
    handler: processTrademark,
  },
  '0x6080604052600436106100985763ffffffff7c010000000000000000000000000000000000000000000000000000000060003504166317a541': {
    context: 'v4',
    contract: Contracts.v4.WordMarkWithInitialProof,
    handler: processTrademark,
  },
  '0x6080604052600436106100ae5763ffffffff7c010000000000000000000000000000000000000000000000000000000060003504166317a541': {
    context: 'v4',
    contract: Contracts.v4.WordAndDesignMarkWithInitialProof,
    handler: processTrademark,
  },
  '0x6060604052600436106100af576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff16806309': {
    context: 'v3',
    contract: Contracts.v3.Timeline,
    handler: processTimeline,
  },
  '0x6080604052600436106100b95763ffffffff7c01000000000000000000000000000000000000000000000000000000006000350416630900f0': {
    context: 'v4',
    contract: Contracts.v4.Timeline,
    handler: processTimeline,
  },
  '0x6060604052600436106100af576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff16806303': {
    context: 'v3',
    contract: Contracts.v3.AreaOfUse,
    handler: processAreaOfUse,
  },
  '0x6060604052600436106100af576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff16806343': {
    context: 'v3',
    contract: Contracts.v3.Classification,
    handler: processClassification,
  },
  '0x6060604052600436106100a4576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff16806309': {
    context: 'v3',
    contract: Contracts.v3.ProofDocument,
    handler: processProofOfUse,
  },
  '0x6060604052600436106100a4576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff16806345': {
    context: 'v3',
    contract: Contracts.v3.Assignment,
    handler: processAssignment,
  },
  '0x6080604052600436106100b95763ffffffff7c010000000000000000000000000000000000000000000000000000000060003504166303c108': {
    context: 'v4',
    contract: Contracts.v4.AreaOfUse,
    handler: processAreaOfUse,
  },
  '0x6080604052600436106100b95763ffffffff7c0100000000000000000000000000000000000000000000000000000000600035041663435d53': {
    context: 'v4',
    contract: Contracts.v4.Classification,
    handler: processClassification,
  },
  '0x6080604052600436106100ae5763ffffffff7c010000000000000000000000000000000000000000000000000000000060003504166309bd5a': {
    context: 'v4',
    contract: Contracts.v4.ProofDocument,
    handler: processProofOfUse,
  },
  '0x6080604052600436106100ae5763ffffffff7c01000000000000000000000000000000000000000000000000000000006000350416634589fe': {
    context: 'v4',
    contract: Contracts.v4.Assignment,
    handler: processAssignment,
  },
};

async function process(address) {
  // noinspection JSUnresolvedFunction
  const code = (await web3.eth.getCodeAsync(address)).substring(0, 116);
  const lookup = ContractMap[code];
  if (!lookup) {
    console.log(`failed ContractMap lookup: ${code}`);
    throw new Error('unidentifiable byte code for trademark');
  }
  return lookup.handler(await lookup.contract.at(address), address, lookup.context);
}

async function processTrademark(trademark, address, context) {
  log(DEBUG, `processing Trademark ${context}`);
  const result = {};
  result.address = address;
  // TODO: Better way to check this?
  log(DEBUG, ` - getting timestamp ${context}`);
  const timestamp = await trademark.timestamp();
  if (timestamp.greaterThan(0)) {
    log(DEBUG, ` - adding timestamp ${context}`);
    result.timestamp = timestamp.toNumber();
  }
  if (trademark.design) {
    log(DEBUG, ` - getting design ${context}`);
    const design = await trademark.design();
    if (design !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
      log(DEBUG, ` - adding design ${context}`);
      result.design = design;
      // noinspection JSUnresolvedVariable
      if (trademark.designLocation) {
        log(DEBUG, ` - adding design location ${context}`);
        const designLocation = await trademark.designLocation();
        result.deprecatedDesignLocation = designLocation;
        result.migratedLocation = designLocation.replace(s3Base, githubBase);
        // TODO: download the migrated location and calculate the SHA256
        result.migratedHash = 'TODO';
      }
    }
  }
  if (trademark.word) {
    log(DEBUG, ` - getting word ${context}`);
    const word = await trademark.word();
    if (word !== '') {
      log(DEBUG, ` - adding word ${context}`);
      result.word = word;
    }
  }
  if (trademark.timeline) {
    log(DEBUG, ` - getting timeline ${context}`);
    const timeline = await trademark.timeline();
    if (timeline !== '0x' && timeline !== '0x0000000000000000000000000000000000000000') {
      log(DEBUG, ` - adding timeline ${context}`);
      result.timeline = await process(timeline);
    } else {
      log(DEBUG, `adding empty timeline ${context}`);
      result.timeline = {
        address: address,
        documents: [],
      };
    }
  } else {
    log(DEBUG, `adding empty timeline ${context}`);
    result.timeline = {
      address: address,
      documents: [],
    };
  }
  // noinspection JSUnresolvedVariable
  if (trademark.initialProof) {
    log(DEBUG, `getting initial proof ${context}`);
    const initialProof = await trademark.initialProof();
    if (initialProof !== '0x') {
      log(DEBUG, `adding initial proof ${context}`);
      // noinspection JSUnresolvedFunction
      const proof = {
        address: address,
        hash: await trademark.initialProof(),
        deprecatedLocation: await trademark.initialProofLocation(),
        type: 'ProofOfUse',
      };
      if (timestamp.greaterThan(0)) {
        proof.timestamp = timestamp.toNumber();
      }
      // push to beginning of the array
      result.timeline.documents.unshift(sort(proof));
    }
  }
  if (result.timeline.documents.length === 0) {
    log(DEBUG, `deleting empty timeline ${context}`);
    delete result.timeline;
  }
  return sort(result);
}

async function processTimeline(timeline, address, context) {
  log(DEBUG, `processing Timeline ${context}`);
  const documents = [];
  // loop over all the timeline documents
  log(DEBUG, ` - getting first ${context}`);
  let next = await timeline.next();
  while (next) {
    if (next === '0x0000000000000000000000000000000000000000') {
      log(DEBUG, ` - documents complete ${context}`);
      break;
    }
    let document = await process(next);
    documents.push(document);
    next = document.next;
    delete document.next;
  }
  const result = {};
  result.address = address;
  result.documents = documents;
  return sort(result);
}

async function processAreaOfUse(areaOfUse, address, context) {
  log(DEBUG, ` - processing Area of Use ${context}`);
  const result = {};
  result.address = address;
  log(DEBUG, `   - getting countries ${context}`);
  const countries = await areaOfUse.countries();
  if (countries !== '') {
    log(DEBUG, `   - adding countries ${context}`);
    result.countries = countries.split(',').sort();
  }
  await addNext(areaOfUse, result, context);
  log(DEBUG, `   - getting proofs ${context}`);
  const proofs = await areaOfUse.proofs();
  if (proofs.length) {
    log(DEBUG, `   - adding proofs ${context}`);
    result.proofs = proofs;
  }
  log(DEBUG, `   - getting regions ${context}`);
  const regions = await areaOfUse.regions();
  if (regions !== '') {
    log(DEBUG, `   - adding regions ${context}`);
    result.regions = regions.split(',').sort();
  }
  // TODO: Better way to check this?
  log(DEBUG, `   - getting timestamp ${context}`);
  const timestamp = await areaOfUse.timestamp();
  if (timestamp.greaterThan(0)) {
    log(DEBUG, `   - adding timestamp ${context}`);
    result.timestamp = timestamp.toNumber();
  }
  result.type = 'AreaOfUse';
  return sort(result);
}

async function processClassification(classification, address, context) {
  log(DEBUG, ` - processing Classification ${context}`);
  const result = {};
  result.address = address;
  log(DEBUG, `   - getting class of goods ${context}`);
  const classOfGoods = await classification.classOfGoods();
  if (classOfGoods) {
    log(DEBUG, `   - adding class of goods ${context}`);
    result.classOfGoods = parseInt(classOfGoods);
  }
  log(DEBUG, `   - getting details ${context}`);
  const details = await classification.details();
  if (details) {
    log(DEBUG, `   - adding details ${context}`);
    result.details = details.split('|').sort();
  }
  await addNext(classification, result, context);
  log(DEBUG, `   - getting proofs ${context}`);
  const proofs = await classification.proofs();
  if (proofs.length) {
    log(DEBUG, `   - adding proofs ${context}`);
    result.proofs = proofs;
  }
  // TODO: Better way to check this?
  log(DEBUG, `   - getting timestamp ${context}`);
  const timestamp = await classification.timestamp();
  if (timestamp.greaterThan(0)) {
    log(DEBUG, `   - adding timestamp ${context}`);
    result.timestamp = timestamp.toNumber();
  }
  result.type = 'Classification';
  return sort(result);
}

async function processProofOfUse(proofOfUse, address, context) {
  log(DEBUG, ` - processing Proof of Use ${context}`);
  const result = {};
  result.address = address;
  log(DEBUG, `   - adding hash ${context}`);
  result.hash = await proofOfUse.hash();
  log(DEBUG, `   - adding location ${context}`);
  result.deprecatedLocation = await proofOfUse.location();
  await addNext(proofOfUse, result, context);
  // TODO: Better way to check this?
  log(DEBUG, `   - getting timestamp ${context}`);
  const timestamp = await proofOfUse.timestamp();
  if (timestamp.greaterThan(0)) {
    log(DEBUG, `   - adding timestamp ${context}`);
    result.timestamp = timestamp.toNumber();
  }
  result.type = 'ProofOfUse';
  return sort(result);
}

async function processAssignment(assignment, address, context) {
  log(DEBUG, ` - processing Assignment ${context}`);
  const result = {};
  result.address = address;
  log(DEBUG, `   - getting company name ${context}`);
  const companyName = await assignment.companyName();
  if (companyName !== '') {
    log(DEBUG, `   - adding company name ${context}`);
    result.companyName = companyName;
  }
  log(DEBUG, `   - getting first name ${context}`);
  const firstName = await assignment.firstName();
  if (firstName !== '') {
    log(DEBUG, `   - adding first name ${context}`);
    result.firstName = firstName;
  }
  log(DEBUG, `   - getting last name ${context}`);
  const lastName = await assignment.lastName();
  if (lastName !== '') {
    log(DEBUG, `   - adding last name ${context}`);
    result.lastName = lastName;
  }
  await addNext(assignment, result, context);
  // TODO: Better way to check this?
  log(DEBUG, `   - getting timestamp ${context}`);
  const timestamp = await assignment.timestamp();
  if (timestamp.greaterThan(0)) {
    log(DEBUG, `   - adding timestamp ${context}`);
    result.timestamp = timestamp.toNumber();
  }
  result.type = 'Assignment';
  return sort(result);
}

async function addNext(document, result, context) {
  log(DEBUG, `   - getting next ${context}`);
  const next = await document.next();
  if (next !== '0x0000000000000000000000000000000000000000') {
    log(DEBUG, `   - adding next ${context}`);
    result.next = next;
  }
}

async function getTrademarkForAddress(address) {
  log(DEBUG, `getting trademark at: ${address}`);
  return process(address);
}

function sort(unordered) {
  const ordered = {};
  Object.keys(unordered)
    .sort()
    .forEach(key => {
      ordered[key] = unordered[key];
    });
  return ordered;
}

module.exports.getTrademarkForAddress = getTrademarkForAddress;
module.exports.githubBase = githubBase;
module.exports.s3Base = s3Base;
