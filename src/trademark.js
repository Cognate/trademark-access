const contract = require('truffle-contract');
const Bluebird = require('bluebird');
const Web3 = require('web3');
const ProviderEngine = require('web3-provider-engine');
const Web3SubProvider = require('web3-provider-engine/subproviders/web3.js');
const fs = require('fs');

const DEBUG = 0;
const INFO = 1;
// const WARN = 2;
// const ERROR = 3;

const ethereumUrl = 'https://mainnet.infura.io/uLI2u8INr7rEARc0acDF';
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
log(INFO, 'completed loading contracts');

function loadContracts(version, web3) {
  const results = {};
  const path = version === 'v4' ? 'cog-asset/build/contracts' : `cog-asset/builds-versioned/${version}/contracts`;
  const files = fs.readdirSync(`node_modules/${path}`);
  for (const file of files) {
    const name = file.split('.')[0];
    const filePath = `${path}/${file}`;
    const Contract = contract(require(filePath));
    Contract.setProvider(web3.currentProvider);
    log(DEBUG, ` - loaded: ${filePath}`);
    results[name] = Contract;
  }
  return results;
}

// TODO: poor mans byte map
const ContractMap = {
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
};

async function process(address) {
  const code = (await web3.eth.getCodeAsync(address)).substring(0, 116);
  const lookup = ContractMap[code];
  if (!lookup) {
    console.log(code);
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
      log(DEBUG, ` - adding design location ${context}`);
      result.designLocation = 'TODO'; // TODO: await trademark.designLocation();
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
  if (trademark.initialProof) {
    log(DEBUG, `adding initial proof ${context}`);
    const proof = {
      address: address,
      hash: await trademark.initialProof(),
      location: await trademark.initialProofLocation(),
      type: 'ProofOfUse',
    };
    if (timestamp.greaterThan(0)) {
      proof.timestamp = timestamp.toNumber();
    }
    // push to beginning of the array
    result.timeline.documents.unshift(sort(proof));
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
  log(DEBUG, `   - adding countries ${context}`);
  result.countries = await areaOfUse.countries();
  log(DEBUG, `   - getting next ${context}`);
  const next = await areaOfUse.next();
  if (next !== '0x0000000000000000000000000000000000000000') {
    log(DEBUG, `   - adding next ${context}`);
    result.next = next;
  }
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
    result.regions = regions;
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
  log(DEBUG, `   - adding class of goods ${context}`);
  result.classOfGoods = await classification.classOfGoods();
  log(DEBUG, `   - adding details ${context}`);
  result.details = await classification.details();
  log(DEBUG, `   - getting next ${context}`);
  const next = await classification.next();
  if (next !== '0x0000000000000000000000000000000000000000') {
    log(DEBUG, `   - adding next ${context}`);
    result.next = next;
  }
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
  result.location = await proofOfUse.location();
  log(DEBUG, `   - getting next ${context}`);
  const next = await proofOfUse.next();
  if (next !== '0x0000000000000000000000000000000000000000') {
    log(DEBUG, `   - adding next ${context}`);
    result.next = next;
  }
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
  log(DEBUG, `   - adding company name ${context}`);
  result.companyName = await assignment.companyName();
  log(DEBUG, `   - adding first name ${context}`);
  result.firstName = await assignment.firstName();
  log(DEBUG, `   - adding last name ${context}`);
  result.lastName = await assignment.lastName();
  log(DEBUG, `   - getting next ${context}`);
  const next = await assignment.next();
  if (next !== '0x0000000000000000000000000000000000000000') {
    log(DEBUG, `   - adding next ${context}`);
    result.next = next;
  }
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

async function getTrademark(address) {
  log(INFO, `getting trademark at: ${address}`);
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

module.exports.getTrademark = getTrademark;
