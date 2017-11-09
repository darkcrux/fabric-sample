import { getClient } from './client.js'


async function testInstallChaincode(org, ...peerURLs) {

    // see client.js
    const client = await getClient(org, 'Admin')

    // identify peers to install chaincode on
    const peers = []
    peerURLs.forEach((peerURL) => {
        peers.push(client.newPeer(peerURL))
        console.log(`will install to ${peerURL}...`)
    })

    const txID = client.newTransactionID()
    const req = {
        targets: peers,
        chaincodePath: 'sample-chaincode', // point this to your chaincode
        chaincodeId: 'test-cc',
        chaincodeVersion: '1.0',
    }

    
    const res = await client.installChaincode(req)
    const responses = res[0]

    if (responses) {
        responses.forEach((response) => {
            if (response && response.response && response.response.status == 200) {
                console.log('...success')
            } else {
                console.log('...fail')
            }
        })
    } else {
        console.log('unable to install chaincode')
    }


}

async function main() {
    try {
        await testInstallChaincode('Amihan', 'grpc://localhost:7051', 'grpc://localhost:8051')
        await testInstallChaincode('Acaleph', 'grpc://localhost:9051', 'grpc://localhost:10051')
    } catch(err) {
        console.error(err)
    }
}

main()
