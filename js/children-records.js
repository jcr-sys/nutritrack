// ===== CHILDREN RECORDS PAGE WITH FIREBASE =====

let allChildrenRecords = [];
let allChildPatients = [];

// Display current date
function displayCurrentDate() {
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        const today = new Date();
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        dateElement.textContent = today.toLocaleDateString('en-US', options);
    }
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

// Load ONLY CHILD patients for dropdown
async function loadPatientsForDropdown() {
    try {
        const patientSelect = document.getElementById('patientId');
        const editPatientSelect = document.getElementById('editPatientId');
        
        if (patientSelect) patientSelect.innerHTML = '<option value="">Loading...</option>';
        if (editPatientSelect) editPatientSelect.innerHTML = '<option value="">Loading...</option>';
        allChildPatients = [];
        
        const snapshot = await db.collection('patients').where('patient_type', '==', 'Child').orderBy('patient_id').get();
        
        if (patientSelect) {
            patientSelect.innerHTML = '<option value="">Select Patient ID</option>';
        }
        if (editPatientSelect) {
            editPatientSelect.innerHTML = '<option value="">Select Patient ID</option>';
        }
        
        if (snapshot.empty) {
            if (patientSelect) patientSelect.innerHTML = '<option value="">No child patients found</option>';
            if (editPatientSelect) editPatientSelect.innerHTML = '<option value="">No child patients found</option>';
            return;
        }
        
        snapshot.forEach(doc => {
            const patient = doc.data();
            allChildPatients.push(patient);
            
            if (patientSelect) {
                const option = document.createElement('option');
                option.value = patient.patient_id;
                option.textContent = patient.patient_id;
                patientSelect.appendChild(option);
            }
            if (editPatientSelect) {
                const editOption = document.createElement('option');
                editOption.value = patient.patient_id;
                editOption.textContent = patient.patient_id;
                editPatientSelect.appendChild(editOption);
            }
        });
        
    } catch (error) {
        console.error("Error loading patients for dropdown:", error);
        const patientSelect = document.getElementById('patientId');
        if (patientSelect) {
            patientSelect.innerHTML = '<option value="">Error loading patients</option>';
        }
    }
}

