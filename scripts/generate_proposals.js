const assert = require('assert').strict;
const { addDays, format } = require('date-fns')
const omit = require('lodash/omit');
const SwaggerParser = require("@apidevtools/swagger-parser");

// Config
const url = 'https://raw.githubusercontent.com/vegaprotocol/protos/v0.50.1/swagger/vega/api/v1/corestate.swagger.json';
const notProposalTypes = ['closingTimestamp', 'enactmentTimestamp', 'validationTimestamp', 'title', 'type']

const nameByType = {
  newFreeform: 'New Freeform Proposal'
}

/**
 * Convenience function to return now + a certain number of days
 * @param {number} daysToAdd 
 * @returns 
 */
function daysInTheFuture(daysToAdd) {
    return new addDays(Date.now(), daysToAdd).getTime()
}

function newProposal(changes, skeleton, type) {
  assert.ok(skeleton.properties.closingTimestamp);
  assert.ok(skeleton.properties.enactmentTimestamp);

  const proposal = {
    closingTimestamp: daysInTheFuture(19),
  }
  if (type !== 'newFreeform'){
    proposal.enactmentTimestamp = daysInTheFuture(20)
  }

  proposal[type] = changes

  console.log(`\r\n## ${nameByType[type]}`);
  console.log(`\r\n### JSON`);
  console.dir(proposal, { depth: 20 });
  console.log(`\r\n### Command line ready`);
  console.dir(JSON.stringify({"proposalSubmission": { reference: 'A test', terms: proposal }}), { depth: 20 });
  console.groupEnd();
}

function newFreeform(skeleton) {
  const result = {};

  assert.ok(skeleton.title);
  assert.equal(skeleton.type, 'object');

  assert.ok(skeleton.properties.changes);
  result.changes = {};

  assert.ok(skeleton.properties.changes.properties.url);
  result.changes.url = 'https://community.vega.xyz';

  assert.ok(skeleton.properties.changes.properties.description);
  result.changes.description = 'A proposal that demonstrates freeform proposals';
 
  assert.ok(skeleton.properties.changes.properties.hash);
  result.changes.hash = 'bafybeigwwctpv37xdcwacqxvekr6e4kaemqsrv34em6glkbiceo3fcy4si';

  return result;
}

const ProposalGenerator = new Map([
  ['newFreeform', newFreeform]
])


function parse(api) {
  const proposalTypes = omit(api.definitions.vegaProposalTerms.properties, notProposalTypes )
  Object.keys(proposalTypes).forEach(type => {
      if (ProposalGenerator.has(type)) {
          const changes = ProposalGenerator.get(type)(proposalTypes[type])
          newProposal(changes, api.definitions.vegaProposalTerms, type) 
      }
  })
}

SwaggerParser.dereference(url).then(parse);
