
  ```bash
vegawallet.exe command send --wallet your_walletname --pubkey your_public_key --network fairground ^
"{^
\"proposalSubmission\": {^
 \"rationale\": {^
  \"title\": \"Update governance.proposal.asset.requiredMajority\",^
  \"description\": \"Proposal to update governance.proposal.asset.requiredMajority to 300}\"^
 },^
 \"terms\": {^
  \"updateNetworkParameter\": {^
   \"changes\": {^
    \"key\": \"governance.proposal.asset.requiredMajority\",^
    \"value\": \"300\"^
   }^
  },^
  \"closingTimestamp\": 1665423449,^
  \"enactmentTimestamp\": 1665509849^
 }^
}^
}"
```
  