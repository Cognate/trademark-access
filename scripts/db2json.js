const fs = require('fs');
const readLine = require('readline');

const lineReader = readLine.createInterface({
  input: require('fs').createReadStream('scripts/map.txt'),
});

const baseUrl = 'https://cognate.github.io/trademark-access/design_marks';
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
    const design = designId === '' ? '' : `${baseUrl}/${designId}`;
    const entry = {
      address: address,
      design: design === '' ? undefined : design,
      word: word === '' ? undefined : word,
    };
    // this will build a map of words/designs to an array of addresses
    if (word !== '') {
      // add anything with a word
      if (data[word] === undefined) {
        data[word] = [];
      }
      data[word].push(entry);
    }
    if (design !== '') {
      // add anything with a design
      if (data[design] === undefined) {
        data[design] = [];
      }
      data[design].push(entry);
    }
  }
});
lineReader.on('close', () => {
  console.log(JSON.stringify(sort(data)));
  // console.log(`closed - processed ${i}`);
});

function sort(unordered) {
  const ordered = {};
  Object.keys(unordered)
    .sort()
    .forEach(key => {
      ordered[key] = unordered[key];
    });
  return ordered;
}
