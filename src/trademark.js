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
Contracts.v3 = loadContracts('v3', web3);
Contracts.v2 = loadContracts('v2', web3);

function loadContracts(version, web3) {
  const results = {};
  const files = fs.readdirSync(`node_modules/cog-asset/builds-versioned/${version}/contracts`);
  for (const file of files) {
    const name = file.split('.')[0];
    const path = `cog-asset/builds-versioned/${version}/contracts/${file}`;
    const Contract = contract(require(path));
    Contract.setProvider(web3.currentProvider);
    log(DEBUG, ` - loaded: ${path}`);
    results[name] = Contract;
  }
  return results;
}

const V4_TRADEMARK_CODE =
  '0x606060405236156100725763ffffffff60e060020a6000350416632f64d386811461007757806341c0e1b5146101045780634c8fe52614610';
const V3_TRADEMARK_CODE =
  '0x6060604052600436106100a4576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff1680631';

const V4_TRADEMARK = 'v4';
const V3_TRADEMARK = 'v3';

async function getTrademark(address) {
  const code = await web3.eth.getCodeAsync(address);
  let trademark;
  if (code.startsWith(V4_TRADEMARK_CODE)) {
    // TODO: v4
    trademark = await Contracts.v3.Trademark.at(address);
    trademark.type = V4_TRADEMARK;
  } else if (code.startsWith(V3_TRADEMARK_CODE)) {
    trademark = await Contracts.v3.Trademark.at(address);
    trademark.type = V3_TRADEMARK;
  } else {
    throw new Error('unidentifiable byte code for trademark');
  }
  const timestamp = await trademark.timestamp();
  const design = await trademark.design();
  const word = await trademark.word();
  // console.log(await trademark.initialProof()); // TODO: v4
  // console.log(await trademark.initialProofLocation()); // TODO: v4

  const result = {};
  result.address = address;
  if (design !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
    result.design = design;
    result.designLocation = 'TODO'; // TODO: await trademark.designLocation();
  }
  result.timeline = await getTimeline(await trademark.timeline());
  // TODO: Better way to check this?
  if (timestamp.greaterThan(0)) {
    result.timestamp = timestamp.toNumber();
  }
  if (word !== '') {
    result.word = word;
  }
  return result;
}

async function getTimeline(address) {
  if (address === '0x') {
    return undefined;
  }
  const timeline = await Contracts.v3.Timeline.at(address);
  const documents = [];
  // loop over all the timeline documents
  let next = await timeline.next();
  while (next) {
    let document = await getTimelineDocument(next);
    documents.push(document);
    next = document.next;
    delete document.next;
  }

  const result = {};
  result.address = address;
  result.documents = documents;
  return result;
}

// poor mans byte code mapping (V3 and V4)
const AREA_OF_USE_CODE =
  '0x6060604052600436106100af576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff1680630';
const ASSIGNMENT_CODE =
  '0x6060604052600436106100a4576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff1680634';
const CLASSIFICATION_CODE =
  '0x6060604052600436106100af576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff1680634';
const PROOF_OF_USE_CODE =
  '0x6060604052600436106100a4576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff1680630';

const AREA_OF_USE = 'AreaOfUse';
const ASSIGNMENT = 'Assignment';
const CLASSIFICATION = 'Classification';
const PROOF_OF_USE = 'ProofOfUse';

async function getTimelineDocument(address) {
  const code = await web3.eth.getCodeAsync(address);
  let timelineDocument;
  if (code.startsWith(ASSIGNMENT_CODE)) {
    timelineDocument = await Contracts.v3.Assignment.at(address);
    timelineDocument.type = ASSIGNMENT;
  } else if (code.startsWith(AREA_OF_USE_CODE)) {
    timelineDocument = await Contracts.v3.AreaOfUse.at(address);
    timelineDocument.type = AREA_OF_USE;
  } else if (code.startsWith(CLASSIFICATION_CODE)) {
    timelineDocument = await Contracts.v3.Classification.at(address);
    timelineDocument.type = CLASSIFICATION;
  } else if (code.startsWith(PROOF_OF_USE_CODE)) {
    timelineDocument = await Contracts.v3.ProofDocument.at(address);
    timelineDocument.type = PROOF_OF_USE;
  } else {
    throw new Error('unidentifiable byte code for timeline document');
  }

  const timestamp = await timelineDocument.timestamp();
  const next = await timelineDocument.next();

  const result = {};
  result.address = address;
  if (timelineDocument.type === CLASSIFICATION) {
    result.classOfGoods = await timelineDocument.classOfGoods();
  }
  if (timelineDocument.type === ASSIGNMENT) {
    result.companyName = await timelineDocument.companyName();
  }
  if (timelineDocument.type === AREA_OF_USE) {
    result.countries = await timelineDocument.countries();
  }
  if (timelineDocument.type === CLASSIFICATION) {
    result.details = await timelineDocument.details();
  }
  if (timelineDocument.type === ASSIGNMENT) {
    result.firstName = await timelineDocument.firstName();
  }
  if (timelineDocument.type === PROOF_OF_USE) {
    result.hash = await timelineDocument.hash();
  }
  if (timelineDocument.type === ASSIGNMENT) {
    result.lastName = await timelineDocument.lastName();
  }
  if (timelineDocument.type === PROOF_OF_USE) {
    result.location = await timelineDocument.location();
  }
  if (next !== '0x0000000000000000000000000000000000000000') {
    result.next = next;
  }
  if (timelineDocument.type === CLASSIFICATION || timelineDocument.type === AREA_OF_USE) {
    const proofs = await timelineDocument.proofs();
    if (proofs.length) {
      result.proofs = proofs;
    }
  }
  if (timelineDocument.type === AREA_OF_USE) {
    result.regions = await timelineDocument.regions();
  }
  // TODO: Better way to check this?
  if (timestamp.greaterThan(0)) {
    result.timestamp = timestamp.toNumber();
  }
  result.type = timelineDocument.type;
  return result;
}

module.exports.getTrademark = getTrademark;
