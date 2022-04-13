const sample = require('lodash/sample');
const random = require('lodash/random');
const sampleSize = require('lodash/sampleSize');
const assert = require('assert').strict;

// Seed data: Some inspirational instrument names and corresponding codes
const instruments = [
    { name: 'Apples Yearly (2022)', code: 'APPLES.22' },
    { name: 'Oranges Daily', code: 'ORANGES.24h' }
];

// Seed data: some example metadata for a market
const metadata = ['sector:energy', 'sector:tech', 'sector:materials', 'sector:health', 'sector:food']

// TODO more type assertions
function generateOracleSpec(skeleton) {
  assert.equal(skeleton.properties.pubKeys.type, 'array', 'Oracle spec pubkeys used to be an array')
  assert.equal(skeleton.properties.pubKeys.items.type, 'string', 'Oracle spec pubkeys used to be an array of strings')
  assert.equal(skeleton.properties.filters.type, 'array', 'Oracle spec filters')
  return {
    pubKeys: [
        "0xab5c950b071684321d59360ccb924d9c5010b31abd6b4148206a57e73594abc9"
      ],
      filters: [
        {
          key: {
            name: "prices.AAPL.value",
            type: "TYPE_INTEGER"
          },
          conditions: [
            {
              "operator": "OPERATOR_EQUALS",
              "value": "1"
            }
          ]
        }
      ]
    }
}

// TODO: Assert types
function generateOracleSpecBinding(skeleton) {
  return {
    settlementPriceProperty: "prices.AAPL.value",
    tradingTerminationProperty: "prices.AAPL.value"
  }
}


// TODO pass in a deeper nested skeleton
function generateInstrument(skeleton) {
  const randomInstrument = sample(instruments)
  // This is tEuro
  const idForAnExistingVegaAsset = '8b52d4a3a4b0ffe733cddbc2b67be273816cfeb6ca4c8b339bac03ffba08e4e4'

  const instrument = {};
  // The properties of an instrument
  assert.ok(skeleton.properties.changes.properties.instrument);
  assert.ok(skeleton.properties.changes.properties.instrument.properties.name);
  instrument.name = randomInstrument.name;
  assert.ok(skeleton.properties.changes.properties.instrument.properties.code);
  instrument.code = randomInstrument.code;
  instrument.future = {};

  assert.ok(skeleton.properties.changes.properties.instrument.properties.future.properties.settlementAsset);
  instrument.future.settlementAsset = idForAnExistingVegaAsset;

  assert.ok(skeleton.properties.changes.properties.instrument.properties.future.properties.quoteName);
  instrument.future.quoteName = 'tEuro';

  assert.ok(skeleton.properties.changes.properties.instrument.properties.future.properties.settlementPriceDecimals);
  assert.equal(skeleton.properties.changes.properties.instrument.properties.future.properties.settlementPriceDecimals.type, 'integer');
  instrument.future.settlementPriceDecimals = 5;

  assert.ok(skeleton.properties.changes.properties.instrument.properties.future.properties.oracleSpecForSettlementPrice);
  instrument.future.oracleSpecForSettlementPrice = generateOracleSpec(skeleton.properties.changes.properties.instrument.properties.future.properties.oracleSpecForSettlementPrice);

  assert.ok(skeleton.properties.changes.properties.instrument.properties.future.properties.oracleSpecForTradingTermination);
  instrument.future.oracleSpecForTradingTermination = generateOracleSpec(skeleton.properties.changes.properties.instrument.properties.future.properties.oracleSpecForSettlementPrice);

  assert.ok(skeleton.properties.changes.properties.instrument.properties.future.properties.oracleSpecBinding);
  instrument.future.oracleSpecBinding = generateOracleSpecBinding(skeleton);

  return instrument
}

function generatePeggedOrder(side) {
  return {
    offset: random(1, 100).toString(),
    proportion: random(1, 10).toString(),
    reference: side === 'sell' ? 'PEGGED_REFERENCE_BEST_ASK' : 'PEGGED_REFERENCE_BEST_BID'
  }
}

function generatePeggedOrders(skeleton, side) {
  assert.equal(skeleton.type, 'array', 'Pegged orders used to be an array')
  assert.equal(skeleton.items.type, 'object', 'Pegged orders array items used to be an object')
  assert.equal(skeleton.items.properties.reference.type, 'string', 'Pegged orders reference used to be a string/enum')
  assert.equal(skeleton.items.properties.proportion.type, 'integer', 'Pegged orders proportion used to be an integer')
  assert.equal(skeleton.items.properties.offset.type, 'string', 'Pegged orders offset used to be a string')

  let orders = [
    generatePeggedOrder(side),
    generatePeggedOrder(side),
    generatePeggedOrder(side),
    generatePeggedOrder(side)
  ]

  return orders
}

