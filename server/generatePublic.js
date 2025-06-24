const fs = require('fs');
const forge = require('node-forge');

// Load private key
const privateKeyPem = fs.readFileSync('./private.pem', 'utf8');
const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);

// Generate public key
const publicKey = forge.pki.setRsaPublicKey(privateKey.n, privateKey.e);
const publicKeyPem = forge.pki.publicKeyToPem(publicKey);

// Save to file (optional)
fs.writeFileSync('publicKey.pem', publicKeyPem);
console.log('✅ Public key saved to publicKey.pem');
