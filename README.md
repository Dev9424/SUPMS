# Secure Unified Patient Medical History & Hospital Visit Analytics System

This is a web application for managing patient medical records and hospital visits.

## Tech Stack
- Frontend: React
- Backend: Express.js
- Database: MySQL

## Setup

1. Ensure MySQL is installed and running on `localhost` with user `hospital_user` and password `hospital_pass`. The database `hospital` has been created.

2. Install dependencies:
   - Backend: `cd backend && npm install`
   - Frontend: `cd frontend && npm install`

3. Start the backend: `cd backend && node index.js`

4. Start the frontend: `cd frontend && npm start`

## Users
- Patient: username `patient1`, password `pass1`
- Doctor: username `doctor1`, password `pass2`
- Hospital Admin: username `admin1`, password `pass3`

## Security Note
Passwords are stored in plaintext for demonstration purposes only. This is highly insecure.

## Why Plaintext Password Storage is Dangerous
Storing passwords in plaintext means that if the database is accessed by unauthorized parties, all passwords are immediately readable. Attackers can use these passwords to log into user accounts, potentially accessing sensitive medical information, impersonating users, or performing malicious actions.

## What Happens if Database is Leaked
If the database is leaked or breached:
- All user credentials are exposed, allowing attackers to take over accounts.
- Patient medical histories and personal data are compromised, leading to privacy violations and potential blackmail.
- Doctors' accounts could be used to alter medical records, causing harm to patients.
- Hospital administrators' accounts could be used to disrupt operations or access administrative data.
- This could result in legal consequences, loss of trust, and significant financial damage to the hospital.