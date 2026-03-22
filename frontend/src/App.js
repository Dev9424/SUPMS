import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';
import './App.css';

import PatientRegistration from './PatientRegistration';
import PatientDashboard from './PatientDashboard';
import DoctorAppointments from './DoctorAppointments';
import LandingPage from './LandingPage';

axios.defaults.withCredentials = true;

function PatientProfile({ patientId, onBack }) {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    React.useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get(`/patients/${patientId}`);
                setProfile(res.data);
            } catch (err) {
                setProfile(null);
            }
            setLoading(false);
        };
        fetchProfile();
    }, [patientId]);
    if (loading) return <div>Loading...</div>;
    if (!profile) return <div>Profile not found.</div>;
    return (
        <div className="patient-profile">
            <button onClick={onBack}>&larr; Back</button>
            <h2>Patient Profile</h2>
            <div><strong>Name:</strong> {profile.patient.name}</div>
            <div><strong>Age:</strong> {profile.patient.age}</div>
            <h3>Visit History</h3>
            {profile.visits.length === 0 ? (
                <p>No visits yet.</p>
            ) : (
                <ul>
                    {profile.visits.map(v => (
                        <li key={v.id}>
                            <strong>Date:</strong> {new Date(v.visit_date).toLocaleDateString()} | <strong>Doctor:</strong> {v.doctor_name} | <strong>Diagnosis:</strong> {v.diagnosis} | <strong>Treatment:</strong> {v.treatment}
                            {v.prescription && <span> | <strong>Prescription:</strong> {v.prescription}</span>}
                            {v.report && <span> | <strong>Report:</strong> {v.report}</span>}
                            | <strong>Progress:</strong> {v.progress}
                            {v.notes && <span> | <strong>Notes:</strong> {v.notes}</span>}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

function App() {
    const [user, setUser] = useState(null);
    const [patients, setPatients] = useState([]);
    const [visits, setVisits] = useState([]);
    const [showRegistration, setShowRegistration] = useState(false);
    const [showLanding, setShowLanding] = useState(true);
    const [checkingSession, setCheckingSession] = useState(true);

    useEffect(() => {
        const checkSession = async () => {
            try {
                const res = await axios.get('/me');
                if (res.data.success) {
                    setUser(res.data.user);
                    setShowLanding(false);
                    fetchData(res.data.user);
                }
            } catch (err) { }
            setCheckingSession(false);
        };
        checkSession();
    }, []);

    const handleLogin = async (username, password) => {
        try {
            const res = await axios.post('/login', { username, password });
            if (res.data.success) {
                setUser(res.data.user);
                fetchData(res.data.user);
            } else {
                alert('Invalid credentials');
            }
        } catch (err) {
            alert('Error');
        }
    };

    const fetchData = async (user) => {
        try {
            const res = await axios.get('/patients');
            if (user.role === 'patient') {
                setVisits(res.data);
            } else {
                setPatients(res.data);
            }
        } catch (err) {
            alert('Error fetching data');
        }
    };

    const addVisit = async (patient_id, diagnosis, treatment, prescription, report, progress, notes) => {
        try {
            // Ensure patient_id is a number
            const numericPatientId = parseInt(patient_id, 10);
            if (isNaN(numericPatientId)) {
                alert('Please select a valid patient');
                return;
            }

            const response = await axios.post('/visits', {
                patient_id: numericPatientId,
                diagnosis,
                treatment,
                prescription,
                report,
                progress,
                notes
            });
            if (response.data.success) {
                alert('Visit added successfully!');
            }
        } catch (err) {
            console.error('Error adding visit:', err);
            const errorMessage = err.response?.data || err.message || 'Error adding visit';
            alert(errorMessage);
        }
    };

    const logout = () => {
        setUser(null);
        setPatients([]);
        setVisits([]);
    };

    const handleLogout = async () => {
        try { await axios.post('/logout'); } catch (err) { }
        logout();
        setShowLanding(true);
    };

    if (checkingSession) return <div>Loading session...</div>;

    return (
        <div className="App">
            {showLanding && !user ? (
                <LandingPage onGetStarted={() => setShowLanding(false)} />
            ) : !user ? (
                showRegistration ? (
                    <PatientRegistration
                        onRegister={() => setShowRegistration(false)}
                        onBackToLogin={() => setShowRegistration(false)}
                    />
                ) : (
                    <Login
                        onLogin={handleLogin}
                        onShowRegistration={() => setShowRegistration(true)}
                    />
                )
            ) : (
                user.role === 'patient' ? (
                    <PatientDashboard
                        user={user}
                        onLogout={handleLogout}
                    />
                ) : (
                    <Dashboard
                        user={user}
                        patients={patients}
                        visits={visits}
                        onAddVisit={addVisit}
                        onLogout={handleLogout}
                    />
                )
            )}
        </div>
    );
}

function Login({ onLogin, onShowRegistration }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const submit = (e) => {
        e.preventDefault();
        onLogin(username, password);
    };

    return (
        <div className="login-container">
            <h1>Secure Unified Patient Medical History &amp; Hospital Visit Analytics System</h1>
            <form onSubmit={submit} className="login-form">
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Login</button>
            </form>
            <p className="registration-link">
                Don't have an account?{' '}
                <button onClick={onShowRegistration} className="link-btn">
                    Register as Patient
                </button>
            </p>
        </div>
    );
}

function Dashboard({ user, patients, visits, onAddVisit, onLogout }) {
    const [patientId, setPatientId] = useState('');
    const [diagnosis, setDiagnosis] = useState('');
    const [treatment, setTreatment] = useState('');
    const [prescription, setPrescription] = useState('');
    const [report, setReport] = useState('');
    const [progress, setProgress] = useState('ongoing');
    const [notes, setNotes] = useState('');
    const [search, setSearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [profileId, setProfileId] = useState(null);
    const [dashboardStats, setDashboardStats] = useState(null);
    const [analytics, setAnalytics] = useState(null);

    React.useEffect(() => {
        if (user && user.role === 'doctor') {
            const fetchStats = async () => {
                try {
                    const res = await axios.get('/dashboard');
                    setDashboardStats(res.data);
                } catch (err) {
                    console.log('Error fetching dashboard stats');
                }
            };
            fetchStats();
        }
        if (user && user.role === 'hospital_admin') {
            const fetchAnalytics = async () => {
                try {
                    const res = await axios.get('/admin/analytics');
                    setAnalytics(res.data);
                } catch (err) {
                    console.log('Error fetching analytics');
                }
            };
            fetchAnalytics();
        }
    }, [user]);

    const submitVisit = (e) => {
        e.preventDefault();
        onAddVisit(patientId, diagnosis, treatment, prescription, report, progress, notes);
        setPatientId('');
        setDiagnosis('');
        setTreatment('');
        setPrescription('');
        setReport('');
        setProgress('ongoing');
        setNotes('');
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!search) return;
        setSearching(true);
        try {
            const res = await axios.get(`/patients/search?query=${encodeURIComponent(search)}`);
            setSearchResults(res.data);
        } catch (err) {
            alert('Error searching patients');
        }
        setSearching(false);
    };

    if (profileId) {
        return <PatientProfile patientId={profileId}
            onBack={
                () => setProfileId(null)
            }
        />;
    }

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <h1>Welcome {user.username} ({user.role})</h1>
                <button onClick={onLogout} className="logout-btn">Logout</button>
            </header>
            {user.role === 'patient' && (
                <div className="patient-section">
                    <h2>Your Medical Visits</h2>
                    {visits.length === 0 ? (
                        <p>No visits yet.</p>
                    ) : (
                        visits.map(v => (
                            <div key={v.id} className="visit-card">
                                <strong>Diagnosis:</strong> {v.diagnosis}
                                <strong>Treatment:</strong> {v.treatment}
                            </div>
                        ))
                    )}
                </div>
            )}
            {(user.role === 'doctor' || user.role === 'hospital_admin') && (
                <div className="admin-section">
                    {user.role === 'doctor' && (
                        <>
                            <DoctorAppointments user={user} />
                            <hr style={{ margin: '30px 0', border: 'none', borderTop: '2px solid #e0e0e0' }} />
                        </>
                    )}

                    {user.role === 'doctor' && dashboardStats && (
                        <div className="dashboard-stats">
                            <h2>Dashboard</h2>
                            <p><strong>Total Patients:</strong> {dashboardStats.totalPatients}</p>
                            <p><strong>Total Visits:</strong> {dashboardStats.totalVisits}</p>
                            <h3>Recent Visits</h3>
                            <ul>
                                {dashboardStats.recentVisits.map(v => (
                                    <li key={v.id}>{v.patient_name} - {v.diagnosis} ({new Date(v.visit_date).toLocaleDateString()})</li>
                                ))}
                            </ul>
                            <h3>Common Diagnoses</h3>
                            <ul>
                                {dashboardStats.commonDiagnoses.map(d => (
                                    <li key={d.diagnosis}>{d.diagnosis} ({d.count})</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {user.role === 'hospital_admin' && analytics && (
                        <div className="analytics">
                            <h2>Analytics Dashboard</h2>
                            <div className="chart-container">
                                <h3>Disease Trends</h3>
                                <BarChart width={600} height={300} data={analytics.diseaseTrends}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="diagnosis" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="count" fill="#8884d8" />
                                </BarChart>
                            </div>
                            <div className="chart-container">
                                <h3>Patient Growth Over Time</h3>
                                <LineChart width={600} height={300} data={analytics.patientGrowth}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="newPatients" stroke="#82ca9d" />
                                </LineChart>
                            </div>
                            <div className="performance-stats">
                                <h3>Hospital Performance</h3>
                                <p>Total Visits: {analytics.performance.totalVisits}</p>
                                <p>Total Patients: {analytics.performance.totalPatients}</p>
                                <p>Total Doctors: {analytics.performance.totalDoctors}</p>
                            </div>
                        </div>
                    )}
                    <h2>Patients</h2>
                    <form onSubmit={handleSearch} className="search-form" style={{ marginBottom: 16 }}>
                        <input
                            type="text"
                            placeholder="Search by name or ID"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                        <button type="submit" disabled={searching}>
                            {searching ? 'Searching...' : 'Search'}
                        </button>
                    </form>
                    {searchResults.length > 0 && (
                        <div className="search-results">
                            <h3>Search Results</h3>
                            {searchResults.map(p => (
                                <div
                                    key={p.id}
                                    className="patient-card"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => setProfileId(p.id)}
                                >
                                    {p.name} - Age: {p.age}
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="patients-list">
                        {patients.map(p => (
                            <div
                                key={p.id}
                                className="patient-card"
                                style={{ cursor: 'pointer' }}
                                onClick={() => setProfileId(p.id)}
                            >
                                {p.name} - Age: {p.age}
                            </div>
                        ))}
                    </div>
                    {user.role === 'doctor' && (
                        <div className="add-visit">
                            <h2>Add Visit</h2>
                            <form onSubmit={submitVisit} className="visit-form">
                                <select
                                    value={patientId}
                                    onChange={e => setPatientId(e.target.value)}
                                    required
                                >
                                    <option value="">Select Patient</option>
                                    {patients.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                                <input
                                    type="text"
                                    placeholder="Diagnosis"
                                    value={diagnosis}
                                    onChange={e => setDiagnosis(e.target.value)}
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Treatment"
                                    value={treatment}
                                    onChange={e => setTreatment(e.target.value)}
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Prescription"
                                    value={prescription}
                                    onChange={e => setPrescription(e.target.value)}
                                />
                                <input
                                    type="text"
                                    placeholder="Report (URL or file name)"
                                    value={report}
                                    onChange={e => setReport(e.target.value)}
                                />
                                <select
                                    value={progress}
                                    onChange={e => setProgress(e.target.value)}
                                >
                                    <option value="ongoing">Ongoing</option>
                                    <option value="completed">Completed</option>
                                </select>
                                <textarea
                                    placeholder="Internal notes or comments"
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                    rows="3"
                                />
                                <button type="submit">Add Visit</button>
                            </form>
                        </div>
                    )}
                </div>
            )}
        </div>
    );

}

export default App;