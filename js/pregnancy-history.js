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
        const editPatientSelect = document.getElementById('editPatientId');
        if (!patientSelect) return;
        
        patientSelect.innerHTML = '<option value="">Loading...</option>';
        if (editPatientSelect) editPatientSelect.innerHTML = '<option value="">Loading...</option>';
        allPregnantPatients = [];
        
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
            allPregnantPatients.push(patient);
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

// Update edit patient name display
function updateEditPatientNameDisplay() {
    const patientSelect = document.getElementById('editPatientId');
    const patientNameDisplay = document.getElementById('editPatientNameDisplay');
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
    
    tableBody.innerHTML = '<td><td colspan="13" style="text-align: center;">Loading pregnancy history...<\/div>';
    
    try {
        const snapshot = await db.collection('pregnancy_history').orderBy('patient_id').get();
        
        if (snapshot.empty) {
            tableBody.innerHTML = '<td><td colspan="13" style="text-align: center;">No pregnancy history found. Click "+ Add History" to add.<\/div>';
            allPregnancyHistory = [];
            return;
        }
        
        allPregnancyHistory = [];
        tableBody.innerHTML = '';
        
        for (const doc of snapshot.docs) {
            const record = doc.data();
            allPregnancyHistory.push(record);
            
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
                        <button class="view-btn" onclick="viewHistoryModal('${record.history_id}')">View</button>
                        <button class="edit-btn" onclick="editHistoryModal('${record.history_id}')">Edit</button>
                        <button class="delete-btn" onclick="showDeleteHistoryConfirmation('${record.history_id}', '${record.patient_id}')">Delete</button>
                    </div>
                <\/div>
            `;
            tableBody.appendChild(row);
        }
    } catch (error) {
        console.error("Error loading pregnancy history:", error);
        tableBody.innerHTML = '<td><td colspan="13" style="text-align: center; color: red;">Error loading data. Please check your connection.<\/div>';
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
                    <button class="view-btn" onclick="viewHistoryModal('${record.history_id}')">View</button>
                    <button class="edit-btn" onclick="editHistoryModal('${record.history_id}')">Edit</button>
                    <button class="delete-btn" onclick="showDeleteHistoryConfirmation('${record.history_id}', '${record.patient_id}')">Delete</button>
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
    return 'preg_hist_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
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
        showToast('Please select a Patient ID', 'warning');
        return;
    }
    
    const historyId = generateHistoryId();
    
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
        showToast(`Pregnancy history for Patient ${patientId} saved successfully!`, 'success');
        await loadHistory();
        hideAddHistoryModal();
    } catch (error) {
        console.error("Error saving pregnancy history:", error);
        showToast("Error saving pregnancy history. Please try again.", 'error');
    }
}

// ========== VIEW HISTORY MODAL ==========
function viewHistoryModal(historyId) {
    const record = allPregnancyHistory.find(r => r.history_id === historyId);
    if (record) {
        const pihClass = record.pregnancy_induced_hypertension === 'Yes' ? 'pih-yes' : 'pih-no';
        
        const content = `
            <div style="line-height: 1.8; font-family: 'Segoe UI', Arial, sans-serif;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; width: 40%; font-weight: 600; color: #2B6896;">Patient ID:<\/td><td style="padding: 8px 0;">${record.patient_id}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Patient Name:<\/td><td style="padding: 8px 0;">${record.patient_name || '-'}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Gravidity:<\/td><td style="padding: 8px 0;">${record.gravidity || 0}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Parity:<\/td><td style="padding: 8px 0;">${record.parity || 0}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Type of Delivery:<\/td><td style="padding: 8px 0;">${record.type_of_delivery || 'N/A'}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Other Delivery Method:<\/td><td style="padding: 8px 0;">${record.other_delivery_method || 'N/A'}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Full Term Births:<\/td><td style="padding: 8px 0;">${record.no_of_full_term || 0}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Premature Births:<\/td><td style="padding: 8px 0;">${record.no_of_premature || 0}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Abortions:<\/td><td style="padding: 8px 0;">${record.no_of_abortion || 0}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Living Children:<\/td><td style="padding: 8px 0;">${record.no_of_living_children || 0}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">PIH (Pregnancy Induced Hypertension):<\/td><td style="padding: 8px 0;" class="${pihClass}">${record.pregnancy_induced_hypertension || 'No'}<\/td><\/tr>
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
function editHistoryModal(historyId) {
    const record = allPregnancyHistory.find(r => r.history_id === historyId);
    if (!record) {
        showToast('Pregnancy history record not found.', 'error');
        return;
    }
    
    console.log("Editing record:", record); // Debug log
    
    document.getElementById('editHistoryId').value = record.history_id;
    
    // Patient ID - READ ONLY text input
    const editPatientIdField = document.getElementById('editPatientId');
    if (editPatientIdField) {
        editPatientIdField.value = record.patient_id;
    }
    
    // Patient Name - display only - get from allPregnantPatients array
    let patientName = '';
    const patient = allPregnantPatients.find(p => p.patient_id === record.patient_id);
    if (patient) {
        patientName = `${patient.first_name} ${patient.last_name}`;
    } else {
        // If not found in array, try to fetch from patients collection
        (async () => {
            try {
                const patientDoc = await db.collection('patients').doc(record.patient_id).get();
                if (patientDoc.exists) {
                    const patientData = patientDoc.data();
                    patientName = `${patientData.first_name} ${patientData.last_name}`;
                    allPregnantPatients.push(patientData);
                    document.getElementById('editPatientNameDisplay').value = patientName;
                }
            } catch (err) {
                console.error("Error fetching patient:", err);
                document.getElementById('editPatientNameDisplay').value = '';
            }
        })();
    }
    
    const editPatientNameDisplay = document.getElementById('editPatientNameDisplay');
    if (editPatientNameDisplay) {
        editPatientNameDisplay.value = patientName;
    }
    
    // Set all other fields
    document.getElementById('editGravidity').value = record.gravidity || 0;
    document.getElementById('editParity').value = record.parity || 0;
    document.getElementById('editTypeOfDelivery').value = record.type_of_delivery || '';
    document.getElementById('editOtherDeliveryMethod').value = record.other_delivery_method || '';
    document.getElementById('editFullTerm').value = record.no_of_full_term || 0;
    document.getElementById('editPremature').value = record.no_of_premature || 0;
    document.getElementById('editAbortion').value = record.no_of_abortion || 0;
    document.getElementById('editLivingChildren').value = record.no_of_living_children || 0;
    document.getElementById('editPih').value = record.pregnancy_induced_hypertension || '';
    document.getElementById('editRemarks').value = record.remarks || '';
    
    document.getElementById('editHistoryModal').classList.add('show');
}

function closeEditHistoryModal() {
    document.getElementById('editHistoryModal').classList.remove('show');
}

function closeEditHistoryModal() {
    document.getElementById('editHistoryModal').classList.remove('show');
}

async function updatePregnancyHistory() {
    const historyId = document.getElementById('editHistoryId').value;
    const patientId = document.getElementById('editPatientId').value;
    const gravidity = document.getElementById('editGravidity').value;
    const parity = document.getElementById('editParity').value;
    const typeOfDelivery = document.getElementById('editTypeOfDelivery').value;
    const otherDeliveryMethod = document.getElementById('editOtherDeliveryMethod').value.trim();
    const fullTerm = document.getElementById('editFullTerm').value;
    const premature = document.getElementById('editPremature').value;
    const abortion = document.getElementById('editAbortion').value;
    const livingChildren = document.getElementById('editLivingChildren').value;
    const pih = document.getElementById('editPih').value;
    const remarks = document.getElementById('editRemarks').value.trim();
    
    if (!patientId) {
        showToast('Please select a Patient ID', 'warning');
        return;
    }
    
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
    
    try {
        await db.collection('pregnancy_history').doc(historyId).update({
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
            updated_at: new Date().toISOString()
        });
        
        showToast(`Pregnancy history record updated successfully!`, 'success');
        await loadHistory();
        closeEditHistoryModal();
    } catch (error) {
        console.error("Error updating pregnancy history:", error);
        showToast("Error updating pregnancy history. Please try again.", 'error');
    }
}

function closeEditHistoryModal() {
    document.getElementById('editHistoryModal').classList.remove('show');
}

async function updatePregnancyHistory() {
    const historyId = document.getElementById('editHistoryId').value;
    const patientId = document.getElementById('editPatientId').value;
    const gravidity = document.getElementById('editGravidity').value;
    const parity = document.getElementById('editParity').value;
    const typeOfDelivery = document.getElementById('editTypeOfDelivery').value;
    const otherDeliveryMethod = document.getElementById('editOtherDeliveryMethod').value.trim();
    const fullTerm = document.getElementById('editFullTerm').value;
    const premature = document.getElementById('editPremature').value;
    const abortion = document.getElementById('editAbortion').value;
    const livingChildren = document.getElementById('editLivingChildren').value;
    const pih = document.getElementById('editPih').value;
    const remarks = document.getElementById('editRemarks').value.trim();
    
    if (!patientId) {
        showToast('Please select a Patient ID', 'warning');
        return;
    }
    
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
    
    try {
        await db.collection('pregnancy_history').doc(historyId).update({
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
            updated_at: new Date().toISOString()
        });
        
        showToast(`Pregnancy history record updated successfully!`, 'success');
        await loadHistory();
        closeEditHistoryModal();
    } catch (error) {
        console.error("Error updating pregnancy history:", error);
        showToast("Error updating pregnancy history. Please try again.", 'error');
    }
}

function closeEditHistoryModal() {
    document.getElementById('editHistoryModal').classList.remove('show');
}

async function updatePregnancyHistory() {
    const historyId = document.getElementById('editHistoryId').value;
    const patientId = document.getElementById('editPatientId').value;
    const gravidity = document.getElementById('editGravidity').value;
    const parity = document.getElementById('editParity').value;
    const typeOfDelivery = document.getElementById('editTypeOfDelivery').value;
    const otherDeliveryMethod = document.getElementById('editOtherDeliveryMethod').value.trim();
    const fullTerm = document.getElementById('editFullTerm').value;
    const premature = document.getElementById('editPremature').value;
    const abortion = document.getElementById('editAbortion').value;
    const livingChildren = document.getElementById('editLivingChildren').value;
    const pih = document.getElementById('editPih').value;
    const remarks = document.getElementById('editRemarks').value.trim();
    
    if (!patientId) {
        showToast('Please select a Patient ID', 'warning');
        return;
    }
    
    let patientName = '';
    const patient = allPregnantPatients.find(p => p.patient_id === patientId);
    if (patient) {
        patientName = `${patient.first_name} ${patient.last_name}`;
    }
    
    try {
        await db.collection('pregnancy_history').doc(historyId).update({
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
            updated_at: new Date().toISOString()
        });
        
        showToast(`Pregnancy history record updated successfully!`, 'success');
        await loadHistory();
        closeEditHistoryModal();
    } catch (error) {
        console.error("Error updating pregnancy history:", error);
        showToast("Error updating pregnancy history. Please try again.", 'error');
    }
}

// ========== DELETE HISTORY CONFIRMATION MODAL ==========
function showDeleteHistoryConfirmation(historyId, patientId) {
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
                    <p>Are you sure you want to delete this pregnancy history record?</p>
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
                <p>Are you sure you want to delete this pregnancy history record?</p>
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
            await db.collection('pregnancy_history').doc(historyId).delete();
            showToast(`Pregnancy history record deleted successfully.`, 'success');
            await loadHistory();
        } catch (error) {
            console.error("Error deleting pregnancy history:", error);
            showToast("Error deleting pregnancy history. Please try again.", 'error');
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