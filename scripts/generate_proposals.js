const assert = require('assert').strict;
const { addDays, format } = require('date-fns')
const omit = require('lodash/omit');
const sample = require('lodash/sample');
const SwaggerParser = require("@apidevtools/swagger-parser");

// Config
const url = 'https://raw.githubusercontent.com/vegaprotocol/protos/v0.50.1/swagger/vega/api/v1/corestate.swagger.json';

// Input: Fields to remove from a specific place in the Swagger file
const notProposalTypes = ['closingTimestamp', 'enactmentTimestamp', 'validationTimestamp', 'title', 'type']
// Input: Ignore these types as they are not finished
const excludeUnimplementedTypes = ['updateMarket'];

// Seed data: Some valid network parameters
const networkParameters = ['market.fee.factors.infrastructureFee', 'governance.proposal.asset.requiredMajority', 'governance.proposal.freeform.minVoterBalance']

// Output: Used to put a nice title on the output
const nameByType = {
  newFreeform: 'New Freeform Proposal',
  updateNetworkParameter: 'Update a network parameter'
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

  // Freeform proposals don't get enacted, so they can't have this
  if (type !== 'newFreeform'){
    proposal.enactmentTimestamp = daysInTheFuture(20)
  }

  proposal[type] = changes

  console.log(`\r\n## ${nameByType[type]}`);
  console.log(`\r\n### JSON`);
  console.log('```json');
  console.dir(proposal, { depth: 20 });
  console.log('```');
  console.log(`\r\n### Command line ready`);
  console.dir(JSON.stringify({"proposalSubmission": { reference: `test-${type}`, terms: proposal }}), { depth: 20 });
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

function updateNetworkParameter(skeleton) {
  const result = {};
  assert.ok(skeleton.properties.changes);
  result.changes = {};

  assert.ok(skeleton.properties.changes.properties.key);
  result.changes.key = sample(networkParameters)

  assert.ok(skeleton.properties.changes.properties.value);
  result.changes.value = Math.random().toString()

  return result
}

const ProposalGenerator = new Map([
  ['newFreeform', newFreeform],
  ['updateNetworkParameter', updateNetworkParameter],
])


function parse(api) {
  const proposalTypes = omit(api.definitions.vegaProposalTerms.properties, notProposalTypes )

  Object.keys(proposalTypes).forEach(type => {
      if ( excludeUnimplementedTypes.indexOf(type) === -1) {
        if (ProposalGenerator.has(type)) {
            const changes = ProposalGenerator.get(type)(proposalTypes[type])
            newProposal(changes, api.definitions.vegaProposalTerms, type) 
        } else {
            console.log('No generator for ' + type);
        }
    }
  })
}

SwaggerParser.dereference(url).then(parse);
