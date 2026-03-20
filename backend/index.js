const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(session({ secret: 'secret', resave: false, saveUninitialized: true }));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'hospital_user',
    password: 'hospital_pass',
    database: 'hospital'
});

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL');
    // Create tables
    db.query(`CREATE TABLE IF NOT EXISTS patients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    age INT
  )`, (err) => { if (err) console.log(err); });
    db.query(`CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255),
    password VARCHAR(255),
    role VARCHAR(50)
  )`, (err) => { if (err) console.log(err); });
    
    // Drop and recreate visits table to ensure notes column exists
    db.query(`DROP TABLE IF EXISTS visits`, (err) => { 
        if (err) console.log('Error dropping visits table:', err); 
    });
    
    db.query(`CREATE TABLE visits (
            id INT AUTO_INCREMENT PRIMARY KEY,
            patient_id INT,
            doctor_id INT,
            diagnosis TEXT,
            treatment TEXT,
            prescription TEXT,
            report VARCHAR(255),
            visit_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            progress ENUM('ongoing', 'completed') DEFAULT 'ongoing',
            notes TEXT,
            FOREIGN KEY (patient_id) REFERENCES patients(id),
            FOREIGN KEY (doctor_id) REFERENCES users(id)
        )`, (err) => { 
            if (err) console.log('Error creating visits table:', err); 
            else console.log('Visits table created successfully with notes column');
        });
    
    // Create patient_profiles table for extended patient information
    db.query(`CREATE TABLE IF NOT EXISTS patient_profiles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        email VARCHAR(255),
        phone VARCHAR(20),
        address TEXT,
        date_of_birth DATE,
        gender ENUM('male', 'female', 'other'),
        blood_group VARCHAR(5),
        emergency_contact VARCHAR(20),
        FOREIGN KEY (user_id) REFERENCES users(id)
    )`, (err) => { if (err) console.log(err); });
    
    // Create appointments table with approval status
    db.query(`DROP TABLE IF EXISTS appointments`, (err) => { 
        if (err) console.log('Error dropping appointments table:', err); 
    });
    
    db.query(`CREATE TABLE appointments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_id INT,
        doctor_id INT,
        appointment_date DATETIME,
        status ENUM('scheduled', 'completed', 'cancelled') DEFAULT 'scheduled',
        approval_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        reason TEXT,
        notes TEXT,
        approved_at DATETIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id),
        FOREIGN KEY (doctor_id) REFERENCES users(id)
    )`, (err) => { 
        if (err) console.log('Error creating appointments table:', err); 
        else console.log('Appointments table created successfully with approval system');
    });
    
    // Create notifications table
    db.query(`CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        title VARCHAR(255),
        message TEXT,
        type ENUM('appointment', 'visit', 'payment', 'general') DEFAULT 'general',
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )`, (err) => { 
        if (err) console.log('Error creating notifications table:', err); 
        else console.log('Notifications table created successfully');
    });
    
    db.query("INSERT IGNORE INTO users (username, password, role) VALUES ('patient1', 'pass1', 'patient'), ('doctor1', 'pass2', 'doctor'), ('admin1', 'pass3', 'hospital_admin')", (err) => { if (err) console.log(err); });
    
    // Create default patients for testing with proper names
    db.query("INSERT IGNORE INTO patients (id, name, age) VALUES (1, 'John Smith', 30), (2, 'Sarah Johnson', 25)", (err) => { 
        if (err) console.log(err); 
        else console.log('Default patients created: John Smith, Sarah Johnson');
    });
    
    // Create default patient profile if not exists
    db.query("INSERT IGNORE INTO patient_profiles (user_id, email, phone) SELECT id, CONCAT(username, '@example.com'), '0000000000' FROM users WHERE username='patient1'", (err) => { if (err) console.log(err); });
    
    // Seed demo appointments with different approval statuses (after visits are done)
    setTimeout(() => {
        seedDemoData();
    }, 2000);
});

