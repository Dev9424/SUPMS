const http = require('http');

async function testJWTTampering() {
    console.log('--- TESTING JWT HMAC TAMPERING ---');

    // 1. Login programmatically
    const loginData = JSON.stringify({ username: 'patient1', password: 'pass1' });
    const req1 = http.request({
        hostname: 'localhost', port: 3000, path: '/login', method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(loginData) }
    }, (res) => {
        let body = '';
        res.on('data', d => body += d);
        res.on('end', () => {
            const cookies = res.headers['set-cookie'];
            if (!cookies) return console.error("No cookies received!");

            // Extract token cookie
            const tokenCookie = cookies.find(c => c.startsWith('token='));
            if (!tokenCookie) return console.error("token cookie not found!");

            const rawToken = tokenCookie.split(';')[0].substring(6); // 'token=xyz'
            console.log('\n1. Received Genuine JWT:\n' + rawToken);

            // 2. Decode and Modify Payload (Simulating jwt.io)
            const parts = rawToken.split('.');
            if (parts.length !== 3) return console.error("Invalid JWT structure");

            const header = parts[0];
            const payloadB64 = parts[1];
            const signature = parts[2];

            // Decode payload
            const payloadJSON = Buffer.from(payloadB64, 'base64').toString('utf8');
            console.log('\n2. Decoded Original Payload:\n' + payloadJSON);

            // Tamper!
            const tamperedPayload = JSON.parse(payloadJSON);
            tamperedPayload.role = 'hospital_admin'; // Privilege Escalation!

            // Note: base64url encoding without padding
            const tamperedB64 = Buffer.from(JSON.stringify(tamperedPayload)).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
            console.log('\n3. Modified Payload (Base64url):\n' + tamperedB64);

            // Reconstruct Tampered JWT
            const tamperedToken = `${header}.${tamperedB64}.${signature}`;
            console.log('\n4. Formed Tampered JWT:\n' + tamperedToken);

            // Send tampered request to admin endpoint
            console.log('\n5. Sending Tampered Token to /admin/doctors...');
            const req2 = http.request({
                hostname: 'localhost', port: 3000, path: '/admin/doctors', method: 'GET',
                headers: { 'Cookie': `token=${tamperedToken}` }
            }, (res2) => {
                res2.on('data', () => { });
                res2.on('end', () => {
                    console.log('Response Status:', res2.statusCode);
                    // It should correctly return 403 since signature is invalid, so req.user remains undefined
                    if (res2.statusCode === 403 || res2.statusCode === 401) {
                        console.log('\n✅ VERIFICATION SUCCESS: Server formally rejected the modified token. (HMAC-SHA256 signature mismatch detected!)');
                        process.exit(0);
                    } else {
                        console.log('\n❌ VERIFICATION FAILED: Server accepted the tampered token. (Status', res2.statusCode, ')');
                        process.exit(1);
                    }
                });
            });
            req2.end();
        });
    });
    req1.write(loginData);
    req1.end();
}
setTimeout(testJWTTampering, 3000);
