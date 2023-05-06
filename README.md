## How to use

### Pre-requirements
1. Ontario Wallet setup completed.
2. Obtained Public Secure Credential 

### Public Secure Info
Public Secure Schema ID
6ZRC6oXp9svMBFCzmXWtux:2:ps-uid:0.1

Public Secure Credential Definition ID
RC9PWzBBqYNNXrNpFaBzex:3:CL:26909:ont_id_0.1

### Supports
This application is using AFJ v0.3.3 with AIP 2.0 supports.

## Running on your local machine
### Requirements:

1. Setup Wallet Agent Service Endpoint:
- setup NGROK for port 8020 - ngrok http 8020
- Update serviceEndpoint and serviceEndpointPort variables in the server.ts file. 

2. Setup NodJS Express Application Public Endpoint
- Update publicEndpoint variable in the server.ts file. 

3. Build docker image
<pre>
<code>docker build . -t afj-public-secure-verifier</code>
</pre>
4. Run the docker image
<pre>
<code>docker run -p 8020:8020 --name afj-ps-verifier -p 3000:3000 afj-public-secure-verifier</code>
</pre>
5. Visit http://localhost:3000 