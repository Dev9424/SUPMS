const { spawn } = require('child_process');
const mysql = require('mysql2/promise');
const http = require('http');

function postReq(path, data) {
    return new Promise((resolve, reject) => {
        const payload = JSON.stringify(data);
        const req = http.request({
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
            }
        }, res => {
            let body = '';
            res.on('data', d => body += d);
            res.on('end', () => {
                try { resolve({ status: res.statusCode, body: JSON.parse(body) }); }
                catch (e) { resolve({ status: res.statusCode, body }); }
            });
        });
        req.on('error', reject);
        req.write(payload);
        req.end();
    });
}

// Kill existing process on port 3000 if needed? Let's just spawn index.js
const server = spawn('node', ['index.js']);
let serverOutput = '';
let testsStarted = false;

server.stdout.on('data', (data) => {
    const text = data.toString();
    serverOutput += text;
    // console.log('[SERVER]:', text.trim());
    if (serverOutput.includes('Connected to MySQL') && !testsStarted) {
        testsStarted = true;
        setTimeout(runTests, 2000);
    }
});

server.stderr.on('data', (d) => console.error('[SERVER ERR]:', d.toString()));

async function runTests() {
    console.log('\n--- STARTING TESTS ---');
    try {
        const db = await mysql.createConnection({ host: 'localhost', user: 'root', password: '[password]', database: 'hospital' });
        const username = 'testuser_' + Date.now();
        const password = 'testpassword';

        console.log('1. Registering user...');
        const regRes = await postReq('/patient/register', { username, password, name: 'Test', age: 30 });
        console.log('Register status:', regRes.status, regRes.body);

        console.log('\n2. Checking DB...');
        const [rows] = await db.query('SELECT password FROM users WHERE username = ?', [username]);
        const hash = rows[0].password;
        console.log('Hash in DB:', hash);
        if (!hash.startsWith('$argon2')) {
            throw new Error('Password not hashed with argon2!');
        } else {
            console.log('✓ Verified: Password is an Argon2 hash in the DB.');
        }

        console.log('\n3. Trying login with wrong password...');
        const l1Res = await postReq('/login', { username, password: 'wrongpassword' });
        console.log('Wrong password response:', l1Res.body);
        if (l1Res.body.success === true) throw new Error('Login should have failed!');
        console.log('✓ Verified: Login failed with incorrect password.');

        console.log('\n4. Trying login with correct password...');
        const l2Res = await postReq('/login', { username, password });
        console.log('Correct password response:', l2Res.body);
        if (l2Res.body.success !== true) throw new Error('Login should have succeeded!');
        console.log('✓ Verified: Login successful with correct password.');

        db.end();
        console.log('\n--- ALL TESTS PASSED ---');
    } catch (err) {
        console.error('Test Failed:', err);
    } finally {
        server.kill();
        process.exit();
    }
}

// Handle timeout just in case server fails to start
setTimeout(() => {
    if (!testsStarted) {
        console.error('Tests did not start. Server output:', serverOutput);
        server.kill();
        process.exit(1);
    }
}, 10000);