// Function to seed demo data
function seedDemoData() {
    console.log('Seeding demo medical data...');
    
    // Get doctor1's ID
    db.query("SELECT id FROM users WHERE username='doctor1'", (err, doctorResult) => {
        if (err || doctorResult.length === 0) return;
        const doctorId = doctorResult[0].id;
        
        // Get patient IDs
        db.query("SELECT id, name FROM patients", (err, patientResult) => {
            if (err || patientResult.length === 0) return;
            
            const patient1Id = patientResult.find(p => p.name === 'John Smith')?.id || 1;
            const patient2Id = patientResult.find(p => p.name === 'Sarah Johnson')?.id || 2;
            
            // Demo visits data
            const demoVisits = [
                {
                    patient_id: patient1Id,
                    doctor_id: doctorId,
                    diagnosis: 'Seasonal Flu',
                    treatment: 'Rest and hydration',
                    prescription: 'Paracetamol 500mg, Vitamin C supplements',
                    report: 'flu_test_report.pdf',
                    progress: 'completed',
                    notes: 'Patient responded well to treatment. Follow-up in 1 week.',
                    visit_date: '2024-01-15 10:30:00'
                },
                {
                    patient_id: patient1Id,
                    doctor_id: doctorId,
                    diagnosis: 'Hypertension',
                    treatment: 'Lifestyle modifications and medication',
                    prescription: 'Amlodipine 5mg daily, Low sodium diet',
                    report: 'bp_monitoring_jan2024.pdf',
                    progress: 'ongoing',
                    notes: 'BP stabilized at 130/85. Continue medication. Regular exercise advised.',
                    visit_date: '2024-02-20 14:15:00'
                },
                {
                    patient_id: patient1Id,
                    doctor_id: doctorId,
                    diagnosis: 'Type 2 Diabetes',
                    treatment: 'Diet control, exercise, and insulin therapy',
                    prescription: 'Metformin 500mg twice daily, Insulin glargine at bedtime',
                    report: 'hba1c_feb2024.pdf',
                    progress: 'ongoing',
                    notes: 'HbA1c at 7.2%. Patient advised on carbohydrate counting and regular glucose monitoring.',
                    visit_date: '2024-03-10 09:00:00'
                },
                {
                    patient_id: patient2Id,
                    doctor_id: doctorId,
                    diagnosis: 'Acute Bronchitis',
                    treatment: 'Antibiotics and cough suppressants',
                    prescription: 'Azithromycin 250mg, Dextromethorphan syrup',
                    report: 'chest_xray_march2024.pdf',
                    progress: 'completed',
                    notes: 'Chest X-ray clear. Symptoms resolved. Full recovery expected.',
                    visit_date: '2024-01-25 11:45:00'
                },
                {
                    patient_id: patient2Id,
                    doctor_id: doctorId,
                    diagnosis: 'Migraine',
                    treatment: 'Pain management and trigger avoidance',
                    prescription: 'Sumatriptan 50mg as needed, Propranolol 40mg daily',
                    report: '',
                    progress: 'ongoing',
                    notes: 'Patient identified stress and lack of sleep as triggers. Advised on sleep hygiene.',
                    visit_date: '2024-02-28 16:30:00'
                },
                {
                    patient_id: patient2Id,
                    doctor_id: doctorId,
                    diagnosis: 'Vitamin D Deficiency',
                    treatment: 'Supplementation and sun exposure',
                    prescription: 'Cholecalciferol 60000 IU weekly for 8 weeks',
                    report: 'vitamin_d_levels.pdf',
                    progress: 'ongoing',
                    notes: 'Level improved from 12 to 28 ng/mL. Continue supplementation for 4 more weeks.',
                    visit_date: '2024-03-18 10:00:00'
                }
            ];
            
            // Insert demo visits
            let inserted = 0;
            demoVisits.forEach((visit, index) => {
                const query = `INSERT INTO visits (patient_id, doctor_id, diagnosis, treatment, prescription, report, progress, notes, visit_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                db.query(query, [
                    visit.patient_id,
                    visit.doctor_id,
                    visit.diagnosis,
                    visit.treatment,
                    visit.prescription,
                    visit.report,
                    visit.progress,
                    visit.notes,
                    visit.visit_date
                ], (err) => {
                    if (err) {
                        console.log(`Error inserting visit ${index + 1}:`, err.message);
                    } else {
                        inserted++;
                        console.log(`✓ Inserted: ${visit.diagnosis} for ${visit.patient_id === patient1Id ? 'John Smith' : 'Sarah Johnson'}`);
                        if (inserted === demoVisits.length) {
                            console.log('\n✅ Demo data seeding complete! ' + inserted + ' visits added.');
                            console.log('\n📊 Demo Data Summary:');
                            console.log('   - John Smith: 3 visits (Flu, Hypertension, Diabetes)');
                            console.log('   - Sarah Johnson: 3 visits (Bronchitis, Migraine, Vitamin D)');
                            console.log('   - Doctor: doctor1');
                            console.log('   - Date range: Jan 2024 - Mar 2024\n');
                        }
                    }
                });
            });
            
            // Seed demo appointments after visits are inserted
            setTimeout(() => {
                seedDemoAppointments(doctorId, patient1Id, patient2Id);
            }, 1000);
        });
    });
}

// Function to seed demo appointments
function seedDemoAppointments(doctorId, patient1Id, patient2Id) {
    console.log('Seeding demo appointments...');
    
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const twoDaysAgo = new Date(Date.now() - 86400000 * 2).toISOString().slice(0, 19).replace('T', ' ');
    const oneDayAgo = new Date(Date.now() - 86400000).toISOString().slice(0, 19).replace('T', ' ');
    
    const demoAppointments = [
        {
            patient_id: patient1Id,
            doctor_id: doctorId,
            appointment_date: '2024-03-25 10:00:00',
            status: 'scheduled',
            approval_status: 'pending',
            reason: 'Regular health checkup - need medical certificate for work',
            notes: '',
            created_at: now
        },
        {
            patient_id: patient2Id,
            doctor_id: doctorId,
            appointment_date: '2024-03-26 14:30:00',
            status: 'scheduled',
            approval_status: 'pending',
            reason: 'Persistent headache for past 3 days',
            notes: '',
            created_at: now
        },
        {
            patient_id: patient1Id,
            doctor_id: doctorId,
            appointment_date: '2024-03-22 11:00:00',
            status: 'scheduled',
            approval_status: 'approved',
            reason: 'Follow-up visit for hypertension',
            notes: 'Approved. Please bring BP monitoring records.',
            approved_at: '2024-03-20 09:00:00',
            created_at: twoDaysAgo
        },
        {
            patient_id: patient2Id,
            doctor_id: doctorId,
            appointment_date: '2024-03-23 15:00:00',
            status: 'scheduled',
            approval_status: 'rejected',
            reason: 'Need to reschedule due to conference',
            notes: 'Sorry, I have a medical conference on this date. Please book another slot.',
            created_at: oneDayAgo
        }
    ];
    
    let inserted = 0;
    demoAppointments.forEach((appt, index) => {
        const query = `INSERT INTO appointments (patient_id, doctor_id, appointment_date, status, approval_status, reason, notes, approved_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        db.query(query, [
            appt.patient_id,
            appt.doctor_id,
            appt.appointment_date,
            appt.status,
            appt.approval_status,
            appt.reason,
            appt.notes,
            appt.approved_at,
            appt.created_at
        ], (err) => {
            if (err) {
                console.log(`Error inserting appointment ${index + 1}:`, err.message);
            } else {
                inserted++;
                const status = appt.approval_status.charAt(0).toUpperCase() + appt.approval_status.slice(1);
                console.log(`✓ Inserted: ${status} appointment for ${appt.patient_id === patient1Id ? 'John Smith' : 'Sarah Johnson'}`);
                
                if (inserted === demoAppointments.length) {
                    console.log('\n✅ Demo appointments seeded!');
                    console.log('📊 Appointment Summary:');
                    console.log('   - ⏳ Pending: 2 (John Smith, Sarah Johnson)');
                    console.log('   - ✓ Approved: 1 (John Smith - Follow-up)');
                    console.log('   - ✗ Rejected: 1 (Sarah Johnson - Conference)');
                    console.log('');
                }
            }
        });
    });
}

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, results) => {
        if (err) return res.status(500).send(err);
        if (results.length > 0) {
            req.session.user = results[0];
            res.send({ success: true, user: results[0] });
        } else {
            res.send({ success: false });
        }
    });
});

// Patient Registration
app.post('/patient/register', (req, res) => {
    const { username, password, name, age, email, phone, address, date_of_birth, gender, blood_group, emergency_contact } = req.body;
    
    if (!username || !password || !name || !age) {
        return res.status(400).send('Missing required fields');
    }
    
    db.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, password, 'patient'], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') return res.status(409).send('Username already exists');
            return res.status(500).send(err);
        }
        
        const userId = result.insertId;
        
        // Create patient record
        db.query('INSERT INTO patients (name, age) VALUES (?, ?)', [name, age], (err) => {
            if (err) console.log('Error creating patient record:', err);
        });
        
        // Create patient profile
        db.query('INSERT INTO patient_profiles (user_id, email, phone, address, date_of_birth, gender, blood_group, emergency_contact) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 
            [userId, email || '', phone || '', address || '', date_of_birth || null, gender || null, blood_group || null, emergency_contact || null], 
            (err) => {
                if (err) console.log('Error creating profile:', err);
            }
        );
        
        res.send({ success: true, message: 'Registration successful' });
    });
});

