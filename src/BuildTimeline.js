const moment = require('moment');
const templateService = require('./SimpleTemplateService');
const $ = require('jquery');
const Handlebars = require('handlebars');
const cogMap = require('./cogMap');

function buildTimeline(element, entries) {
  entries = groupEntriesByDate(entries);
  for (let i = 0; i < entries.length; i++) {
    createEntry(element, entries[i]);
  }
}

function groupEntriesByDate(entries) {
  // Use object keys to group entries by date
  let dates = {};
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const date = moment(new Date(entry.timestamp * 1000)).format('LL');
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
  dates = Object.keys(dates).map(key => {
    return dates[key];
  });
  return dates.sort((d1, d2) => {
    return d2.date - d1.date;
  });
}

function createEntry(element, entry) {
  appendEntry(
    element,
    {
      formattedDate: entry.date,
    },
    entryDiv => {
      for (let i = 0; i < entry.assignment.length; i++) {
        populateEntry(entryDiv, entry.assignment[i], 'Assignment');
      }
      for (let i = 0; i < entry.classification.length; i++) {
        populateEntry(entryDiv, entry.classification[i], 'Classification');
      }
      for (let i = 0; i < entry.area_of_use.length; i++) {
        populateEntry(entryDiv, entry.area_of_use[i], 'Area of use');
      }
      for (let i = 0; i < entry.proof_of_use.length; i++) {
        populateEntry(entryDiv, entry.proof_of_use[i], 'Proof of use');
      }
    },
  );
}

function populateEntry(entryDiv, entryPart, contentType) {
  if (contentType === 'Assignment') {
    const assignmentTable = {};
    if (entryPart.companyName) {
      assignmentTable.CompanyName = entryPart.companyName;
    }
    if (entryPart.firstName) {
      assignmentTable.FirstName = entryPart.firstName;
    }
    if (entryPart.lastName) {
      assignmentTable.LastName = entryPart.lastName;
    }
    const table = templateService.getTemplate('timelineEntryDataTable', { tableData: assignmentTable });
    // noinspection JSUnresolvedFunction
    appendContentToEntry(entryDiv, {
      address: entryPart.address,
      contentType: contentType,
      entryContent: new Handlebars.SafeString(table),
    });
  } else if (contentType === 'Proof of use') {
    const proofTable = {};
    proofTable.Hash = entryPart.hash;
    if (entryPart.deprecatedLocation) {
      proofTable.ID = entryPart.deprecatedLocation.slice(25);
    }
    const table = templateService.getTemplate('timelineEntryDataTable', { tableData: proofTable });
    // noinspection JSUnresolvedFunction
    appendContentToEntry(entryDiv, {
      address: entryPart.address,
      contentType: contentType,
      entryContent: new Handlebars.SafeString(table),
    });
  } else if (contentType === 'Classification') {
    const cogTable = {};
    cogTable.Classification = `${entryPart.classOfGoods} | ${cogMap[entryPart.classOfGoods]}`;
    if (entryPart.details) {
      // noinspection JSUnresolvedFunction
      cogTable.Identifications = new Handlebars.SafeString(entryPart.details.join('<br>'));
    }
    const table = templateService.getTemplate('timelineEntryDataTable', { tableData: cogTable });
    // noinspection JSUnresolvedFunction
    appendContentToEntry(entryDiv, {
      address: entryPart.address,
      contentType: contentType,
      entryContent: new Handlebars.SafeString(table),
    });
  } else if (contentType === 'Area of use') {
    const aouTable = {};
    if (entryPart.regions) {
      aouTable.States = entryPart.regions.join(', ');
    }
    if (entryPart.countries) {
      aouTable.Countries = entryPart.countries.join(', ');
    }
    const table = templateService.getTemplate('timelineEntryDataTable', { tableData: aouTable });
    // noinspection JSUnresolvedFunction
    appendContentToEntry(entryDiv, {
      address: entryPart.address,
      contentType: contentType,
      entryContent: new Handlebars.SafeString(table),
    });
  }
}

function appendEntry(element, entryData, callback) {
  const template = templateService.getTemplate('timelineEntry', entryData);
  const div = $(template);
  element.append(div);
  callback(div);
}

function appendContentToEntry(entryDiv, content) {
  const template = templateService.getTemplate('timelineEntryContent', content);
  entryDiv.find('.content').append(template);
}

module.exports.buildTimeline = buildTimeline;
