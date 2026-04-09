// children-records.js
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

// Load ONLY CHILD patients for dropdown
async function loadPatientsForDropdown() {
    try {
        const patientSelect = document.getElementById('patientId');
        if (!patientSelect) return;
        
        patientSelect.innerHTML = '<option value="">Loading...</option>';
        allChildPatients = [];
        
        // Get only child patients
        const snapshot = await db.collection('patients').where('patient_type', '==', 'Child').orderBy('patient_id').get();
        
        patientSelect.innerHTML = '<option value="">Select Patient ID</option>';
        
        snapshot.forEach(doc => {
            const patient = doc.data();
            allChildPatients.push(patient);
            const option = document.createElement('option');
            option.value = patient.patient_id;
            option.textContent = patient.patient_id; // Show only Patient ID
            patientSelect.appendChild(option);
        });
        
        if (allChildPatients.length === 0) {
            patientSelect.innerHTML = '<option value="">No child patients found</option>';
        }
        
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
    const selectedValue = patientSelect.value;
    
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
    
    tableBody.innerHTML = '<tr><td colspan="11" style="text-align: center;">Loading children records...</td></tr>';
    
    try {
        const snapshot = await db.collection('children_records').orderBy('patient_id').get();
        
        if (snapshot.empty) {
            tableBody.innerHTML = '<tr><td colspan="11" style="text-align: center;">No children records found. Click "+ Add Record" to add.</td></tr>';
            allChildrenRecords = [];
            return;
        }
        
        allChildrenRecords = [];
        tableBody.innerHTML = '';
        
        snapshot.forEach(doc => {
            const record = doc.data();
            allChildrenRecords.push(record);
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${record.patient_id || '-'}</td>
                <td>${record.mother_name || '-'}</td>
                <td>${record.father_name || '-'}</td>
                <td>${record.birth_weight || '-'}</td>
                <td>${record.birth_height || '-'}</td>
                <td>${record.birth_place || '-'}</td>
                <td>${record.guardian || '-'}</td>
                <td>${record.guardian_contact || '-'}</td>
                <td>${record.relationship || '-'}</td>
                <td>${record.remarks || '-'}</td>
                <td>
                    <div class="action-buttons">
                        <button class="view-btn" onclick="viewRecord('${record.record_id || record.patient_id}')">View</button>
                        <button class="edit-btn" onclick="editRecord('${record.record_id || record.patient_id}')">Edit</button>
                        <button class="delete-btn" onclick="deleteRecord('${record.record_id || record.patient_id}')">Delete</button>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Error loading children records:", error);
        tableBody.innerHTML = '<tr><td colspan="11" style="text-align: center; color: red;">Error loading data. Please check your connection.</td></tr>';
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

// Display filtered/sorted records
function displayFilteredRecords(recordsList) {
    const tableBody = document.getElementById('recordsTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    recordsList.forEach(record => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${record.patient_id || '-'}</td>
            <td>${record.mother_name || '-'}</td>
            <td>${record.father_name || '-'}</td>
            <td>${record.birth_weight || '-'}</td>
            <td>${record.birth_height || '-'}</td>
            <td>${record.birth_place || '-'}</td>
            <td>${record.guardian || '-'}</td>
            <td>${record.guardian_contact || '-'}</td>
            <td>${record.relationship || '-'}</td>
            <td>${record.remarks || '-'}</td>
            <td>
                <div class="action-buttons">
                    <button class="view-btn" onclick="viewRecord('${record.record_id || record.patient_id}')">View</button>
                    <button class="edit-btn" onclick="editRecord('${record.record_id || record.patient_id}')">Edit</button>
                    <button class="delete-btn" onclick="deleteRecord('${record.record_id || record.patient_id}')">Delete</button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Generate unique record ID
function generateRecordId() {
    return 'child_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
}

// Show add record modal
function showAddRecordModal() {
    document.getElementById('addRecordModal').classList.add('show');
    loadPatientsForDropdown(); // Refresh patient list when modal opens
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
        alert('Please fill in all required fields');
        return;
    }
    
    // Check if record already exists
    if (allChildrenRecords.some(r => r.patient_id === patientId)) {
        alert('A children record for this patient already exists');
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
        alert(`Children record for Patient ${patientId} saved successfully!`);
        await loadRecords();
        hideAddRecordModal();
    } catch (error) {
        console.error("Error saving children record:", error);
        alert("Error saving children record. Please try again.");
    }
}

// View record
function viewRecord(recordId) {
    const record = allChildrenRecords.find(r => (r.record_id === recordId) || (r.patient_id === recordId));
    if (record) {
        alert(`CHILDREN RECORD DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Patient ID: ${record.patient_id}
Mother Name: ${record.mother_name}
Father Name: ${record.father_name || 'N/A'}
Birth Weight: ${record.birth_weight} kg
Birth Height: ${record.birth_height} cm
Birth Place: ${record.birth_place}
Guardian: ${record.guardian || 'N/A'}
Guardian Contact: ${record.guardian_contact || 'N/A'}
Relationship: ${record.relationship || 'N/A'}
Remarks: ${record.remarks || 'N/A'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    }
}

// Edit record
function editRecord(recordId) {
    alert(`Edit children record\n\nThis feature will be implemented in the next phase.`);
}

// Delete record from Firestore
async function deleteRecord(recordId) {
    if (confirm(`Delete this children record?`)) {
        try {
            const recordToDelete = allChildrenRecords.find(r => (r.record_id === recordId) || (r.patient_id === recordId));
            if (recordToDelete && recordToDelete.record_id) {
                await db.collection('children_records').doc(recordToDelete.record_id).delete();
                alert(`Children record deleted successfully.`);
                await loadRecords();
            }
        } catch (error) {
            console.error("Error deleting children record:", error);
            alert("Error deleting children record. Please try again.");
        }
    }
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