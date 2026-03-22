import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AppointmentBooking({ user }) {
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState('');
    const [appointmentDate, setAppointmentDate] = useState('');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [myAppointments, setMyAppointments] = useState([]);

    useEffect(() => {
        fetchDoctors();
        fetchMyAppointments();
    }, []);

    const fetchDoctors = async() => {
        try {
            const res = await axios.get('/appointments/available-doctors');
            setDoctors(res.data);
        } catch (err) {
            console.error('Error fetching doctors:', err);
        }
    };

    const fetchMyAppointments = async() => {
        try {
            const res = await axios.get('/appointments/my-appointments');
            setMyAppointments(res.data);
        } catch (err) {
            console.error('Error fetching appointments:', err);
        }
    };

    const bookAppointment = async(e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!selectedDoctor || !appointmentDate) {
            setError('Please select a doctor and date/time');
            return;
        }

        // Check if date is in the past
        const selectedDateTime = new Date(appointmentDate);
        const now = new Date();
        if (selectedDateTime < now) {
            setError('Cannot book appointment in the past');
            return;
        }

        setLoading(true);

        try {
            const res = await axios.post('/appointments/book', {
                doctor_id: selectedDoctor,
                appointment_date: appointmentDate,
                reason: reason
            });

            if (res.data.success) {
                setSuccess('Appointment booked successfully!');
                setSelectedDoctor('');
                setAppointmentDate('');
                setReason('');
                fetchMyAppointments();
            }
        } catch (err) {
            setError(err.response?.data || 'Failed to book appointment');
        } finally {
            setLoading(false);
        }
    };

    const cancelAppointment = async(id) => {
        if (!window.confirm('Are you sure you want to cancel this appointment?')) return;

        try {
            await axios.delete(`/appointments/${id}/cancel`);
            setSuccess('Appointment cancelled');
            fetchMyAppointments();
        } catch (err) {
            setError('Failed to cancel appointment');
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            scheduled: { bg: '#fff3cd', color: '#856404', text: 'Scheduled' },
            completed: { bg: '#d4edda', color: '#155724', text: 'Completed' },
            cancelled: { bg: '#f8d7da', color: '#721c24', text: 'Cancelled' }
        };
        return badges[status] || badges.scheduled;
    };

    const getApprovalBadge = (status) => {
        const badges = {
            pending: { bg: '#fff3e0', color: '#f57c00', text: '⏳ Pending Approval' },
            approved: { bg: '#e8f5e9', color: '#2e7d32', text: '✓ Approved' },
            rejected: { bg: '#ffebee', color: '#c62828', text: '✗ Rejected' }
        };
        return badges[status] || badges.pending;
    };

    return (
        <div className="appointment-booking">
            <h2>Book an Appointment</h2>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <form onSubmit={bookAppointment} className="appointment-form">
                <div className="form-group">
                    <label>Select Doctor:</label>
                    <select
                        value={selectedDoctor}
                        onChange={(e) => setSelectedDoctor(e.target.value)}
                        required
                    >
                        <option value="">Choose a doctor...</option>
                        {doctors.map(doctor => (
                            <option key={doctor.id} value={doctor.id}>
                                Dr. {doctor.username}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Appointment Date & Time:</label>
                    <input
                        type="datetime-local"
                        value={appointmentDate}
                        onChange={(e) => setAppointmentDate(e.target.value)}
                        min={new Date().toISOString().slice(0, 16)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Reason for Visit (Optional):</label>
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Briefly describe your symptoms or reason for visit..."
                        rows="3"
                    />
                </div>

                <button type="submit" disabled={loading} className="book-btn">
                    {loading ? 'Booking...' : 'Book Appointment'}
                </button>
            </form>

            <div className="my-appointments">
                <h3>My Appointments</h3>
                {myAppointments.length === 0 ? (
                    <p>No appointments booked yet.</p>
                ) : (
                    <div className="appointments-list">
                        {myAppointments.map(appt => {
                            const badge = getStatusBadge(appt.status);
                            const approvalBadge = getApprovalBadge(appt.approval_status || 'pending');
                            
                            return (
                                <div key={appt.id} className="appointment-card">
                                    <div className="card-header">
                                        <h4>Dr. {appt.doctor_name}</h4>
                                        <div className="badges-container">
                                            <span 
                                                className="status-badge"
                                                style={{ 
                                                    background: badge.bg, 
                                                    color: badge.color 
                                                }}
                                            >
                                                {badge.text}
                                            </span>
                                            <span 
                                                className="approval-badge"
                                                style={{ 
                                                    background: approvalBadge.bg, 
                                                    color: approvalBadge.color 
                                                }}
                                            >
                                                {approvalBadge.text}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="card-body">
                                        <p><strong>Date:</strong> {new Date(appt.appointment_date).toLocaleString()}</p>
                                        {appt.reason && <p><strong>Reason:</strong> {appt.reason}</p>}
                                        <p><strong>Booked on:</strong> {new Date(appt.created_at).toLocaleString()}</p>
                                        
                                        {appt.notes && (
                                            <p className="doctor-notes">
                                                <strong>Doctor's Notes:</strong> {appt.notes}
                                            </p>
                                        )}
                                        
                                        {appt.approval_status === 'rejected' && (
                                            <button 
                                                onClick={() => {
                                                    // Could add reschedule functionality here
                                                    alert('This appointment was rejected. Please book a new one.');
                                                }}
                                                className="reschedule-btn"
                                            >
                                                🔄 Book New Appointment
                                            </button>
                                        )}
                                        
                                        {appt.status === 'scheduled' && appt.approval_status !== 'rejected' && (
                                            <button 
                                                onClick={() => cancelAppointment(appt.id)}
                                                className="cancel-btn"
                                            >
                                                Cancel Appointment
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default AppointmentBooking;