// Get Patient Profile
app.get('/patient/profile', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'patient') {
        return res.status(403).send('Forbidden');
    }
    
    db.query('SELECT * FROM patient_profiles WHERE user_id = ?', [req.session.user.id], (err, results) => {
        if (err) return res.status(500).send(err);
        if (results.length === 0) return res.status(404).send('Profile not found');
        res.send(results[0]);
    });
});

// Update Patient Profile
app.put('/patient/profile', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'patient') {
        return res.status(403).send('Forbidden');
    }
    
    const { email, phone, address, date_of_birth, gender, blood_group, emergency_contact } = req.body;
    
    db.query('UPDATE patient_profiles SET email = ?, phone = ?, address = ?, date_of_birth = ?, gender = ?, blood_group = ?, emergency_contact = ? WHERE user_id = ?',
        [email, phone, address, date_of_birth, gender, blood_group, emergency_contact, req.session.user.id],
        (err) => {
            if (err) return res.status(500).send(err);
            res.send({ success: true, message: 'Profile updated successfully' });
        }
    );
});

app.get('/patients', (req, res) => {
    if (!req.session.user) return res.status(401).send('Not logged in');
    if (req.session.user.role === 'patient') {
        // Fetch visits for the logged-in patient by joining with users table
        db.query(`SELECT v.*, p.name as patient_name 
                  FROM visits v 
                  JOIN patients p ON v.patient_id = p.id 
                  WHERE p.name = ? 
                  ORDER BY v.visit_date DESC`, 
            [req.session.user.username], 
            (err, results) => {
                if (err) return res.status(500).send(err);
                res.send(results);
            }
        );
    } else if (req.session.user.role === 'doctor' || req.session.user.role === 'hospital_admin') {
        db.query('SELECT * FROM patients', (err, results) => {
            if (err) return res.status(500).send(err);
            res.send(results);
        });
    }
});

