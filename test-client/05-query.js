
import * as FabricClient from 'fabric-client'
import * as util from './util.js'
import { getClient } from './client.js'


async function testQuery() {

    const fabricClient = await getClient('Amihan', 'Admin')

    const peer = fabricClient.newPeer('grpc://localhost:7051')
    const channel = fabricClient.newChannel('amihan-channel')
    channel.addPeer(peer)

    console.log('using amihan-channel with peer0.amihan.net')

    const req = {
        chaincodeId: 'test-cc',
        fcn: 'get',
        args: ['x']
    }

    console.log('querying...')
    const res = await channel.queryByChaincode(req)

    console.log('query done.')
    if (res && res.length == 1) {
        // there is a response
        if (res[0] instanceof Error) {
            // there was an error
            console.error(`error from query = ${res[0]}`)
        } else {
            // response success
            console.error(`response: ${res[0].toString()}`)
        }
    } else {
        // no response
        console.log('no payloads were returned from query')
    }

}

async function main() {
    await testQuery()
}

console.log('starting')
main()