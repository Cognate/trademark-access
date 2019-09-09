const moment = require('moment');
const templateService = require('./SimpleTemplateService');
const $ = require('jquery');
const Handlebars = require('handlebars');

function buildTimeline(element, entries) {
  clearEntries(element);
  entries = groupEntriesByDate(entries);
  for (var i = 0; i < entries.length; i++) {
    createEntry(element, entries[i]);
  }
}

function groupEntriesByDate(entries) {
  // Use object keys to group entries by date
  var dates = {};
  for (var i = 0; i < entries.length; i++) {
    var entry = entries[i];
    var date = new Date(entry.timestamp * 1000);
    if (dates[date] === undefined) {
      dates[date] = {
        date: date,
        classification: [],
        area_of_use: [],
        proof_of_use: [],
      };
    }
    switch (entry.type) {
      case 'AreaOfUse':
        dates[date].area_of_use.push(entry);
        break;
      case 'Classification':
        dates[date].classification.push(entry);
        break;
      case 'ProofOfUse':
        dates[date].proof_of_use.push(entry);
        break;
      default:
        console.log(`Type not found: ${entry.type}`);
    }
  }
  // Convert object to list so entries can be ordered by date
  dates = Object.keys(dates).map(function(key) {
    return dates[key];
  });
  return dates.sort(function(d1, d2) {
    return d2.date - d1.date;
  });
}

function createEntry(element, entry) {
  appendEntry(
    element,
    {
      formattedDate: moment(entry.date).format('MM/DD/YYYY'),
    },
    function(entryDiv) {
      for (var i = 0; i < entry.classification.length; i++) {
        populateEntry(entryDiv, entry.classification[i], 'Classification');
      }
      for (var i = 0; i < entry.area_of_use.length; i++) {
        populateEntry(entryDiv, entry.area_of_use[i], 'Area of use');
      }
      for (var i = 0; i < entry.proof_of_use.length; i++) {
        populateEntry(entryDiv, entry.proof_of_use[i], 'Proof of use');
      }
    },
  );
}

function populateEntry(entryDiv, entryPart, contentType) {
  var entryContent = '';
  if (contentType === 'Proof of use') {
    entryContent += `<div class="proof-hash">${entryPart.hash}</div>`;
    appendContentToEntry(entryDiv, {
      contentType: contentType,
      entryContent: new Handlebars.SafeString(entryContent),
    });
  } else if (contentType === 'Classification') {
    if (entryPart.details) {
      var table = templateService.getTemplate('timelineEntryDataTable', {
        tableData: {
          Classification: `${entryPart.classOfGoods} | TODO title?`,
          Identifications: new Handlebars.SafeString(entryPart.details.join('<br>')),
        },
      });

      appendContentToEntry(entryDiv, {
        contentType: contentType,
        entryContent: new Handlebars.SafeString(table),
      });
    }
  } else if (contentType === 'Area of use') {
    var tableData = {};
    if (entryPart.regions) {
      tableData['States'] = new Handlebars.SafeString(entryPart.regions.join(', '));
    }
    if (entryPart.countries) {
      tableData['Countries'] = entryPart.countries.join(', ');
    }
    var table = templateService.getTemplate('timelineEntryDataTable', {
      tableData: tableData,
    });

    appendContentToEntry(entryDiv, {
      contentType: contentType,
      entryContent: new Handlebars.SafeString(table),
    });
  }
}

function appendEntry(element, entryData, callback) {
  var template = templateService.getTemplate('timelineEntry', entryData);
  var div = $(template);
  element.append(div);
  callback(div);
}

function appendContentToEntry(entryDiv, content) {
  var template = templateService.getTemplate('timelineEntryContent', content);
  entryDiv.find('.content').append(template);
}

function clearEntries(element) {
  // element.remove();
}

module.exports.buildTimeline = buildTimeline;
