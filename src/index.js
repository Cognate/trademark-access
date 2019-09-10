import './listings.scss';
import 'jquery-typeahead';
import 'jquery-typeahead/dist/jquery.typeahead.min.css';

// es-lint-ignore
const $ = require('jquery');
const Trademark = require('./trademark');
const BuildTimeline = require('./BuildTimeline');
const trademarkMap = require('./trademarkMap');
const templateService = require('./SimpleTemplateService');

$().ready(function() {
  $('.js-typeahead').typeahead({
    order: 'asc',
    source: {
      groupName: {
        // Array of Objects / Strings
        data: Object.keys(trademarkMap),
      },
    },
  });
  $('#submit-address').on('click', async function() {
    $('#timeline-content').html(templateService.getTemplate('loading'));
    const mark = $('#trademark').val();
    const address = trademarkMap[mark][0];
    const results = await Trademark.getTrademarkForAddress(address);
    if (mark.indexOf('http') !== -1) {
      $('#timeline-content').html(
        `<div class="tmark"><img class="mark-img" src="${mark}"/><div>${results.design}</div></div>`,
      );
    } else {
      $('#timeline-content').html(
        `<div class="tmark"><div><h2 class="mark-title">${mark}</h2></div><div><a href="https://etherscan.io/address/${address}" target="_blank">See it on Etherscan</a></div></div>`,
      );
    }
    if (results.timeline && results.timeline.documents) {
      BuildTimeline.buildTimeline($('#timeline-content'), results.timeline.documents);
    }
  });
});
