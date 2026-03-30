// ===== PREGNANCY HISTORY PAGE FUNCTIONALITY =====

// Sample pregnancy history data
let pregnancyHistory = [
    {
        patient_id: '1002',
        gravidity: 3,
        parity: 2,
        type_of_delivery: 'Normal',
        other_delivery_method: null,
        no_of_full_term: 2,
        no_of_premature: 1,
        no_of_abortion: 0,
        no_of_living_children: 3,
        pregnancy_induced_hypertension: 'No',
        remarks: 'All normal deliveries. Healthy children.'
    },
    {
        patient_id: '1006',
        gravidity: 2,
        parity: 1,
        type_of_delivery: 'Cesarean',
        other_delivery_method: null,
        no_of_full_term: 1,
        no_of_premature: 1,
        no_of_abortion: 0,
        no_of_living_children: 2,
        pregnancy_induced_hypertension: 'No',
        remarks: 'First baby delivered via CS due to breech presentation'
    },
    {
        patient_id: '1007',
        gravidity: 1,
        parity: 0,
        type_of_delivery: null,
        other_delivery_method: null,
        no_of_full_term: 0,
        no_of_premature: 0,
        no_of_abortion: 0,
        no_of_living_children: 0,
        pregnancy_induced_hypertension: 'No',
        remarks: 'First pregnancy. Currently in 1st trimester.'
    },
    {
        patient_id: '1008',
        gravidity: 4,
        parity: 3,
        type_of_delivery: 'Normal',
        other_delivery_method: null,
        no_of_full_term: 3,
        no_of_premature: 1,
        no_of_abortion: 0,
        no_of_living_children: 4,
        pregnancy_induced_hypertension: 'Yes',
        remarks: 'Had PIH during third pregnancy. Monitored closely.'
    },
    {
        patient_id: '1009',
        gravidity: 2,
        parity: 1,
        type_of_delivery: 'Other',
        other_delivery_method: 'Water Birth',
        no_of_full_term: 1,
        no_of_premature: 0,
        no_of_abortion: 1,
        no_of_living_children: 1,
        pregnancy_induced_hypertension: 'No',
        remarks: 'Water birth for first delivery. Previous miscarriage.'
    },
    {
        patient_id: '1010',
        gravidity: 1,
        parity: 0,
        type_of_delivery: null,
        other_delivery_method: null,
        no_of_full_term: 0,
        no_of_premature: 0,
        no_of_abortion: 0,
        no_of_living_children: 0,
        pregnancy_induced_hypertension: 'No',
        remarks: 'First pregnancy. Regular checkups.'
    }
];

// Display current date
function displayCurrentDate() {
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        const today = new Date();
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        dateElement.textContent = today.toLocaleDateString('en-US', options);
    }
}

