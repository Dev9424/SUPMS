const http = require('http');

async function testInsecureCookie() {
    console.log('--- TESTING INSECURE COOKIE SESSIONS ---');

    // 1. Login programmatically (simulating Browser 1)
    const loginData = JSON.stringify({ username: 'patient1', password: 'pass1' });
    const req1 = http.request({
        hostname: 'localhost', port: 3000, path: '/login', method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(loginData) }
    }, (res) => {
        let body = '';
        res.on('data', d => body += d);
        res.on('end', () => {
            console.log('1. Login Response Status:', res.statusCode);
            const cookies = res.headers['set-cookie'];
            console.log('Set-Cookie received:', cookies);

            if (!cookies) {
                console.error("No cookies received!");
                return;
            }

            // Extract userAuth cookie
            const userAuthCookie = cookies.find(c => c.startsWith('userAuth='));
            if (!userAuthCookie) {
                console.error("userAuth cookie not found!");
                return;
            }

            const rawCookieString = userAuthCookie.split(';')[0];
            console.log('\n2. Copied Cookie:', rawCookieString);

            console.log('\n3. Simulating pasting the cookie in another browser...');
            // Simulating Browser 2 making a request to a protected endpoint (/me)
            const req2 = http.request({
                hostname: 'localhost', port: 3000, path: '/me', method: 'GET',
                headers: { 'Cookie': rawCookieString } // Injecting the stolen cookie
            }, (res2) => {
                let body2 = '';
                res2.on('data', d => body2 += d);
                res2.on('end', () => {
                    console.log('\n4. Response from /me (Protected System Access):');
                    console.log('Body:', body2);
                    try {
                        const parsed = JSON.parse(body2);
                        if (parsed.success && parsed.user.username === 'patient1') {
                            console.log('\n✅ VULNERABILITY CONFIRMED: System accessed successfully using stolen cookie without logging in!');
                            process.exit(0);
                        } else {
                            console.log('\n❌ VULNERABILITY FAILED: System rejected the stolen cookie.');
                            process.exit(1);
                        }
                    } catch (e) {
                        console.log('JSON Parse Error', e);
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
// Delay test slightly to ensure backend is fully initialized
setTimeout(testInsecureCookie, 2000);
