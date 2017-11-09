
import { getClient } from './client.js'

async function joinChannel(org, ...peerURLs) {

    console.log(`joining peers for ${org}`)

    // see client.js
    const client = await getClient(org, 'Admin')

    // create channel and add orderer
    const orderer = client.newOrderer('grpc://localhost:7050')
    const channel = client.newChannel('amihan-channel')
    channel.addOrderer(orderer)

    // extract genesis block from channel
    const genesisBlock = await channel.getGenesisBlock({ txId: client.newTransactionID() })
    console.log('channel genesis block retrieved')
    

    const peers = []
    peerURLs.forEach((peerURL) => {
        peers.push(client.newPeer(peerURL))
    })

    const req = {
        txId: client.newTransactionID(),
        block: genesisBlock,
        targets: peers
    }

    console.log('adding peers...')
    const res = await channel.joinChannel(req)

    if (res != null) {
        console.log(`${org} peers joined`)
    } else {
        console.log('unable to join peers')
    }
}

async function main() {
    try {
        await joinChannel('Amihan', 'grpc://localhost:7051', 'grpc://localhost:8051')
        await joinChannel('Acaleph', 'grpc://localhost:9051', 'grpc://localhost:10051')
    } catch(err) {
        console.error(`error joining channel: ${err}`)
    }
}

main()