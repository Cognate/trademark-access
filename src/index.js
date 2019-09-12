import './listings.scss';
import 'jquery-typeahead';
import 'jquery-typeahead/dist/jquery.typeahead.min.css';

// es-lint-ignore
const $ = require('jquery');
const Trademark = require('./trademark');
const BuildTimeline = require('./BuildTimeline');
const trademarkMap = require('./trademarkMap');
const templateService = require('./SimpleTemplateService');
const Handlebars = require('handlebars');
const Util = require('./util');

window.Dropzone = require('./dropzone');

Dropzone.autoDiscover = false;

$().ready(() => {
  new Dropzone('#dropzone-sha', {
    dictDefaultMessage: 'Drop file here to generate SHA-256 hash',
    url: '/',
    autoQueue: false,
    addRemoveLinks: true,
    maxFiles: 1,
    addedfile: async file => {
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
      const buffer = new Buffer(fileData, 'binary');
      $('#sha-result').html(Util.sha256(buffer));
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
      const entry = trademarkMap[item.display];
      if (entry && entry.design) {
        return `<img src="${entry.design}" class="typeahead-thumbnail" alt="${item.display}" title="${item.display}"/>`;
      }
      return `<span>${item.display}</span>`;
    },
    callback: {
      onClickAfter: async () => {
        $('#timeline-content').html(templateService.getTemplate('loading'));
        const trademarkEntry = trademarkMap[$('#trademark').val()];
        const results = await Trademark.getTrademarkForAddress(trademarkEntry.address);

        const fileName = results.word ? results.word : `trademark`;
        const fileData = JSON.stringify(results, null, 2);

        // this is due to an on chain data discrepancy.
        // we are modifying the results rendered in the UI but not the raw data downloaded
        if (trademarkEntry.design && !results.migratedLocation) {
          // set the design location as we know it
          results.migratedLocation = trademarkEntry.design;
        }
        if (results.migratedLocation && !results.design) {
          // determine and set the design hash
          const data = await new Promise((resolve, reject) => {
            const httpRequest = new XMLHttpRequest();
            httpRequest.open('GET', results.migratedLocation, true);
            httpRequest.responseType = 'arraybuffer';
            httpRequest.onload = () => {
              resolve(httpRequest.response);
            };
            httpRequest.send();
          });
          results.design = `0x${Util.sha256(new Buffer(data, 'binary'))}`;
          // remove the proof if it happened to have been there
          if (results.timeline && results.timeline.documents) {
            let i = 0;
            let found = false;
            while (i < results.timeline.documents.length) {
              const document = results.timeline.documents[i];
              if (document.hash === results.design) {
                found = true;
                break;
              }
              i++;
            }
            if (found) {
              results.timeline.documents.splice(i);
            }
          }
        }

        let markHtml = '';
        if (results.word) {
          markHtml += `<h2 class="mark-title">${results.word}</h2>`;
        }
        if (results.design) {
          markHtml += `<img class="mark-img" src="${results.migratedLocation}" alt="${fileName}"/>
                         <div class="design-hash">${results.design}
                       </div>`;
        }
        $('#timeline-content').html(
          templateService.getTemplate('timelineHeader', {
            address: trademarkEntry.address,
            fileData,
            fileName: fileName,
            markHtml: new Handlebars.SafeString(markHtml),
          }),
        );
        if (results.timeline && results.timeline.documents) {
          BuildTimeline.buildTimeline($('#timeline-content'), results.timeline.documents);
        }
      },
    },
  });
});
