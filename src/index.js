import "./listings.scss";

// es-lint-ignore
const $ = require('jquery');
const Trademark = require('./trademark');
const BuildTimeline = require('./BuildTimeline');
$().ready(function() {
  $('#submit-address').on('click', async function() {
    $('#timeline-content').html('Loading...'); // TODO: make this a spinner
    const address = $('#address').val();
    const results = await Trademark.getTrademark(address);
    $('#timeline-content').html(`<div>${results.word}</div>`);
    if (results.timeline && results.timeline.documents) {
      BuildTimeline.buildTimeline($('#timeline-content'), results.timeline.documents);
    }
  });
});