function generateNewMarketCommitment(skeleton) {
  return {
    commitmentAmount: random(100000,10000000).toString(),
    fee: random(0.01, 0.9).toPrecision(2).toString(),
    buys: generatePeggedOrders(skeleton.properties.buys, 'buy'),
    sells: generatePeggedOrders(skeleton.properties.sells, 'sell')
  }
}

function generatePriceMonitoringParameters(skeleton) {
  assert.ok(skeleton.properties.triggers)
  assert.equal(skeleton.properties.triggers.type, 'array')
  assert.equal(skeleton.properties.triggers.items.properties.horizon.format, 'int64')
  assert.equal(skeleton.properties.triggers.items.properties.probability.type, 'string')
  assert.equal(skeleton.properties.triggers.items.properties.auctionExtension.format, 'int64')
  return {
    triggers: [
      {
        horizon: "43200",
        probability: "0.9999999",
        auctionExtension: "600"
      }
    ]
  }
}

function generateLiquidityMonitoringParameters(skeleton) {
  assert.ok(skeleton.properties.targetStakeParameters)
  assert.equal(skeleton.properties.targetStakeParameters.properties.timeWindow.type, 'string')
  assert.equal(skeleton.properties.targetStakeParameters.properties.scalingFactor.type, 'number')

  assert.equal(skeleton.properties.triggeringRatio.type, 'number')
  assert.equal(skeleton.properties.auctionExtension.type, 'string')

  return {
    targetStakeParameters: {
      timeWindow: '3600',
      scalingFactor: 10
    },
    triggeringRatio: 0.7,
    auctionExtension: '1'
  }
}

function generateMetadata(skeleton) {
  assert.equal(skeleton.type, 'array', 'Market metadata type used to be an array')
  assert.equal(skeleton.items.type, 'string', 'Market metadata type used to be an array of strings')
  return [...sampleSize(metadata, random(1,3)) ,'source:docs.vega.xyz'] 
}


function generateRiskModel(skeleton, riskModelType) {
  if (riskModelType !== 'logNormal') {
    throw 'Not implemented'
  }

  assert.ok(skeleton.properties.riskAversionParameter);
  assert.ok(skeleton.properties.tau);
  assert.equal(skeleton.properties.tau.format, 'double');
  assert.ok(skeleton.properties.params.properties.r);
  assert.equal(skeleton.properties.params.properties.r.format, 'double');
  assert.ok(skeleton.properties.params.properties.sigma);
  assert.equal(skeleton.properties.params.properties.sigma.format, 'double');

  return {
    // This was what all the markets on fairground were set to
    tau: 0.0001140771161,
    // This is a random array based on what was live on Fairground at the time
    riskAversionParameter: sample([0.001, 0.01, 0.0001]),
    params: {
      // This was what all the markets on fairground were set to
      r: 0.016,
      // This is a random array based on what was live on Fairground at the time
      sigma: sample([0.5, 0.3, 1.25, 0.8])
    }
  }
}

function newMarket(skeleton) {
  const result = {};
  const docs = {};

  assert.ok(skeleton.properties.changes);
  result.changes = {};

  assert.ok(skeleton.properties.changes.properties.decimalPlaces);
  result.changes.decimalPlaces = 5;
  assert.ok(skeleton.properties.changes.properties.positionDecimalPlaces);
  result.changes.positionDecimalPlaces = 5;
 
  assert.ok(skeleton.properties.changes.properties.instrument);
  result.changes.instrument = generateInstrument(skeleton)

  assert.equal(skeleton.properties.changes.properties.metadata.type, 'array');
  result.changes.metadata = generateMetadata(skeleton.properties.changes.properties.metadata)
  
  assert.ok(skeleton.properties.changes.properties.priceMonitoringParameters);
  result.changes.priceMonitoringParameters = generatePriceMonitoringParameters(skeleton.properties.changes.properties.priceMonitoringParameters)

  assert.ok(skeleton.properties.changes.properties.liquidityMonitoringParameters);
  result.changes.liquidityMonitoringParameters = generateLiquidityMonitoringParameters(skeleton.properties.changes.properties.liquidityMonitoringParameters)

  assert.ok(skeleton.properties.changes.properties.logNormal);
  result.changes.logNormal = generateRiskModel(skeleton.properties.changes.properties.logNormal, 'logNormal')

  /*------- Liquidity Commitment required */
  assert.ok(skeleton.properties.liquidityCommitment);
  result.liquidityCommitment = generateNewMarketCommitment(skeleton.properties.liquidityCommitment)
  
  //console.dir(result, { depth: 20 })
  return { result, docs }
}

module.exports = { newMarket }