import express from 'express'
import process, { config } from 'process'

import {
    ConnectionEventTypes,
    ConnectionStateChangedEvent,
    DidExchangeState,
    Agent,
    ProofAttributeInfo,
    ProofEventTypes,
    ProofStateChangedEvent,
    AttributeFilter,
    HttpOutboundTransport,
    ConsoleLogger,
    LogLevel,
    AutoAcceptProof,
    IndyRevocationInterval,
    V2PresentationMessage
} from '@aries-framework/core'

import { HttpInboundTransport, agentDependencies } from '@aries-framework/node'
import { DidCommMessageRepository } from '@aries-framework/core/build/storage'


var qrImage = require('qr-image')

let GlobalSessionMap = new Map()

//NodeJS Express Application
const publicEndpoint ="http://192.168.2.171:3000/getqr/"

//Wallet Agent Service Endpoint - for wallet commnication
const serviceEndpointPort = 8020   // needs to match your ngrok session
var serviceEndpoint: string = 'https://d0c9247fca92.ngrok.app'  

const env = process.env

const walletLabel = 'verifier2'
const walletKey = 'secret00000000000000000000'
const listenPort = 3000
const CANdyDev = `{"reqSignature":{},"txn":{"data":{"data":{"alias":"dev-bc-1","blskey":"14YvF9m4TU4FSkqZQ9gDRr9Ef95aHPuieToEPTmMNEWAqkKB75FfGM3rU25Sfhqkd8nmGMjaJDso9jWgoQdaPqQxscuxu7VcDBmkByiZWtVohk4mRxSownozaaYESpyte4A346wXfGcqxCvUUa9gSyU1qEaM6ss4Z3e5pc39hzdekAq","blskey_pop":"RXmiB6JYFKU6RJwdhfwsH9mGSJx4X8s2Dsk3gHn7Ytajsn6kuaBC6FFiRmzbKkDuYFnMzF81JuRKHC7NBrKgsh8egmyGm5APNya6W6G7XyWwGs2WHX5tUtHeBVogSQEjV8Yq4RfzbpM6TJzPDzu8HyM1Why2nX9f84DMxgxJPMJseo","client_ip":"3.99.10.96","client_port":"9702","node_ip":"3.98.254.147","node_port":"9701","services":["VALIDATOR"]},"dest":"FgRxLSbzVzcMC8ioAbzbzYi1oqhYLUsoFeDewYiw97U"},"metadata":{"from":"7iLf2c7weDopmBLyPPGLHz"},"type":"0"},"txnMetadata":{"seqNo":1,"txnId":"26ac1e1cd83aa136090321bc58877f8563d1ed14cf11e78e1eb46a33692580f1"},"ver":"1"}
{"reqSignature":{},"txn":{"data":{"data":{"alias":"dev-qc-1","blskey":"NFLKzusQk9RfCAvmw5z56eFXVDhQahAwd8KoxNU4kaikT9RTUBTx537oswApMmTwFhcsrfTpwUm49QLHcVMNY4oZMyoq1ok1jZnUKvkPjqFkYahCr8VefsknaUj6qWiqoqFB1hLCdP3jeXvZbDVQSBnjTSysUkgnVwXEXdmAjt2ovn","blskey_pop":"QtrKM3pBvf9UnNgihnpoC86kVSm1VkLSj6maz9FGupZXcYcsjPaU8fbibUboW6NwzT9WfKpwCTmebDfPC6dieNZpgwxee8WDXHF7nBsgH8ctY2P3aezsEDs2zYSiCvrbdFkxBKvjNMkesK3xKUwGVUMyggjGckVFG2zZgUQ8pY4LKy","client_ip":"3.96.89.59","client_port":"9702","node_ip":"3.97.25.250","node_port":"9701","services":["VALIDATOR"]},"dest":"CfTG6ZPJzXRu9xozL43jzsA8EQXRvkbDHvYw3QzuTQrf"},"metadata":{"from":"XdVFchbXSMC898NjWCymXD"},"type":"0"},"txnMetadata":{"seqNo":2,"txnId":"8a6f8e43b9d9f7020c824e069a521b6682a91d48b3dd31bd71b67caaaf7ada9c"},"ver":"1"}
{"reqSignature":{},"txn":{"data":{"data":{"alias":"CandyDevOntNode01","blskey":"2Ldaj4ZeYmri7sx9YVGk5x1DRD5NMwbuASQPvEicqC7yQxreCvZYKKrnfi2kiTm26Mss5dm6UUeVFYLPKFwHqXWUnACyMNnHAUBw2HissHNXtLWUVXmPSdAXNgjYVTpPDZ4FuHKWuyDKtghfcb7F6UZSiJwkbVytA4aWoQmFeVrsHSp","blskey_pop":"RGkwsaPoSrERaFTbkLx5CQ8EcthFrNU8LaXsVV4dage4Cqk6eFtqeUj6BRzUaGUAQMFWiRTmfand6AhAt9ghBK6Hi2axf93JEkDChgPUC1Nks9HscMYRxs2AFuXiectW1uHEFW4QtrtWuKyfmBSfyv9rDvJiKCZsiVWaQpecUftdeP","client_ip":"20.200.95.22","client_port":"9702","node_ip":"20.151.226.136","node_port":"9701","services":["VALIDATOR"]},"dest":"DcvgAW7Wuw2aDxakjJGxFnssaXoAgUEWBhRUfNoEeVHx"},"metadata":{"from":"SmQ4y56g72C3ESKVgJTsBL"},"type":"0"},"txnMetadata":{"seqNo":3,"txnId":"3e0f572aa2a2e1c4ebf2ba679438f30f73abce817f3b6af1308c6fcb52823594"},"ver":"1"}
{"reqSignature":{},"txn":{"data":{"data":{"alias":"CandyDevOntNode02","blskey":"y9Vim7vZ39VkaacrmTcpQ8ytniabf2NSq3RRNAmELx8U93nKN1XhQaAhLJWPBwAjDtWfTP9PeaJUJZ1JNx1b3vmroZzEiPigMViZGBgnSLSiPnNyGCo1WqmSV2XD5QVqFLoRkym7C97vg9p5xTZm2EmBfdDpEc3M5F2tqofDhzFAzi","blskey_pop":"RQrbDZ1uj6QwUqGwzN2LMNw4DvpNmpgsZEYWYVM7e3aWnyiVWijgTV6mp1rjJR83x48P7dN2JYXFer8iTym9iiKvKTKKEMGEGvEUkGE3r3Mxg6hGMKEFkr5aYZMpoqiZ5BWjN52pGjMx2SfEr7FcmcHrwFw8znQvNxn8s1qh9TLCJ3","client_ip":"20.200.77.108","client_port":"9702","node_ip":"20.104.69.119","node_port":"9701","services":["VALIDATOR"]},"dest":"6Ey8JA9YDPzEccbi4dGTaEoPtWK6bvVki6WveWHMUjHb"},"metadata":{"from":"5KwZGBgmVhjAUmc3Ur8wGZ"},"type":"0"},"txnMetadata":{"seqNo":4,"txnId":"5fcd2367ffe5f0f2e63c5807692b0895f3d9db8c10a35a1974f9f507a3f291e3"},"ver":"1"}`