// Get Patient's Complete Medical History
app.get('/patient/medical-history', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'patient') {
        return res.status(403).send('Forbidden');
    }
    
    db.query(`SELECT v.*, p.name as patient_name, u.username as doctor_name 
              FROM visits v 
              JOIN patients p ON v.patient_id = p.id 
              JOIN users u ON v.doctor_id = u.id 
              WHERE p.name = ? 
              ORDER BY v.visit_date DESC`, 
        [req.session.user.username], 
        (err, results) => {
            if (err) return res.status(500).send(err);
            res.send(results);
        }
    );
});

// Get Patient Dashboard Stats
app.get('/patient/dashboard', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'patient') {
        return res.status(403).send('Forbidden');
    }
    
    // Get total visits
    db.query('SELECT COUNT(*) as totalVisits FROM visits v JOIN patients p ON v.patient_id = p.id WHERE p.name = ?', [req.session.user.username], (err, visitCount) => {
        if (err) return res.status(500).send(err);
        
        // Get ongoing treatments
        db.query('SELECT COUNT(*) as ongoingTreatments FROM visits v JOIN patients p ON v.patient_id = p.id WHERE p.name = ? AND v.progress = ?', [req.session.user.username, 'ongoing'], (err, ongoingCount) => {
            if (err) return res.status(500).send(err);
            
            // Get recent visits (last 5)
            db.query(`SELECT v.*, u.username as doctor_name 
                      FROM visits v 
                      JOIN patients p ON v.patient_id = p.id 
                      JOIN users u ON v.doctor_id = u.id 
                      WHERE p.name = ? 
                      ORDER BY v.visit_date DESC LIMIT 5`, 
                [req.session.user.username], 
                (err, recentVisits) => {
                    if (err) return res.status(500).send(err);
                    
                    // Get latest prescription
                    db.query(`SELECT v.prescription, v.visit_date 
                              FROM visits v 
                              JOIN patients p ON v.patient_id = p.id 
                              WHERE p.name = ? AND v.prescription IS NOT NULL AND v.prescription != '' 
                              ORDER BY v.visit_date DESC LIMIT 1`, 
                        [req.session.user.username], 
                        (err, latestPrescription) => {
                            if (err) return res.status(500).send(err);
                            
                            res.send({
                                totalVisits: visitCount[0].totalVisits,
                                ongoingTreatments: ongoingCount[0].ongoingTreatments,
                                recentVisits: recentVisits,
                                latestPrescription: latestPrescription[0] || null
                            });
                        }
                    );
                }
            );
        });
    });
});

// Download Report (Get report file path/URL)
app.get('/patient/reports', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'patient') {
        return res.status(403).send('Forbidden');
    }
    
    db.query(`SELECT v.id, v.visit_date, v.report, v.diagnosis, u.username as doctor_name 
              FROM visits v 
              JOIN patients p ON v.patient_id = p.id 
              JOIN users u ON v.doctor_id = u.id 
              WHERE p.name = ? AND v.report IS NOT NULL AND v.report != '' 
              ORDER BY v.visit_date DESC`, 
        [req.session.user.username], 
        (err, results) => {
            if (err) return res.status(500).send(err);
            res.send(results);
        }
    );
});

