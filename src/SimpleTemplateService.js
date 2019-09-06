const Handlebars = require('handlebars');

// prettier-ignore
const Templates = function() {

  // Handlebars Templates
  this.dialog = Handlebars.compile([
      /* eslint-disable indent, quotes */
      '<div class="dialog">',
          '<div class="dialog-alert">',
          '</div>',
          '<div class="dialog-content">',
              '<div class="cancel-dialog-btn destroy-dialog"><span class="glyphicon glyphicon-remove"></span></div>',
              '{{{content}}}',
          '</div>',
          '<div class="overlay"></div>',
      '</div>',
      /* eslint-enable indent, quotes */
  ].join("\n"));

  this.loading = Handlebars.compile([
      /* eslint-disable indent, quotes */
      '<div class="loading-screen">',
          '<div><img src="/assets/spinner.png"> Loading&hellip;</div>',
      '</div>'
      /* eslint-enable indent, quotes */
  ].join("\n"));

  this.timelineEntry = Handlebars.compile([
      /* eslint-disable indent, quotes */
      '<div class="entry">',
          '<div class="date">{{formattedDate}}</div>',
          '<div class="content"></div>',
      '</div>',
      /* eslint-enable indent, quotes */
  ].join("\n"));

  this.timelineEntryContent = Handlebars.compile([
      /* eslint-disable indent, quotes */
      '<div class="type">{{contentType}}</div>',
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
