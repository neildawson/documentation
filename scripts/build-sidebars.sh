#!/usr/bin/env bash

echo "GraphQL: Remove unused generated sidebar"
rm -f docs/graphql/sidebar.schema.js

echo "REST: Rename services (improve search results appearance)"
sed -i -E 's/CoreService/Core service/g' docs/api/rest/core/sidebar.js
sed -i -E 's/CoreStateService/Core State/g' docs/api/rest/state/sidebar.js
sed -i -E 's/TradingDataService/Trading Data \(v2\)/g' docs/api/rest/data-v2/sidebar.js
sed -i -E 's/TradingDataService/Trading Data \(v1\)/g' docs/api/rest/data-v1/sidebar.js

echo "GRPC: Rename root ('Files' is not useful)"
sed -i -E 's/Files/GRPC/g' docs/grpc/sidebar.js
echo "GRPC: Fix sidebar links (fixes incorrect path mappings for the versioned world)"
sed -i -E 's/vega\//grpc\/vega\//g' docs/grpc/sidebar.js
sed -i -E 's/data-node\//grpc\/data-node\//g' docs/grpc/sidebar.js

# Mac SED workaround - delete remnant files (not required with gsed)
find . -name "*-E" -exec rm -rf {} +

