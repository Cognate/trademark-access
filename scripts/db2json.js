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
  const id = parts[0].trim();
  const word = parts[1].trim().toLocaleUpperCase();
  const designId = parts[2].trim(); // lowercase
  const address = parts[3].trim();
  if (address === '') {
    // console.log(`no address : ${id}`);
  } else {
    // this will build a map of words/designs to an array of addresses
    if (word !== '') {
      // add anything with a word
      if (data[word] === undefined) {
        data[word] = [];
      }
      data[word].push(address);
    }
    if (designId !== '') {
      // add anything with a design
      const design = `${baseUrl}/${designId}`;
      if (data[design] === undefined) {
        data[design] = [];
      }
      data[design].push(address);
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
