const assert = require('assert').strict;
const { addDays } = require('date-fns')
const omit = require('lodash/omit');
const sample = require('lodash/sample');
const SwaggerParser = require("@apidevtools/swagger-parser");
const { newMarket } = require('./libGenerateProposals/newMarket')
// Config
const url = 'https://raw.githubusercontent.com/vegaprotocol/protos/v0.50.1/swagger/vega/api/v1/corestate.swagger.json';

// Input: Fields to remove from a specific place in the Swagger file
const notProposalTypes = ['closingTimestamp', 'enactmentTimestamp', 'validationTimestamp', 'title', 'type']
// Input: Ignore these types as they are not finished
const excludeUnimplementedTypes = ['updateMarket'];

// Seed data: Some valid network parameters
const networkParameters = ['market.fee.factors.infrastructureFee', 'governance.proposal.asset.requiredMajority', 'governance.proposal.freeform.minVoterBalance']
// Seed data: Some asset names
const assetNames = [
    { name: 'Ethereum', symbol: 'ETH' },
    { name: 'Bitcoin', symbol: 'Tether' },
    { name: 'BNB', symbol: 'BNB' },
    { name: 'XRP', symbol: 'XRP' },
    { name: 'Solana', symbol: 'SOL' }
];
// Output: Used to put a nice title on the output
const nameByType = {
  newFreeform: 'New Freeform Proposal',
  updateNetworkParameter: 'Update a network parameter',
  newAsset: 'New asset (ERC20)',
  newMarket: 'New market'
}

/**
 * Convenience function to return now + a certain number of days
 * @param {number} daysToAdd 
 * @returns 
 */
function daysInTheFuture(daysToAdd) {
  return new addDays(Date.now(), daysToAdd).getTime()
}

function newProposal(changesAndDocs, skeleton, type) {
  assert.ok(skeleton.properties.closingTimestamp);
  assert.ok(skeleton.properties.enactmentTimestamp);

  const proposal = {
    closingTimestamp: daysInTheFuture(19),
  }

  // Freeform proposals don't get enacted, so they can't have this
  if (type !== 'newFreeform'){
    proposal.enactmentTimestamp = daysInTheFuture(20)
  }

  proposal[type] = changesAndDocs.result

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
  const docs = skeleton;

  assert.ok(skeleton.title);
  assert.equal(skeleton.type, 'object');

  assert.ok(skeleton.properties.changes);
  result.changes = {};

  assert.ok(skeleton.properties.changes.properties.url);
  result.changes.url = 'https://dweb.link/ipfs/bafybeigwwctpv37xdcwacqxvekr6e4kaemqsrv34em6glkbiceo3fcy4si';

  assert.ok(skeleton.properties.changes.properties.description);
  result.changes.description = 'A proposal that demonstrates freeform proposals';
 
  assert.ok(skeleton.properties.changes.properties.hash);
  result.changes.hash = 'bafybeigwwctpv37xdcwacqxvekr6e4kaemqsrv34em6glkbiceo3fcy4si';

  return { result, docs };
}

function updateNetworkParameter(skeleton) {
  const result = {};
  const docs = skeleton 

  assert.ok(skeleton.properties.changes);
  result.changes = {};

  assert.ok(skeleton.properties.changes.properties.key);
  result.changes.key = sample(networkParameters)

  assert.ok(skeleton.properties.changes.properties.value);
  result.changes.value = Math.random().toString()

  return { result, docs }
}

function newAsset(skeleton) {
  const result = {};
  const docs = skeleton;

  const asset = sample(assetNames);

  assert.ok(skeleton.properties.changes);
  result.changes = {};
  
  assert.ok(skeleton.properties.changes.properties.name);
  result.changes.name = asset.name;
  
  assert.ok(skeleton.properties.changes.properties.symbol);
  result.changes.symbol = asset.symbol;

  assert.ok(skeleton.properties.changes.properties.totalSupply);
  result.changes.totalSupply = '19010568';

  assert.ok(skeleton.properties.changes.properties.decimals);
  result.changes.decimals = '5'

  assert.ok(skeleton.properties.changes.properties.quantum);
  result.changes.quantum = '1'

  assert.ok(skeleton.properties.changes.properties.erc20);
  result.changes.erc20 = { contractAddress: '0xcb84d72e61e383767c4dfeb2d8ff7f4fb89abc6e' };
  return { result, docs }
}


const ProposalGenerator = new Map([
  ['newFreeform', newFreeform],
  ['updateNetworkParameter', updateNetworkParameter],
  ['newAsset', newAsset],
  ['newMarket', newMarket]
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
