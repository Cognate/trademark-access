const readLine = require('readline');

const lineReader = readLine.createInterface({
  input: require('fs').createReadStream('scripts/map.txt'),
});

const path = 'design_marks';
const baseUrl = `https://cognate.github.io/trademark-access/${path}`;
let i = 0;
const data = {};

lineReader.on('line', line => {
  i++;
  const parts = line.split('|');
  // const id = parts[0].trim();
  const word = parts[1].trim().toLocaleUpperCase();
  const designId = parts[2].trim(); // lowercase
  const address = parts[3].trim();
  if (address === '') {
    // console.log(`no address : ${id}`);
  } else {
    const design = designId === '' ? '' : `${path}/${designId}`;
    const entry = {
      address: address,
      design: designId === '' ? undefined : `${baseUrl}/${designId}`,
      word: word === '' ? undefined : word,
    };
    // this will build a map of words/designs to an array of addresses
    addEntry(data, word, entry, 0);
    addEntry(data, design, entry, 0);
  }
});
lineReader.on('close', () => {
  console.log(JSON.stringify(sort(data), null, 2));
});

function addEntry(data, key, entry, index) {
  if (key !== '') {
    const lookup = index > 0 ? `${key} [${index}]` : key;
    if (data[lookup] === undefined) {
      data[lookup] = entry;
    } else {
      addEntry(data, key, entry, index + 1);
    }
  }
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
