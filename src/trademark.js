const contract = require('truffle-contract');
const Bluebird = require('bluebird');
const Web3 = require('web3');
const ProviderEngine = require('web3-provider-engine');
const Web3SubProvider = require('web3-provider-engine/subproviders/web3.js');
const contractMap = require('./contracts/map');

const DEBUG = 0;
const INFO = 1;
const ERROR = 2;

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

log(DEBUG, 'loading contracts...');
const Contracts = {};
Contracts.v4 = loadContracts('v4', web3);
Contracts.v3 = loadContracts('v3', web3);
Contracts.v2 = loadContracts('v2', web3);
Contracts.v1 = loadContracts('v1', web3);
log(DEBUG, 'completed loading contracts');

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
  '0x606060405236156100825760e060020a600035046306f9fcd481146100875780633cecd719146100e257806341c0e1b5146103095780634c160b40146103375780637e05f5a81461036a5780638fff396f146103945780639749c4e81461041c5780639f8f60f31461044f578063c4': {
    context: 'v1',
    contract: Contracts.v1.Listing,
    handler: processTrademark,
  },
  '0x606060405236156100725763ffffffff60e060020a6000350416632f64d386811461007757806341c0e1b5146101045780634c8fe5261461011357806352effe111461013c57806393f5020614610157578063ac04f5a714610176578063ba19322d14610191578063cf09e0d01461': {
    context: 'v2',
    contract: Contracts.v2.Trademark,
    handler: processTrademark,
  },
  '0x6060604052600436106100a4576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff16806317a5410b146100a95780632f64d386146100fe57806341c0e1b51461018c57806352effe11146101a15780638da5cb5b146101da578063': {
    context: 'v3',
    contract: Contracts.v3.Trademark,
    handler: processTrademark,
  },
  '0x6080604052600436106100825763ffffffff7c010000000000000000000000000000000000000000000000000000000060003504166317a5410b81146100875780632f64d386146100b857806341c0e1b51461014257806352effe11146101595780638da5cb5b1461017a578063b8': {
    context: 'v4',
    contract: Contracts.v4.WordMark,
    handler: processTrademark,
  },
  '0x6080604052600436106100985763ffffffff7c010000000000000000000000000000000000000000000000000000000060003504166317a5410b811461009d5780632f64d386146100ce57806341c0e1b51461015857806352effe111461016f5780638da5cb5b14610190578063a9': {
    context: 'v4',
    contract: Contracts.v4.WordMarkWithInitialProof,
    handler: processTrademark,
  },
  '0x60806040526004361061008d5763ffffffff7c010000000000000000000000000000000000000000000000000000000060003504166317a5410b811461009257806341c0e1b5146100c357806352effe11146100da5780638da5cb5b146100fb57806393f5020614610110578063a7': {
    context: 'v4',
    contract: Contracts.v4.DesignMark,
    handler: processTrademark,
  },
  '0x6080604052600436106100985763ffffffff7c010000000000000000000000000000000000000000000000000000000060003504166317a5410b811461009d5780632f64d386146100ce57806341c0e1b51461015857806352effe111461016f5780638da5cb5b1461019057806393': {
    context: 'v4',
    contract: Contracts.v4.WordAndDesignMark,
    handler: processTrademark,
  },
  '0x6080604052600436106100ae5763ffffffff7c010000000000000000000000000000000000000000000000000000000060003504166317a5410b81146100b35780632f64d386146100e457806341c0e1b51461016e57806352effe11146101855780638da5cb5b146101a657806393': {
    context: 'v4',
    contract: Contracts.v4.WordAndDesignMarkWithInitialProof,
    handler: processTrademark,
  },
  '0x6060604052600436106100af576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff1680630900f010146100b457806313d8c840146100ed5780634c8fe5261461014257806352effe111461019757806354fd4d50146101d0578063': {
    context: 'v3',
    contract: Contracts.v3.Timeline,
    handler: processTimeline,
  },
  '0x6080604052600436106100b95763ffffffff7c01000000000000000000000000000000000000000000000000000000006000350416630900f01081146100be57806313d8c840146100e157806329092d0e146101125780634c8fe5261461013357806352effe111461014857806354': {
    context: 'v4',
    contract: Contracts.v4.Timeline,
    handler: processTimeline,
  },
  '0x606060405236156100825760e060020a600035046305c7e05481146100875780633cecd719146100b157806341c0e1b51461017f5780637e05f5a8146101ad5780639144e776146101d7578063ac04f5a714610260578063c47049cd146102c8578063d3e32f0b146102fb578063ed': {
    context: 'v1',
    contract: Contracts.v1.UsageDocument,
    handler: processProofOfUse,
  },
  '0x606060405236156100725763ffffffff60e060020a6000350416634589fe0c81146100775780634c8fe5261461010457806352effe111461012d5780639ab03dcb14610148578063ac04f5a7146101d5578063ba19322d146101f0578063cf09e0d01461020f578063f5ec2eed1461': {
    context: 'v2',
    contract: Contracts.v2.Assignment,
    handler: processAssignment,
  },
  '0x606060405236156100885763ffffffff60e060020a6000350416633aa89aec811461008d5780634c8fe5261461011a57806352effe1114610143578063565974d31461015e578063654c1c38146101eb5780638a7be8e51461020a578063abc0bbe714610229578063ac04f5a71461': {
    context: 'v2',
    contract: Contracts.v2.UsageDocument,
    handler: processProofOfUse,
  },
  '0x6060604052600436106100af576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff16806303c108b8146100b4578063435d53f2146101425780634c8fe526146101ac57806352effe11146102015780638da5cb5b1461023a578063': {
    context: 'v3',
    contract: Contracts.v3.AreaOfUse,
    handler: processAreaOfUse,
  },
  '0x6060604052600436106100af576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff168063435d53f2146100b45780634c8fe5261461011e57806352effe1114610173578063565974d3146101ac5780638a7be8e51461023a578063': {
    context: 'v3',
    contract: Contracts.v3.Classification,
    handler: processClassification,
  },
  '0x6060604052600436106100a4576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff16806309bd5a60146100a95780634c8fe526146100da578063516f279e1461012f57806352effe11146101bd578063827bfbdf146101f6578063': {
    context: 'v3',
    contract: Contracts.v3.ProofDocument,
    handler: processProofOfUse,
  },
  '0x6060604052600436106100a4576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff1680634589fe0c146100a95780634c8fe5261461013757806352effe111461018c5780638da5cb5b146101c55780639ab03dcb1461021a578063': {
    context: 'v3',
    contract: Contracts.v3.Assignment,
    handler: processAssignment,
  },
  '0x6080604052600436106100b95763ffffffff7c010000000000000000000000000000000000000000000000000000000060003504166303c108b881146100be578063435d53f214610148578063479c9254146101ad5780634c8fe526146101de57806352effe11146101f35780638c': {
    context: 'v4',
    contract: Contracts.v4.AreaOfUse,
    handler: processAreaOfUse,
  },
  '0x6080604052600436106100b95763ffffffff7c0100000000000000000000000000000000000000000000000000000000600035041663435d53f281146100be578063479c9254146101235780634c8fe5261461015457806352effe1114610169578063565974d31461018c5780638a': {
    context: 'v4',
    contract: Contracts.v4.Classification,
    handler: processClassification,
  },
  '0x6080604052600436106100ae5763ffffffff7c010000000000000000000000000000000000000000000000000000000060003504166309bd5a6081146100b3578063479c9254146100da5780634c8fe5261461010b578063516f279e1461012057806352effe11146101aa57806382': {
    context: 'v4',
    contract: Contracts.v4.ProofDocument,
    handler: processProofOfUse,
  },
  '0x6080604052600436106100ae5763ffffffff7c01000000000000000000000000000000000000000000000000000000006000350416634589fe0c81146100b3578063479c92541461013d5780634c8fe5261461016e57806352effe11146101835780638c1bb2a4146101a65780638d': {
    context: 'v4',
    contract: Contracts.v4.Assignment,
    handler: processAssignment,
  },
};

