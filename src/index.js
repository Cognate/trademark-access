const Trademark = require('./trademark');

async function get(address) {
  return await Trademark.getTrademark(address);
}

get('0x2022e7859281b85ab6e26e46bdd188830ac31fd1')
  .then(results => {
    console.log(JSON.stringify(results, null, 2));
    process.exit(0);
  })
  .catch(err => {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  });
