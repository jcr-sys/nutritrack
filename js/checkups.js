// checkups.js
// ===== PREGNANCY CHECKUPS PAGE WITH FIREBASE =====

let allCheckups = [];
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

// Load ALL PREGNANT patients for dropdown and name lookup
async function loadPatientsForDropdown() {
    try {
        const patientSelect = document.getElementById('patientId');
        if (!patientSelect) return;
        
        patientSelect.innerHTML = '<option value="">Loading...</option>';
        allPatients = [];
        
        const snapshot = await db.collection('patients').where('patient_type', '==', 'Pregnant').get();
        
        patientSelect.innerHTML = '<option value="">Select Patient ID</option>';
        
        if (snapshot.empty) {
            patientSelect.innerHTML = '<option value="">No pregnant patients found</option>';
            return;
        }
        
        snapshot.forEach(doc => {
            const patient = doc.data();
            allPatients.push(patient);
            const option = document.createElement('option');
            option.value = patient.patient_id;
            option.textContent = patient.patient_id;
            patientSelect.appendChild(option);
        });
        
    } catch (error) {
        console.error("Error loading patients:", error);
        const patientSelect = document.getElementById('patientId');
        if (patientSelect) {
            patientSelect.innerHTML = '<option value="">Error loading patients</option>';
        }
    }
}

// Load staff for doctor dropdown
async function loadStaffForDropdown() {
    try {
        const doctorSelect = document.getElementById('doctorId');
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
        const doctorSelect = document.getElementById('doctorId');
        if (doctorSelect) {
            doctorSelect.innerHTML = '<option value="">Error loading doctors</option>';
        }
    }
}

// Helper function to get patient name by ID
async function getPatientNameById(patientId) {
    // First check if already in allPatients array
    let patient = allPatients.find(p => p.patient_id === patientId);
    if (patient) {
        return `${patient.first_name} ${patient.last_name}`;
    }
    
    // If not, fetch from Firebase
    try {
        const doc = await db.collection('patients').doc(patientId).get();
        if (doc.exists) {
            const patientData = doc.data();
            // Add to allPatients for future use
            allPatients.push(patientData);
            return `${patientData.first_name} ${patientData.last_name}`;
        }
    } catch (error) {
        console.error("Error fetching patient name:", error);
    }
    return '-';
}

// Helper function to get doctor name by ID
async function getDoctorNameById(doctorId) {
    // First check if already in allStaff array
    let doctor = allStaff.find(s => s.doctor_id.toString() === doctorId);
    if (doctor) {
        return `Dr. ${doctor.first_name} ${doctor.last_name}`;
    }
    
    // If not, fetch from Firebase
    try {
        const snapshot = await db.collection('staff').where('doctor_id', '==', parseInt(doctorId)).get();
        if (!snapshot.empty) {
            const doctorData = snapshot.docs[0].data();
            allStaff.push(doctorData);
            return `Dr. ${doctorData.first_name} ${doctorData.last_name}`;
        }
    } catch (error) {
        console.error("Error fetching doctor name:", error);
    }
    return '-';
}

// Update patient name display when patient selected
function updatePatientNameDisplay() {
    const patientSelect = document.getElementById('patientId');
    const patientNameDisplay = document.getElementById('patientNameDisplay');
    const selectedValue = patientSelect.value;
    
    if (selectedValue && allPatients.length > 0) {
        const patient = allPatients.find(p => p.patient_id === selectedValue);
        if (patient) {
            patientNameDisplay.value = `${patient.first_name} ${patient.last_name}`;
        } else {
            patientNameDisplay.value = '';
        }
    } else {
        patientNameDisplay.value = '';
    }
}