const ledgerID = 'CANdy-dev'
const ledgerGenesis = CANdyDev

class AFJAgent {
    agent: Agent
    endpoint: string
    inPort: number
    connection_id: string
}

var vAttrs = {
    verified: false,
    okta_id: '',
    email: '',
    revoke_flag :''
}

const agentConfig ={
    config: {
        label: walletLabel,
        logger: new ConsoleLogger(LogLevel.error),
        walletConfig: {
            id: walletLabel,
            key: walletKey
        },
        indyLedgers: [{
            genesisTransactions: ledgerGenesis,
            indyNamespace: "candi",
            id: ledgerID,
            isProduction: false
        }],
        autoAcceptConnections: false,
        autoAcceptProofs: AutoAcceptProof.ContentApproved,
        connectToIndyLedgersOnStartup: true,
        endpoints: [serviceEndpoint],
    
    },
    dependencies: agentDependencies,
  }

const AgentAFJ = new AFJAgent()
AgentAFJ.agent = new Agent(agentConfig)
AgentAFJ.agent.registerOutboundTransport(new HttpOutboundTransport())
AgentAFJ.agent.registerInboundTransport(new HttpInboundTransport({ port: serviceEndpointPort }))
AgentAFJ.agent.initialize()
AgentAFJ.inPort = serviceEndpointPort
AgentAFJ.endpoint = serviceEndpoint
console.log("New agent created")


AgentAFJ.agent.events.on<ConnectionStateChangedEvent>(ConnectionEventTypes.ConnectionStateChanged, async ({ payload }) => {
    if (payload.connectionRecord.state === DidExchangeState.Completed) {
        console.log("Connection completed", payload.connectionRecord)
        AgentAFJ.connection_id = payload.connectionRecord.id
        const connectionRecord = AgentAFJ.connection_id
    }
    else {
        console.log("Connection status", payload.connectionRecord)
    }
})


const app = express()
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', async (req, res) => {
    vAttrs.verified = false
    vAttrs.okta_id = ''
    vAttrs.email = ''

    //Create an OOB proof request.
    const [proofReqId, qrCode] = await getQrcode();
    const qrUrl = publicEndpoint + proofReqId
    
    //Create a dummy session store.
    GlobalSessionMap.set(proofReqId,JSON.parse(qrCode))

    console.log("invitation", qrUrl)
    var inviteQR = ''

    // Generate QR code SVG string
    // To display raw SVG without escape any characters (without HTML Encode) -  <%- qr %>
    inviteQR = qrImage.imageSync(qrUrl, { type: 'svg' });  

    const deeplinkurl = ""
    res.render('qr.ejs', { 'qr': inviteQR.toString(), 'deepLink': 'didcomm://' + qrCode })
})

app.get('/statuscheck', async (req, res) => {
    res.setHeader('Content-Type', 'text/plain;charset=utf-8')
    res.setHeader("Cache-Control", "no-cache, must-revalidate")

    if (vAttrs.verified) {
        res.status(200).send('Ready')
    }
    else {
        res.status(404).send('Not yet')
    }
})

