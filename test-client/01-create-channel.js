import * as fs from 'fs'
import * as path from 'path'

import { getClient } from './client.js'

async function createChannel() {

    // see client.js
    const client = await getClient('Amihan', 'Admin')
    const orderer = client.newOrderer('grpc://localhost:7050')

    // load channel config from channel.tx
    const envelop = fs.readFileSync('../channel-artifacts/channel.tx')
    const channelConfig = client.extractChannelConfig(envelop)
    const signature = client.signChannelConfig(channelConfig)

    // create channel
    const req = {
        name: 'amihan-channel',
        config: channelConfig,
        signatures: [signature],
        orderer: orderer,
        txId: client.newTransactionID()
    }
    const res = await client.createChannel(req)

    if (res != null) {
        console.log('channel created')
    } else {
        console.log('unable to create channel')
    }
}

async function main() {
    try {
        await createChannel()
    } catch(err) {
        console.error('error creating channel')
    }
}

main()