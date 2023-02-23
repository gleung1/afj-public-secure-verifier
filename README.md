## How to use

### Pre-requirements
1. Ontario Wallet setup completed.
2. Obtained Public Secure Credential 

### Public Secure Info
Public Secure Schema ID
6ZRC6oXp9svMBFCzmXWtux:2:ps-uid:0.1

Public Secure Credential Definition ID
RC9PWzBBqYNNXrNpFaBzex:3:CL:26909:ont_id_0.1

## Running on your local machine
### Requirements:
1. setup NGROK for port 8020 - ngrok http 8020
2. Build docker image
<pre>
<code>docker build . -t afj-public-secure-verifier</code>
</pre>
3. Run the docker image
<pre>
<code>docker run -p 8020:8020 -p 3000:3000 afj-public-secure-verifier</code>
</pre>
4. Visit http://localhost:3000 