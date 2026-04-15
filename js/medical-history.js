// medical-history.js
// ===== MEDICAL HISTORY PAGE WITH FIREBASE =====

let allMedicalHistory = [];
let allPatients = [];
let allStaff = [];
let pendingStatusUpdate = null;

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
        const editPatientSelect = document.getElementById('editPatientId');
        if (!patientSelect) return;
        
        patientSelect.innerHTML = '<option value="">Loading...</option>';
        if (editPatientSelect) editPatientSelect.innerHTML = '<option value="">Loading...</option>';
        allPatients = [];
        
        const snapshot = await db.collection('patients').orderBy('patient_id').get();
        
        patientSelect.innerHTML = '<option value="">Select Patient ID</option>';
        if (editPatientSelect) editPatientSelect.innerHTML = '<option value="">Select Patient ID</option>';
        
        if (snapshot.empty) {
            patientSelect.innerHTML = '<option value="">No patients found</option>';
            if (editPatientSelect) editPatientSelect.innerHTML = '<option value="">No patients found</option>';
            return;
        }
        
        snapshot.forEach(doc => {
            const patient = doc.data();
            allPatients.push(patient);
            const option = document.createElement('option');
            option.value = patient.patient_id;
            option.textContent = patient.patient_id;
            patientSelect.appendChild(option);
            if (editPatientSelect) {
                const editOption = document.createElement('option');
                editOption.value = patient.patient_id;
                editOption.textContent = patient.patient_id;
                editPatientSelect.appendChild(editOption);
            }
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
        const editDoctorSelect = document.getElementById('editDoctorId');
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

// Update edit patient name display
function updateEditPatientNameDisplay() {
    const patientSelect = document.getElementById('editPatientId');
    const patientNameDisplay = document.getElementById('editPatientNameDisplay');
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

// Update edit doctor name display
function updateEditDoctorNameDisplay() {
    const doctorSelect = document.getElementById('editDoctorId');
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

// Format date
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// ========== UPDATE STATUS MODAL ==========
function showUpdateStatusModal(medicalId, currentStatus) {
    const newStatus = currentStatus === 'Ongoing' ? 'Resolved' : 'Ongoing';
    pendingStatusUpdate = { medicalId, newStatus };
    
    document.getElementById('currentStatusDisplay').textContent = currentStatus;
    document.getElementById('newStatusDisplay').textContent = newStatus;
    
    const modal = document.getElementById('updateStatusModal');
    if (modal) modal.classList.add('show');
    
    const confirmBtn = document.getElementById('confirmStatusUpdateBtn');
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    newConfirmBtn.addEventListener('click', async () => {
        if (pendingStatusUpdate) {
            try {
                await db.collection('medical_history').doc(pendingStatusUpdate.medicalId).update({
                    status: pendingStatusUpdate.newStatus,
                    updated_at: new Date().toISOString()
                });
                showToast(`Status updated to "${pendingStatusUpdate.newStatus}" successfully!`, 'success');
                await loadHistory();
            } catch (error) {
                console.error("Error updating status:", error);
                showToast("Error updating status. Please try again.", 'error');
            }
        }
        closeUpdateStatusModal();
    });
}

function closeUpdateStatusModal() {
    const modal = document.getElementById('updateStatusModal');
    if (modal) modal.classList.remove('show');
    pendingStatusUpdate = null;
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
            
            let patientName = record.patient_name || await getPatientNameById(record.patient_id);
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
                        <button class="view-btn" onclick="viewHistoryModal('${record.medical_id}')">View</button>
                        <button class="edit-btn" onclick="editHistoryModal('${record.medical_id}')">Edit</button>
                        <button class="status-btn" onclick="showUpdateStatusModal('${record.medical_id}', '${record.status}')">Update Status</button>
                        <button class="delete-btn" onclick="showDeleteHistoryConfirmation('${record.medical_id}', '${record.patient_id}')">Delete</button>
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
                    <button class="view-btn" onclick="viewHistoryModal('${record.medical_id}')">View</button>
                    <button class="edit-btn" onclick="editHistoryModal('${record.medical_id}')">Edit</button>
                    <button class="status-btn" onclick="showUpdateStatusModal('${record.medical_id}', '${record.status}')">Update Status</button>
                    <button class="delete-btn" onclick="showDeleteHistoryConfirmation('${record.medical_id}', '${record.patient_id}')">Delete</button>
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
        showToast('Please fill in all required fields', 'warning');
        return;
    }
    
    const medicalId = `${patientId}_${condition}_${Date.now()}`;
    
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
        showToast(`Medical history for Patient ${patientId} saved successfully!`, 'success');
        await loadHistory();
        hideAddHistoryModal();
    } catch (error) {
        console.error("Error saving medical history:", error);
        showToast("Error saving medical history. Please try again.", 'error');
    }
}

// ========== VIEW HISTORY MODAL ==========
function viewHistoryModal(medicalId) {
    const record = allMedicalHistory.find(r => r.medical_id === medicalId);
    if (record) {
        const statusBadge = record.status === 'Ongoing' 
            ? '<span class="status-ongoing">Ongoing</span>' 
            : '<span class="status-resolved">Resolved</span>';
        
        const content = `
            <div style="line-height: 1.8; font-family: 'Segoe UI', Arial, sans-serif;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; width: 35%; font-weight: 600; color: #2B6896;">Patient ID:<\/td><td style="padding: 8px 0;">${record.patient_id}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Patient Name:<\/td><td style="padding: 8px 0;">${record.patient_name || '-'}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Doctor ID:<\/td><td style="padding: 8px 0;">${record.doctor_id}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Doctor Name:<\/td><td style="padding: 8px 0;">${record.doctor_name || '-'}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Condition:<\/td><td style="padding: 8px 0;"><strong>${record.condition}<\/strong><\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Diagnosis Date:<\/td><td style="padding: 8px 0;">${formatDate(record.diagnosis_date)}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Status:<\/td><td style="padding: 8px 0;">${statusBadge}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Treatment Notes:<\/td><td style="padding: 8px 0;">${record.treatment_notes || 'N/A'}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Remarks:<\/td><td style="padding: 8px 0;">${record.remarks || 'N/A'}<\/td><\/tr>
                </table>
            </div>
        `;
        
        const modal = document.getElementById('viewHistoryModal');
        if (modal) {
            document.getElementById('viewHistoryModalBody').innerHTML = content;
            modal.classList.add('show');
        }
    }
}

function closeViewHistoryModal() {
    const modal = document.getElementById('viewHistoryModal');
    if (modal) modal.classList.remove('show');
}

// ========== EDIT HISTORY MODAL ==========
// ========== EDIT HISTORY MODAL ==========
function editHistoryModal(medicalId) {
    const record = allMedicalHistory.find(r => r.medical_id === medicalId);
    if (!record) {
        showToast('Medical history record not found.', 'error');
        return;
    }
    
    console.log("Editing record:", record); // Debug log
    
    document.getElementById('editMedicalId').value = record.medical_id;
    
    // Patient ID - READ ONLY text input
    const editPatientIdField = document.getElementById('editPatientId');
    if (editPatientIdField) {
        editPatientIdField.value = record.patient_id;
    }
    
    // Doctor ID - READ ONLY text input
    const editDoctorIdField = document.getElementById('editDoctorId');
    if (editDoctorIdField) {
        editDoctorIdField.value = record.doctor_id;
    }
    
    // Patient Name - display only
    const editPatientNameDisplay = document.getElementById('editPatientNameDisplay');
    if (editPatientNameDisplay) {
        editPatientNameDisplay.value = record.patient_name || '';
    }
    
    // Doctor Name - display only
    const editDoctorNameDisplay = document.getElementById('editDoctorNameDisplay');
    if (editDoctorNameDisplay) {
        editDoctorNameDisplay.value = record.doctor_name || '';
    }
    
    // Set all other fields
    document.getElementById('editCondition').value = record.condition || '';
    document.getElementById('editDiagnosisDate').value = record.diagnosis_date || '';
    document.getElementById('editStatus').value = record.status || '';
    document.getElementById('editTreatmentNotes').value = record.treatment_notes || '';
    document.getElementById('editRemarks').value = record.remarks || '';
    
    document.getElementById('editHistoryModal').classList.add('show');
}

function closeEditHistoryModal() {
    document.getElementById('editHistoryModal').classList.remove('show');
}

async function updateHistory() {
    const medicalId = document.getElementById('editMedicalId').value;
    const patientId = document.getElementById('editPatientId').value;
    const doctorId = document.getElementById('editDoctorId').value;
    const condition = document.getElementById('editCondition').value.trim();
    const diagnosisDate = document.getElementById('editDiagnosisDate').value;
    const status = document.getElementById('editStatus').value;
    const treatmentNotes = document.getElementById('editTreatmentNotes').value.trim();
    const remarks = document.getElementById('editRemarks').value.trim();
    
    if (!patientId || !doctorId || !condition || !status) {
        showToast('Please fill in all required fields', 'warning');
        return;
    }
    
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
    
    let doctorName = '';
    const doctor = allStaff.find(s => s.doctor_id.toString() === doctorId);
    if (doctor) {
        doctorName = `Dr. ${doctor.first_name} ${doctor.last_name}`;
    } else {
        try {
            const snapshot = await db.collection('staff').where('doctor_id', '==', parseInt(doctorId)).get();
            if (!snapshot.empty) {
                const doctorData = snapshot.docs[0].data();
                doctorName = `Dr. ${doctorData.first_name} ${doctorData.last_name}`;
            }
        } catch (error) {
            console.error("Error fetching doctor:", error);
        }
    }
    
    try {
        await db.collection('medical_history').doc(medicalId).update({
            patient_id: patientId,
            patient_name: patientName,
            doctor_id: doctorId,
            doctor_name: doctorName,
            condition: condition,
            diagnosis_date: diagnosisDate || null,
            status: status,
            treatment_notes: treatmentNotes || null,
            remarks: remarks || null,
            updated_at: new Date().toISOString()
        });
        
        showToast(`Medical history record updated successfully!`, 'success');
        await loadHistory();
        closeEditHistoryModal();
    } catch (error) {
        console.error("Error updating medical history:", error);
        showToast("Error updating medical history. Please try again.", 'error');
    }
}

function closeEditHistoryModal() {
    document.getElementById('editHistoryModal').classList.remove('show');
}

async function updateHistory() {
    const medicalId = document.getElementById('editMedicalId').value;
    const patientId = document.getElementById('editPatientId').value;
    const doctorId = document.getElementById('editDoctorId').value;
    const condition = document.getElementById('editCondition').value.trim();
    const diagnosisDate = document.getElementById('editDiagnosisDate').value;
    const status = document.getElementById('editStatus').value;
    const treatmentNotes = document.getElementById('editTreatmentNotes').value.trim();
    const remarks = document.getElementById('editRemarks').value.trim();
    
    if (!patientId || !doctorId || !condition || !status) {
        showToast('Please fill in all required fields', 'warning');
        return;
    }
    
    let patientName = '';
    const patient = allPatients.find(p => p.patient_id === patientId);
    if (patient) {
        patientName = `${patient.first_name} ${patient.last_name}`;
    }
    
    let doctorName = '';
    const doctor = allStaff.find(s => s.doctor_id.toString() === doctorId);
    if (doctor) {
        doctorName = `Dr. ${doctor.first_name} ${doctor.last_name}`;
    }
    
    try {
        await db.collection('medical_history').doc(medicalId).update({
            patient_id: patientId,
            patient_name: patientName,
            doctor_id: doctorId,
            doctor_name: doctorName,
            condition: condition,
            diagnosis_date: diagnosisDate || null,
            status: status,
            treatment_notes: treatmentNotes || null,
            remarks: remarks || null,
            updated_at: new Date().toISOString()
        });
        
        showToast(`Medical history record updated successfully!`, 'success');
        await loadHistory();
        closeEditHistoryModal();
    } catch (error) {
        console.error("Error updating medical history:", error);
        showToast("Error updating medical history. Please try again.", 'error');
    }
}

// ========== DELETE HISTORY CONFIRMATION MODAL ==========
function showDeleteHistoryConfirmation(medicalId, patientId) {
    let modal = document.getElementById('deleteHistoryConfirmModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'deleteHistoryConfirmModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 400px; text-align: center;">
                <div class="modal-header" style="background: #f44336;">
                    <h2 style="color: white;">⚠️ Confirm Delete</h2>
                    <button class="close-modal" onclick="closeDeleteHistoryModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div style="font-size: 48px; margin-bottom: 15px;">🗑️</div>
                    <p>Are you sure you want to delete this medical history record?</p>
                    <p><strong>Patient ID: ${escapeHtml(patientId)}</strong></p>
                    <p style="color: #f44336; font-size: 13px;">⚠️ This action cannot be undone!</p>
                </div>
                <div class="modal-footer" style="justify-content: center;">
                    <button class="cancel-btn" onclick="closeDeleteHistoryModal()">Cancel</button>
                    <button class="save-btn" id="confirmDeleteHistoryBtn" style="background: #f44336;">Delete Permanently</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    } else {
        const modalBody = modal.querySelector('.modal-body');
        if (modalBody) {
            modalBody.innerHTML = `
                <div style="font-size: 48px; margin-bottom: 15px;">🗑️</div>
                <p>Are you sure you want to delete this medical history record?</p>
                <p><strong>Patient ID: ${escapeHtml(patientId)}</strong></p>
                <p style="color: #f44336; font-size: 13px;">⚠️ This action cannot be undone!</p>
            `;
        }
    }
    
    modal.classList.add('show');
    
    const confirmBtn = document.getElementById('confirmDeleteHistoryBtn');
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    newConfirmBtn.addEventListener('click', async () => {
        try {
            await db.collection('medical_history').doc(medicalId).delete();
            showToast(`Medical history record deleted successfully.`, 'success');
            await loadHistory();
        } catch (error) {
            console.error("Error deleting medical history:", error);
            showToast("Error deleting medical history. Please try again.", 'error');
        }
        closeDeleteHistoryModal();
    });
}

function closeDeleteHistoryModal() {
    const modal = document.getElementById('deleteHistoryConfirmModal');
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