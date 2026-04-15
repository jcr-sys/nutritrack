// js/patients.js
// ===== PATIENTS PAGE WITH FIREBASE =====

let allPatients = [];
let allStaff = [];
let allBNSAndNurses = [];

// Display current date
function displayCurrentDate() {
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        const today = new Date();
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        dateElement.textContent = today.toLocaleDateString('en-US', options);
    }
}

// Load staff for doctor dropdown
async function loadStaffForDropdown() {
    try {
        const doctorSelect = document.getElementById('primaryDoctorId');
        const editDoctorSelect = document.getElementById('editPrimaryDoctorId');
        if (!doctorSelect) return;
        
        doctorSelect.innerHTML = '<option value="">Loading doctors...</option>';
        if (editDoctorSelect) editDoctorSelect.innerHTML = '<option value="">Loading doctors...</option>';
        allStaff = [];
        
        const snapshot = await db.collection('staff').orderBy('doctor_id').get();
        
        doctorSelect.innerHTML = '<option value="">Select Doctor ID</option>';
        if (editDoctorSelect) editDoctorSelect.innerHTML = '<option value="">Select Doctor ID</option>';
        
        if (snapshot.empty) {
            doctorSelect.innerHTML = '<option value="">No doctors found</option>';
            if (editDoctorSelect) editDoctorSelect.innerHTML = '<option value="">No doctors found</option>';
            return;
        }
        
        snapshot.forEach(doc => {
            const staff = doc.data();
            allStaff.push(staff);
            const option = document.createElement('option');
            option.value = staff.doctor_id;
            option.textContent = staff.doctor_id;
            doctorSelect.appendChild(option);
            if (editDoctorSelect) {
                const editOption = document.createElement('option');
                editOption.value = staff.doctor_id;
                editOption.textContent = staff.doctor_id;
                editDoctorSelect.appendChild(editOption);
            }
        });
        
    } catch (error) {
        console.error("Error loading staff:", error);
        const doctorSelect = document.getElementById('primaryDoctorId');
        if (doctorSelect) {
            doctorSelect.innerHTML = '<option value="">Error loading doctors</option>';
        }
    }
}

// Load BNS and Nurses for Handled By dropdown (exclude Doctors and IT)
async function loadBNSAndNursesForDropdown() {
    try {
        const handledBySelect = document.getElementById('handledBy');
        const editHandledBySelect = document.getElementById('editHandledBy');
        
        allBNSAndNurses = [];
        
        // Load BNS Workers
        const bnsSnapshot = await db.collection('bns_workers').orderBy('bns_id').get();
        bnsSnapshot.forEach(doc => {
            const staff = doc.data();
            allBNSAndNurses.push({
                id: staff.bns_id,
                name: `${staff.first_name} ${staff.last_name} (BNS)`,
                type: 'bns'
            });
        });
        
        // Load Nurses
        const nursesSnapshot = await db.collection('nurses').orderBy('nurse_id').get();
        nursesSnapshot.forEach(doc => {
            const staff = doc.data();
            allBNSAndNurses.push({
                id: staff.nurse_id,
                name: `${staff.first_name} ${staff.last_name} (Nurse)`,
                type: 'nurse'
            });
        });
        
        // Populate dropdowns
        if (handledBySelect) {
            handledBySelect.innerHTML = '<option value="">Select BNS or Nurse</option>';
            allBNSAndNurses.forEach(staff => {
                const option = document.createElement('option');
                option.value = staff.id;
                option.textContent = staff.name;
                handledBySelect.appendChild(option);
            });
        }
        
        if (editHandledBySelect) {
            editHandledBySelect.innerHTML = '<option value="">Select BNS or Nurse</option>';
            allBNSAndNurses.forEach(staff => {
                const option = document.createElement('option');
                option.value = staff.id;
                option.textContent = staff.name;
                editHandledBySelect.appendChild(option);
            });
        }
        
    } catch (error) {
        console.error("Error loading BNS/Nurses:", error);
    }
}

