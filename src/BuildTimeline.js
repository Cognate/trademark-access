const moment = require('moment');
const templateService = require('./SimpleTemplateService');
const $ = require('jquery');
const Handlebars = require('handlebars');
const cogMap = require('./cogMap');

function buildTimeline(element, entries) {
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
    var date = moment(new Date(entry.timestamp * 1000)).format('LL');
    if (dates[date] === undefined) {
      dates[date] = {
        date: date,
        assignment: [],
        classification: [],
        area_of_use: [],
        proof_of_use: [],
      };
    }
    switch (entry.type) {
      case 'Assignment':
        dates[date].assignment.push(entry);
        break;
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
      formattedDate: entry.date,
    },
    function(entryDiv) {
      for (var i = 0; i < entry.assignment.length; i++) {
        populateEntry(entryDiv, entry.assignment[i], 'Assignment');
      }
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
  if (contentType === 'Assignment') {
    var assignmentTable = {};
    if (entryPart.companyName) {
      assignmentTable.CompanyName = entryPart.companyName;
    }
    if (entryPart.firstName) {
      assignmentTable.FirstName = entryPart.firstName;
    }
    if (entryPart.lastName) {
      assignmentTable.LastName = entryPart.lastName;
    }
    var table = templateService.getTemplate('timelineEntryDataTable', { tableData: assignmentTable });

    appendContentToEntry(entryDiv, {
      address: entryPart.address,
      contentType: contentType,
      entryContent: new Handlebars.SafeString(table),
    });
  } else if (contentType === 'Proof of use') {
    var proofTable = {};
    proofTable.Hash = entryPart.hash;
    if (entryPart.deprecatedLocation) {
      proofTable.ID = entryPart.deprecatedLocation.slice(25);
    }
    var table = templateService.getTemplate('timelineEntryDataTable', { tableData: proofTable });
    appendContentToEntry(entryDiv, {
      address: entryPart.address,
      contentType: contentType,
      entryContent: new Handlebars.SafeString(table),
    });
  } else if (contentType === 'Classification') {
    var cogTable = {};
    cogTable.Classification = `${entryPart.classOfGoods} | ${cogMap[entryPart.classOfGoods]}`;
    if (entryPart.details) {
      cogTable.Identifications = new Handlebars.SafeString(entryPart.details.join('<br>'));
    }
    var table = templateService.getTemplate('timelineEntryDataTable', { tableData: cogTable });

    appendContentToEntry(entryDiv, {
      address: entryPart.address,
      contentType: contentType,
      entryContent: new Handlebars.SafeString(table),
    });
  } else if (contentType === 'Area of use') {
    var aouTable = {};
    if (entryPart.regions) {
      aouTable.States = entryPart.regions.join(', ');
    }
    if (entryPart.countries) {
      aouTable.Countries = entryPart.countries.join(', ');
    }
    var table = templateService.getTemplate('timelineEntryDataTable', { tableData: aouTable });

    appendContentToEntry(entryDiv, {
      address: entryPart.address,
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

module.exports.buildTimeline = buildTimeline;