app.get('/patients/:id', (req, res) => {
    if (!req.session.user || (req.session.user.role !== 'doctor' && req.session.user.role !== 'hospital_admin')) {
        return res.status(403).send('Forbidden');
    }
    const patientId = req.params.id;
    db.query('SELECT * FROM patients WHERE id = ?', [patientId], (err, patientResults) => {
        if (err) return res.status(500).send(err);
        if (patientResults.length === 0) return res.status(404).send('Patient not found');
        db.query('SELECT visits.*, users.username as doctor_name FROM visits JOIN users ON visits.doctor_id = users.id WHERE visits.patient_id = ?', [patientId], (err, visitResults) => {
            if (err) return res.status(500).send(err);
            res.send({ patient: patientResults[0], visits: visitResults });
        });
    });
});

app.get('/patients/search', (req, res) => {
    if (!req.session.user || (req.session.user.role !== 'doctor' && req.session.user.role !== 'hospital_admin')) {
        return res.status(403).send('Forbidden');
    }
    const { query } = req.query;
    if (!query) return res.status(400).send('Missing search query');
    db.query('SELECT * FROM patients WHERE name LIKE ? OR id = ?', [`%${query}%`, query], (err, results) => {
        if (err) return res.status(500).send(err);
        res.send(results);
    });
});

app.post('/visits', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'doctor') {
        return res.status(403).send('Forbidden: Only doctors can add visits');
    }
    
    const { patient_id, diagnosis, treatment, prescription, report, progress, notes } = req.body;
    
    // Validate required fields
    if (!patient_id || !diagnosis || !treatment) {
        return res.status(400).send('Missing required fields: patient_id, diagnosis, and treatment are required');
    }
    
    db.query('INSERT INTO visits (patient_id, doctor_id, diagnosis, treatment, prescription, report, progress, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 
        [patient_id, req.session.user.id, diagnosis, treatment, prescription || '', report || '', progress || 'ongoing', notes || ''], 
        (err) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).send('Error saving visit: ' + err.message);
            }
            res.send({ success: true, message: 'Visit added successfully' });
        }
    );
});

app.post('/admin/add-doctor', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'hospital_admin') return res.status(403).send('Forbidden');
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).send('Missing username or password');
    db.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, password, 'doctor'], (err) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') return res.status(409).send('Username already exists');
            return res.status(500).send(err);
        }
        res.send({ success: true });
    });
});

app.get('/admin/doctors', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'hospital_admin') return res.status(403).send('Forbidden');
    db.query('SELECT id, username FROM users WHERE role = ?', ['doctor'], (err, results) => {
        if (err) return res.status(500).send(err);
        res.send(results);
    });
});

app.delete('/admin/remove-doctor/:id', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'hospital_admin') return res.status(403).send('Forbidden');
    const doctorId = req.params.id;
    db.query('DELETE FROM users WHERE id = ? AND role = ?', [doctorId, 'doctor'], (err, result) => {
        if (err) return res.status(500).send(err);
        if (result.affectedRows === 0) return res.status(404).send('Doctor not found');
        res.send({ success: true });
    });
});

app.get('/dashboard', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'doctor') return res.status(403).send('Forbidden');
    const doctorId = req.session.user.id;
    db.query('SELECT COUNT(DISTINCT patient_id) as totalPatients FROM visits WHERE doctor_id = ?', [doctorId], (err, patientRes) => {
        if (err) return res.status(500).send(err);
        db.query('SELECT COUNT(*) as totalVisits FROM visits WHERE doctor_id = ?', [doctorId], (err, visitRes) => {
            if (err) return res.status(500).send(err);
            db.query('SELECT visits.*, patients.name as patient_name FROM visits JOIN patients ON visits.patient_id = patients.id WHERE visits.doctor_id = ? ORDER BY visit_date DESC LIMIT 5', [doctorId], (err, recentRes) => {
                if (err) return res.status(500).send(err);
                db.query('SELECT diagnosis, COUNT(*) as count FROM visits WHERE doctor_id = ? GROUP BY diagnosis ORDER BY count DESC LIMIT 3', [doctorId], (err, diagRes) => {
                    if (err) return res.status(500).send(err);
                    res.send({
                        totalPatients: patientRes[0].totalPatients,
                        totalVisits: visitRes[0].totalVisits,
                        recentVisits: recentRes,
                        commonDiagnoses: diagRes
                    });
                });
            });
        });
    });
});

