const Handlebars = require('handlebars');

// prettier-ignore
const Templates = function() {

  // Handlebars Templates
  // noinspection JSUnresolvedFunction
  this.loading = Handlebars.compile([
      /* eslint-disable indent, quotes */
      '<div class="loading-screen">',
          '<div class="loader">Loading&hellip;</div>',
      '</div>'
      /* eslint-enable indent, quotes */
  ].join("\n"));

  // noinspection JSUnresolvedFunction
  this.timelineHeader = Handlebars.compile([
      /* eslint-disable indent, quotes */
      '<div class="tmark">',
        '<div class="date">{{formattedDate}}</div>',
        '<div>{{markHtml}}</div>',
        '<div>',
            '<a href="https://etherscan.io/address/{{address}}#code" target="_blank">See it on Etherscan</a> | ',
            '<a href="data:text/json;charset=utf-8,{{fileData}}" download="{{fileName}}.json">Download Raw JSON Data</a>',
        '</div>',
      '</div>',
      /* eslint-enable indent, quotes */
  ].join("\n"));

  // noinspection JSUnresolvedFunction
  this.timelineEntry = Handlebars.compile([
      /* eslint-disable indent, quotes */
      '<div class="entry">',
          '<div class="date">{{formattedDate}}</div>',
          '<div class="content"></div>',
      '</div>',
      /* eslint-enable indent, quotes */
  ].join("\n"));

  // noinspection JSUnresolvedFunction
  this.timelineEntryContent = Handlebars.compile([
      /* eslint-disable indent, quotes */
      '<div class="type">',
        '<span class="content-type">{{contentType}}</span>',
        '<a href="https://etherscan.io/address/{{address}}#code" class="etherscan-link" target="_blank">See it on Etherscan</a>',
      '</div>',
      '{{entryContent}}',
      '<ul class="proofs">',
          '{{#each proofs}}',
          '<li><a href="{{@this}}" target="_blank">',
              '<div class="img">',
                  '<img class="proof" src="{{@this}}" />',
              '</div>',
          '</a></li>',
          '{{/each}}',
      '</ul>',
      /* eslint-enable indent, quotes */
  ].join("\n"));

  // noinspection JSUnresolvedFunction
  this.timelineEntryDataTable = Handlebars.compile([
      /* eslint-disable indent, quotes */
      '<table class="table">',
          '{{#each tableData}}',
              '<tr><td>{{@key}}</td><td>{{this}}</td></tr>',
          '{{/each}}',
      '</table>',
      /* eslint-enable indent, quotes */
  ].join("\n"));
};
const templates = new Templates();

function getTemplate(name, params) {
  params = params || {};
  return templates[name](params);
}

module.exports.getTemplate = getTemplate;