async function process(address) {
  // noinspection JSUnresolvedFunction
  const code = await web3.eth.getCodeAsync(address);
  const lookup = code.substring(0, 224);
  const entry = ContractMap[lookup];
  if (!entry) {
    console.log(code.substring(0, 116));
    log(ERROR, `failed ContractMap lookup: ${lookup}`);
    throw new Error('unidentifiable byte code for trademark');
  }
  const Contract = entry.contract;
  Contract.defaults({
    from: '88a80b35014fe7c33b4568cb818f2e16ba799b23',
  });
  return entry.handler(await Contract.at(address), address, entry.context);
}

const DesignBugAddresses = [
  '0x2e62b1099aca2484416701727e83cfce2db9b066',
  '0xa73a94d6d2e4de40c5a89df585385b8ae2cdf95c',
  '0x13dd01ccddba43ff6167e80bc2effa2e132a7e45',
];

async function processTrademark(trademark, address, context) {
  log(DEBUG, `processing Trademark ${context}`);
  const result = {};
  result.address = address;
  await addTimestamp(trademark, result, context);
  if (trademark.design) {
    if (DesignBugAddresses.indexOf(address) >= 0) {
      result.designNote = 'Design image represented as ProofOfUse in the timeline';
    }
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
  if (trademark.getMark) {
    log(DEBUG, ` - getting word ${context}`);
    const word = await trademark.getMark();
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
  if (trademark.next) {
    log(DEBUG, `getting next ${context}`);
    let next = await trademark.next();
    while (next) {
      if (next === '0x0000000000000000000000000000000000000000') {
        log(DEBUG, ` - documents complete ${context}`);
        break;
      }
      let document = await process(next);
      if (document.classOfGoods || document.details) {
        result.timeline.documents.push({
          address: document.address,
          classOfGoods: document.classOfGoods,
          details: document.details,
          timestamp: document.timestamp,
          type: 'Classification',
        });
      }
      if (document.regions) {
        result.timeline.documents.push({
          address: document.address,
          countries: ['US'],
          regions: document.regions,
          timestamp: document.timestamp,
          type: 'AreaOfUse',
        });
      }
      if (document.hash) {
        result.timeline.documents.push({
          address: document.address,
          hash: document.hash,
          timestamp: document.timestamp,
          type: 'ProofOfUse',
        });
      }
      if (document.companyName || document.firstName || document.lastName) {
        result.timeline.documents.push(document);
      }
      next = document.next;
      delete document.next;
    }
  }
  if (trademark.getAssignment) {
    log(DEBUG, `getting assignment ${context}`);
    const assignment = await trademark.getUsageDocument();
    if (assignment !== '0x0000000000000000000000000000000000000000') {
      log(DEBUG, `adding assignment ${context}`);
      const document = await process(assignment);
      if (document.companyName || document.firstName || document.lastName) {
        result.timeline.documents.push(document);
      }
    }
  }
  if (trademark.getUsageDocument) {
    log(DEBUG, `getting usage document ${context}`);
    const usageDocument = await trademark.getUsageDocument();
    if (usageDocument !== '0x0000000000000000000000000000000000000000') {
      log(DEBUG, `adding usage document ${context}`);
      const document = await process(usageDocument);
      if (document.classOfGoods || document.details) {
        result.timeline.documents.push({
          address: document.address,
          classOfGoods: document.classOfGoods,
          details: document.details,
          timestamp: document.timestamp,
          type: 'Classification',
        });
      }
      if (document.regions) {
        result.timeline.documents.push({
          address: document.address,
          countries: ['US'],
          regions: document.regions,
          timestamp: document.timestamp,
          type: 'AreaOfUse',
        });
      }
      if (document.hash) {
        result.timeline.documents.push({
          address: document.address,
          hash: document.hash,
          timestamp: document.timestamp,
          type: 'ProofOfUse',
        });
      }
    }
  }
  await addAmendment(trademark, result, context);
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
      if (result.timestamp) {
        proof.timestamp = result.timestamp;
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
    if (result.regions.length > 0 && result.regions[0] === '') {
      result.regions.shift();
    }
  }
  await addTimestamp(areaOfUse, result, context, '  ');
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
  await addTimestamp(classification, result, context, '  ');
  result.type = 'Classification';
  return sort(result);
}

async function processProofOfUse(proofOfUse, address, context) {
  log(DEBUG, ` - processing Proof of Use ${context}`);
  const result = {};
  result.address = address;
  if (proofOfUse.hash) {
    log(DEBUG, `   - adding hash ${context}`);
    result.hash = await proofOfUse.hash();
  }
  if (proofOfUse.location) {
    log(DEBUG, `   - adding location ${context}`);
    result.deprecatedLocation = await proofOfUse.location();
  }
  await addNext(proofOfUse, result, context);
  await addTimestamp(proofOfUse, result, context, '  ');
  // version 1
  if (proofOfUse.getGeographicRegion) {
    log(DEBUG, `   - getting regions ${context}`);
    const regions = await proofOfUse.getGeographicRegion();
    if (regions !== '') {
      log(DEBUG, `   - adding regions ${context}`);
      result.regions = regions.split(',').sort();
      if (result.regions.length > 0 && result.regions[0] === '') {
        result.regions.shift();
      }
    }
  }
  // version 2
  if (proofOfUse.geographicRegion) {
    log(DEBUG, `   - getting regions ${context}`);
    const regions = await proofOfUse.geographicRegion();
    if (regions !== '') {
      log(DEBUG, `   - adding regions ${context}`);
      result.regions = regions.split(',').sort();
      if (result.regions.length > 0 && result.regions[0] === '') {
        result.regions.shift();
      }
    }
  }
  // version 1 and 2
  if (proofOfUse.getClassOfGoods) {
    log(DEBUG, `   - getting class of goods ${context}`);
    const classOfGoods = await proofOfUse.getClassOfGoods();
    if (classOfGoods) {
      log(DEBUG, `   - adding class of goods ${context}`);
      result.classOfGoods = parseInt(classOfGoods);
    }
  }
  // version 3 and 4
  if (proofOfUse.classOfGoods) {
    log(DEBUG, `   - getting class of goods ${context}`);
    const classOfGoods = await proofOfUse.classOfGoods();
    if (classOfGoods) {
      log(DEBUG, `   - adding class of goods ${context}`);
      result.classOfGoods = parseInt(classOfGoods);
    }
  }
  // // version 1
  // if (proofOfUse.getDateOfFirstUse) {
  //   log(DEBUG, `   - getting date of first use ${context}`);
  //   const timestamp = await proofOfUse.getDateOfFirstUse();
  //   // TODO: Better way to check this?
  //   if (timestamp.greaterThan(0)) {
  //     log(DEBUG, `   - adding date of first use ${context}`);
  //     result.dateOfFirstUse = timestamp.toNumber();
  //   }
  // }
  // // version 2
  // if (proofOfUse.dateOfFirstUse) {
  //   log(DEBUG, `   - getting date of first use ${context}`);
  //   const timestamp = await proofOfUse.dateOfFirstUse();
  //   // TODO: Better way to check this?
  //   if (timestamp.greaterThan(0)) {
  //     log(DEBUG, `   - adding date of first use ${context}`);
  //     result.dateOfFirstUse = timestamp.toNumber();
  //   }
  // }
  // version 1
  if (proofOfUse.getProofOfUse) {
    log(DEBUG, `   - adding hash ${context}`);
    result.hash = await proofOfUse.getProofOfUse();
  }
  // version 2
  if (proofOfUse.proofOfUse) {
    log(DEBUG, `   - adding hash ${context}`);
    result.hash = await proofOfUse.proofOfUse();
  }
  // version 1 and 2
  if (proofOfUse.getDetails) {
    log(DEBUG, `   - getting details ${context}`);
    const details = await proofOfUse.getDetails();
    if (details) {
      log(DEBUG, `   - adding details ${context}`);
      result.details = details.split('|').sort();
    }
  }
  // version 3 and 4
  if (proofOfUse.details) {
    log(DEBUG, `   - getting details ${context}`);
    const details = await proofOfUse.details();
    if (details) {
      log(DEBUG, `   - adding details ${context}`);
      result.details = details.split('|').sort();
    }
  }
  result.type = 'ProofOfUse';
  return sort(result);
}

async function processAssignment(assignment, address, context) {
  log(DEBUG, ` - processing Assignment ${context}`);
  const result = {};
  result.address = address;
  // version 3 and 4
  if (assignment.companyName) {
    log(DEBUG, `   - getting company name ${context}`);
    const companyName = await assignment.companyName();
    if (companyName !== '') {
      log(DEBUG, `   - adding company name ${context}`);
      result.companyName = companyName;
    }
  }
  // version 1 and 2
  if (assignment.getCompanyName) {
    log(DEBUG, `   - getting company name ${context}`);
    const companyName = await assignment.getCompanyName();
    if (companyName !== '') {
      log(DEBUG, `   - adding company name ${context}`);
      result.companyName = companyName;
    }
  }
  // version 3 and 4
  if (assignment.firstName) {
    log(DEBUG, `   - getting first name ${context}`);
    const firstName = await assignment.firstName();
    if (firstName !== '') {
      log(DEBUG, `   - adding first name ${context}`);
      result.firstName = firstName;
    }
  }
  // version 1 and 2
  if (assignment.getFirstName) {
    log(DEBUG, `   - getting first name ${context}`);
    const firstName = await assignment.getFirstName();
    if (firstName !== '') {
      log(DEBUG, `   - adding first name ${context}`);
      result.firstName = firstName;
    }
  }
  // version 3 and 4
  if (assignment.lastName) {
    log(DEBUG, `   - getting last name ${context}`);
    const lastName = await assignment.lastName();
    if (lastName !== '') {
      log(DEBUG, `   - adding last name ${context}`);
      result.lastName = lastName;
    }
  }
  // version 1 and 2
  if (assignment.getLastName) {
    log(DEBUG, `   - getting last name ${context}`);
    const lastName = await assignment.getLastName();
    if (lastName !== '') {
      log(DEBUG, `   - adding last name ${context}`);
      result.lastName = lastName;
    }
  }
  await addNext(assignment, result, context);
  await addTimestamp(assignment, result, context, '  ');
  await addAmendment(assignment, result, context, '  ');
  result.type = 'Assignment';
  return sort(result);
}

async function addNext(document, result, context) {
  if (document.next) {
    log(DEBUG, `   - getting next ${context}`);
    const next = await document.next();
    if (next !== '0x0000000000000000000000000000000000000000') {
      log(DEBUG, `   - adding next ${context}`);
      result.next = next;
    }
  }
}

async function addTimestamp(document, result, context, prefix) {
  if (!prefix) {
    prefix = '';
  }
  // version 3 and 4
  if (document.timestamp) {
    log(DEBUG, `${prefix} - getting timestamp ${context}`);
    const timestamp = await document.timestamp();
    // TODO: Better way to check this?
    if (timestamp.greaterThan(0)) {
      log(DEBUG, `${prefix} - adding timestamp ${context}`);
      result.timestamp = timestamp.toNumber();
    }
  }
  // version 1
  if (document.getCreatedAt) {
    log(DEBUG, `${prefix} - getting timestamp ${context}`);
    const timestamp = await document.getCreatedAt();
    // TODO: Better way to check this?
    if (timestamp.greaterThan(0)) {
      log(DEBUG, `${prefix} - adding timestamp ${context}`);
      result.timestamp = timestamp.toNumber();
    }
  }
  // version 2
  if (document.createdAt) {
    log(DEBUG, `${prefix} - getting timestamp ${context}`);
    const timestamp = await document.createdAt();
    // TODO: Better way to check this?
    if (timestamp.greaterThan(0)) {
      log(DEBUG, `${prefix} - adding timestamp ${context}`);
      result.timestamp = timestamp.toNumber();
    }
  }
}

async function addAmendment(document, result, context, prefix) {
  if (!prefix) {
    prefix = '';
  }
  if (document.getAmendment) {
    log(DEBUG, `${prefix} - getting amendment ${context}`);
    const amendment = await document.getAmendment();
    if (amendment !== '0x0000000000000000000000000000000000000000') {
      log(DEBUG, `${prefix} - adding amendment ${context}`);
      result.amendment = await process(amendment);
    }
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