// Update patient name display when patient selected
function updatePatientNameDisplay() {
    const patientSelect = document.getElementById('patientId');
    const patientNameDisplay = document.getElementById('patientNameDisplay');
    const selectedValue = patientSelect?.value;
    
    if (selectedValue && allChildPatients.length > 0) {
        const patient = allChildPatients.find(p => p.patient_id === selectedValue);
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
    const selectedValue = patientSelect?.value;
    
    if (selectedValue && allChildPatients.length > 0) {
        const patient = allChildPatients.find(p => p.patient_id === selectedValue);
        if (patient) {
            patientNameDisplay.value = `${patient.first_name} ${patient.last_name}`;
        } else {
            patientNameDisplay.value = '';
        }
    } else {
        patientNameDisplay.value = '';
    }
}

// Load children records from Firestore
async function loadRecords() {
    const tableBody = document.getElementById('recordsTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '<tr><td colspan="12" style="text-align: center;">Loading children records...<\/div>';

    try {
        const snapshot = await db.collection('children_records').orderBy('patient_id').get();
        
        if (snapshot.empty) {
            tableBody.innerHTML = '<tr><td colspan="12" style="text-align: center;">No children records found. Click "+ Add Record" to add.<\/div>';
            allChildrenRecords = [];
            return;
        }
        
        allChildrenRecords = [];
        tableBody.innerHTML = '';
        
        for (const doc of snapshot.docs) {
            const record = doc.data();
            allChildrenRecords.push(record);
            
            // Get patient name from patients table
            let patientName = '';
            const patient = allChildPatients.find(p => p.patient_id === record.patient_id);
            if (patient) {
                patientName = `${patient.first_name} ${patient.last_name}`;
            } else {
                // Fetch from Firebase if not in array
                try {
                    const patientDoc = await db.collection('patients').doc(record.patient_id).get();
                    if (patientDoc.exists) {
                        const patientData = patientDoc.data();
                        patientName = `${patientData.first_name} ${patientData.last_name}`;
                        // Add to array for future use
                        allChildPatients.push(patientData);
                    }
                } catch (err) {
                    console.error("Error fetching patient:", err);
                }
            }
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${record.patient_id || '-'}<\/div>
                <td>${patientName || '-'}<\/div>
                <td>${record.mother_name || '-'}<\/div>
                <td>${record.father_name || '-'}<\/div>
                <td>${record.birth_weight || '-'}<\/div>
                <td>${record.birth_height || '-'}<\/div>
                <td>${record.birth_place || '-'}<\/div>
                <td>${record.guardian || '-'}<\/div>
                <td>${record.guardian_contact || '-'}<\/div>
                <td>${record.relationship || '-'}<\/div>
                <td>${record.remarks || '-'}<\/div>
                <td>
                    <div class="action-buttons">
                        <button class="view-btn" onclick="viewRecordModal('${record.record_id}')">View</button>
                        <button class="edit-btn" onclick="editRecordModal('${record.record_id}')">Edit</button>
                        <button class="delete-btn" onclick="showDeleteRecordConfirmation('${record.record_id}', '${record.patient_id}')">Delete</button>
                    </div>
                <\/div>
            `;
            tableBody.appendChild(row);
        }
    } catch (error) {
        console.error("Error loading children records:", error);
        tableBody.innerHTML = '<tr><td colspan="12" style="text-align: center; color: red;">Error loading data. Please check your connection.<\/div>';
    }
}

// Search records
function searchRecords() {
    const searchTerm = document.getElementById('recordSearch').value.toLowerCase();
    const filteredRecords = allChildrenRecords.filter(record => 
        record.patient_id.toLowerCase().includes(searchTerm) ||
        (record.mother_name && record.mother_name.toLowerCase().includes(searchTerm)) ||
        (record.father_name && record.father_name.toLowerCase().includes(searchTerm)) ||
        (record.guardian && record.guardian.toLowerCase().includes(searchTerm)) ||
        (record.remarks && record.remarks.toLowerCase().includes(searchTerm))
    );
    displayFilteredRecords(filteredRecords);
}

// Sort records
function sortRecords() {
    const sortBy = document.getElementById('sortBy').value;
    const sortedRecords = [...allChildrenRecords].sort((a, b) => {
        let valA = a[sortBy] || '';
        let valB = b[sortBy] || '';
        
        if (sortBy === 'patient_id') {
            return String(valA).localeCompare(String(valB), undefined, {numeric: true});
        }
        if (sortBy === 'birth_weight' || sortBy === 'birth_height') {
            return parseFloat(valA) - parseFloat(valB);
        }
        return String(valA).localeCompare(String(valB));
    });
    displayFilteredRecords(sortedRecords);
}

// ========== EDIT RECORD MODAL ==========
function editRecordModal(recordId) {
    const record = allChildrenRecords.find(r => r.record_id === recordId);
    if (!record) {
        showToast('Children record not found.', 'error');
        return;
    }
    
    document.getElementById('editRecordId').value = record.record_id;
    document.getElementById('editMotherName').value = record.mother_name || '';
    document.getElementById('editFatherName').value = record.father_name || '';
    document.getElementById('editBirthWeight').value = record.birth_weight || '';
    document.getElementById('editBirthHeight').value = record.birth_height || '';
    document.getElementById('editBirthPlace').value = record.birth_place || '';
    document.getElementById('editGuardian').value = record.guardian || '';
    document.getElementById('editGuardianContact').value = record.guardian_contact || '';
    document.getElementById('editRelationship').value = record.relationship || '';
    document.getElementById('editRemarks').value = record.remarks || '';
    
    // Set Patient ID as read-only text input
    document.getElementById('editPatientId').value = record.patient_id;
    
    // Get patient name for display from patients table
    let patientName = '';
    const patient = allChildPatients.find(p => p.patient_id === record.patient_id);
    if (patient) {
        patientName = `${patient.first_name} ${patient.last_name}`;
    } else {
        // Fetch from Firebase if not in array
        (async () => {
            try {
                const patientDoc = await db.collection('patients').doc(record.patient_id).get();
                if (patientDoc.exists) {
                    const patientData = patientDoc.data();
                    patientName = `${patientData.first_name} ${patientData.last_name}`;
                    allChildPatients.push(patientData);
                    document.getElementById('editPatientNameDisplay').value = patientName;
                }
            } catch (err) {
                console.error("Error fetching patient:", err);
                document.getElementById('editPatientNameDisplay').value = '';
            }
        })();
    }
    document.getElementById('editPatientNameDisplay').value = patientName;
    
    document.getElementById('editRecordModal').classList.add('show');
}

// Generate unique record ID
function generateRecordId() {
    return 'child_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
}

// Show add record modal
function showAddRecordModal() {
    document.getElementById('addRecordModal').classList.add('show');
    loadPatientsForDropdown();
}

// Hide add record modal
function hideAddRecordModal() {
    document.getElementById('addRecordModal').classList.remove('show');
    clearRecordForm();
}

// Clear record form
function clearRecordForm() {
    document.getElementById('recordForm').reset();
    document.getElementById('patientNameDisplay').value = '';
}

// Save new record to Firestore
async function saveRecord() {
    const patientId = document.getElementById('patientId').value;
    const motherName = document.getElementById('motherName').value.trim();
    const fatherName = document.getElementById('fatherName').value.trim();
    const birthWeight = document.getElementById('birthWeight').value;
    const birthHeight = document.getElementById('birthHeight').value;
    const birthPlace = document.getElementById('birthPlace').value.trim();
    const guardian = document.getElementById('guardian').value.trim();
    const guardianContact = document.getElementById('guardianContact').value.trim();
    const relationship = document.getElementById('relationship').value.trim();
    const remarks = document.getElementById('remarks').value.trim();
    
    if (!patientId || !motherName || !birthWeight || !birthHeight || !birthPlace) {
        showToast('Please fill in all required fields', 'warning');
        return;
    }
    
    if (allChildrenRecords.some(r => r.patient_id === patientId)) {
        showToast('A children record for this patient already exists', 'warning');
        return;
    }
    
    const recordId = generateRecordId();
    
    const newRecord = {
        record_id: recordId,
        patient_id: patientId,
        mother_name: motherName,
        father_name: fatherName || null,
        birth_weight: parseFloat(birthWeight),
        birth_height: parseFloat(birthHeight),
        birth_place: birthPlace,
        guardian: guardian || null,
        guardian_contact: guardianContact || null,
        relationship: relationship || null,
        remarks: remarks || null,
        created_at: new Date().toISOString()
    };
    
    try {
        await db.collection('children_records').doc(recordId).set(newRecord);
        showToast(`Children record for Patient ${patientId} saved successfully!`, 'success');
        await loadRecords();
        hideAddRecordModal();
    } catch (error) {
        console.error("Error saving children record:", error);
        showToast("Error saving children record. Please try again.", 'error');
    }
}

// ========== VIEW RECORD MODAL ==========
function viewRecordModal(recordId) {
    const record = allChildrenRecords.find(r => r.record_id === recordId);
    if (record) {
        const content = `
            <div style="line-height: 1.8; font-family: 'Segoe UI', Arial, sans-serif;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; width: 35%; font-weight: 600; color: #2B6896;">Patient ID:<\/td><td style="padding: 8px 0;">${record.patient_id}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Mother Name:<\/td><td style="padding: 8px 0;">${record.mother_name}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Father Name:<\/td><td style="padding: 8px 0;">${record.father_name || 'N/A'}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Birth Weight:<\/td><td style="padding: 8px 0;">${record.birth_weight} kg<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Birth Height:<\/td><td style="padding: 8px 0;">${record.birth_height} cm<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Birth Place:<\/td><td style="padding: 8px 0;">${record.birth_place}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Guardian:<\/td><td style="padding: 8px 0;">${record.guardian || 'N/A'}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Guardian Contact:<\/td><td style="padding: 8px 0;">${record.guardian_contact || 'N/A'}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Relationship to Guardian:<\/td><td style="padding: 8px 0;">${record.relationship || 'N/A'}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Remarks:<\/td><td style="padding: 8px 0;">${record.remarks || 'N/A'}<\/td><\/tr>
                </table>
            </div>
        `;
        
        const modal = document.getElementById('viewRecordModal');
        if (modal) {
            document.getElementById('viewRecordModalBody').innerHTML = content;
            modal.classList.add('show');
        }
    }
}

function closeViewRecordModal() {
    const modal = document.getElementById('viewRecordModal');
    if (modal) modal.classList.remove('show');
}

// ========== EDIT RECORD MODAL ==========
function editRecordModal(recordId) {
    const record = allChildrenRecords.find(r => r.record_id === recordId);
    if (!record) {
        showToast('Children record not found.', 'error');
        return;
    }
    
    document.getElementById('editRecordId').value = record.record_id;
    document.getElementById('editPatientId').value = record.patient_id;
    document.getElementById('editMotherName').value = record.mother_name || '';
    document.getElementById('editFatherName').value = record.father_name || '';
    document.getElementById('editBirthWeight').value = record.birth_weight || '';
    document.getElementById('editBirthHeight').value = record.birth_height || '';
    document.getElementById('editBirthPlace').value = record.birth_place || '';
    document.getElementById('editGuardian').value = record.guardian || '';
    document.getElementById('editGuardianContact').value = record.guardian_contact || '';
    document.getElementById('editRelationship').value = record.relationship || '';
    document.getElementById('editRemarks').value = record.remarks || '';
    
    updateEditPatientNameDisplay();
    loadPatientsForDropdown();
    
    document.getElementById('editRecordModal').classList.add('show');
}

function closeEditRecordModal() {
    document.getElementById('editRecordModal').classList.remove('show');
}

async function updateRecord() {
    const recordId = document.getElementById('editRecordId').value;
    const patientId = document.getElementById('editPatientId').value;
    const motherName = document.getElementById('editMotherName').value.trim();
    const fatherName = document.getElementById('editFatherName').value.trim();
    const birthWeight = document.getElementById('editBirthWeight').value;
    const birthHeight = document.getElementById('editBirthHeight').value;
    const birthPlace = document.getElementById('editBirthPlace').value.trim();
    const guardian = document.getElementById('editGuardian').value.trim();
    const guardianContact = document.getElementById('editGuardianContact').value.trim();
    const relationship = document.getElementById('editRelationship').value.trim();
    const remarks = document.getElementById('editRemarks').value.trim();
    
    if (!patientId || !motherName || !birthWeight || !birthHeight || !birthPlace) {
        showToast('Please fill in all required fields', 'warning');
        return;
    }
    
    try {
        await db.collection('children_records').doc(recordId).update({
            patient_id: patientId,
            mother_name: motherName,
            father_name: fatherName || null,
            birth_weight: parseFloat(birthWeight),
            birth_height: parseFloat(birthHeight),
            birth_place: birthPlace,
            guardian: guardian || null,
            guardian_contact: guardianContact || null,
            relationship: relationship || null,
            remarks: remarks || null,
            updated_at: new Date().toISOString()
        });
        
        showToast(`Children record updated successfully!`, 'success');
        await loadRecords();
        closeEditRecordModal();
    } catch (error) {
        console.error("Error updating children record:", error);
        showToast("Error updating children record. Please try again.", 'error');
    }
}

// ========== DELETE RECORD CONFIRMATION MODAL ==========
let pendingDeleteRecordId = null;

function showDeleteRecordConfirmation(recordId, patientId) {
    pendingDeleteRecordId = recordId;
    
    let modal = document.getElementById('deleteRecordConfirmModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'deleteRecordConfirmModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 400px; text-align: center;">
                <div class="modal-header" style="background: #f44336;">
                    <h2 style="color: white;">⚠️ Confirm Delete</h2>
                    <button class="close-modal" onclick="closeDeleteRecordModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div style="font-size: 48px; margin-bottom: 15px;">🗑️</div>
                    <p>Are you sure you want to delete this children record?</p>
                    <p><strong id="deleteRecordInfo"></strong></p>
                    <p style="color: #f44336; font-size: 13px;">⚠️ This action cannot be undone!</p>
                </div>
                <div class="modal-footer" style="justify-content: center;">
                    <button class="cancel-btn" onclick="closeDeleteRecordModal()">Cancel</button>
                    <button class="save-btn" id="confirmDeleteRecordBtn" style="background: #f44336;">Delete Permanently</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    const deleteInfo = document.getElementById('deleteRecordInfo');
    if (deleteInfo) {
        deleteInfo.innerHTML = `Patient ID: ${escapeHtml(patientId)}`;
    }
    
    modal.classList.add('show');
    
    const confirmBtn = document.getElementById('confirmDeleteRecordBtn');
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    newConfirmBtn.addEventListener('click', async () => {
        if (pendingDeleteRecordId) {
            try {
                await db.collection('children_records').doc(pendingDeleteRecordId).delete();
                showToast(`Children record deleted successfully.`, 'success');
                await loadRecords();
            } catch (error) {
                console.error("Error deleting children record:", error);
                showToast("Error deleting children record. Please try again.", 'error');
            }
        }
        closeDeleteRecordModal();
    });
}

function closeDeleteRecordModal() {
    const modal = document.getElementById('deleteRecordConfirmModal');
    if (modal) modal.classList.remove('show');
    pendingDeleteRecordId = null;
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    displayCurrentDate();
    loadRecords();
    
    const searchInput = document.getElementById('recordSearch');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchRecords();
            }
        });
    }
});