app.get('/result', async (req, res) => {
    console.log("result")
    res.render('result.ejs', { 'revoke_flag': vAttrs.revoke_flag, 'okta_id': vAttrs.okta_id, 'email': vAttrs.email })
})

function getUnixTime(time?: number) {
    const epoch = time ? time : Date.now();
    return Math.floor(epoch / 1000);

}

async function getQrcode() {

    //ODS LAB:
    //const sid = "QcjnAxxbQGex5QmRcYfCRz:2:ontario-test-credential:0.1.3"
    //const sid = "tzTU3gw6xGsWXYUdMkjjb:2:ontario-test-credential:0.1.3"
    //"cred_def_id": "QcjnAxxbQGex5QmRcYfCRz:3:CL:26959:ontario-test-credential",
    // city   country 

    //Gary Lab:
    //const sid = "PYQeBbSrkxBwVpxH1RmEfE:2:hc-demo-schema:0.16"
    // person.name.given    person.name.family     person.identifier.type   

    //Public Secure Schema ID
    const sid = "6ZRC6oXp9svMBFCzmXWtux:2:ps-uid:0.1"
    //Public Secure Credential Definition ID
    //RC9PWzBBqYNNXrNpFaBzex:3:CL:26909:ont_id_0.1
    //okta_id  email

    const attributes: Record<string, ProofAttributeInfo> = {}
    const unixTime = getUnixTime()

    console.log(unixTime)

    const revokeInterval = new IndyRevocationInterval({
        to: unixTime
    })

    attributes['attr_1'] = new ProofAttributeInfo({
        name: "okta_id",
        nonRevoked: revokeInterval,
        restrictions: [new AttributeFilter({
            schemaId: sid
        })

        ]
    })
    attributes['attr_2'] = new ProofAttributeInfo({
        name: "email",
        restrictions: [new AttributeFilter({
            schemaId: sid
        })

        ]
    })

    //Create AIP 2 Proof Request
   let { message, proofRecord } = await AgentAFJ.agent.proofs.createRequest({
    protocolVersion: 'v2',
    proofFormats: {
      indy: {
        name: 'test-proof-request',
        version: '2.0',
        nonce: '12345678901',
        requestedAttributes: attributes,
        //requestedPredicates: predicates,
      },
    },
    autoAcceptProof: AutoAcceptProof.ContentApproved,
  })

  // Inject Service Decorator 
  const requestMessage  = await AgentAFJ.agent.oob.createLegacyConnectionlessInvitation({
       recordId: proofRecord.id,
       message,
        domain: serviceEndpoint,
  })


console.log("REQ MSG is  " + JSON.stringify(requestMessage.message))

var qr = JSON.stringify(requestMessage.message)

return [proofRecord.id, qr]

}


//  incoming pattern "http://URL:3000/getqr/proofid=" + proofReqId
app.get('/getqr/:proofid', async (req, res) => {

    //prefer to use session ID instead of proofid.
    console.log(req.params.proofid);
    const proofMessage = await AgentAFJ.agent.proofs.findRequestMessage(req.params.proofid)
    
    console.log("proofMessage " + JSON.stringify(proofMessage))

    //retrieve from Session. 
    //const qr = GlobalSessionMap.get(req.params.proofid)
    //console.log("From session" + JSON.stringify(qr))
    
    res.json(proofMessage)

})

AgentAFJ.agent.events.on(ProofEventTypes.ProofStateChanged, async ({ payload }: ProofStateChangedEvent) => {
    console.log("Proof presentation=", JSON.stringify(payload.proofRecord))
    console.log("Proof state: ", payload.proofRecord?.state)
    console.log("Proof verified: ", payload.proofRecord?.isVerified ? 'Verified' : 'not Verified')

    if(payload.proofRecord.state === "presentation-received") {

    var proofResponseMessage = await AgentAFJ.agent.proofs.findPresentationMessage(payload.proofRecord.id)

    const didCommMessageRepository = AgentAFJ.agent.dependencyManager.resolve(DidCommMessageRepository)

    const proofAttachement = await didCommMessageRepository.findAgentMessage(AgentAFJ.agent.context, {
        associatedRecordId: payload.proofRecord.id,
        messageClass: V2PresentationMessage,
      }) 
    
    const decode = (str: string): string => Buffer.from(str, 'base64').toString('binary')

    const proofData = JSON.parse(decode(proofAttachement.presentationsAttach[0].data.base64))

    vAttrs.verified = true
    vAttrs.okta_id = proofData.requested_proof.revealed_attrs.attr_1.raw
    vAttrs.email = proofData.requested_proof.revealed_attrs.attr_2.raw
    vAttrs.revoke_flag = payload.proofRecord?.isVerified ? "Good standing" : "Revoked"
    console.log("attr_1=", proofData.requested_proof.revealed_attrs.attr_1.raw)
    console.log("attr_2=", proofData.requested_proof.revealed_attrs.attr_2.raw) 
    }
})

app.listen(listenPort)
function AttachmentDataOptions(arg0: {}) {
    throw new Error('Function not implemented.')
}

