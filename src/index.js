import "./listings.scss";
import "jquery-typeahead";
import "jquery-typeahead/dist/jquery.typeahead.min.css";

import { resolve } from "url";

// es-lint-ignore
const $ = require('jquery');
const Trademark = require('./trademark');
const BuildTimeline = require('./BuildTimeline');
const trademarkMap = require('./trademarkMap');
const templateService = require('./SimpleTemplateService');
const Handlebars = require('handlebars');
const crypto = require('crypto');

window.Dropzone = require('./dropzone');

Dropzone.autoDiscover = false;

$().ready(function() {
  new Dropzone('#dropzone-sha', {
    dictDefaultMessage: 'Drop image here to generate SHA-256 hash',
    url: '/',
    autoQueue: false,
    addRemoveLinks: true,
    maxFiles: 1,
    addedfile: async file => {
      const hash = crypto.createHash('sha256');
      const reader = new FileReader();
      const fileData = await new Promise((resolve, reject) => {
        reader.onloadend = () => {
          resolve(reader.result);
        };
        reader.onerror = error => {
          reject(error);
        };
        reader.readAsBinaryString(file);
      });
      // console.log(fileData);
      hash.update(fileData, 'utf8');
      $('#sha-result').html(hash.digest('hex'));
    },
  });

  $('.js-typeahead').typeahead({
    order: 'asc',
    source: {
      groupName: {
        // Array of Objects / Strings
        data: Object.keys(trademarkMap),
      },
    },
    template: (query, item) => {
      if (item.display.startsWith('http')) {
        return `<img src="${item.display}" class="typeahead-thumbnail"/>`;
      }
      return '<span>{{display}}</span>';
    },
    callback: {
      onClickAfter: async function() {
        $('#timeline-content').html(templateService.getTemplate('loading'));
        const mark = $('#trademark').val();
        const address = trademarkMap[mark][0];
        const results = await Trademark.getTrademarkForAddress(address);
        if (mark.startsWith('http')) {
          $('#timeline-content').html(
            templateService.getTemplate('timelineHeader', {
              address,
              mark: results.design,
              markHtml: new Handlebars.SafeString(
                `<img class="mark-img" src="${mark}"/><div class="design-hash">${results.design}</div>`,
              ),
              results: JSON.stringify(results),
            }),
          );
        } else {
          $('#timeline-content').html(
            templateService.getTemplate('timelineHeader', {
              address,
              mark: results.word,
              markHtml: new Handlebars.SafeString(`<h2 class="mark-title">${results.word}</h2>`),
              results: JSON.stringify(results),
            }),
          );
        }
        if (results.timeline && results.timeline.documents) {
          BuildTimeline.buildTimeline($('#timeline-content'), results.timeline.documents);
        }
      },
    },
  });
  /*$('#submit-address').on('click', async function() {
    $('#timeline-content').html(templateService.getTemplate('loading'));
    const mark = $('#trademark').val();
    const address = trademarkMap[mark][0];
    const results = await Trademark.getTrademarkForAddress(address);
    if (mark.startsWith('http')) {
      $('#timeline-content').html(
        templateService.getTemplate('timelineHeader', {
          address,
          mark: results.design,
          markHtml: new Handlebars.SafeString(
            `<img class="mark-img" src="${mark}"/><div class="design-hash">${results.design}</div>`,
          ),
          results: JSON.stringify(results),
        }),
      );
    } else {
      $('#timeline-content').html(
        templateService.getTemplate('timelineHeader', {
          address,
          mark: results.word,
          markHtml: new Handlebars.SafeString(`<h2 class="mark-title">${results.word}</h2>`),
          results: JSON.stringify(results),
        }),
      );
    }
    if (results.timeline && results.timeline.documents) {
      BuildTimeline.buildTimeline($('#timeline-content'), results.timeline.documents);
    }
  });*/
});
