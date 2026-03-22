import React, { useState } from 'react';
import axios from 'axios';

function PatientRegistration({ onRegister, onBackToLogin }) {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        name: '',
        age: '',
        email: '',
        phone: '',
        address: '',
        date_of_birth: '',
        gender: 'male',
        blood_group: '',
        emergency_contact: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const submit = async(e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 4) {
            setError('Password must be at least 4 characters');
            return;
        }

        setLoading(true);

        try {
            const res = await axios.post('/patient/register', formData);
            if (res.data.success) {
                alert('Registration successful! Please login.');
                onRegister();
            }
        } catch (err) {
            if (err.response && err.response.status === 409) {
                setError('Username already exists. Please choose another.');
            } else if (err.response) {
                setError(err.response.data || 'Registration failed');
            } else {
                setError('Network error. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="registration-container">
            <h1>Patient Registration</h1>
            <button onClick={onBackToLogin} className="back-btn">← Back to Login</button>
            
            {error && <div className="error-message">{error}</div>}
            
            <form onSubmit={submit} className="registration-form">
                <h3>Account Information</h3>
                <input
                    type="text"
                    name="username"
                    placeholder="Username *"
                    value={formData.username}
                    onChange={handleChange}
                    required
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password *"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />
                <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm Password *"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                />

                <h3>Personal Details</h3>
                <input
                    type="text"
                    name="name"
                    placeholder="Full Name *"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />
                <input
                    type="number"
                    name="age"
                    placeholder="Age *"
                    value={formData.age}
                    onChange={handleChange}
                    required
                    min="0"
                    max="150"
                />
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                />
                <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={handleChange}
                />

                <h3>Medical Information</h3>
                <input
                    type="date"
                    name="date_of_birth"
                    placeholder="Date of Birth"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                />
                <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                </select>
                <input
                    type="text"
                    name="blood_group"
                    placeholder="Blood Group (e.g., A+, O-)"
                    value={formData.blood_group}
                    onChange={handleChange}
                />
                <input
                    type="tel"
                    name="emergency_contact"
                    placeholder="Emergency Contact Number"
                    value={formData.emergency_contact}
                    onChange={handleChange}
                />

                <h3>Address</h3>
                <textarea
                    name="address"
                    placeholder="Full Address"
                    value={formData.address}
                    onChange={handleChange}
                    rows="3"
                />

                <button type="submit" disabled={loading} className="register-btn">
                    {loading ? 'Registering...' : 'Register'}
                </button>
            </form>
        </div>
    );
}

export default PatientRegistration;
