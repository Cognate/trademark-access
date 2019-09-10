const Util = require('./util');

const parameters = process.argv.slice(2);
if (parameters.length < 1) {
  usage();
} else if (parameters[0] === 'trademark') {
  if (parameters.length !== 2 || !Util.isAddress(parameters[1])) {
    usage();
  }
  getTrademark(parameters[1])
    .then(results => {
      console.log(JSON.stringify(results, null, 2));
      process.exit(0);
    })
    .catch(err => {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    });
} else if (parameters[0] === 'sha') {
  if (parameters.length !== 2) {
    usage();
  }
  // TODO: get URL and generate SHA of data
  console.log('TODO');
} else {
  usage();
}

function usage() {
  console.log('Usage: node src/index.js trademark <address>');
  console.log('Usage: node src/index.js sha <url>');
  process.exit(1);
}

async function getTrademark(address) {
  const Trademark = require('./trademark');
  return await Trademark.getTrademarkForAddress(address);
}
