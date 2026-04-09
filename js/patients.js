// js/patients.js
// ===== PATIENTS PAGE WITH FIREBASE =====

let allPatients = [];
let allStaff = [];

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
        if (!doctorSelect) return;
        
        doctorSelect.innerHTML = '<option value="">Loading doctors...</option>';
        allStaff = [];
        
        const snapshot = await db.collection('staff').orderBy('doctor_id').get();
        
        doctorSelect.innerHTML = '<option value="">Select Doctor ID</option>';
        
        if (snapshot.empty) {
            doctorSelect.innerHTML = '<option value="">No doctors found</option>';
            return;
        }
        
        snapshot.forEach(doc => {
            const staff = doc.data();
            allStaff.push(staff);
            const option = document.createElement('option');
            option.value = staff.doctor_id;
            option.textContent = staff.doctor_id;
            doctorSelect.appendChild(option);
        });
        
    } catch (error) {
        console.error("Error loading staff:", error);
        const doctorSelect = document.getElementById('primaryDoctorId');
        if (doctorSelect) {
            doctorSelect.innerHTML = '<option value="">Error loading doctors</option>';
        }
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

// Load patients from Firestore
async function loadPatients() {
    const tableBody = document.getElementById('patientsTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '<tr><td colspan="18" style="text-align: center;">Loading patients...<\/div>';

    try {
        const snapshot = await db.collection('patients').orderBy('patient_id').get();
        
        if (snapshot.empty) {
            tableBody.innerHTML = '<tr><td colspan="18" style="text-align: center;">No patients found. Click "+ Add Patient" to add.<\/div>';
            allPatients = [];
            return;
        }
        
        allPatients = [];
        tableBody.innerHTML = '';
        
        snapshot.forEach(doc => {
            const patient = doc.data();
            allPatients.push(patient);
            
            // Get doctor ID and doctor name separately
            const doctorIdNum = patient.primary_doctor_id || '-';
            let doctorName = '-';
            
            const doctor = allStaff.find(s => s.doctor_id.toString() === doctorIdNum.toString());
            if (doctor) {
                doctorName = `Dr. ${doctor.first_name} ${doctor.last_name}`;
            }
            
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
                <td>${patient.mobile_number || '-'}<\/div>
                <td>${patient.blood_type || '-'}<\/div>
                <td>${patient.allergy || '-'}<\/div>
                <td>${doctorIdNum}<\/div>
                <td>${doctorName}<\/div>
                <td>${patient.patient_type || '-'}<\/div>
                <td>
                    <div class="action-buttons">
                        <button class="view-btn" onclick="viewPatient('${patient.patient_id}')">View</button>
                        <button class="edit-btn" onclick="editPatient('${patient.patient_id}')">Edit</button>
                        <button class="delete-btn" onclick="deletePatient('${patient.patient_id}')">Delete</button>
                    </div>
                <\/div>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Error loading patients:", error);
        tableBody.innerHTML = '<tr><td colspan="18" style="text-align: center; color: red;">Error loading data. Please check your connection.<\/div>';
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
            <td>${patient.mobile_number || '-'}<\/div>
            <td>${patient.blood_type || '-'}<\/div>
            <td>${patient.allergy || '-'}<\/div>
            <td>${doctorIdNum}<\/div>
            <td>${doctorName}<\/div>
            <td>${patient.patient_type || '-'}<\/div>
            <td>
                <div class="action-buttons">
                    <button class="view-btn" onclick="viewPatient('${patient.patient_id}')">View</button>
                    <button class="edit-btn" onclick="editPatient('${patient.patient_id}')">Edit</button>
                    <button class="delete-btn" onclick="deletePatient('${patient.patient_id}')">Delete</button>
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
    const mobileNumber = document.getElementById('mobileNumber').value.trim();
    const bloodType = document.getElementById('bloodType').value;
    const allergy = document.getElementById('allergy').value.trim();
    const primaryDoctorId = document.getElementById('primaryDoctorId').value;
    const patientType = document.getElementById('patientType').value;
    
    if (!lastName || !firstName || (!age && age !== 0) || !gender || !birthdate || !address || !patientType || !primaryDoctorId) {
        alert('Please fill in all required fields');
        return;
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
        mobile_number: mobileNumber || '',
        blood_type: bloodType || '',
        allergy: allergy || '',
        primary_doctor_id: primaryDoctorId,
        patient_type: patientType,
        created_at: new Date().toISOString()
    };
    
    try {
        await db.collection('patients').doc(newId).set(newPatient);
        alert(`Patient ${firstName} ${lastName} saved successfully with ID: ${newId}`);
        await loadPatients();
        hideAddPatientModal();
    } catch (error) {
        console.error("Error saving patient:", error);
        alert("Error saving patient. Please try again.");
    }
}

// View patient details
function viewPatient(patientId) {
    const patient = allPatients.find(p => p.patient_id === patientId);
    if (patient) {
        let doctorName = 'N/A';
        const doctor = allStaff.find(s => s.doctor_id.toString() === patient.primary_doctor_id);
        if (doctor) {
            doctorName = `Dr. ${doctor.first_name} ${doctor.last_name} (${doctor.specialty})`;
        }
        
        alert(`PATIENT DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ID: ${patient.patient_id}
Name: ${patient.first_name} ${patient.middle_name} ${patient.last_name} ${patient.suffix}
Age: ${patient.age}
Gender: ${patient.gender}
Birthdate: ${patient.birthdate}
Religion: ${patient.religion || 'N/A'}
Occupation: ${patient.occupation || 'N/A'}
Address: ${patient.address}
Contact: ${patient.mobile_number || 'N/A'}
Blood Type: ${patient.blood_type || 'N/A'}
Allergy: ${patient.allergy || 'N/A'}
Primary Doctor: ${doctorName}
Patient Type: ${patient.patient_type}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    }
}

// Edit patient
function editPatient(patientId) {
    alert(`Edit patient feature will be implemented in the next phase.\n\nPatient ID: ${patientId}`);
}

// Delete patient from Firestore
async function deletePatient(patientId) {
    if (confirm(`Are you sure you want to delete patient ID: ${patientId}? This action cannot be undone.`)) {
        try {
            await db.collection('patients').doc(patientId).delete();
            alert(`Patient ${patientId} has been deleted successfully.`);
            await loadPatients();
        } catch (error) {
            console.error("Error deleting patient:", error);
            alert("Error deleting patient. Please try again.");
        }
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    displayCurrentDate();
    loadPatients();
    loadStaffForDropdown();
    
    const searchInput = document.getElementById('patientSearch');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchPatients();
            }
        });
    }
});