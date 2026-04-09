// medical-history.js
// ===== MEDICAL HISTORY PAGE WITH FIREBASE =====

let allMedicalHistory = [];
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

// Load ALL patients for dropdown
async function loadPatientsForDropdown() {
    try {
        const patientSelect = document.getElementById('patientId');
        if (!patientSelect) return;
        
        patientSelect.innerHTML = '<option value="">Loading...</option>';
        allPatients = [];
        
        const snapshot = await db.collection('patients').orderBy('patient_id').get();
        
        patientSelect.innerHTML = '<option value="">Select Patient ID</option>';
        
        if (snapshot.empty) {
            patientSelect.innerHTML = '<option value="">No patients found</option>';
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
    let patient = allPatients.find(p => p.patient_id === patientId);
    if (patient) {
        return `${patient.first_name} ${patient.last_name}`;
    }
    try {
        const doc = await db.collection('patients').doc(patientId).get();
        if (doc.exists) {
            const patientData = doc.data();
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
    let doctor = allStaff.find(s => s.doctor_id.toString() === doctorId);
    if (doctor) {
        return `Dr. ${doctor.first_name} ${doctor.last_name}`;
    }
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

// Format date
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Update status in Firestore
async function updateStatus(medicalId, currentStatus) {
    const newStatus = currentStatus === 'Ongoing' ? 'Resolved' : 'Ongoing';
    
    if (confirm(`Change status from "${currentStatus}" to "${newStatus}"?`)) {
        try {
            await db.collection('medical_history').doc(medicalId).update({
                status: newStatus,
                updated_at: new Date().toISOString()
            });
            alert(`Status updated to "${newStatus}" successfully!`);
            await loadHistory();
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Error updating status. Please try again.");
        }
    }
}

// Load medical history from Firestore
async function loadHistory() {
    const tableBody = document.getElementById('historyTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '<td><td colspan="10" style="text-align: center;">Loading medical history...<\/div>';

    try {
        const snapshot = await db.collection('medical_history').orderBy('diagnosis_date', 'desc').get();
        
        if (snapshot.empty) {
            tableBody.innerHTML = '<td><td colspan="10" style="text-align: center;">No medical history found. Click "+ Add History" to add.<\/div>';
            allMedicalHistory = [];
            return;
        }
        
        allMedicalHistory = [];
        tableBody.innerHTML = '';
        
        for (const doc of snapshot.docs) {
            const record = doc.data();
            allMedicalHistory.push(record);
            
            // Get patient name
            let patientName = record.patient_name || await getPatientNameById(record.patient_id);
            
            // Get doctor name
            let doctorIdNum = record.doctor_id || '-';
            let doctorName = record.doctor_name || await getDoctorNameById(doctorIdNum);
            
            const statusBadge = record.status === 'Ongoing' 
                ? '<span class="status-ongoing">Ongoing</span>' 
                : '<span class="status-resolved">Resolved</span>';
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${record.patient_id || '-'}<\/div>
                <td>${patientName}<\/div>
                <td>${doctorIdNum}<\/div>
                <td>${doctorName}<\/div>
                <td><strong>${record.condition || '-'}</strong><\/div>
                <td>${formatDate(record.diagnosis_date)}<\/div>
                <td>${statusBadge}<\/div>
                <td>${record.treatment_notes || '-'}<\/div>
                <td>${record.remarks || '-'}<\/div>
                <td>
                    <div class="action-buttons">
                        <button class="view-btn" onclick="viewHistory('${record.medical_id}')">View</button>
                        <button class="edit-btn" onclick="editHistory('${record.medical_id}')">Edit</button>
                        <button class="status-btn" onclick="updateStatus('${record.medical_id}', '${record.status}')">Update Status</button>
                        <button class="delete-btn" onclick="deleteHistory('${record.medical_id}')">Delete</button>
                    </div>
                <\/div>
            `;
            tableBody.appendChild(row);
        }
    } catch (error) {
        console.error("Error loading medical history:", error);
        tableBody.innerHTML = '<td><td colspan="10" style="text-align: center; color: red;">Error loading data. Please check your connection.<\/div>';
    }
}

// Search history
function searchHistory() {
    const searchTerm = document.getElementById('historySearch').value.toLowerCase();
    const filteredHistory = allMedicalHistory.filter(record => 
        record.patient_id.toLowerCase().includes(searchTerm) ||
        (record.condition && record.condition.toLowerCase().includes(searchTerm)) ||
        (record.doctor_id && record.doctor_id.toString().toLowerCase().includes(searchTerm)) ||
        (record.treatment_notes && record.treatment_notes.toLowerCase().includes(searchTerm)) ||
        (record.remarks && record.remarks.toLowerCase().includes(searchTerm))
    );
    displayFilteredHistory(filteredHistory);
}

// Sort history
function sortHistory() {
    const sortBy = document.getElementById('sortBy').value;
    const sortedHistory = [...allMedicalHistory].sort((a, b) => {
        let valA = a[sortBy] || '';
        let valB = b[sortBy] || '';
        
        if (sortBy === 'diagnosis_date') {
            return new Date(valA) - new Date(valB);
        }
        if (sortBy === 'patient_id') {
            return String(valA).localeCompare(String(valB));
        }
        if (sortBy === 'doctor_id') {
            return (parseInt(valA) || 0) - (parseInt(valB) || 0);
        }
        return String(valA).localeCompare(String(valB));
    });
    displayFilteredHistory(sortedHistory);
}

// Display filtered/sorted history
function displayFilteredHistory(historyList) {
    const tableBody = document.getElementById('historyTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    historyList.forEach(record => {
        let patientName = record.patient_name || '-';
        let doctorIdNum = record.doctor_id || '-';
        let doctorName = record.doctor_name || '-';
        
        const statusBadge = record.status === 'Ongoing' 
            ? '<span class="status-ongoing">Ongoing</span>' 
            : '<span class="status-resolved">Resolved</span>';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${record.patient_id || '-'}<\/div>
            <td>${patientName}<\/div>
            <td>${doctorIdNum}<\/div>
            <td>${doctorName}<\/div>
            <td><strong>${record.condition || '-'}</strong><\/div>
            <td>${formatDate(record.diagnosis_date)}<\/div>
            <td>${statusBadge}<\/div>
            <td>${record.treatment_notes || '-'}<\/div>
            <td>${record.remarks || '-'}<\/div>
            <td>
                <div class="action-buttons">
                    <button class="view-btn" onclick="viewHistory('${record.medical_id}')">View</button>
                    <button class="edit-btn" onclick="editHistory('${record.medical_id}')">Edit</button>
                    <button class="status-btn" onclick="updateStatus('${record.medical_id}', '${record.status}')">Update Status</button>
                    <button class="delete-btn" onclick="deleteHistory('${record.medical_id}')">Delete</button>
                </div>
            <\/div>
        `;
        tableBody.appendChild(row);
    });
}

// Show add history modal
function showAddHistoryModal() {
    document.getElementById('addHistoryModal').classList.add('show');
    loadPatientsForDropdown();
    loadStaffForDropdown();
}

// Hide add history modal
function hideAddHistoryModal() {
    document.getElementById('addHistoryModal').classList.remove('show');
    clearHistoryForm();
}

// Clear history form
function clearHistoryForm() {
    document.getElementById('historyForm').reset();
    document.getElementById('patientNameDisplay').value = '';
    document.getElementById('doctorNameDisplay').value = '';
}

// Save new medical history to Firestore
async function saveHistory() {
    const patientId = document.getElementById('patientId').value;
    const doctorId = document.getElementById('doctorId').value;
    const condition = document.getElementById('condition').value.trim();
    const diagnosisDate = document.getElementById('diagnosisDate').value;
    const status = document.getElementById('status').value;
    const treatmentNotes = document.getElementById('treatmentNotes').value.trim();
    const remarks = document.getElementById('remarks').value.trim();
    
    if (!patientId || !doctorId || !condition || !status) {
        alert('Please fill in all required fields');
        return;
    }
    
    const medicalId = `${patientId}_${condition}_${Date.now()}`;
    
    // Get patient name
    let patientName = '';
    const patient = allPatients.find(p => p.patient_id === patientId);
    if (patient) {
        patientName = `${patient.first_name} ${patient.last_name}`;
    } else {
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
    
    const newHistory = {
        medical_id: medicalId,
        patient_id: patientId,
        patient_name: patientName,
        doctor_id: doctorId,
        doctor_name: doctorName,
        condition: condition,
        diagnosis_date: diagnosisDate || null,
        status: status,
        treatment_notes: treatmentNotes || null,
        remarks: remarks || null,
        created_at: new Date().toISOString()
    };
    
    try {
        await db.collection('medical_history').doc(medicalId).set(newHistory);
        alert(`Medical history for Patient ${patientId} saved successfully!`);
        await loadHistory();
        hideAddHistoryModal();
    } catch (error) {
        console.error("Error saving medical history:", error);
        alert("Error saving medical history. Please try again.");
    }
}

// View history
function viewHistory(medicalId) {
    const record = allMedicalHistory.find(r => r.medical_id === medicalId);
    if (record) {
        alert(`MEDICAL HISTORY DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Patient ID: ${record.patient_id}
Doctor ID: ${record.doctor_id}
Condition: ${record.condition}
Diagnosis Date: ${formatDate(record.diagnosis_date)}
Status: ${record.status}
Treatment Notes: ${record.treatment_notes || 'N/A'}
Remarks: ${record.remarks || 'N/A'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    }
}

// Edit history
function editHistory(medicalId) {
    alert(`Edit medical history\n\nThis feature will be implemented in the next phase.`);
}

// Delete history from Firestore
async function deleteHistory(medicalId) {
    if (confirm(`Delete this medical history record?`)) {
        try {
            await db.collection('medical_history').doc(medicalId).delete();
            alert(`Medical history deleted successfully.`);
            await loadHistory();
        } catch (error) {
            console.error("Error deleting medical history:", error);
            alert("Error deleting medical history. Please try again.");
        }
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    displayCurrentDate();
    loadHistory();
    
    const searchInput = document.getElementById('historySearch');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchHistory();
            }
        });
    }
});