// Update doctor name display when doctor selected
function updateDoctorNameDisplay() {
    const doctorSelect = document.getElementById('primaryDoctorId');
    const doctorNameDisplay = document.getElementById('doctorNameDisplay');
    const selectedValue = doctorSelect.value;
    
    if (selectedValue && allStaff.length > 0) {
        const doctor = allStaff.find(s => s.doctor_id.toString() === selectedValue);
        if (doctor) {
            doctorNameDisplay.value = `Dr. ${doctor.first_name} ${doctor.last_name} (${doctor.specialty})`;
        } else {
            doctorNameDisplay.value = '';
        }
    } else {
        doctorNameDisplay.value = '';
    }
}

// Update edit doctor name display
function updateEditDoctorNameDisplay() {
    const doctorSelect = document.getElementById('editPrimaryDoctorId');
    const doctorNameDisplay = document.getElementById('editDoctorNameDisplay');
    const selectedValue = doctorSelect.value;
    
    if (selectedValue && allStaff.length > 0) {
        const doctor = allStaff.find(s => s.doctor_id.toString() === selectedValue);
        if (doctor) {
            doctorNameDisplay.value = `Dr. ${doctor.first_name} ${doctor.last_name} (${doctor.specialty})`;
        } else {
            doctorNameDisplay.value = '';
        }
    } else {
        doctorNameDisplay.value = '';
    }
}

