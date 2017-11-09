Fabric Sample
-------------

## Running the network

Note the following:

- channel-artifacts -- already has the genesis block created
- crypto-config -- already has the certs generated

To start the network, run the following command:

```
$ docker-compose -f docker-config.yaml up -d
```

This should start the network with the following details:

Orgs: 
 - AGSX
     orderers:
       - orderer: localhost:7050
 - Amihan
     peers:
       - peer0: localhost:7051
       - peer1: localhost:8051
 - Acaleph
      peers:
       - peer0: localhost:9051
       - peer1: localhost:10051

Note that this is a bare network. no channels have been set up yet.

## Setting up the chaincode

The `sample-chaincode` directory contains a sample chaincode. Copy this to your GOPATH:

```
cp -r sample-chaincode $GOPATH/src
```

## Running the client scripts

The `test-client` contains test scripts that can access the network. Change directory to `test-client`:

```
cd test-client
```

Install the dependencies:

```
npm install
```

Install additional dependencies (if needed):

```
npm install grpc
npm install -g babel-cli
```

Create the channel:

```
babel-node 01-create-channel.js
```

Join peers:

```
babel-node 02-join-peers.js
```

Install chaincode:

```
babel-node 03-install-chaincode.js
```

Instantiate chaincode:

```
babel-node 04-instantiate-chaincode.js
```

Run query:

```
babel-node 05-query.js
```

Run invoke:

```
babel-node 06-invoke.js
```
