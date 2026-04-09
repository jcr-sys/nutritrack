// immunizations.js
// ===== CHILD IMMUNIZATIONS PAGE WITH FIREBASE =====

let allImmunizations = [];
let allChildPatients = [];
let allVaccines = [];
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

// Load ONLY CHILD patients for dropdown
async function loadPatientsForDropdown() {
    try {
        const patientSelect = document.getElementById('patientId');
        if (!patientSelect) return;
        
        patientSelect.innerHTML = '<option value="">Loading...</option>';
        allChildPatients = [];
        
        const snapshot = await db.collection('patients').where('patient_type', '==', 'Child').orderBy('patient_id').get();
        
        patientSelect.innerHTML = '<option value="">Select Patient ID</option>';
        
        if (snapshot.empty) {
            patientSelect.innerHTML = '<option value="">No child patients found</option>';
            return;
        }
        
        snapshot.forEach(doc => {
            const patient = doc.data();
            allChildPatients.push(patient);
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

// Load VACCINES from inventory for dropdown with stock info
async function loadVaccinesForDropdown() {
    try {
        const vaccineSelect = document.getElementById('vaccineId');
        if (!vaccineSelect) return;
        
        vaccineSelect.innerHTML = '<option value="">Loading vaccines...</option>';
        allVaccines = [];
        
        const snapshot = await db.collection('vaccines_inventory').orderBy('no').get();
        
        vaccineSelect.innerHTML = '<option value="">Select Vaccine ID</option>';
        
        if (snapshot.empty) {
            vaccineSelect.innerHTML = '<option value="">No vaccines found in inventory</option>';
            return;
        }
        
        snapshot.forEach(doc => {
            const vaccine = doc.data();
            allVaccines.push(vaccine);
            const option = document.createElement('option');
            option.value = vaccine.no;
            const stockStatus = vaccine.quantity > 0 ? `Stock: ${vaccine.quantity}` : 'OUT OF STOCK';
            option.textContent = `${vaccine.no} - ${vaccine.name} (${stockStatus})`;
            vaccineSelect.appendChild(option);
        });
        
    } catch (error) {
        console.error("Error loading vaccines:", error);
        const vaccineSelect = document.getElementById('vaccineId');
        if (vaccineSelect) {
            vaccineSelect.innerHTML = '<option value="">Error loading vaccines</option>';
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

// Update vaccine name display when vaccine selected (with stock info)
function updateVaccineNameDisplay() {
    const vaccineSelect = document.getElementById('vaccineId');
    const vaccineNameDisplay = document.getElementById('vaccineNameDisplay');
    const availableStockDisplay = document.getElementById('availableStockDisplay');
    const quantityInput = document.getElementById('quantity');
    const selectedValue = vaccineSelect.value;
    
    if (selectedValue && allVaccines.length > 0) {
        const vaccine = allVaccines.find(v => v.no.toString() === selectedValue);
        if (vaccine) {
            vaccineNameDisplay.value = vaccine.name;
            availableStockDisplay.value = `${vaccine.quantity} doses available`;
            availableStockDisplay.style.color = vaccine.quantity > 0 ? '#2e7d32' : '#f44336';
            
            // Set max attribute on quantity input
            quantityInput.max = vaccine.quantity;
            
            // Validate quantity on change
            validateQuantity();
        } else {
            vaccineNameDisplay.value = '';
            availableStockDisplay.value = '';
        }
    } else {
        vaccineNameDisplay.value = '';
        availableStockDisplay.value = '';
        quantityInput.max = '';
    }
}

// Validate quantity against available stock
function validateQuantity() {
    const quantityInput = document.getElementById('quantity');
    const availableStockDisplay = document.getElementById('availableStockDisplay');
    const vaccineSelect = document.getElementById('vaccineId');
    
    if (!vaccineSelect.value) return;
    
    const vaccine = allVaccines.find(v => v.no.toString() === vaccineSelect.value);
    if (!vaccine) return;
    
    let quantity = parseInt(quantityInput.value);
    
    if (isNaN(quantity) || quantity < 1) {
        quantityInput.value = 1;
        quantity = 1;
    }
    
    if (quantity > vaccine.quantity) {
        quantityInput.value = vaccine.quantity;
        availableStockDisplay.style.color = '#f44336';
        availableStockDisplay.value = `⚠️ Only ${vaccine.quantity} doses available!`;
    } else {
        availableStockDisplay.style.color = '#2e7d32';
        availableStockDisplay.value = `${vaccine.quantity} doses available`;
    }
}

// Check vaccine stock before saving
function checkVaccineStock(vaccineId, requestedQuantity) {
    const vaccine = allVaccines.find(v => v.no.toString() === vaccineId);
    if (!vaccine) {
        return { available: false, message: 'Vaccine not found in inventory' };
    }
    if (vaccine.quantity <= 0) {
        return { available: false, message: 'Vaccine is out of stock!' };
    }
    if (requestedQuantity > vaccine.quantity) {
        return { available: false, message: `Insufficient stock! Only ${vaccine.quantity} doses available.` };
    }
    return { available: true, vaccine: vaccine };
}

// Update vaccine stock in Firestore
async function updateVaccineStock(vaccineId, currentStock, deductedQuantity) {
    try {
        const newStock = currentStock - deductedQuantity;
        await db.collection('vaccines_inventory').doc(vaccineId.toString()).update({
            quantity: newStock,
            updated_at: new Date().toISOString()
        });
        return true;
    } catch (error) {
        console.error("Error updating vaccine stock:", error);
        return false;
    }
}

// Get vaccine name by ID
function getVaccineName(vaccineId) {
    const vaccine = allVaccines.find(v => v.no.toString() === vaccineId);
    return vaccine ? vaccine.name : 'Unknown Vaccine';
}

// Load immunizations from Firestore
async function loadImmunizations() {
    const tableBody = document.getElementById('immunizationsTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '<tr><td colspan="10" style="text-align: center;">Loading immunizations...<\/div>';

    try {
        const snapshot = await db.collection('child_immunizations').orderBy('date_given', 'desc').get();

        if (snapshot.empty) {
            tableBody.innerHTML = '<tr><td colspan="10" style="text-align: center;">No immunizations found. Click "+ Record Immunization" to add.<\/div>';
            allImmunizations = [];
            return;
        }

        allImmunizations = [];
        tableBody.innerHTML = '';

        snapshot.forEach(doc => {
            const record = doc.data();
            allImmunizations.push(record);
            
            let patientName = '';
            const patient = allChildPatients.find(p => p.patient_id === record.patient_id);
            if (patient) {
                patientName = `${patient.first_name} ${patient.last_name}`;
            }
            
            const vaccineName = getVaccineName(record.vaccine_id);
            
            let doctorName = '';
            const doctor = allStaff.find(s => s.doctor_id.toString() === record.doctor_id);
            if (doctor) {
                doctorName = `Dr. ${doctor.first_name} ${doctor.last_name}`;
            }

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${record.patient_id || '-'}<\/div>
                <td>${patientName || '-'}<\/div>
                <td>${vaccineName}<\/div>
                <td>${record.quantity || 1}<\/div>
                <td>${record.dose_number || '-'}<\/div>
                <td>${record.date_given || '-'}<\/div>
                <td>${record.doctor_id || '-'}<\/div>
                <td>${doctorName}<\/div>
                <td>${record.remarks || '-'}<\/div>
                <td>
                    <div class="action-buttons">
                        <button class="view-btn" onclick="viewImmunization('${record.record_id}')">View</button>
                        <button class="edit-btn" onclick="editImmunization('${record.record_id}')">Edit</button>
                        <button class="delete-btn" onclick="deleteImmunization('${record.record_id}')">Delete</button>
                    </div>
                <\/div>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Error loading immunizations:", error);
        tableBody.innerHTML = '<tr><td colspan="10" style="text-align: center; color: red;">Error loading data. Please check your connection.<\/div>';
    }
}

// Search immunizations
function searchImmunizations() {
    const searchTerm = document.getElementById('immunizationSearch').value.toLowerCase();
    const filteredImmunizations = allImmunizations.filter(record => 
        record.patient_id.toLowerCase().includes(searchTerm) ||
        (record.vaccine_id && getVaccineName(record.vaccine_id).toLowerCase().includes(searchTerm)) ||
        (record.doctor_id && record.doctor_id.toLowerCase().includes(searchTerm)) ||
        (record.remarks && record.remarks.toLowerCase().includes(searchTerm))
    );
    displayFilteredImmunizations(filteredImmunizations);
}

// Sort immunizations
function sortImmunizations() {
    const sortBy = document.getElementById('sortBy').value;
    const sortedImmunizations = [...allImmunizations].sort((a, b) => {
        let valA = a[sortBy] || '';
        let valB = b[sortBy] || '';
        
        if (sortBy === 'patient_id' || sortBy === 'doctor_id') {
            return String(valA).localeCompare(String(valB));
        }
        if (sortBy === 'dose_number') {
            return (parseInt(valA) || 0) - (parseInt(valB) || 0);
        }
        if (sortBy === 'date_given') {
            return new Date(valA) - new Date(valB);
        }
        if (sortBy === 'vaccine_name') {
            return getVaccineName(valA).localeCompare(getVaccineName(valB));
        }
        return String(valA).localeCompare(String(valB));
    });
    displayFilteredImmunizations(sortedImmunizations);
}

// Display filtered/sorted immunizations
function displayFilteredImmunizations(immList) {
    const tableBody = document.getElementById('immunizationsTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    immList.forEach(record => {
        let patientName = '';
        const patient = allChildPatients.find(p => p.patient_id === record.patient_id);
        if (patient) {
            patientName = `${patient.first_name} ${patient.last_name}`;
        }
        
        const vaccineName = getVaccineName(record.vaccine_id);
        
        let doctorName = '';
        const doctor = allStaff.find(s => s.doctor_id.toString() === record.doctor_id);
        if (doctor) {
            doctorName = `Dr. ${doctor.first_name} ${doctor.last_name}`;
        }
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${record.patient_id || '-'}<\/div>
            <td>${patientName || '-'}<\/div>
            <td>${vaccineName}<\/div>
            <td>${record.quantity || 1}<\/div>
            <td>${record.dose_number || '-'}<\/div>
            <td>${record.date_given || '-'}<\/div>
            <td>${record.doctor_id || '-'}<\/div>
            <td>${doctorName}<\/div>
            <td>${record.remarks || '-'}<\/div>
            <td>
                <div class="action-buttons">
                    <button class="view-btn" onclick="viewImmunization('${record.record_id}')">View</button>
                    <button class="edit-btn" onclick="editImmunization('${record.record_id}')">Edit</button>
                    <button class="delete-btn" onclick="deleteImmunization('${record.record_id}')">Delete</button>
                </div>
            <\/div>
        `;
        tableBody.appendChild(row);
    });
}

// Generate unique record ID
function generateRecordId() {
    return 'imm_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
}

// Show add immunization modal
function showAddImmunizationModal() {
    document.getElementById('addImmunizationModal').classList.add('show');
    loadPatientsForDropdown();
    loadVaccinesForDropdown();
    loadStaffForDropdown();
    
    // Reset quantity to 1
    document.getElementById('quantity').value = 1;
}

// Hide add immunization modal
function hideAddImmunizationModal() {
    document.getElementById('addImmunizationModal').classList.remove('show');
    clearImmunizationForm();
}

// Clear immunization form
function clearImmunizationForm() {
    document.getElementById('immunizationForm').reset();
    document.getElementById('patientNameDisplay').value = '';
    document.getElementById('vaccineNameDisplay').value = '';
    document.getElementById('doctorNameDisplay').value = '';
    document.getElementById('availableStockDisplay').value = '';
    document.getElementById('quantity').value = 1;
}

// Save new immunization to Firestore
async function saveImmunization() {
    const patientId = document.getElementById('patientId').value;
    const vaccineId = document.getElementById('vaccineId').value;
    const quantity = parseInt(document.getElementById('quantity').value);
    const doseNumber = document.getElementById('doseNumber').value;
    const dateGiven = document.getElementById('dateGiven').value;
    const doctorId = document.getElementById('doctorId').value;
    const remarks = document.getElementById('remarks').value.trim();
    
    if (!patientId || !vaccineId || !doseNumber || !dateGiven || !doctorId) {
        alert('Please fill in all required fields');
        return;
    }
    
    if (parseInt(doseNumber) < 1) {
        alert('Dose number must be greater than 0');
        return;
    }
    
    // Check vaccine stock
    const stockCheck = checkVaccineStock(vaccineId, quantity);
    if (!stockCheck.available) {
        alert(stockCheck.message);
        return;
    }
    
    const recordId = generateRecordId();
    
    let patientName = '';
    const patient = allChildPatients.find(p => p.patient_id === patientId);
    if (patient) {
        patientName = `${patient.first_name} ${patient.last_name}`;
    }
    
    const vaccineName = getVaccineName(vaccineId);
    
    let doctorName = '';
    const doctor = allStaff.find(s => s.doctor_id.toString() === doctorId);
    if (doctor) {
        doctorName = `Dr. ${doctor.first_name} ${doctor.last_name}`;
    }
    
    const newImmunization = {
        record_id: recordId,
        patient_id: patientId,
        patient_name: patientName,
        vaccine_id: vaccineId,
        vaccine_name: vaccineName,
        quantity: quantity,
        dose_number: parseInt(doseNumber),
        date_given: dateGiven,
        doctor_id: doctorId,
        doctor_name: doctorName,
        remarks: remarks || null,
        created_at: new Date().toISOString()
    };
    
    try {
        // First, save the immunization record
        await db.collection('child_immunizations').doc(recordId).set(newImmunization);
        
        // Then, deduct vaccine stock
        const stockUpdated = await updateVaccineStock(vaccineId, stockCheck.vaccine.quantity, quantity);
        if (stockUpdated) {
            alert(`Immunization record saved! ${quantity} dose(s) of ${vaccineName} administered. Remaining stock: ${stockCheck.vaccine.quantity - quantity}`);
            // Refresh vaccines dropdown to show updated stock
            await loadVaccinesForDropdown();
        } else {
            alert(`Immunization record saved but failed to update vaccine stock. Please check inventory manually.`);
        }
        
        await loadImmunizations();
        hideAddImmunizationModal();
    } catch (error) {
        console.error("Error saving immunization:", error);
        alert("Error saving immunization. Please try again.");
    }
}

// View immunization
function viewImmunization(recordId) {
    const record = allImmunizations.find(r => r.record_id === recordId);
    if (record) {
        alert(`IMMUNIZATION DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Patient ID: ${record.patient_id}
Vaccine: ${record.vaccine_name || getVaccineName(record.vaccine_id)}
Quantity: ${record.quantity || 1} dose(s)
Dose Number: ${record.dose_number}
Date Given: ${record.date_given}
Doctor ID: ${record.doctor_id}
Remarks: ${record.remarks || 'N/A'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    }
}

// Edit immunization
function editImmunization(recordId) {
    alert(`Edit immunization record\n\nThis feature will be implemented in the next phase.`);
}

// Delete immunization from Firestore
async function deleteImmunization(recordId) {
    if (confirm(`Delete this immunization record?`)) {
        try {
            await db.collection('child_immunizations').doc(recordId).delete();
            alert(`Immunization record deleted successfully.`);
            await loadImmunizations();
        } catch (error) {
            console.error("Error deleting immunization:", error);
            alert("Error deleting immunization. Please try again.");
        }
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    displayCurrentDate();
    loadImmunizations();
    
    // Add quantity validation on input change
    const quantityInput = document.getElementById('quantity');
    if (quantityInput) {
        quantityInput.addEventListener('input', validateQuantity);
    }
    
    document.getElementById('immunizationSearch')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchImmunizations();
        }
    });
});