// Update doctor name display when doctor selected
function updateDoctorNameDisplay() {
    const doctorSelect = document.getElementById('doctorId');
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

// Update status in Firestore
async function updateStatus(checkupId, currentStatus) {
    const newStatus = currentStatus === 'Scheduled' ? 'Completed' : 'Scheduled';
    
    if (confirm(`Change status from "${currentStatus}" to "${newStatus}"?`)) {
        try {
            await db.collection('pregnancy_checkups').doc(checkupId).update({
                status: newStatus,
                updated_at: new Date().toISOString()
            });
            alert(`Status updated to "${newStatus}" successfully!`);
            await loadCheckups();
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Error updating status. Please try again.");
        }
    }
}

// Get status badge class
function getStatusBadgeClass(status) {
    if (status === 'Scheduled') {
        return 'status-scheduled-checkup';
    } else if (status === 'Completed') {
        return 'status-completed-checkup';
    }
    return '';
}

// Load checkups from Firestore
async function loadCheckups() {
    const tableBody = document.getElementById('checkupsTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '<tr><td colspan="15" style="text-align: center;">Loading checkups...<\/div>';

    try {
        const snapshot = await db.collection('pregnancy_checkups').orderBy('checkup_date', 'desc').get();
        
        if (snapshot.empty) {
            tableBody.innerHTML = '<tr><td colspan="15" style="text-align: center;">No checkups found. Click "+ Add Checkup" to add.<\/div>';
            allCheckups = [];
            return;
        }
        
        allCheckups = [];
        tableBody.innerHTML = '';
        
        for (const doc of snapshot.docs) {
            const checkup = doc.data();
            allCheckups.push(checkup);
            
            // Set default status if not exists
            if (!checkup.status) {
                checkup.status = 'Scheduled';
            }
            
            // Get patient name - fetch directly from Firebase if needed
            let patientName = checkup.patient_name || await getPatientNameById(checkup.patient_id);
            
            // Get doctor name
            let doctorIdNum = checkup.doctor_id || '-';
            let doctorName = checkup.doctor_name || await getDoctorNameById(doctorIdNum);
            
            const statusBadgeClass = getStatusBadgeClass(checkup.status);
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${checkup.patient_id || '-'}<\/div>
                <td>${patientName}<\/div>
                <td>${doctorIdNum}<\/div>
                <td>${doctorName}<\/div>
                <td>${checkup.checkup_date || '-'}<\/div>
                <td>${checkup.trimester || '-'}<\/div>
                <td>${checkup.gestational_age || '-'} weeks<\/div>
                <td>${checkup.blood_pressure || '-'}<\/div>
                <td>${checkup.weight ? checkup.weight + ' kg' : '-'}<\/div>
                <td>${checkup.ultrasound_result || '-'}<\/div>
                <td>${checkup.blood_test_result || '-'}<\/div>
                <td>${checkup.doctor_notes || '-'}<\/div>
                <td>${checkup.next_checkup_date || '-'}<\/div>
                <td><span class="status-badge-checkup ${statusBadgeClass}">${checkup.status}</span><\/div>
                <td>
                    <div class="action-buttons">
                        <button class="view-btn" onclick="viewCheckup('${checkup.checkup_id}')">View</button>
                        <button class="edit-btn" onclick="editCheckup('${checkup.checkup_id}')">Edit</button>
                        <button class="status-btn" onclick="updateStatus('${checkup.checkup_id}', '${checkup.status}')">Update Status</button>
                        <button class="delete-btn" onclick="deleteCheckup('${checkup.checkup_id}')">Delete</button>
                    </div>
                <\/div>
            `;
            tableBody.appendChild(row);
        }
    } catch (error) {
        console.error("Error loading checkups:", error);
        tableBody.innerHTML = '<tr><td colspan="15" style="text-align: center; color: red;">Error loading data. Please check your connection.<\/div>';
    }
}

// Search checkups
function searchCheckups() {
    const searchTerm = document.getElementById('checkupSearch').value.toLowerCase();
    const filteredCheckups = allCheckups.filter(checkup => 
        checkup.patient_id.toLowerCase().includes(searchTerm) ||
        (checkup.doctor_id && checkup.doctor_id.toString().toLowerCase().includes(searchTerm)) ||
        (checkup.blood_pressure && checkup.blood_pressure.toLowerCase().includes(searchTerm)) ||
        (checkup.status && checkup.status.toLowerCase().includes(searchTerm))
    );
    displayFilteredCheckups(filteredCheckups);
}

// Sort checkups
function sortCheckups() {
    const sortBy = document.getElementById('sortBy').value;
    const sortedCheckups = [...allCheckups].sort((a, b) => {
        let valA = a[sortBy] || '';
        let valB = b[sortBy] || '';
        
        if (sortBy === 'gestational_age' || sortBy === 'trimester') {
            return (parseInt(valA) || 0) - (parseInt(valB) || 0);
        }
        if (sortBy === 'checkup_date') {
            return new Date(valA) - new Date(valB);
        }
        if (sortBy === 'doctor_id') {
            return (parseInt(valA) || 0) - (parseInt(valB) || 0);
        }
        return String(valA).localeCompare(String(valB));
    });
    displayFilteredCheckups(sortedCheckups);
}

// Display filtered/sorted checkups
function displayFilteredCheckups(checkupList) {
    const tableBody = document.getElementById('checkupsTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    checkupList.forEach(checkup => {
        let patientName = checkup.patient_name || '-';
        let doctorIdNum = checkup.doctor_id || '-';
        let doctorName = checkup.doctor_name || '-';
        
        const statusBadgeClass = getStatusBadgeClass(checkup.status);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${checkup.patient_id || '-'}<\/div>
            <td>${patientName}<\/div>
            <td>${doctorIdNum}<\/div>
            <td>${doctorName}<\/div>
            <td>${checkup.checkup_date || '-'}<\/div>
            <td>${checkup.trimester || '-'}<\/div>
            <td>${checkup.gestational_age || '-'} weeks<\/div>
            <td>${checkup.blood_pressure || '-'}<\/div>
            <td>${checkup.weight ? checkup.weight + ' kg' : '-'}<\/div>
            <td>${checkup.ultrasound_result || '-'}<\/div>
            <td>${checkup.blood_test_result || '-'}<\/div>
            <td>${checkup.doctor_notes || '-'}<\/div>
            <td>${checkup.next_checkup_date || '-'}<\/div>
            <td><span class="status-badge-checkup ${statusBadgeClass}">${checkup.status}</span><\/div>
            <td>
                <div class="action-buttons">
                    <button class="view-btn" onclick="viewCheckup('${checkup.checkup_id}')">View</button>
                    <button class="edit-btn" onclick="editCheckup('${checkup.checkup_id}')">Edit</button>
                    <button class="status-btn" onclick="updateStatus('${checkup.checkup_id}', '${checkup.status}')">Update Status</button>
                    <button class="delete-btn" onclick="deleteCheckup('${checkup.checkup_id}')">Delete</button>
                </div>
            <\/div>
        `;
        tableBody.appendChild(row);
    });
}

// Show add checkup modal
function showAddCheckupModal() {
    document.getElementById('addCheckupModal').classList.add('show');
    loadPatientsForDropdown();
    loadStaffForDropdown();
}

// Hide add checkup modal
function hideAddCheckupModal() {
    document.getElementById('addCheckupModal').classList.remove('show');
    clearCheckupForm();
}

// Clear checkup form
function clearCheckupForm() {
    document.getElementById('checkupForm').reset();
    document.getElementById('patientNameDisplay').value = '';
    document.getElementById('doctorNameDisplay').value = '';
}

// Save new checkup to Firestore
async function saveCheckup() {
    const patientId = document.getElementById('patientId').value;
    const doctorId = document.getElementById('doctorId').value;
    const checkupDate = document.getElementById('checkupDate').value;
    const trimester = document.getElementById('trimester').value;
    const gestationalAge = document.getElementById('gestationalAge').value;
    const bloodPressure = document.getElementById('bloodPressure').value.trim();
    const weight = document.getElementById('weight').value;
    const ultrasoundResult = document.getElementById('ultrasoundResult').value.trim();
    const bloodTestResult = document.getElementById('bloodTestResult').value.trim();
    const doctorNotes = document.getElementById('doctorNotes').value.trim();
    const nextCheckupDate = document.getElementById('nextCheckupDate').value;
    
    if (!patientId || !doctorId || !checkupDate || !trimester || !gestationalAge) {
        alert('Please fill in all required fields');
        return;
    }
    
    const checkupId = `${patientId}_${checkupDate}_${Date.now()}`;
    
    // Get patient name
    let patientName = '';
    const patient = allPatients.find(p => p.patient_id === patientId);
    if (patient) {
        patientName = `${patient.first_name} ${patient.last_name}`;
    } else {
        // Fetch from Firebase if not in array
        try {
            const doc = await db.collection('patients').doc(patientId).get();
            if (doc.exists) {
                const patientData = doc.data();
                patientName = `${patientData.first_name} ${patientData.last_name}`;
            }
        } catch (error) {
            console.error("Error fetching patient:", error);
        }
    }
    
    // Get doctor name
    let doctorName = '';
    const doctor = allStaff.find(s => s.doctor_id.toString() === doctorId);
    if (doctor) {
        doctorName = `Dr. ${doctor.first_name} ${doctor.last_name}`;
    }
    
    const newCheckup = {
        checkup_id: checkupId,
        patient_id: patientId,
        patient_name: patientName,
        doctor_id: doctorId,
        doctor_name: doctorName,
        checkup_date: checkupDate,
        trimester: parseInt(trimester),
        gestational_age: parseInt(gestationalAge),
        blood_pressure: bloodPressure || null,
        weight: weight ? parseFloat(weight) : null,
        ultrasound_result: ultrasoundResult || null,
        blood_test_result: bloodTestResult || null,
        doctor_notes: doctorNotes || null,
        next_checkup_date: nextCheckupDate || null,
        status: 'Scheduled',
        created_at: new Date().toISOString()
    };
    
    try {
        await db.collection('pregnancy_checkups').doc(checkupId).set(newCheckup);
        alert(`Pregnancy checkup for Patient ${patientId} saved successfully!`);
        await loadCheckups();
        hideAddCheckupModal();
    } catch (error) {
        console.error("Error saving checkup:", error);
        alert("Error saving checkup. Please try again.");
    }
}

// View checkup
function viewCheckup(checkupId) {
    const checkup = allCheckups.find(c => c.checkup_id === checkupId);
    if (checkup) {
        alert(`PREGNANCY CHECKUP DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Patient ID: ${checkup.patient_id}
Doctor ID: ${checkup.doctor_id}
Checkup Date: ${checkup.checkup_date}
Trimester: ${checkup.trimester}
Gestational Age: ${checkup.gestational_age} weeks
Blood Pressure: ${checkup.blood_pressure || 'N/A'}
Weight: ${checkup.weight ? checkup.weight + ' kg' : 'N/A'}
Ultrasound Result: ${checkup.ultrasound_result || 'N/A'}
Blood Test Result: ${checkup.blood_test_result || 'N/A'}
Doctor Notes: ${checkup.doctor_notes || 'N/A'}
Next Checkup: ${checkup.next_checkup_date || 'N/A'}
Status: ${checkup.status || 'Scheduled'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    }
}

// Edit checkup
function editCheckup(checkupId) {
    alert(`Edit checkup\n\nThis feature will be implemented in the next phase.`);
}

// Delete checkup
async function deleteCheckup(checkupId) {
    if (confirm(`Delete this checkup record?`)) {
        try {
            await db.collection('pregnancy_checkups').doc(checkupId).delete();
            alert(`Checkup deleted successfully.`);
            await loadCheckups();
        } catch (error) {
            console.error("Error deleting checkup:", error);
            alert("Error deleting checkup. Please try again.");
        }
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    displayCurrentDate();
    loadCheckups();
    
    const searchInput = document.getElementById('checkupSearch');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchCheckups();
            }
        });
    }
});