app.get('/admin/analytics', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'hospital_admin') return res.status(403).send('Forbidden');
    db.query('SELECT diagnosis, COUNT(*) as count FROM visits GROUP BY diagnosis ORDER BY count DESC LIMIT 10', (err, diseaseTrends) => {
        if (err) return res.status(500).send(err);
        db.query('SELECT DATE(visit_date) as date, COUNT(DISTINCT patient_id) as newPatients FROM visits GROUP BY DATE(visit_date) ORDER BY date', (err, patientGrowth) => {
            if (err) return res.status(500).send(err);
            db.query('SELECT COUNT(*) as totalVisits, COUNT(DISTINCT patient_id) as totalPatients, COUNT(DISTINCT doctor_id) as totalDoctors FROM visits', (err, performance) => {
                if (err) return res.status(500).send(err);
                res.send({
                    diseaseTrends,
                    patientGrowth,
                    performance: performance[0]
                });
            });
        });
    });
});

app.get('/admin/patients', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'hospital_admin') return res.status(403).send('Forbidden');
    db.query('SELECT id, username, role FROM users WHERE role = ?', ['patient'], (err, results) => {
        if (err) return res.status(500).send(err);
        res.send(results);
    });
});

app.delete('/admin/remove-patient/:id', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'hospital_admin') return res.status(403).send('Forbidden');
    const patientId = req.params.id;
    db.query('DELETE FROM users WHERE id = ? AND role = ?', [patientId, 'patient'], (err, result) => {
        if (err) return res.status(500).send(err);
        if (result.affectedRows === 0) return res.status(404).send('Patient not found');
        res.send({ success: true });
    });
});

app.post('/admin/reset-patient-password', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'hospital_admin') return res.status(403).send('Forbidden');
    const { id, newPassword } = req.body;
    if (!id || !newPassword) return res.status(400).send('Missing id or newPassword');
    db.query('UPDATE users SET password = ? WHERE id = ? AND role = ?', [newPassword, id, 'patient'], (err, result) => {
        if (err) return res.status(500).send(err);
        if (result.affectedRows === 0) return res.status(404).send('Patient not found');
        res.send({ success: true });
    });
});

app.post('/admin/assign-role', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'hospital_admin') return res.status(403).send('Forbidden');
    const { id, role } = req.body;
    if (!id || !role) return res.status(400).send('Missing id or role');
    if (!['doctor', 'patient', 'hospital_admin'].includes(role)) return res.status(400).send('Invalid role');
    db.query('UPDATE users SET role = ? WHERE id = ?', [role, id], (err, result) => {
        if (err) return res.status(500).send(err);
        if (result.affectedRows === 0) return res.status(404).send('User not found');
        res.send({ success: true });
    });
});

// ==================== APPOINTMENT ENDPOINTS ====================

// Book an appointment (Patient)
app.post('/appointments/book', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'patient') {
        return res.status(403).send('Forbidden: Only patients can book appointments');
    }
    
    const { doctor_id, appointment_date, reason } = req.body;
    
    if (!doctor_id || !appointment_date) {
        return res.status(400).send('Missing required fields: doctor_id and appointment_date');
    }
    
    // Get patient_id from patients table
    db.query('SELECT id FROM patients WHERE name = ?', [req.session.user.username], (err, patientResult) => {
        if (err) return res.status(500).send(err);
        if (patientResult.length === 0) return res.status(404).send('Patient record not found');
        
        const patientId = patientResult[0].id;
        
        db.query('INSERT INTO appointments (patient_id, doctor_id, appointment_date, reason, approval_status) VALUES (?, ?, ?, ?, ?)', 
            [patientId, doctor_id, appointment_date, reason || '', 'pending'], 
            (err, result) => {
                if (err) return res.status(500).send(err);
                
                // Create notification for doctor
                const notificationQuery = 'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)';
                db.query(notificationQuery, [
                    doctor_id,
                    'New Appointment Request',
                    `Patient ${req.session.user.username} has booked an appointment for ${new Date(appointment_date).toLocaleString()}`,
                    'appointment'
                ]);
                
                res.send({ success: true, appointment_id: result.insertId });
            }
        );
    });
});

// Get patient's appointments
app.get('/appointments/my-appointments', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'patient') {
        return res.status(403).send('Forbidden');
    }
    
    db.query('SELECT id FROM patients WHERE name = ?', [req.session.user.username], (err, patientResult) => {
        if (err) return res.status(500).send(err);
        if (patientResult.length === 0) return res.status(404).send('Patient not found');
        
        const patientId = patientResult[0].id;
        
        db.query(`SELECT a.*, u.username as doctor_name 
                  FROM appointments a 
                  JOIN users u ON a.doctor_id = u.id 
                  WHERE a.patient_id = ? 
                  ORDER BY a.appointment_date DESC`, 
            [patientId], 
            (err, results) => {
                if (err) return res.status(500).send(err);
                res.send(results);
            }
        );
    });
});

