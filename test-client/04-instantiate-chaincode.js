import * as fs from 'fs'
import * as path from 'path'

import { getClient } from './client.js'

async function instantiateChaincode() {

    // see client.js
    const client = await getClient('Amihan', 'Admin')
    const orderer = client.newOrderer('grpc://localhost:7050')
    const peer = client.newPeer('grpc://localhost:7051')
    const channel = client.newChannel('amihan-channel')
    channel.addPeer(peer)
    channel.addOrderer(orderer)

    await channel.initialize()

    const req = {
        chaincodeId: 'test-cc',
        chaincodeVersion: '1.0',
        args: ['x','100'],
        txId: client.newTransactionID()
    }

    console.log('sending instantiation proposal')
    const proposalResponse = await channel.sendInstantiateProposal(req)

    console.log('sending instantiation transaction')
    const res = await channel.sendTransaction({
        proposalResponses: proposalResponse[0],
        proposal: proposalResponse[1]
    })

    console.log(res)
    
}

async function main() {
    try {
        await instantiateChaincode()
    } catch(err) {
        console.error('error creating chaincode')
    }
}

main()