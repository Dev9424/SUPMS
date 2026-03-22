import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AppointmentBooking from './AppointmentBooking';
import Notifications from './Notifications';

function PatientDashboard({ user, onLogout }) {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [profile, setProfile] = useState(null);
    const [medicalHistory, setMedicalHistory] = useState([]);
    const [reports, setReports] = useState([]);
    const [dashboardStats, setDashboardStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [profileData, setProfileData] = useState({
        email: '',
        phone: '',
        address: '',
        date_of_birth: '',
        gender: 'male',
        blood_group: '',
        emergency_contact: ''
    });

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async() => {
        setLoading(true);
        try {
            // Fetch dashboard stats
            const dashRes = await axios.get('/patient/dashboard');
            setDashboardStats(dashRes.data);

            // Fetch medical history
            const historyRes = await axios.get('/patient/medical-history');
            setMedicalHistory(historyRes.data);

            // Fetch reports
            const reportsRes = await axios.get('/patient/reports');
            setReports(reportsRes.data);

            // Fetch profile
            try {
                const profileRes = await axios.get('/patient/profile');
                setProfile(profileRes.data);
                setProfileData({
                    email: profileRes.data.email || '',
                    phone: profileRes.data.phone || '',
                    address: profileRes.data.address || '',
                    date_of_birth: profileRes.data.date_of_birth || '',
                    gender: profileRes.data.gender || 'male',
                    blood_group: profileRes.data.blood_group || '',
                    emergency_contact: profileRes.data.emergency_contact || ''
                });
            } catch (err) {
                console.log('Profile not found, will create on save');
            }
        } catch (err) {
            console.log('Error fetching data:', err);
        }
        setLoading(false);
    };

    const handleProfileChange = (e) => {
        setProfileData({
            ...profileData,
            [e.target.name]: e.target.value
        });
    };

    const saveProfile = async(e) => {
        e.preventDefault();
        try {
            await axios.put('/patient/profile', profileData);
            alert('Profile updated successfully!');
            setEditMode(false);
            fetchAllData();
        } catch (err) {
            alert('Error updating profile');
        }
    };

    const renderDashboard = () => {
        if (!dashboardStats) return <p>Loading...</p>;

        return (
            <div className="patient-dashboard">
                <h2>Health Summary</h2>
                
                <div className="stats-grid">
                    <div className="stat-card">
                        <h3>Total Visits</h3>
                        <p className="stat-number">{dashboardStats.totalVisits}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Ongoing Treatments</h3>
                        <p className="stat-number ongoing">{dashboardStats.ongoingTreatments}</p>
                    </div>
                </div>

                <div className="recent-section">
                    <h3>Recent Visits</h3>
                    {dashboardStats.recentVisits.length === 0 ? (
                        <p>No visits yet.</p>
                    ) : (
                        <div className="visits-timeline">
                            {dashboardStats.recentVisits.map((visit, index) => (
                                <div key={visit.id} className={`timeline-item ${visit.progress}`}>
                                    <div className="timeline-marker"></div>
                                    <div className="timeline-content">
                                        <div className="visit-header">
                                            <h4>{visit.diagnosis}</h4>
                                            <span className={`status-badge ${visit.progress}`}>
                                                {visit.progress}
                                            </span>
                                        </div>
                                        <p><strong>Date:</strong> {new Date(visit.visit_date).toLocaleDateString()}</p>
                                        <p><strong>Doctor:</strong> {visit.doctor_name}</p>
                                        <p><strong>Treatment:</strong> {visit.treatment}</p>
                                        {visit.prescription && (
                                            <p><strong>Prescription:</strong> {visit.prescription}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {dashboardStats.latestPrescription && (
                    <div className="latest-prescription">
                        <h3>Latest Prescription</h3>
                        <p><strong>Date:</strong> {new Date(dashboardStats.latestPrescription.visit_date).toLocaleDateString()}</p>
                        <p><strong>Prescription:</strong> {dashboardStats.latestPrescription.prescription}</p>
                    </div>
                )}
            </div>
        );
    };

    const renderMedicalHistory = () => {
        return (
            <div className="medical-history">
                <h2>Complete Medical History</h2>
                {medicalHistory.length === 0 ? (
                    <p>No medical records available.</p>
                ) : (
                    <div className="history-list">
                        {medicalHistory.map((visit, index) => (
                            <div key={visit.id} className="history-card">
                                <div className="card-header">
                                    <h3>{visit.diagnosis}</h3>
                                    <span className={`status-badge ${visit.progress}`}>
                                        {visit.progress}
                                    </span>
                                </div>
                                <div className="card-body">
                                    <p><strong>Visit Date:</strong> {new Date(visit.visit_date).toLocaleDateString()}</p>
                                    <p><strong>Doctor:</strong> {visit.doctor_name}</p>
                                    <p><strong>Treatment:</strong> {visit.treatment}</p>
                                    {visit.prescription && (
                                        <p><strong>Prescription:</strong> {visit.prescription}</p>
                                    )}
                                    {visit.report && (
                                        <p><strong>Report:</strong> {visit.report}</p>
                                    )}
                                    {visit.notes && (
                                        <p><strong>Notes:</strong> {visit.notes}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const renderReports = () => {
        return (
            <div className="reports-section">
                <h2>Medical Reports</h2>
                {reports.length === 0 ? (
                    <p>No reports available.</p>
                ) : (
                    <div className="reports-grid">
                        {reports.map((report) => (
                            <div key={report.id} className="report-card">
                                <h4>{report.diagnosis}</h4>
                                <p><strong>Date:</strong> {new Date(report.visit_date).toLocaleDateString()}</p>
                                <p><strong>Doctor:</strong> {report.doctor_name}</p>
                                <p><strong>Report:</strong> {report.report}</p>
                                <button 
                                    className="download-btn"
                                    onClick={() => window.open(report.report, '_blank')}
                                >
                                    View Report
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const renderProfile = () => {
        return (
            <div className="profile-section">
                <h2>My Profile</h2>
                {!editMode ? (
                    <div className="profile-view">
                        <div className="profile-info">
                            <h3>Personal Information</h3>
                            <p><strong>Username:</strong> {user.username}</p>
                            <p><strong>Email:</strong> {profile?.email || 'Not provided'}</p>
                            <p><strong>Phone:</strong> {profile?.phone || 'Not provided'}</p>
                            <p><strong>Date of Birth:</strong> {profile?.date_of_birth || 'Not provided'}</p>
                            <p><strong>Gender:</strong> {profile?.gender || 'Not provided'}</p>
                            <p><strong>Blood Group:</strong> {profile?.blood_group || 'Not provided'}</p>
                            <p><strong>Emergency Contact:</strong> {profile?.emergency_contact || 'Not provided'}</p>
                            <p><strong>Address:</strong> {profile?.address || 'Not provided'}</p>
                        </div>
                        <button className="edit-btn" onClick={() => setEditMode(true)}>
                            Edit Profile
                        </button>
                    </div>
                ) : (
                    <form onSubmit={saveProfile} className="profile-form">
                        <h3>Edit Profile Information</h3>
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={profileData.email}
                            onChange={handleProfileChange}
                        />
                        <input
                            type="tel"
                            name="phone"
                            placeholder="Phone Number"
                            value={profileData.phone}
                            onChange={handleProfileChange}
                        />
                        <input
                            type="date"
                            name="date_of_birth"
                            placeholder="Date of Birth"
                            value={profileData.date_of_birth}
                            onChange={handleProfileChange}
                        />
                        <select
                            name="gender"
                            value={profileData.gender}
                            onChange={handleProfileChange}
                        >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                        <input
                            type="text"
                            name="blood_group"
                            placeholder="Blood Group"
                            value={profileData.blood_group}
                            onChange={handleProfileChange}
                        />
                        <input
                            type="tel"
                            name="emergency_contact"
                            placeholder="Emergency Contact"
                            value={profileData.emergency_contact}
                            onChange={handleProfileChange}
                        />
                        <textarea
                            name="address"
                            placeholder="Address"
                            value={profileData.address}
                            onChange={handleProfileChange}
                            rows="3"
                        />
                        <div className="form-actions">
                            <button type="submit" className="save-btn">Save Changes</button>
                            <button type="button" className="cancel-btn" onClick={() => setEditMode(false)}>
                                Cancel
                            </button>
                        </div>
                    </form>
                )}
            </div>
        );
    };

    if (loading) {
        return <div className="loading">Loading patient data...</div>;
    }

    return (
        <div className="patient-portal">
            <header className="patient-header">
                <h1>Welcome, {user.username}</h1>
                <button onClick={onLogout} className="logout-btn">Logout</button>
            </header>

            <nav className="patient-nav">
                <button 
                    className={activeTab === 'dashboard' ? 'active' : ''}
                    onClick={() => setActiveTab('dashboard')}
                >
                    Dashboard
                </button>
                <button 
                    className={activeTab === 'appointments' ? 'active' : ''}
                    onClick={() => setActiveTab('appointments')}
                >
                    Appointments 📅
                </button>
                <button 
                    className={activeTab === 'history' ? 'active' : ''}
                    onClick={() => setActiveTab('history')}
                >
                    Medical History
                </button>
                <button 
                    className={activeTab === 'reports' ? 'active' : ''}
                    onClick={() => setActiveTab('reports')}
                >
                    Reports
                </button>
                <button 
                    className={activeTab === 'profile' ? 'active' : ''}
                    onClick={() => setActiveTab('profile')}
                >
                    Profile
                </button>
            </nav>

            <main className="patient-content">
                {activeTab === 'dashboard' && renderDashboard()}
                {activeTab === 'appointments' && <AppointmentBooking user={user} />}
                {activeTab === 'history' && renderMedicalHistory()}
                {activeTab === 'reports' && renderReports()}
                {activeTab === 'profile' && renderProfile()}
            </main>
        </div>
    );
}

export default PatientDashboard;