// Get doctor's appointments
app.get('/appointments/doctor-schedule', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'doctor') {
        return res.status(403).send('Forbidden');
    }
    
    db.query(`SELECT a.*, p.name as patient_name 
              FROM appointments a 
              JOIN patients p ON a.patient_id = p.id 
              WHERE a.doctor_id = ? 
              ORDER BY a.appointment_date ASC`, 
        [req.session.user.id], 
        (err, results) => {
            if (err) return res.status(500).send(err);
            res.send(results);
        }
    );
});

// Update appointment status (Doctor)
app.put('/appointments/:id/status', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'doctor') {
        return res.status(403).send('Forbidden');
    }
    
    const { status } = req.body; // 'scheduled', 'completed', 'cancelled'
    const appointmentId = req.params.id;
    
    if (!status || !['scheduled', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).send('Invalid status');
    }
    
    db.query('UPDATE appointments SET status = ? WHERE id = ?', [status, appointmentId], (err) => {
        if (err) return res.status(500).send(err);
        
        // Notify patient about status change
        db.query('SELECT patient_id FROM appointments WHERE id = ?', [appointmentId], (err, result) => {
            if (err || result.length === 0) return;
            
            const patientId = result[0].patient_id;
            db.query('SELECT name FROM patients WHERE id = ?', [patientId], (err, patientResult) => {
                if (err || patientResult.length === 0) return;
                
                const patientName = patientResult[0].name;
                db.query('INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)', [
                    patientId,
                    'Appointment Status Updated',
                    `Your appointment has been ${status}`,
                    'appointment'
                ]);
            });
        });
        
        res.send({ success: true });
    });
});

// Cancel appointment (Patient)
app.delete('/appointments/:id/cancel', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'patient') {
        return res.status(403).send('Forbidden');
    }
    
    const appointmentId = req.params.id;
    
    db.query('DELETE FROM appointments WHERE id = ?', [appointmentId], (err) => {
        if (err) return res.status(500).send(err);
        res.send({ success: true });
    });
});

// Get available doctors for appointment
app.get('/appointments/available-doctors', (req, res) => {
    if (!req.session.user) {
        return res.status(401).send('Not authenticated');
    }
    
    db.query('SELECT id, username FROM users WHERE role = ?', ['doctor'], (err, results) => {
        if (err) return res.status(500).send(err);
        res.send(results);
    });
});

// ==================== APPOINTMENT APPROVAL ENDPOINTS ====================

// Approve appointment (Doctor)
app.put('/appointments/:id/approve', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'doctor') {
        return res.status(403).send('Forbidden: Only doctors can approve appointments');
    }
    
    const appointmentId = req.params.id;
    const { notes } = req.body; // Optional doctor notes
    
    db.query('UPDATE appointments SET approval_status = ?, approved_at = NOW(), notes = ? WHERE id = ?', 
        ['approved', notes || '', appointmentId], 
        (err) => {
            if (err) return res.status(500).send(err);
            
            // Notify patient about approval
            db.query('SELECT patient_id FROM appointments WHERE id = ?', [appointmentId], (err, result) => {
                if (err || result.length === 0) return;
                
                const patientId = result[0].patient_id;
                db.query('SELECT name FROM patients WHERE id = ?', [patientId], (err, patientResult) => {
                    if (err || patientResult.length === 0) return;
                    
                    const patientName = patientResult[0].name;
                    db.query('INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)', [
                        patientId,
                        'Appointment Approved ✓',
                        `Your appointment has been approved by the doctor. ${notes ? 'Note: ' + notes : ''}`,
                        'appointment'
                    ]);
                });
            });
            
            res.send({ success: true, message: 'Appointment approved successfully' });
        }
    );
});

// Reject appointment (Doctor)
app.put('/appointments/:id/reject', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'doctor') {
        return res.status(403).send('Forbidden: Only doctors can reject appointments');
    }
    
    const appointmentId = req.params.id;
    const { reason } = req.body; // Reason for rejection
    
    if (!reason) {
        return res.status(400).send('Rejection reason is required');
    }
    
    db.query('UPDATE appointments SET approval_status = ?, notes = ? WHERE id = ?', 
        ['rejected', reason, appointmentId], 
        (err) => {
            if (err) return res.status(500).send(err);
            
            // Notify patient about rejection
            db.query('SELECT patient_id FROM appointments WHERE id = ?', [appointmentId], (err, result) => {
                if (err || result.length === 0) return;
                
                const patientId = result[0].patient_id;
                db.query('SELECT name FROM patients WHERE id = ?', [patientId], (err, patientResult) => {
                    if (err || patientResult.length === 0) return;
                    
                    const patientName = patientResult[0].name;
                    db.query('INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)', [
                        patientId,
                        'Appointment Rejected ✗',
                        `Your appointment request was rejected. Reason: ${reason}`,
                        'appointment'
                    ]);
                });
            });
            
            res.send({ success: true, message: 'Appointment rejected' });
        }
    );
});

