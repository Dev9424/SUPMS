const selfsigned = require('selfsigned');
const fs = require('fs');
const path = require('path');

async function main() {
    try {
        const attrs = [{ name: 'commonName', value: 'localhost' }];
        let pems = selfsigned.generate(attrs, { days: 365, keySize: 2048 });

        if (pems instanceof Promise) {
            pems = await pems;
        }

        const priv = pems.private || pems.privateKey;
        const cert = pems.cert || pems.certificate;

        if (!priv || !cert) {
            throw new Error(`Failed to find keys. Object keys: ${Object.keys(pems)}`);
        }

        fs.writeFileSync(path.join(__dirname, 'server.key'), priv);
        fs.writeFileSync(path.join(__dirname, 'server.cert'), cert);
        console.log('Certificates generated successfully.');
    } catch (error) {
        console.error('Error:', error);
    }
}

main();
