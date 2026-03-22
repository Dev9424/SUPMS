import React, { useState, useEffect } from 'react';
import axios from 'axios';

function DoctorAppointments({ user }) {
    const [appointments, setAppointments] = useState([]);
    const [pendingApprovals, setPendingApprovals] = useState([]);
    const [filter, setFilter] = useState('all'); // all, pending, approved, rejected
    const [loading, setLoading] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [approvalNotes, setApprovalNotes] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        fetchAllAppointments();
        fetchPendingApprovals();
        
        // Poll for updates every 30 seconds
        const interval = setInterval(() => {
            fetchAllAppointments();
            fetchPendingApprovals();
        }, 30000);

        return () => clearInterval(interval);
    }, [filter]);

    const fetchAllAppointments = async() => {
        try {
            const res = await axios.get(`/appointments/doctor-all?filter=${filter}`);
            setAppointments(res.data);
        } catch (err) {
            console.error('Error fetching appointments:', err);
            setErrorMessage('Failed to load appointments');
        }
    };

    const fetchPendingApprovals = async() => {
        try {
            const res = await axios.get('/appointments/pending-approvals');
            setPendingApprovals(res.data);
        } catch (err) {
            console.error('Error fetching pending approvals:', err);
        }
    };

    const approveAppointment = async(id) => {
        if (!window.confirm('Approve this appointment?')) return;

        try {
            const res = await axios.put(`/appointments/${id}/approve`, {
                notes: approvalNotes
            });
            
            if (res.data.success) {
                setSuccessMessage('Appointment approved successfully!');
                setApprovalNotes('');
                fetchAllAppointments();
                fetchPendingApprovals();
                
                setTimeout(() => setSuccessMessage(''), 3000);
            }
        } catch (err) {
            setErrorMessage(err.response?.data || 'Failed to approve appointment');
            setTimeout(() => setErrorMessage(''), 3000);
        }
    };

    const openRejectModal = (appointment) => {
        setSelectedAppointment(appointment);
        setRejectionReason('');
        setShowRejectModal(true);
    };

    const rejectAppointment = async() => {
        if (!selectedAppointment) return;

        try {
            const res = await axios.put(`/appointments/${selectedAppointment.id}/reject`, {
                reason: rejectionReason
            });
            
            if (res.data.success) {
                setSuccessMessage('Appointment rejected');
                setShowRejectModal(false);
                setSelectedAppointment(null);
                setRejectionReason('');
                fetchAllAppointments();
                fetchPendingApprovals();
                
                setTimeout(() => setSuccessMessage(''), 3000);
            }
        } catch (err) {
            setErrorMessage(err.response?.data || 'Failed to reject appointment');
            setTimeout(() => setErrorMessage(''), 3000);
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            scheduled: { bg: '#e3f2fd', color: '#1976d2', text: 'Scheduled' },
            completed: { bg: '#e8f5e9', color: '#388e3c', text: 'Completed' },
            cancelled: { bg: '#ffebee', color: '#d32f2f', text: 'Cancelled' }
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

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', { 
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="doctor-appointments">
            <header className="appointments-header">
                <h2>📅 Appointment Management</h2>
                {pendingApprovals.length > 0 && (
                    <div className="pending-badge">
                        ⏰ {pendingApprovals.length} Pending Approval{pendingApprovals.length > 1 ? 's' : ''}
                    </div>
                )}
            </header>

            {successMessage && (
                <div className="success-message">{successMessage}</div>
            )}
            {errorMessage && (
                <div className="error-message">{errorMessage}</div>
            )}

            {/* Pending Approvals Section */}
            {pendingApprovals.length > 0 && (
                <div className="pending-approvals-section">
                    <h3>⏰ Pending Approvals ({pendingApprovals.length})</h3>
                    <div className="appointments-grid">
                        {pendingApprovals.map(appt => (
                            <div key={appt.id} className="appointment-card pending">
                                <div className="card-header">
                                    <h4>Patient: {appt.patient_name}</h4>
                                    <span className="status-badge" style={{ background: '#fff3e0', color: '#f57c00' }}>
                                        ⏳ Pending
                                    </span>
                                </div>
                                <div className="card-body">
                                    <p><strong>Requested Date:</strong> {formatDate(appt.appointment_date)}</p>
                                    <p><strong>Age:</strong> {appt.patient_age} years</p>
                                    {appt.reason && (
                                        <p><strong>Reason:</strong> {appt.reason}</p>
                                    )}
                                    <p><strong>Booked:</strong> {formatDate(appt.created_at)}</p>
                                    
                                    <div className="action-buttons">
                                        <button 
                                            onClick={() => approveAppointment(appt.id)}
                                            className="approve-btn"
                                        >
                                            ✓ Approve
                                        </button>
                                        <button 
                                            onClick={() => openRejectModal(appt)}
                                            className="reject-btn"
                                        >
                                            ✗ Reject
                                        </button>
                                    </div>
                                    
                                    <details className="notes-section">
                                        <summary>Add Notes (Optional)</summary>
                                        <textarea
                                            value={approvalNotes}
                                            onChange={(e) => setApprovalNotes(e.target.value)}
                                            placeholder="Add any notes for the patient..."
                                            rows="2"
                                        />
                                    </details>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* All Appointments Section */}
            <div className="all-appointments-section">
                <div className="section-header">
                    <h3>All Appointments</h3>
                    <select 
                        value={filter} 
                        onChange={(e) => setFilter(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">All Appointments</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>

                {appointments.length === 0 ? (
                    <p className="no-appointments">No appointments found</p>
                ) : (
                    <div className="appointments-list">
                        {appointments.map(appt => {
                            const statusBadge = getStatusBadge(appt.status);
                            const approvalBadge = getApprovalBadge(appt.approval_status);
                            
                            return (
                                <div key={appt.id} className={`appointment-item ${appt.approval_status}`}>
                                    <div className="item-header">
                                        <div className="patient-info">
                                            <h4>{appt.patient_name}</h4>
                                            <span>Age: {appt.patient_age}</span>
                                        </div>
                                        <div className="badges">
                                            <span 
                                                className="badge status-badge"
                                                style={{ background: statusBadge.bg, color: statusBadge.color }}
                                            >
                                                {statusBadge.text}
                                            </span>
                                            <span 
                                                className="badge approval-badge"
                                                style={{ background: approvalBadge.bg, color: approvalBadge.color }}
                                            >
                                                {approvalBadge.text}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="item-details">
                                        <p><strong>Appointment:</strong> {formatDate(appt.appointment_date)}</p>
                                        {appt.reason && <p><strong>Reason:</strong> {appt.reason}</p>}
                                        {appt.notes && (
                                            <p className="notes">
                                                <strong>Notes:</strong> {appt.notes}
                                            </p>
                                        )}
                                        {appt.approved_at && (
                                            <p className="approved-time">
                                                <small>Approved at: {formatDate(appt.approved_at)}</small>
                                            </p>
                                        )}
                                        <p><small>Booked: {formatDate(appt.created_at)}</small></p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Rejection Modal */}
            {showRejectModal && (
                <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Reject Appointment</h3>
                        <p>Please provide a reason for rejection:</p>
                        
                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="e.g., Schedule is full on this date, Please choose another time..."
                            rows="4"
                            autoFocus
                        />
                        
                        <div className="modal-buttons">
                            <button 
                                onClick={() => setShowRejectModal(false)}
                                className="cancel-btn"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={rejectAppointment}
                                className="confirm-reject-btn"
                                disabled={!rejectionReason.trim()}
                            >
                                Reject Appointment
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DoctorAppointments;
