---
title: Wallet API v1
hide_title: false
sidebar_position: 2
---
Vega Wallet uses a built-in REST API service to allow programmatic access to signing and key management. This API service is used to sign transactions with a private and public key pair when submitting orders or other commands to a Vega node.

:::warning API deprecation
This API is being deprecated, and will not be available once the [JSON-RPC Wallet API](./v2-api/get-started) is out of alpha.
:::

## Create a wallet
Creating a wallet is done using a wallet name and passphrase. If a wallet already exists, the action is aborted. New wallets are marshalled, encrypted (using the passphrase) and saved to a file on the file system. A session and accompanying JWT is created, and the JWT is returned to the user.

* Request:

  ```json
  {
    "wallet": "walletname",
    "passphrase": "supersecret"
  }
  ```
* Command:

  ```shell
  curl -s -XPOST -d 'requestjson' https://wallet.testnet.vega.xyz/api/v1/wallets
  ```
* Response:

  ```json
  {
    "token": "verylongJWT"
  }
  ```

## Connecting to a wallet
Connect to a wallet using the wallet name and passphrase. 

The operation fails if the wallet does not exist, or the passphrase is incorrect. On success, the wallet is loaded, a session is created and a JWT is returned to the user.

* Request:

  ```json
  {
    "wallet": "walletname",
    "passphrase": "supersecret"
  }
  ```
* Command:

  ```shell
  curl -s -XPOST -d 'requestjson' https://wallet.testnet.vega.xyz/api/v1/auth/token
  ```
* Response:

  ```json
  {
    "token": "verylongJWT"
  }
  ```

## Disconnecting from a wallet

Using the JWT returned when connecting, the session is recovered and removed from the service. The wallet can no longer be accessed using the token from this point on.

* Request: n/a
* Command:

  ```shell
  curl -s -XDELETE -H 'Authorization: Bearer verylongJWT' https://wallet.testnet.vega.xyz/api/v1/auth/token
  ```
* Response:

  ```json
  {
    "success": true
  }
  ```

## List keys

Users can list all their public keys (with taint status, and metadata), if they provide the correct JWT. The service extracts the session from this token, and uses it to fetch the relevant wallet information to send back to the user.

* Request: n/a
* Command:

  ```shell
  curl -s -XGET -H "Authorization: Bearer verylongJWT" https://wallet.testnet.vega.xyz/api/v1/keys
  ```
* Response:

  ```json
  {
    "keys": [
      {
        "pub": "1122aabb...",
        "algo": "ed25519",
        "tainted": false,
        "meta": [
          {
            "key": "somekey",
            "value": "somevalue"
          }
        ]
      }
    ]
  }
  ```

## Generate a new key pair

The user submits a valid JWT, and a passphrase. We recover the session of the user, and attempt to open the wallet using the passphrase. If the JWT is invalid, the session could not be recovered, or the wallet could not be opened, an error is returned. If all went well, a new key pair is generated, saved in the wallet, and the public key is returned.

* Request:

  ```json
  {
    "passphrase": "supersecret",
    "meta": [
      {
        "key": "somekey",
        "value": "somevalue"
      }
    ]
  }
  ```
* Command:

  ```shell
  curl -s -XPOST -H 'Authorization: Bearer verylongJWT' -d 'requestjson' https://wallet.testnet.vega.xyz/api/v1/keys
  ```
* Response:

  ```json
  {
    "key": {
      "pub": "1122aabb...",
      "algo": "ed25519",
      "tainted": false,
      "meta": [
        {
          "key": "somekey",
          "value": "somevalue"
        }
      ]
    }
  }
  ```

## Sign a transaction

Sign a transaction using the specified keypair.

* Request:

  ```json
  {
    "tx": "dGVzdGRhdGEK",
    "pubKey": "1122aabb...",
    "propagate": false
  }
  ```
* Command:

  ```shell
  curl -s -XPOST -H "Authorization: Bearer verylongJWT" -d 'requestjson' http://127.0.0.1:1789/api/v1/messages

  ```
* Response:

  ```json
  {
    "signedTx": {
      "data": "dGVzdGRhdGEK",
      "sig": "...",
      "pubKey": "1122aabb..."
    }
  }
  ```

### Propagate

As you can see, the request payload has a field `propagate` (optional). If set to true, then the wallet service, if configured with a valid Vega node address, will try to send the transaction on your behalf to the node after signing it successfully. The node address can be configured via the wallet service configuration file. By default it will point to a local instance of a Vega node.

## Taint a key

* Request:

  ```json
  {
    "passphrase": "supersecret"
  }
  ```
* Command:

  ```shell
  curl -s -XPUT -H "Authorization: Bearer verylongJWT" -d 'requestjson' https://wallet.testnet.vega.xyz/api/v1/keys/1122aabb/taint

  ```
* Response:

  ```json
  {
    "success": true
  }
  ```

## Update key metadata

Overwrite all existing metadata with the new metadata.

* Request:

  ```json
  {
    "passphrase": "supersecret",
    "meta": [
      {
        "key": "newkey",
        "value": "newvalue"
      }
    ]
  }
  ```
* Command:

  ```shell
  curl -s -XPUT -H "Authorization: Bearer verylongJWT" -d 'requestjson' https://wallet.testnet.vega.xyz/api/v1/keys/1122aabb/metadata

  ```
* Response:

  ```json
  {
    "success": true
  }
  ```

## Issue a transaction

* Request:

  ```json
  {
    "pubKey": "8d06a20eb717938b746e0332686257ae39fa3d90847eb8ee0da3463732e968ba",
    "propagate": true,
    "orderCancellation": {
      "marketId": "YESYESYES"
    }
  }
  ```
* Command:

  ```shell
  curl -s -XPOST -H "Authorization: Bearer verylongJWT" -d 'requestjson' https://wallet.testnet.vega.xyz/api/v1/command
  ```
* Response:

  ```json
  {
    "transaction": {
      "inputData": "dGVzdGRhdG9837420b4b3yb23ybc4o1ui23yEK",
      "signature": {
        "value": "7f6g9sf8f8s76dfa867fda",
        "algo": "vega/ed25519",
        "version": 1
      },
      "from": {
        "pubKey": "1122aabb..."
      },
      "version": 1
    }
  }
  ```