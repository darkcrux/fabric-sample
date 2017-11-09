
import * as fs from 'fs'
import * as path from 'path'

export function getPeerPEM(domain, peer) {

    const pem_file = `../crypto-config/peerOrganizations/${domain}/peers/${peer}.${domain}/tls/ca.crt`
    const pem_data = fs.readFileSync(path.join(__dirname, pem_file));
    const pem = Buffer.from(pem_data).toString()

    return pem
}