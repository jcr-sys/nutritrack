// checkups.js
// ===== PREGNANCY CHECKUPS PAGE WITH FIREBASE =====

let allCheckups = [];
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

// Load ALL PREGNANT patients for dropdown and name lookup
async function loadPatientsForDropdown() {
    try {
        const patientSelect = document.getElementById('patientId');
        const editPatientSelect = document.getElementById('editPatientId');
        if (!patientSelect) return;
        
        patientSelect.innerHTML = '<option value="">Loading...</option>';
        if (editPatientSelect) editPatientSelect.innerHTML = '<option value="">Loading...</option>';
        allPatients = [];
        
        const snapshot = await db.collection('patients').where('patient_type', '==', 'Pregnant').get();
        
        patientSelect.innerHTML = '<option value="">Select Patient ID</option>';
        if (editPatientSelect) editPatientSelect.innerHTML = '<option value="">Select Patient ID</option>';
        
        if (snapshot.empty) {
            patientSelect.innerHTML = '<option value="">No pregnant patients found</option>';
            if (editPatientSelect) editPatientSelect.innerHTML = '<option value="">No pregnant patients found</option>';
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

// Get status badge class
function getStatusBadgeClass(status) {
    if (status === 'Scheduled') {
        return 'status-scheduled-checkup';
    } else if (status === 'Completed') {
        return 'status-completed-checkup';
    }
    return '';
}

// ========== UPDATE STATUS MODAL ==========
function showUpdateStatusModal(checkupId, currentStatus) {
    const newStatus = currentStatus === 'Scheduled' ? 'Completed' : 'Scheduled';
    pendingStatusUpdate = { checkupId, newStatus };
    
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
                await db.collection('pregnancy_checkups').doc(pendingStatusUpdate.checkupId).update({
                    status: pendingStatusUpdate.newStatus,
                    updated_at: new Date().toISOString()
                });
                showToast(`Status updated to "${pendingStatusUpdate.newStatus}" successfully!`, 'success');
                await loadCheckups();
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
            
            if (!checkup.status) {
                checkup.status = 'Scheduled';
            }
            
            let patientName = checkup.patient_name || await getPatientNameById(checkup.patient_id);
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
                        <button class="view-btn" onclick="viewCheckupModal('${checkup.checkup_id}')">View</button>
                        <button class="edit-btn" onclick="editCheckupModal('${checkup.checkup_id}')">Edit</button>
                        <button class="status-btn" onclick="showUpdateStatusModal('${checkup.checkup_id}', '${checkup.status}')">Update Status</button>
                        <button class="delete-btn" onclick="showDeleteCheckupConfirmation('${checkup.checkup_id}', '${checkup.patient_id}')">Delete</button>
                    </div>
                <\/div>
            `;
            tableBody.appendChild(row);
        }
    } catch (error) {
        console.error("Error loading checkups:", error);
        tableBody.innerHTML = '<td><td colspan="15" style="text-align: center; color: red;">Error loading data. Please check your connection.<\/div>';
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
                    <button class="view-btn" onclick="viewCheckupModal('${checkup.checkup_id}')">View</button>
                    <button class="edit-btn" onclick="editCheckupModal('${checkup.checkup_id}')">Edit</button>
                    <button class="status-btn" onclick="showUpdateStatusModal('${checkup.checkup_id}', '${checkup.status}')">Update Status</button>
                    <button class="delete-btn" onclick="showDeleteCheckupConfirmation('${checkup.checkup_id}', '${checkup.patient_id}')">Delete</button>
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
        showToast('Please fill in all required fields', 'warning');
        return;
    }
    
    const checkupId = `${patientId}_${checkupDate}_${Date.now()}`;
    
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
        showToast(`Pregnancy checkup for Patient ${patientId} saved successfully!`, 'success');
        await loadCheckups();
        hideAddCheckupModal();
    } catch (error) {
        console.error("Error saving checkup:", error);
        showToast("Error saving checkup. Please try again.", 'error');
    }
}

// ========== VIEW CHECKUP MODAL ==========
function viewCheckupModal(checkupId) {
    const checkup = allCheckups.find(c => c.checkup_id === checkupId);
    if (checkup) {
        const content = `
            <div style="line-height: 1.8; font-family: 'Segoe UI', Arial, sans-serif;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; width: 40%; font-weight: 600; color: #2B6896;">Patient ID:<\/td><td style="padding: 8px 0;">${checkup.patient_id}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Patient Name:<\/td><td style="padding: 8px 0;">${checkup.patient_name || '-'}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Doctor ID:<\/td><td style="padding: 8px 0;">${checkup.doctor_id}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Doctor Name:<\/td><td style="padding: 8px 0;">${checkup.doctor_name || '-'}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Checkup Date:<\/td><td style="padding: 8px 0;">${checkup.checkup_date}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Trimester:<\/td><td style="padding: 8px 0;">${checkup.trimester}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Gestational Age:<\/td><td style="padding: 8px 0;">${checkup.gestational_age} weeks<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Blood Pressure:<\/td><td style="padding: 8px 0;">${checkup.blood_pressure || 'N/A'}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Weight:<\/td><td style="padding: 8px 0;">${checkup.weight ? checkup.weight + ' kg' : 'N/A'}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Ultrasound Result:<\/td><td style="padding: 8px 0;">${checkup.ultrasound_result || 'N/A'}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Blood Test Result:<\/td><td style="padding: 8px 0;">${checkup.blood_test_result || 'N/A'}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Doctor Notes:<\/td><td style="padding: 8px 0;">${checkup.doctor_notes || 'N/A'}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Next Checkup Date:<\/td><td style="padding: 8px 0;">${checkup.next_checkup_date || 'N/A'}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Status:<\/td><td style="padding: 8px 0;"><span class="status-badge-checkup ${getStatusBadgeClass(checkup.status)}">${checkup.status}<\/span><\/td><\/tr>
                </table>
            </div>
        `;
        
        const modal = document.getElementById('viewCheckupModal');
        if (modal) {
            document.getElementById('viewCheckupModalBody').innerHTML = content;
            modal.classList.add('show');
        }
    }
}

function closeViewCheckupModal() {
    const modal = document.getElementById('viewCheckupModal');
    if (modal) modal.classList.remove('show');
}

// ========== EDIT CHECKUP MODAL ==========
function editCheckupModal(checkupId) {
    const checkup = allCheckups.find(c => c.checkup_id === checkupId);
    if (!checkup) {
        showToast('Checkup record not found.', 'error');
        return;
    }
    
    console.log("Editing checkup:", checkup); // Debug log
    
    document.getElementById('editCheckupId').value = checkup.checkup_id;
    
    // Patient ID - READ ONLY - set the value from the checkup record
    const editPatientIdField = document.getElementById('editPatientId');
    if (editPatientIdField) {
        editPatientIdField.value = checkup.patient_id;
        editPatientIdField.disabled = true;
    }
    
    // Doctor ID - READ ONLY - set the value from the checkup record
    const editDoctorIdField = document.getElementById('editDoctorId');
    if (editDoctorIdField) {
        editDoctorIdField.value = checkup.doctor_id;
        editDoctorIdField.disabled = true;
    }
    
    // Set patient name display
    const editPatientNameDisplay = document.getElementById('editPatientNameDisplay');
    if (editPatientNameDisplay) {
        editPatientNameDisplay.value = checkup.patient_name || '';
    }
    
    // Set doctor name display
    const editDoctorNameDisplay = document.getElementById('editDoctorNameDisplay');
    if (editDoctorNameDisplay) {
        editDoctorNameDisplay.value = checkup.doctor_name || '';
    }
    
    // Set all other fields
    document.getElementById('editCheckupDate').value = checkup.checkup_date || '';
    document.getElementById('editTrimester').value = checkup.trimester || '';
    document.getElementById('editGestationalAge').value = checkup.gestational_age || '';
    document.getElementById('editBloodPressure').value = checkup.blood_pressure || '';
    document.getElementById('editWeight').value = checkup.weight || '';
    document.getElementById('editUltrasoundResult').value = checkup.ultrasound_result || '';
    document.getElementById('editBloodTestResult').value = checkup.blood_test_result || '';
    document.getElementById('editDoctorNotes').value = checkup.doctor_notes || '';
    document.getElementById('editNextCheckupDate').value = checkup.next_checkup_date || '';
    document.getElementById('editStatus').value = checkup.status || 'Scheduled';
    
    document.getElementById('editCheckupModal').classList.add('show');
}

function closeEditCheckupModal() {
    document.getElementById('editCheckupModal').classList.remove('show');
    // Re-enable fields for next time (they will be set again in editCheckupModal)
    const editPatientIdField = document.getElementById('editPatientId');
    const editDoctorIdField = document.getElementById('editDoctorId');
    if (editPatientIdField) editPatientIdField.disabled = false;
    if (editDoctorIdField) editDoctorIdField.disabled = false;
}

function closeEditCheckupModal() {
    document.getElementById('editCheckupModal').classList.remove('show');
    // Re-enable fields for next time (they will be set again in editCheckupModal)
    const editPatientIdField = document.getElementById('editPatientId');
    const editDoctorIdField = document.getElementById('editDoctorId');
    if (editPatientIdField) editPatientIdField.disabled = false;
    if (editDoctorIdField) editDoctorIdField.disabled = false;
}

async function updateCheckup() {
    const checkupId = document.getElementById('editCheckupId').value;
    const patientId = document.getElementById('editPatientId').value;
    const doctorId = document.getElementById('editDoctorId').value;
    const checkupDate = document.getElementById('editCheckupDate').value;
    const trimester = document.getElementById('editTrimester').value;
    const gestationalAge = document.getElementById('editGestationalAge').value;
    const bloodPressure = document.getElementById('editBloodPressure').value.trim();
    const weight = document.getElementById('editWeight').value;
    const ultrasoundResult = document.getElementById('editUltrasoundResult').value.trim();
    const bloodTestResult = document.getElementById('editBloodTestResult').value.trim();
    const doctorNotes = document.getElementById('editDoctorNotes').value.trim();
    const nextCheckupDate = document.getElementById('editNextCheckupDate').value;
    const status = document.getElementById('editStatus').value;
    
    if (!patientId || !doctorId || !checkupDate || !trimester || !gestationalAge) {
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
        await db.collection('pregnancy_checkups').doc(checkupId).update({
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
            status: status,
            updated_at: new Date().toISOString()
        });
        
        showToast(`Checkup record updated successfully!`, 'success');
        await loadCheckups();
        closeEditCheckupModal();
    } catch (error) {
        console.error("Error updating checkup:", error);
        showToast("Error updating checkup. Please try again.", 'error');
    }
}

// ========== DELETE CHECKUP CONFIRMATION MODAL ==========
function showDeleteCheckupConfirmation(checkupId, patientId) {
    let modal = document.getElementById('deleteCheckupConfirmModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'deleteCheckupConfirmModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 400px; text-align: center;">
                <div class="modal-header" style="background: #f44336;">
                    <h2 style="color: white;">⚠️ Confirm Delete</h2>
                    <button class="close-modal" onclick="closeDeleteCheckupModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div style="font-size: 48px; margin-bottom: 15px;">🗑️</div>
                    <p>Are you sure you want to delete this checkup record?</p>
                    <p><strong>Patient ID: ${escapeHtml(patientId)}</strong></p>
                    <p style="color: #f44336; font-size: 13px;">⚠️ This action cannot be undone!</p>
                </div>
                <div class="modal-footer" style="justify-content: center;">
                    <button class="cancel-btn" onclick="closeDeleteCheckupModal()">Cancel</button>
                    <button class="save-btn" id="confirmDeleteCheckupBtn" style="background: #f44336;">Delete Permanently</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    } else {
        const modalBody = modal.querySelector('.modal-body');
        if (modalBody) {
            modalBody.innerHTML = `
                <div style="font-size: 48px; margin-bottom: 15px;">🗑️</div>
                <p>Are you sure you want to delete this checkup record?</p>
                <p><strong>Patient ID: ${escapeHtml(patientId)}</strong></p>
                <p style="color: #f44336; font-size: 13px;">⚠️ This action cannot be undone!</p>
            `;
        }
    }
    
    modal.classList.add('show');
    
    const confirmBtn = document.getElementById('confirmDeleteCheckupBtn');
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    newConfirmBtn.addEventListener('click', async () => {
        try {
            await db.collection('pregnancy_checkups').doc(checkupId).delete();
            showToast(`Checkup record deleted successfully.`, 'success');
            await loadCheckups();
        } catch (error) {
            console.error("Error deleting checkup:", error);
            showToast("Error deleting checkup. Please try again.", 'error');
        }
        closeDeleteCheckupModal();
    });
}

function closeDeleteCheckupModal() {
    const modal = document.getElementById('deleteCheckupConfirmModal');
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