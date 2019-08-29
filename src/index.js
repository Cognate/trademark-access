const Trademark = require('./trademark');

async function get(address) {
  return await Trademark.getTrademark(address);
}

// get('0xca6823878b5fc9390c21c652405b000e1daa734f')
get('0xb35d271ffbd783ffb6ccb227b932298e03e15f24')
  .then(results => {
    console.log(JSON.stringify(results, null, 2));
    process.exit(0);
  })
  .catch(err => {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  });
