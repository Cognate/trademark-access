const $ = require('jquery');
const Trademark = require('./trademark');

$().ready(function() {
  console.log('jquery ready');
  $('#demo-btn').on('click', async function() {
    console.log('clicked');
    const results = await Trademark.getTrademark('0xa2a423a147ef2fe82f4613227f8c576fe635ec9b');
    console.log(JSON.stringify(results, null, 2));
  });
});