// Get handled by name from ID or stored name
function getHandledByName(handledById, storedName = null) {
    // First, try to use the stored name if it exists
    if (storedName && storedName !== '') {
        return storedName;
    }
    // If no stored name, look up by ID
    if (!handledById) return '-';
    const staff = allBNSAndNurses.find(s => s.id.toString() === handledById.toString());
    if (staff) {
        return staff.name;
    }
    return '-';
}
// Load patients from Firestore
async function loadPatients() {
    const tableBody = document.getElementById('patientsTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '<td><td colspan="20" style="text-align: center;">Loading patients...<\/div>';

    try {
        // Make sure staff data is loaded
        if (allStaff.length === 0) {
            await loadStaffForDropdown();
        }
        
        const snapshot = await db.collection('patients').orderBy('patient_id').get();
        
        if (snapshot.empty) {
            tableBody.innerHTML = '<tr><td colspan="20" style="text-align: center;">No patients found. Click "+ Add Patient" to add.<\/div>';
            allPatients = [];
            return;
        }
        
        allPatients = [];
        tableBody.innerHTML = '';
        
        for (const doc of snapshot.docs) {
            const patient = doc.data();
            allPatients.push(patient);
            
            // Get doctor ID and doctor name separately
            const doctorIdNum = patient.primary_doctor_id || '-';
            let doctorName = '-';
            
            // Find doctor in allStaff array
            const doctor = allStaff.find(s => s.doctor_id?.toString() === doctorIdNum?.toString());
            if (doctor) {
                doctorName = `Dr. ${doctor.first_name} ${doctor.last_name}`;
            } else if (patient.doctor_name) {
                doctorName = patient.doctor_name;
            }
            
            const handledByName = getHandledByName(patient.handled_by, patient.handled_by_name);
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${patient.patient_id || '-'}<\/div>
                <td>${patient.last_name || '-'}<\/div>
                <td>${patient.first_name || '-'}<\/div>
                <td>${patient.middle_name || '-'}<\/div>
                <td>${patient.suffix || '-'}<\/div>
                <td>${patient.age || '-'}<\/div>
                <td>${patient.gender || '-'}<\/div>
                <td>${patient.birthdate || '-'}<\/div>
                <td>${patient.religion || '-'}<\/div>
                <td>${patient.occupation || '-'}<\/div>
                <td>${patient.address || '-'}<\/div>
                <td>${patient.email || '-'}<\/div>
                <td>${patient.mobile_number || '-'}<\/div>
                <td>${patient.blood_type || '-'}<\/div>
                <td>${patient.allergy || '-'}<\/div>
                <td>${doctorIdNum}<\/div>
                <td>${doctorName}<\/div>
                <td>${handledByName}<\/div>
                <td>${patient.patient_type || '-'}<\/div>
                <td>
                    <div class="action-buttons">
                        <button class="view-btn" onclick="viewPatientModal('${patient.patient_id}')">View</button>
                        <button class="edit-btn" onclick="editPatientModal('${patient.patient_id}')">Edit</button>
                        <button class="delete-btn" onclick="showDeletePatientConfirmation('${patient.patient_id}', '${patient.first_name} ${patient.last_name}')">Delete</button>
                    </div>
                <\/div>
            `;
            tableBody.appendChild(row);
        }
    } catch (error) {
        console.error("Error loading patients:", error);
        tableBody.innerHTML = '<td><td colspan="20" style="text-align: center; color: red;">Error loading data. Please check your connection.<\/div>';
    }
}

// Search patients
function searchPatients() {
    const searchTerm = document.getElementById('patientSearch').value.toLowerCase();
    const filteredPatients = allPatients.filter(patient => 
        patient.patient_id.toLowerCase().includes(searchTerm) ||
        (patient.last_name && patient.last_name.toLowerCase().includes(searchTerm)) ||
        (patient.first_name && patient.first_name.toLowerCase().includes(searchTerm)) ||
        (patient.middle_name && patient.middle_name.toLowerCase().includes(searchTerm)) ||
        (patient.address && patient.address.toLowerCase().includes(searchTerm)) ||
        (patient.email && patient.email.toLowerCase().includes(searchTerm)) ||
        (patient.mobile_number && patient.mobile_number.toLowerCase().includes(searchTerm)) ||
        (patient.patient_type && patient.patient_type.toLowerCase().includes(searchTerm)) ||
        (patient.primary_doctor_id && patient.primary_doctor_id.toString().toLowerCase().includes(searchTerm))
    );
    displayFilteredPatients(filteredPatients);
}

// Calculate age from birthdate
function calculateAge() {
    const birthdateInput = document.getElementById('birthdate');
    const ageInput = document.getElementById('age');
    
    if (!birthdateInput.value) {
        ageInput.value = '';
        return;
    }
    
    const birthdate = new Date(birthdateInput.value);
    const today = new Date();
    
    let age = today.getFullYear() - birthdate.getFullYear();
    const monthDiff = today.getMonth() - birthdate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthdate.getDate())) {
        age--;
    }
    
    ageInput.value = age >= 0 ? age : 0;
}

// Calculate edit age
function calculateEditAge() {
    const birthdateInput = document.getElementById('editBirthdate');
    const ageInput = document.getElementById('editAge');
    
    if (!birthdateInput.value) {
        ageInput.value = '';
        return;
    }
    
    const birthdate = new Date(birthdateInput.value);
    const today = new Date();
    
    let age = today.getFullYear() - birthdate.getFullYear();
    const monthDiff = today.getMonth() - birthdate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthdate.getDate())) {
        age--;
    }
    
    ageInput.value = age >= 0 ? age : 0;
}

// Sort patients
function sortPatients() {
    const sortBy = document.getElementById('sortBy').value;
    const sortedPatients = [...allPatients].sort((a, b) => {
        let valA = a[sortBy] || '';
        let valB = b[sortBy] || '';
        
        if (sortBy === 'age' || sortBy === 'patient_id') {
            return parseInt(valA) - parseInt(valB);
        }
        if (sortBy === 'primary_doctor_id') {
            return (parseInt(valA) || 0) - (parseInt(valB) || 0);
        }
        return String(valA).localeCompare(String(valB));
    });
    displayFilteredPatients(sortedPatients);
}

// Display filtered/sorted patients
function displayFilteredPatients(patientList) {
    const tableBody = document.getElementById('patientsTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    patientList.forEach(patient => {
        const doctorIdNum = patient.primary_doctor_id || '-';
        let doctorName = '-';
        
        const doctor = allStaff.find(s => s.doctor_id.toString() === doctorIdNum.toString());
        if (doctor) {
            doctorName = `Dr. ${doctor.first_name} ${doctor.last_name}`;
        }
        
        const handledByName = getHandledByName(patient.handled_by, patient.handled_by_name);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${patient.patient_id || '-'}<\/div>
            <td>${patient.last_name || '-'}<\/div>
            <td>${patient.first_name || '-'}<\/div>
            <td>${patient.middle_name || '-'}<\/div>
            <td>${patient.suffix || '-'}<\/div>
            <td>${patient.age || '-'}<\/div>
            <td>${patient.gender || '-'}<\/div>
            <td>${patient.birthdate || '-'}<\/div>
            <td>${patient.religion || '-'}<\/div>
            <td>${patient.occupation || '-'}<\/div>
            <td>${patient.address || '-'}<\/div>
            <td>${patient.email || '-'}<\/div>
            <td>${patient.mobile_number || '-'}<\/div>
            <td>${patient.blood_type || '-'}<\/div>
            <td>${patient.allergy || '-'}<\/div>
            <td>${doctorIdNum}<\/div>
            <td>${doctorName}<\/div>
            <td>${handledByName}<\/div>
            <td>${patient.patient_type || '-'}<\/div>
            <td>
                <div class="action-buttons">
                    <button class="view-btn" onclick="viewPatientModal('${patient.patient_id}')">View</button>
                    <button class="edit-btn" onclick="editPatientModal('${patient.patient_id}')">Edit</button>
                    <button class="delete-btn" onclick="showDeletePatientConfirmation('${patient.patient_id}', '${patient.first_name} ${patient.last_name}')">Delete</button>
                </div>
            <\/div>
        `;
        tableBody.appendChild(row);
    });
}

// Show add patient modal
function showAddPatientModal() {
    document.getElementById('addPatientModal').classList.add('show');
    loadStaffForDropdown();
    loadBNSAndNursesForDropdown();
}

// Hide add patient modal
function hideAddPatientModal() {
    document.getElementById('addPatientModal').classList.remove('show');
    clearPatientForm();
}

// Clear patient form
function clearPatientForm() {
    document.getElementById('patientForm').reset();
    document.getElementById('doctorNameDisplay').value = '';
}

// Generate new patient ID
async function getNextPatientId() {
    try {
        const snapshot = await db.collection('patients').orderBy('patient_id', 'desc').limit(1).get();
        if (snapshot.empty) {
            return '1001';
        }
        const lastPatient = snapshot.docs[0].data();
        const lastId = parseInt(lastPatient.patient_id);
        return (lastId + 1).toString();
    } catch (error) {
        console.error("Error getting next patient ID:", error);
        return (allPatients.length + 1001).toString();
    }
}

// Save new patient to Firestore
async function savePatient() {
    const lastName = document.getElementById('lastName').value.trim();
    const firstName = document.getElementById('firstName').value.trim();
    const middleName = document.getElementById('middleName').value.trim();
    const suffix = document.getElementById('suffix').value.trim();
    const age = document.getElementById('age').value;
    const gender = document.getElementById('gender').value;
    const birthdate = document.getElementById('birthdate').value;
    const religion = document.getElementById('religion').value.trim();
    const occupation = document.getElementById('occupation').value.trim();
    const address = document.getElementById('address').value.trim();
    const email = document.getElementById('email').value.trim();
    const mobileNumber = document.getElementById('mobileNumber').value.trim();
    const bloodType = document.getElementById('bloodType').value;
    const allergy = document.getElementById('allergy').value.trim();
    const primaryDoctorId = document.getElementById('primaryDoctorId').value;
    const handledBy = document.getElementById('handledBy').value;
    const patientType = document.getElementById('patientType').value;
    
    if (!lastName || !firstName || (!age && age !== 0) || !gender || !birthdate || !address || !patientType || !primaryDoctorId) {
        showToast('Please fill in all required fields', 'warning');
        return;
    }
    
    // Get the handled by name for display
    let handledByName = '';
    if (handledBy) {
        const staff = allBNSAndNurses.find(s => s.id.toString() === handledBy.toString());
        if (staff) {
            handledByName = staff.name;
        }
    }
    
    const newId = await getNextPatientId();
    
    const newPatient = {
        patient_id: newId,
        last_name: lastName,
        first_name: firstName,
        middle_name: middleName || '',
        suffix: suffix || '',
        age: parseInt(age),
        gender: gender,
        birthdate: birthdate,
        religion: religion || '',
        occupation: occupation || '',
        address: address,
        email: email || '',
        mobile_number: mobileNumber || '',
        blood_type: bloodType || '',
        allergy: allergy || '',
        primary_doctor_id: primaryDoctorId,
        handled_by: handledBy || null,
        handled_by_name: handledByName,
        patient_type: patientType,
        created_at: new Date().toISOString()
    };
    
    try {
        await db.collection('patients').doc(newId).set(newPatient);
        showToast(`Patient ${firstName} ${lastName} saved successfully with ID: ${newId}`, 'success');
        await loadPatients();
        hideAddPatientModal();
    } catch (error) {
        console.error("Error saving patient:", error);
        showToast("Error saving patient. Please try again.", 'error');
    }
}

// ========== VIEW PATIENT MODAL ==========
function viewPatientModal(patientId) {
    const patient = allPatients.find(p => p.patient_id === patientId);
    if (patient) {
        let doctorName = 'N/A';
        const doctor = allStaff.find(s => s.doctor_id.toString() === patient.primary_doctor_id);
        if (doctor) {
            doctorName = `Dr. ${doctor.first_name} ${doctor.last_name} (${doctor.specialty})`;
        }
        
        const handledByName = getHandledByName(patient.handled_by, patient.handled_by_name);
        
        const content = `
            <div style="line-height: 1.8; font-family: 'Segoe UI', Arial, sans-serif;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; width: 35%; font-weight: 600; color: #2B6896;">Patient ID:<\/td><td style="padding: 8px 0;">${patient.patient_id}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Full Name:<\/td><td style="padding: 8px 0;">${patient.first_name} ${patient.middle_name || ''} ${patient.last_name} ${patient.suffix || ''}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Age:<\/td><td style="padding: 8px 0;">${patient.age}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Gender:<\/td><td style="padding: 8px 0;">${patient.gender}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Birthdate:<\/td><td style="padding: 8px 0;">${patient.birthdate}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Religion:<\/td><td style="padding: 8px 0;">${patient.religion || 'N/A'}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Occupation:<\/td><td style="padding: 8px 0;">${patient.occupation || 'N/A'}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Address:<\/td><td style="padding: 8px 0;">${patient.address}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Email:<\/td><td style="padding: 8px 0;">${patient.email || 'N/A'}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Mobile Number:<\/td><td style="padding: 8px 0;">${patient.mobile_number || 'N/A'}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Blood Type:<\/td><td style="padding: 8px 0;">${patient.blood_type || 'N/A'}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Allergy:<\/td><td style="padding: 8px 0;">${patient.allergy || 'N/A'}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Primary Doctor:<\/td><td style="padding: 8px 0;">${doctorName}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Handled By:<\/td><td style="padding: 8px 0;">${handledByName}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Patient Type:<\/td><td style="padding: 8px 0;">${patient.patient_type}<\/td><\/tr>
                </table>
            </div>
        `;
        
        const modal = document.getElementById('viewPatientModal');
        if (modal) {
            document.getElementById('viewPatientModalBody').innerHTML = content;
            modal.classList.add('show');
        }
    }
}

function closeViewPatientModal() {
    const modal = document.getElementById('viewPatientModal');
    if (modal) modal.classList.remove('show');
}

// ========== EDIT PATIENT MODAL ==========
function editPatientModal(patientId) {
    const patient = allPatients.find(p => p.patient_id === patientId);
    if (!patient) {
        showToast('Patient not found.', 'error');
        return;
    }
    
    // Populate edit form
    document.getElementById('editPatientId').value = patient.patient_id;
    document.getElementById('editLastName').value = patient.last_name || '';
    document.getElementById('editFirstName').value = patient.first_name || '';
    document.getElementById('editMiddleName').value = patient.middle_name || '';
    document.getElementById('editSuffix').value = patient.suffix || '';
    document.getElementById('editAge').value = patient.age || '';
    document.getElementById('editGender').value = patient.gender || '';
    document.getElementById('editBirthdate').value = patient.birthdate || '';
    document.getElementById('editReligion').value = patient.religion || '';
    document.getElementById('editOccupation').value = patient.occupation || '';
    document.getElementById('editAddress').value = patient.address || '';
    document.getElementById('editEmail').value = patient.email || '';
    document.getElementById('editMobileNumber').value = patient.mobile_number || '';
    document.getElementById('editBloodType').value = patient.blood_type || '';
    document.getElementById('editAllergy').value = patient.allergy || '';
    document.getElementById('editPrimaryDoctorId').value = patient.primary_doctor_id || '';
    document.getElementById('editHandledBy').value = patient.handled_by || '';
    document.getElementById('editPatientType').value = patient.patient_type || '';
    
    // Update doctor name display
    updateEditDoctorNameDisplay();
    
    // Load dropdowns
    loadStaffForDropdown();
    loadBNSAndNursesForDropdown();
    
    document.getElementById('editPatientModal').classList.add('show');
}

function closeEditPatientModal() {
    document.getElementById('editPatientModal').classList.remove('show');
}

async function updatePatient() {
    const patientId = document.getElementById('editPatientId').value;
    const lastName = document.getElementById('editLastName').value.trim();
    const firstName = document.getElementById('editFirstName').value.trim();
    const middleName = document.getElementById('editMiddleName').value.trim();
    const suffix = document.getElementById('editSuffix').value.trim();
    const age = document.getElementById('editAge').value;
    const gender = document.getElementById('editGender').value;
    const birthdate = document.getElementById('editBirthdate').value;
    const religion = document.getElementById('editReligion').value.trim();
    const occupation = document.getElementById('editOccupation').value.trim();
    const address = document.getElementById('editAddress').value.trim();
    const email = document.getElementById('editEmail').value.trim();
    const mobileNumber = document.getElementById('editMobileNumber').value.trim();
    const bloodType = document.getElementById('editBloodType').value;
    const allergy = document.getElementById('editAllergy').value.trim();
    const primaryDoctorId = document.getElementById('editPrimaryDoctorId').value;
    const handledBy = document.getElementById('editHandledBy').value;
    const patientType = document.getElementById('editPatientType').value;
    
    console.log("Updating patient - handled_by value from dropdown:", handledBy);
    
    if (!lastName || !firstName || !gender || !birthdate || !address || !patientType || !primaryDoctorId) {
        showToast('Please fill in all required fields', 'warning');
        return;
    }
    
    // Get the handled by name for display
    let handledByName = '';
    if (handledBy) {
        const staff = allBNSAndNurses.find(s => s.id.toString() === handledBy.toString());
        if (staff) {
            handledByName = staff.name;
            console.log("Found staff name:", handledByName);
        } else {
            console.log("Staff not found for ID:", handledBy);
        }
    }
    
    try {
        await db.collection('patients').doc(patientId).update({
            last_name: lastName,
            first_name: firstName,
            middle_name: middleName || '',
            suffix: suffix || '',
            age: parseInt(age),
            gender: gender,
            birthdate: birthdate,
            religion: religion || '',
            occupation: occupation || '',
            address: address,
            email: email || '',
            mobile_number: mobileNumber || '',
            blood_type: bloodType || '',
            allergy: allergy || '',
            primary_doctor_id: primaryDoctorId,
            handled_by: handledBy || null,
            handled_by_name: handledByName,
            patient_type: patientType,
            updated_at: new Date().toISOString()
        });
        
        showToast(`Patient ${firstName} ${lastName} has been updated successfully.`, 'success');
        
        // Refresh the allPatients array and reload the table
        await loadPatients();
        closeEditPatientModal();
    } catch (error) {
        console.error("Error updating patient:", error);
        showToast('An error occurred while updating patient.', 'error');
    }
}

// ========== DELETE PATIENT CONFIRMATION MODAL ==========
function showDeletePatientConfirmation(patientId, patientName) {
    let modal = document.getElementById('deletePatientConfirmModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'deletePatientConfirmModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 400px; text-align: center;">
                <div class="modal-header" style="background: #f44336;">
                    <h2 style="color: white;">⚠️ Confirm Delete</h2>
                    <button class="close-modal" onclick="closeDeletePatientModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div style="font-size: 48px; margin-bottom: 15px;">🗑️</div>
                    <p>Are you sure you want to delete patient <strong>${escapeHtml(patientName)}</strong>?</p>
                    <p style="color: #f44336; font-size: 13px;">⚠️ This action cannot be undone!</p>
                </div>
                <div class="modal-footer" style="justify-content: center;">
                    <button class="cancel-btn" onclick="closeDeletePatientModal()">Cancel</button>
                    <button class="save-btn" id="confirmDeletePatientBtn" style="background: #f44336;">Delete Permanently</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    } else {
        const modalBody = modal.querySelector('.modal-body');
        if (modalBody) {
            modalBody.innerHTML = `
                <div style="font-size: 48px; margin-bottom: 15px;">🗑️</div>
                <p>Are you sure you want to delete patient <strong>${escapeHtml(patientName)}</strong>?</p>
                <p style="color: #f44336; font-size: 13px;">⚠️ This action cannot be undone!</p>
            `;
        }
    }
    
    modal.classList.add('show');
    
    const confirmBtn = document.getElementById('confirmDeletePatientBtn');
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    newConfirmBtn.addEventListener('click', async () => {
        try {
            await db.collection('patients').doc(patientId).delete();
            showToast(`Patient ${patientName} has been deleted successfully.`, 'success');
            await loadPatients();
        } catch (error) {
            console.error("Error deleting patient:", error);
            showToast('An error occurred while deleting patient.', 'error');
        }
        closeDeletePatientModal();
    });
}

function closeDeletePatientModal() {
    const modal = document.getElementById('deletePatientConfirmModal');
    if (modal) modal.classList.remove('show');
}

// ========== TOAST NOTIFICATION ==========
function showToast(message, type = 'success') {
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        toastContainer.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 9999;
        `;
        document.body.appendChild(toastContainer);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast-notification ${type}`;
    
    let bgColor = '#4caf50';
    if (type === 'error') bgColor = '#f44336';
    if (type === 'warning') bgColor = '#ff9800';
    
    toast.style.cssText = `
        background: ${bgColor};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        margin-bottom: 10px;
        font-size: 14px;
        animation: slideIn 0.3s ease;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        min-width: 250px;
        text-align: center;
        font-family: 'Segoe UI', Arial, sans-serif;
    `;
    toast.textContent = message;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Initialize page
document.addEventListener('DOMContentLoaded', async function() {
    displayCurrentDate();
    
    // Load staff and BNS/Nurses FIRST before loading patients
    await loadStaffForDropdown();
    await loadBNSAndNursesForDropdown();
    
    // Then load patients (which needs the staff data for doctor names)
    await loadPatients();
    
    const searchInput = document.getElementById('patientSearch');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchPatients();
            }
        });
    }
});