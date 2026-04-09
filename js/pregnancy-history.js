// pregnancy-history.js
// ===== PREGNANCY HISTORY PAGE WITH FIREBASE =====

let allPregnancyHistory = [];
let allPregnantPatients = [];

// Display current date
function displayCurrentDate() {
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        const today = new Date();
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        dateElement.textContent = today.toLocaleDateString('en-US', options);
    }
}

// Helper function to get patient name by ID
async function getPatientNameById(patientId) {
    let patient = allPregnantPatients.find(p => p.patient_id === patientId);
    if (patient) {
        return `${patient.first_name} ${patient.last_name}`;
    }
    try {
        const doc = await db.collection('patients').doc(patientId).get();
        if (doc.exists) {
            const patientData = doc.data();
            allPregnantPatients.push(patientData);
            return `${patientData.first_name} ${patientData.last_name}`;
        }
    } catch (error) {
        console.error("Error fetching patient name:", error);
    }
    return '-';
}

// Load ONLY PREGNANT patients for dropdown
async function loadPatientsForDropdown() {
    try {
        const patientSelect = document.getElementById('patientId');
        if (!patientSelect) return;
        
        patientSelect.innerHTML = '<option value="">Loading...</option>';
        allPregnantPatients = [];
        
        const snapshot = await db.collection('patients').where('patient_type', '==', 'Pregnant').get();
        
        patientSelect.innerHTML = '<option value="">Select Patient ID</option>';
        
        if (snapshot.empty) {
            patientSelect.innerHTML = '<option value="">No pregnant patients found</option>';
            return;
        }
        
        snapshot.forEach(doc => {
            const patient = doc.data();
            allPregnantPatients.push(patient);
            const option = document.createElement('option');
            option.value = patient.patient_id;
            option.textContent = patient.patient_id;
            patientSelect.appendChild(option);
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
    const selectedValue = patientSelect.value;
    
    if (selectedValue && allPregnantPatients.length > 0) {
        const patient = allPregnantPatients.find(p => p.patient_id === selectedValue);
        if (patient) {
            patientNameDisplay.value = `${patient.first_name} ${patient.last_name}`;
        } else {
            patientNameDisplay.value = '';
        }
    } else {
        patientNameDisplay.value = '';
    }
}

// Load pregnancy history from Firestore
async function loadHistory() {
    const tableBody = document.getElementById('historyTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '<td><td colspan="12" style="text-align: center;">Loading pregnancy history...<\/div>';
    
    try {
        const snapshot = await db.collection('pregnancy_history').orderBy('patient_id').get();
        
        if (snapshot.empty) {
            tableBody.innerHTML = '<td><td colspan="12" style="text-align: center;">No pregnancy history found. Click "+ Add History" to add.<\/div>';
            allPregnancyHistory = [];
            return;
        }
        
        allPregnancyHistory = [];
        tableBody.innerHTML = '';
        
        for (const doc of snapshot.docs) {
            const record = doc.data();
            allPregnancyHistory.push(record);
            
            // Get patient name
            let patientName = record.patient_name || await getPatientNameById(record.patient_id);
            
            const pihClass = record.pregnancy_induced_hypertension === 'Yes' ? 'pih-yes' : 'pih-no';
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${record.patient_id || '-'}<\/div>
                <td>${patientName}<\/div>
                <td>${record.gravidity || 0}<\/div>
                <td>${record.parity || 0}<\/div>
                <td>${record.type_of_delivery || '-'}<\/div>
                <td>${record.other_delivery_method || '-'}<\/div>
                <td>${record.no_of_full_term || 0}<\/div>
                <td>${record.no_of_premature || 0}<\/div>
                <td>${record.no_of_abortion || 0}<\/div>
                <td>${record.no_of_living_children || 0}<\/div>
                <td class="${pihClass}">${record.pregnancy_induced_hypertension || 'No'}<\/div>
                <td>${record.remarks || '-'}<\/div>
                <td>
                    <div class="action-buttons">
                        <button class="view-btn" onclick="viewHistory('${record.history_id || record.patient_id}')">View</button>
                        <button class="edit-btn" onclick="editHistory('${record.history_id || record.patient_id}')">Edit</button>
                        <button class="delete-btn" onclick="deleteHistory('${record.history_id || record.patient_id}')">Delete</button>
                    </div>
                <\/div>
            `;
            tableBody.appendChild(row);
        }
    } catch (error) {
        console.error("Error loading pregnancy history:", error);
        tableBody.innerHTML = '<td><td colspan="12" style="text-align: center; color: red;">Error loading data. Please check your connection.<\/div>';
    }
}

// Search history
function searchHistory() {
    const searchTerm = document.getElementById('historySearch').value.toLowerCase();
    const filteredHistory = allPregnancyHistory.filter(record => 
        record.patient_id.toLowerCase().includes(searchTerm) ||
        (record.remarks && record.remarks.toLowerCase().includes(searchTerm))
    );
    displayFilteredHistory(filteredHistory);
}

// Sort history
function sortHistory() {
    const sortBy = document.getElementById('sortBy').value;
    const sortedHistory = [...allPregnancyHistory].sort((a, b) => {
        let valA = a[sortBy] || '';
        let valB = b[sortBy] || '';
        
        if (sortBy === 'gravidity' || sortBy === 'parity' || sortBy === 'no_of_living_children') {
            return (valA || 0) - (valB || 0);
        }
        if (sortBy === 'patient_id') {
            return String(valA).localeCompare(String(valB));
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
        const pihClass = record.pregnancy_induced_hypertension === 'Yes' ? 'pih-yes' : 'pih-no';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${record.patient_id || '-'}<\/div>
            <td>${patientName}<\/div>
            <td>${record.gravidity || 0}<\/div>
            <td>${record.parity || 0}<\/div>
            <td>${record.type_of_delivery || '-'}<\/div>
            <td>${record.other_delivery_method || '-'}<\/div>
            <td>${record.no_of_full_term || 0}<\/div>
            <td>${record.no_of_premature || 0}<\/div>
            <td>${record.no_of_abortion || 0}<\/div>
            <td>${record.no_of_living_children || 0}<\/div>
            <td class="${pihClass}">${record.pregnancy_induced_hypertension || 'No'}<\/div>
            <td>${record.remarks || '-'}<\/div>
            <td>
                <div class="action-buttons">
                    <button class="view-btn" onclick="viewHistory('${record.history_id || record.patient_id}')">View</button>
                    <button class="edit-btn" onclick="editHistory('${record.history_id || record.patient_id}')">Edit</button>
                    <button class="delete-btn" onclick="deleteHistory('${record.history_id || record.patient_id}')">Delete</button>
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
}

// Generate unique ID
function generateHistoryId() {
    return 'hist_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
}

// Save new pregnancy history to Firestore
async function saveHistory() {
    const patientId = document.getElementById('patientId').value;
    const gravidity = document.getElementById('gravidity').value;
    const parity = document.getElementById('parity').value;
    const typeOfDelivery = document.getElementById('typeOfDelivery').value;
    const otherDeliveryMethod = document.getElementById('otherDeliveryMethod').value.trim();
    const fullTerm = document.getElementById('fullTerm').value;
    const premature = document.getElementById('premature').value;
    const abortion = document.getElementById('abortion').value;
    const livingChildren = document.getElementById('livingChildren').value;
    const pih = document.getElementById('pih').value;
    const remarks = document.getElementById('remarks').value.trim();
    
    if (!patientId) {
        alert('Please select a Patient ID');
        return;
    }
    
    const historyId = generateHistoryId();
    
    // Get patient name
    let patientName = '';
    const patient = allPregnantPatients.find(p => p.patient_id === patientId);
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
    
    const newHistory = {
        history_id: historyId,
        patient_id: patientId,
        patient_name: patientName,
        gravidity: gravidity ? parseInt(gravidity) : 0,
        parity: parity ? parseInt(parity) : 0,
        type_of_delivery: typeOfDelivery || null,
        other_delivery_method: otherDeliveryMethod || null,
        no_of_full_term: fullTerm ? parseInt(fullTerm) : 0,
        no_of_premature: premature ? parseInt(premature) : 0,
        no_of_abortion: abortion ? parseInt(abortion) : 0,
        no_of_living_children: livingChildren ? parseInt(livingChildren) : 0,
        pregnancy_induced_hypertension: pih || 'No',
        remarks: remarks || null,
        created_at: new Date().toISOString()
    };
    
    try {
        await db.collection('pregnancy_history').doc(historyId).set(newHistory);
        alert(`Pregnancy history for Patient ${patientId} saved successfully!`);
        await loadHistory();
        hideAddHistoryModal();
    } catch (error) {
        console.error("Error saving pregnancy history:", error);
        alert("Error saving pregnancy history. Please try again.");
    }
}

// View history
function viewHistory(historyId) {
    const record = allPregnancyHistory.find(r => (r.history_id === historyId) || (r.patient_id === historyId));
    if (record) {
        alert(`PREGNANCY HISTORY DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Patient ID: ${record.patient_id}
Gravidity: ${record.gravidity || 0}
Parity: ${record.parity || 0}
Type of Delivery: ${record.type_of_delivery || 'N/A'}
Other Delivery Method: ${record.other_delivery_method || 'N/A'}
Full Term Births: ${record.no_of_full_term || 0}
Premature Births: ${record.no_of_premature || 0}
Abortions: ${record.no_of_abortion || 0}
Living Children: ${record.no_of_living_children || 0}
PIH: ${record.pregnancy_induced_hypertension || 'No'}
Remarks: ${record.remarks || 'N/A'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    }
}

// Edit history
function editHistory(historyId) {
    alert(`Edit pregnancy history\n\nThis feature will be implemented in the next phase.`);
}

// Delete history from Firestore
async function deleteHistory(historyId) {
    if (confirm(`Delete this pregnancy history record?`)) {
        try {
            const recordToDelete = allPregnancyHistory.find(r => (r.history_id === historyId) || (r.patient_id === historyId));
            if (recordToDelete && recordToDelete.history_id) {
                await db.collection('pregnancy_history').doc(recordToDelete.history_id).delete();
                alert(`Pregnancy history deleted successfully.`);
                await loadHistory();
            }
        } catch (error) {
            console.error("Error deleting pregnancy history:", error);
            alert("Error deleting pregnancy history. Please try again.");
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