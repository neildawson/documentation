import React, { useEffect, useState } from 'react';

const networkApiUrl = {
  'TESTNET': 'https://lb.testnet.vega.xyz/network/parameters',
  'MAINNET': 'https://api.token.vega.xyz/network/parameters',
}

const explorerUrl = {
  'TESTNET': 'https://explorer.fairground.wtf/network-parameters',
  'MAINNET': 'https://explorer.vega.xyz/network-parameters',
}

function restructureData(apiResponse) {
  const dict = {}
  apiResponse.forEach(a => {
    dict[a['key']] = a['value']
  })
  return dict
}

export default function NetworkParameter(props) {
  const vega_network = props?.frontMatter?.vega_network || 'TESTNET';
  const hideName = props.hideName ? props.hideName : false
  const suffix = props.suffix ? props.suffix : false

  if (!vega_network) {
    throw new Error("Missing vega_network");
  }

  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(networkApiUrl[vega_network]);
      const allParams = await response.json();
      setData(restructureData(allParams.networkParameters));
    };

    fetchData();
  }, [props.id]);

  if (data) {
    const value = data[props.param]
    const displayValue = suffix ? <>{value} {suffix}< /> : value;

    return (<a href={explorerUrl[vega_network]} className="networkparameter" title={`Set by network parameter: ${props.param}`} >
      <span className="networkparametericon">🛠️</span>
      {(hideName ? null : <span className="networkparametername">{props.param}: </span>)}
      <span className="networkparametervalue">{displayValue || `Could not find ${props.param}`}</span>
    </a>);
  } else {
    return <b>Loading...</b>;
  }
}
