
import { getClient } from './client.js'


async function testInvoke() {

	// see client.js
	const client = await getClient('Amihan', 'Admin')

	const channel = client.newChannel('amihan-channel')
	channel.addPeer(client.newPeer('grpc://localhost:7051'))
	channel.addPeer(client.newPeer('grpc://localhost:8051'))
	channel.addPeer(client.newPeer('grpc://localhost:9051'))
	channel.addPeer(client.newPeer('grpc://localhost:10051'))
	channel.addOrderer(client.newOrderer('grpc://localhost:7050'))
	
	console.log('created new client with peers and orderer')

	// create a new tranasction ID, needed for proposal and tracking of events
	const txID = client.newTransactionID()

	// proposal request
	const req = {
		chaincodeId: 'test-cc',
		fcn: 'set',
		args: ['x', '1000'],
		chainId: 'amihan-channel',
		txId: txID
	}

	console.log('sending proposal...')
	const res = await channel.sendTransactionProposal(req)

	const isProposalBad = res && res[0].response && res[0].response.status !== 200

	if (isProposalBad) {
		console.error('proposal was bad')
		return -1
	}

	// tranasction request
	const txReq = {
		proposalResponses: res[0],
		proposal: res[1]
	}

	// send the transaction promise, we'll send it later
	const invokePromise = channel.sendTransaction(txReq)

	// transaction ID string, needed to track which transaction
	const tranasctionID = txID.getTransactionID()

	// event hub listens to transactions
	const eventHub  = client.newEventHub()
	eventHub.setPeerAddr('grpc://localhost:7053')

	// event promise acts on the transaction results
	const eventPromise = new Promise((resolve, reject) => {

		// timeout after 3 seconds
		const handle = setTimeout(() => {
			eventHub.disconnect()
			resolve({event_status: 'TIMEOUT'})
		}, 3000)

		// connect the eventhub
		eventHub.connect()

		// listen on the transaction
		eventHub.registerTxEvent(tranasctionID, 
			
			// if there's a response
			(tx, code) => {
	
				// clear timeout, unregister, then disconnect
				clearTimeout(handle)
				eventHub.unregisterTxEvent(tranasctionID)
				eventHub.disconnect()

				// resolve promise
				var return_status = {event_status : code, tx_id : tranasctionID};
				if (code !== 'VALID') {
					console.log(`the tranasction was invalid: ${code}`)
					resolve(return_status)
				} else {
					console.log('the transaction has been committed')
					resolve(return_status)
				}
			}, 
			
			// if err, log the error
			(err) => {
				console.log(`issue with event hub: ${err}`)
			}
		)
		
	}, )

	// run the invoke, and listen to the event
	const results = await Promise.all([
		invokePromise,
		eventPromise
	])

	// display result

	const invokeSuccess = results && results[0] && results[0].status == 'SUCCESS'
	const eventSuccess = results && results[1] && results[1].event_status == 'VALID'

	if (invokeSuccess) {
		console.log('tranasction successfully sent to the orderer')
	} else {
		console.error('failed to order tranasction.')
	}

	if (eventSuccess) {
		console.log('transaction successfully committed to the ledger')
	} else {
		console.error('unable to commit tranasction')
	}

	
}

async function main() {
	await testInvoke()
}

main()