// Load pregnancy history into table
function loadHistory() {
    const tableBody = document.getElementById('historyTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    pregnancyHistory.forEach(record => {
        const row = document.createElement('tr');
        const pihClass = record.pregnancy_induced_hypertension === 'Yes' ? 'pih-yes' : 'pih-no';
        
        row.innerHTML = `
            <td>${record.patient_id}</td>
            <td>${record.gravidity || 0}</td>
            <td>${record.parity || 0}</td>
            <td>${record.type_of_delivery || '-'}</td>
            <td>${record.other_delivery_method || '-'}</td>
            <td>${record.no_of_full_term || 0}</td>
            <td>${record.no_of_premature || 0}</td>
            <td>${record.no_of_abortion || 0}</td>
            <td>${record.no_of_living_children || 0}</td>
            <td class="${pihClass}">${record.pregnancy_induced_hypertension || 'No'}</td>
            <td>${record.remarks || '-'}</td>
            <td>
                <div class="action-buttons">
                    <button class="view-btn" onclick="viewHistory('${record.patient_id}')">View</button>
                    <button class="edit-btn" onclick="editHistory('${record.patient_id}')">Edit</button>
                    <button class="delete-btn" onclick="deleteHistory('${record.patient_id}')">Delete</button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Search history
function searchHistory() {
    const searchTerm = document.getElementById('historySearch').value.toLowerCase();
    const filteredHistory = pregnancyHistory.filter(record => 
        record.patient_id.toLowerCase().includes(searchTerm) ||
        (record.remarks && record.remarks.toLowerCase().includes(searchTerm))
    );
    displayFilteredHistory(filteredHistory);
}

// Sort history
function sortHistory() {
    const sortBy = document.getElementById('sortBy').value;
    const sortedHistory = [...pregnancyHistory].sort((a, b) => {
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
        const row = document.createElement('tr');
        const pihClass = record.pregnancy_induced_hypertension === 'Yes' ? 'pih-yes' : 'pih-no';
        
        row.innerHTML = `
            <td>${record.patient_id}</td>
            <td>${record.gravidity || 0}</td>
            <td>${record.parity || 0}</td>
            <td>${record.type_of_delivery || '-'}</td>
            <td>${record.other_delivery_method || '-'}</td>
            <td>${record.no_of_full_term || 0}</td>
            <td>${record.no_of_premature || 0}</td>
            <td>${record.no_of_abortion || 0}</td>
            <td>${record.no_of_living_children || 0}</td>
            <td class="${pihClass}">${record.pregnancy_induced_hypertension || 'No'}</td>
            <td>${record.remarks || '-'}</td>
            <td>
                <div class="action-buttons">
                    <button class="view-btn" onclick="viewHistory('${record.patient_id}')">View</button>
                    <button class="edit-btn" onclick="editHistory('${record.patient_id}')">Edit</button>
                    <button class="delete-btn" onclick="deleteHistory('${record.patient_id}')">Delete</button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Show add history modal
function showAddHistoryModal() {
    document.getElementById('addHistoryModal').classList.add('show');
}

// Hide add history modal
function hideAddHistoryModal() {
    document.getElementById('addHistoryModal').classList.remove('show');
    clearHistoryForm();
}

// Clear history form
function clearHistoryForm() {
    document.getElementById('historyForm').reset();
}

// Save new pregnancy history
function saveHistory() {
    // Get form values
    const patientId = document.getElementById('patientId').value.trim();
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
    
    // Validate required field
    if (!patientId) {
        alert('Please enter Patient ID');
        return;
    }
    
    // Create new history object
    const newHistory = {
        patient_id: patientId,
        gravidity: gravidity ? parseInt(gravidity) : 0,
        parity: parity ? parseInt(parity) : 0,
        type_of_delivery: typeOfDelivery || null,
        other_delivery_method: otherDeliveryMethod || null,
        no_of_full_term: fullTerm ? parseInt(fullTerm) : 0,
        no_of_premature: premature ? parseInt(premature) : 0,
        no_of_abortion: abortion ? parseInt(abortion) : 0,
        no_of_living_children: livingChildren ? parseInt(livingChildren) : 0,
        pregnancy_induced_hypertension: pih || 'No',
        remarks: remarks || null
    };
    
    // Add to array
    pregnancyHistory.push(newHistory);
    
    // Reload table
    loadHistory();
    
    // Hide modal
    hideAddHistoryModal();
    
    alert(`Pregnancy history for Patient ${patientId} saved successfully`);
}

// View history
function viewHistory(patientId) {
    const record = pregnancyHistory.find(r => r.patient_id === patientId);
    if (record) {
        alert(`Pregnancy History Details:
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
Remarks: ${record.remarks || 'N/A'}`);
    }
}

// Edit history
function editHistory(patientId) {
    alert(`Edit pregnancy history for Patient ${patientId}\n\nThis feature will be implemented in the next phase.`);
}

// Delete history
function deleteHistory(patientId) {
    if (confirm(`Delete pregnancy history for Patient ${patientId}?`)) {
        const index = pregnancyHistory.findIndex(r => r.patient_id === patientId);
        if (index !== -1) {
            pregnancyHistory.splice(index, 1);
            loadHistory();
            alert(`Pregnancy history for Patient ${patientId} has been deleted.`);
        }
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    displayCurrentDate();
    loadHistory();
    
    document.getElementById('historySearch')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchHistory();
        }
    });
});