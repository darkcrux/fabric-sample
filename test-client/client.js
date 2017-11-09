// this contains common code

import * as fs from 'fs'

import { Client, newDefaultKeyValueStore, newCryptoKeyStore, newCryptoSuite }  from 'fabric-client'
const FabricClient = require('fabric-client')

// import * as FabricCaClient from 'fabric-ca-client'

const keystorePath = 'hfc-keystore'

const clusterOrgs = {
    'Amihan': { domain: 'amihan.net' },
    'Acaleph': { domain: 'acale.ph' }
}

export function createTransactionID() {
    
}

export async function getClient(org, userID) {

    // create a key value store in the given path
    const store = await newDefaultKeyValueStore({path: keystorePath})

    // same path for cryptostore (user keys storage)
    const keystore = newCryptoKeyStore({path: keystorePath})
    const cryptosuite = newCryptoSuite()
    cryptosuite.setCryptoKeyStore(keystore)

    // create the client
    const client = new FabricClient()
    client.setCryptoSuite(cryptosuite)
    client.setStateStore(store)

    // get the user context from keystore
    var user  = await client.getUserContext(`${org}-${userID}`, true)
        
    // if user is not in keystore, create it
    if (user == null) {
        console.log(`creating user ${org}-${userID}...`)
        // create user crypto content
        const domain = clusterOrgs[org].domain
        const mspPath = getUserMSP(domain, userID)
        const privateKeyFile = fs.readdirSync(`${mspPath}/keystore`)[0]
        const cryptoContent = {
            privateKey: `${mspPath}/keystore/${privateKeyFile}`,
            signedCert: `${mspPath}/signcerts/${userID}@${domain}-cert.pem`
        }

        // create user
        user = await client.createUser({
            username: `${org}-${userID}`,
            mspid: `${org}MSP`,
            cryptoContent: cryptoContent
        })
        console.log('user created')
    }

    // set user context
    await client.setUserContext(user)

    console.log(`created client for ${org}:${userID}`)
    return client
}


const getUserMSP = (domain, user) => {
    return `../crypto-config/peerOrganizations/${domain}/users/${user}@${domain}/msp`
}
