# Account Testing & Synchronization Checklist

## ✅ Test Results Template

### 1. Patient Account Tests

#### Test Patient1 (Default Account)
- [ ] Login successful with username: `patient1`, password: `pass1`
- [ ] Dashboard loads correctly
- [ ] Profile tab shows user information
- [ ] Can edit and save profile
- [ ] Medical History tab displays (empty if no visits)
- [ ] Reports tab displays (empty if no reports)
- [ ] Logout works

#### Test New Patient Registration
- [ ] Registration form opens
- [ ] Can create new account successfully
- [ ] Login with new account works
- [ ] Profile is created in database
- [ ] Patient record is synced in patients table
- [ ] Can access all tabs

---

### 2. Doctor Account Tests

#### Test Doctor1
- [ ] Login successful with username: `doctor1`, password: `pass2`
- [ ] Dashboard shows doctor-specific view
- [ ] Can see all patients list
- [ ] Can search for patients
- [ ] Can add visit to a patient
- [ ] Visit is saved with correct patient_id and doctor_id
- [ ] Can view patient profiles
- [ ] Logout works

---

### 3. Admin Account Tests

#### Test Admin1
- [ ] Login successful with username: `admin1`, password: `pass3`
- [ ] Analytics dashboard loads
- [ ] Can see disease trends chart
- [ ] Can see patient growth chart
- [ ] Can see hospital performance stats
- [ ] Can view all patients
- [ ] Can search patients
- [ ] Can view patient profiles
- [ ] Cannot add visits (doctor only)
- [ ] Logout works

---

### 4. Data Synchronization Tests

#### Patient-Doctor Sync
- [ ] Doctor adds visit for patient1
- [ ] Patient1 can see the visit in their dashboard
- [ ] Visit appears in medical history
- [ ] Visit count updates in dashboard stats

#### Patient Registration Sync
- [ ] New patient registers
- [ ] User record created in `users` table
- [ ] Patient record created in `patients` table
- [ ] Profile record created in `patient_profiles` table
- [ ] Doctor can see new patient in patient list
- [ ] Admin can see new patient in analytics

#### Cross-Role Data Visibility
- [ ] Doctor creates visit → Patient sees it ✓
- [ ] Multiple doctors → All can see same patients ✓
- [ ] Admin views analytics → Includes all patients' data ✓

---

## 🔍 Common Issues to Check

### Issue 1: Patient cannot see visits added by doctor
**Cause**: Mismatch in patient name/username mapping
**Fix**: Ensure queries use `patients.name = user.username`

### Issue 2: Newly registered patient not visible to doctors
**Cause**: Missing INSERT into patients table during registration
**Fix**: Registration endpoint creates both user and patient records

### Issue 3: Profile not found error
**Cause**: patient_profiles table not created or missing record
**Fix**: Auto-create profile on registration, handle missing profile gracefully

### Issue 4: Dashboard stats showing 0 for new patient
**Expected**: New patients should show 0 visits initially
**Check**: Dashboard endpoint handles COUNT correctly

---

## 📊 Database Consistency Checks

Run these SQL queries to verify data:

```sql
-- Check all users
SELECT * FROM users;

-- Check all patients
SELECT * FROM patients;

-- Check all visits
SELECT * FROM visits;

-- Check patient profiles
SELECT * FROM patient_profiles;

-- Verify patient-user sync
SELECT u.username, u.role, p.name, p.age 
FROM users u 
LEFT JOIN patients p ON u.username = p.name 
WHERE u.role = 'patient';

-- Verify visits have valid patient references
SELECT v.id, v.patient_id, p.name as patient_name, v.doctor_id, u.username as doctor_name
FROM visits v
JOIN patients p ON v.patient_id = p.id
JOIN users u ON v.doctor_id = u.id;
```

---

## 🧪 Manual Testing Steps

### Step 1: Test Default Patient
1. Open http://localhost:3001
2. Login: patient1 / pass1
3. Verify dashboard shows "Health Summary"
4. Click through all tabs
5. Logout

### Step 2: Register New Patient
1. Click "Register as Patient"
2. Fill form:
   - Username: `testuser`
   - Password: `test123`
   - Name: `Test User`
   - Age: `28`
   - Email: `test@test.com`
3. Submit
4. Go back to login
5. Login with new credentials
6. Verify all tabs work

### Step 3: Test Doctor Workflow
1. Logout
2. Login: doctor1 / pass2
3. Verify patient list shows patient1 and testuser
4. Add a visit for patient1:
   - Diagnosis: Fever
   - Treatment: Rest and medication
   - Progress: Ongoing
5. Submit
6. Verify visit appears in UI

### Step 4: Verify Patient Sees Visit
1. Logout
2. Login: patient1 / pass1
3. Check dashboard - should show new visit
4. Check medical history - should show visit details
5. Verify visit date and doctor name

### Step 5: Test Admin View
1. Logout
2. Login: admin1 / pass3
3. Check analytics dashboard
4. Verify total patients count includes testuser
5. Verify total visits count includes new visit
6. Check disease trends shows fever diagnosis

---

## ✅ Success Criteria

All tests pass if:
1. ✅ All 3 default accounts can login
2. ✅ Each role sees correct UI (patient/doctor/admin)
3. ✅ New patient registration works end-to-end
4. ✅ Doctor can add visits for any patient
5. ✅ Patient can see visits added by doctor
6. ✅ Admin analytics include all data
7. ✅ Profile management works for patients
8. ✅ No console errors in browser
9. ✅ No database errors in backend logs
10. ✅ Data persists across sessions

---

## 🐛 Known Limitations

1. **Session Storage**: Sessions stored in memory, lost on server restart
2. **Report Files**: Reports stored as text URLs, not actual file uploads
3. **Password Encryption**: Passwords stored in plain text (for testing)
4. **Email Verification**: No email verification on registration

---

## 📝 Notes

- Backend must be running on port 3000
- Frontend must be running on port 3001
- Database connection must be active
- All tables created automatically on first run
- CORS enabled for localhost development
