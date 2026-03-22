const mysql = require('mysql2/promise');
const argon2 = require('argon2');

(async () => {
    try {
        const db = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '[password]',
            database: 'hospital'
        });
        const [users] = await db.query('SELECT * FROM users');
        let updated = 0;
        for (const u of users) {
            if (!u.password.startsWith('$argon2')) {
                const hash = await argon2.hash(u.password);
                await db.query('UPDATE users SET password = ? WHERE id = ?', [hash, u.id]);
                console.log('Upgraded password for user:', u.username);
                updated++;
            }
        }
        console.log('Finished upgrading', updated, 'users to Argon2 hashes.');
        process.exit(0);
    } catch (e) {
        console.error('Migration error:', e);
        process.exit(1);
    }
})();