// Get pending appointments for doctor (to approve/reject)
app.get('/appointments/pending-approvals', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'doctor') {
        return res.status(403).send('Forbidden');
    }
    
    db.query(`SELECT a.*, p.name as patient_name, p.age as patient_age
              FROM appointments a 
              JOIN patients p ON a.patient_id = p.id 
              WHERE a.doctor_id = ? AND a.approval_status = 'pending'
              ORDER BY a.created_at ASC`, 
        [req.session.user.id], 
        (err, results) => {
            if (err) return res.status(500).send(err);
            res.send(results);
        }
    );
});

// Get all appointments with approval status for doctor
app.get('/appointments/doctor-all', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'doctor') {
        return res.status(403).send('Forbidden');
    }
    
    const { filter } = req.query; // 'all', 'pending', 'approved', 'rejected'
    
    let query = `SELECT a.*, p.name as patient_name, p.age as patient_age 
                 FROM appointments a 
                 JOIN patients p ON a.patient_id = p.id 
                 WHERE a.doctor_id = ?`;
    
    if (filter && filter !== 'all') {
        query += ` AND a.approval_status = ?`;
        db.query(query, [req.session.user.id, filter], (err, results) => {
            if (err) return res.status(500).send(err);
            res.send(results);
        });
    } else {
        db.query(query + ' ORDER BY a.approval_status DESC, a.appointment_date ASC', 
            [req.session.user.id], 
            (err, results) => {
                if (err) return res.status(500).send(err);
                res.send(results);
            }
        );
    }
});

// Reschedule appointment (Patient - after rejection)
app.put('/appointments/:id/reschedule', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'patient') {
        return res.status(403).send('Forbidden');
    }
    
    const { appointment_date, reason } = req.body;
    const appointmentId = req.params.id;
    
    if (!appointment_date) {
        return res.status(400).send('New date/time is required');
    }
    
    db.query('UPDATE appointments SET appointment_date = ?, approval_status = ?, reason = ? WHERE id = ?', 
        [appointment_date, 'pending', reason || 'Rescheduling requested', appointmentId], 
        (err) => {
            if (err) return res.status(500).send(err);
            
            // Notify doctor about reschedule request
            db.query('SELECT doctor_id FROM appointments WHERE id = ?', [appointmentId], (err, result) => {
                if (err || result.length === 0) return;
                
                const doctorId = result[0].doctor_id;
                db.query('INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)', [
                    doctorId,
                    'Appointment Reschedule Request',
                    'Patient has requested to reschedule the appointment',
                    'appointment'
                ]);
            });
            
            res.send({ success: true, message: 'Reschedule request sent' });
        }
    );
});

// ==================== NOTIFICATION ENDPOINTS ====================

// Get user notifications
app.get('/notifications', (req, res) => {
    if (!req.session.user) {
        return res.status(401).send('Not authenticated');
    }
    
    db.query('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50', 
        [req.session.user.id], 
        (err, results) => {
            if (err) return res.status(500).send(err);
            res.send(results);
        }
    );
});

// Mark notification as read
app.put('/notifications/:id/read', (req, res) => {
    if (!req.session.user) {
        return res.status(401).send('Not authenticated');
    }
    
    const notificationId = req.params.id;
    
    db.query('UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?', 
        [notificationId, req.session.user.id], 
        (err) => {
            if (err) return res.status(500).send(err);
            res.send({ success: true });
        }
    );
});

// Mark all notifications as read
app.put('/notifications/read-all', (req, res) => {
    if (!req.session.user) {
        return res.status(401).send('Not authenticated');
    }
    
    db.query('UPDATE notifications SET is_read = TRUE WHERE user_id = ?', 
        [req.session.user.id], 
        (err) => {
            if (err) return res.status(500).send(err);
            res.send({ success: true });
        }
    );
});

// Get unread notification count
app.get('/notifications/unread-count', (req, res) => {
    if (!req.session.user) {
        return res.status(401).send('Not authenticated');
    }
    
    db.query('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE', 
        [req.session.user.id], 
        (err, results) => {
            if (err) return res.status(500).send(err);
            res.send(results[0]);
        }
    );
});

// Delete notification
app.delete('/notifications/:id', (req, res) => {
    if (!req.session.user) {
        return res.status(401).send('Not authenticated');
    }
    
    const notificationId = req.params.id;
    
    db.query('DELETE FROM notifications WHERE id = ? AND user_id = ?', 
        [notificationId, req.session.user.id], 
        (err) => {
            if (err) return res.status(500).send(err);
            res.send({ success: true });
        }
    );
});

// ==================== ADMIN ENDPOINTS ====================

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
