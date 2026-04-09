// appointments.js
// ===== APPOINTMENT SCHEDULING PAGE WITH FIREBASE =====

let allAppointments = [];
let allPatients = [];
let selectedAppointmentId = null;
let selectedCurrentStatus = null;

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

// Get status badge class
function getStatusBadgeClass(status) {
    switch(status) {
        case 'Scheduled': return 'status-scheduled';
        case 'Confirmed': return 'status-confirmed';
        case 'Completed': return 'status-completed';
        case 'Cancelled': return 'status-cancelled';
        case 'No Show': return 'status-no-show';
        default: return '';
    }
}

// Get priority badge class
function getPriorityBadgeClass(priority) {
    switch(priority) {
        case 'Prenatal Priority': return 'priority-prenatal';
        case 'Emergency': return 'priority-emergency';
        default: return '';
    }
}

// Open status update modal
function openStatusModal(appointmentId, currentStatus) {
    selectedAppointmentId = appointmentId;
    selectedCurrentStatus = currentStatus;
    
    document.getElementById('currentStatusDisplay').value = currentStatus;
    document.getElementById('newStatusSelect').value = '';
    document.getElementById('statusModal').classList.add('show');
}

// Close status modal
function closeStatusModal() {
    document.getElementById('statusModal').classList.remove('show');
    selectedAppointmentId = null;
    selectedCurrentStatus = null;
}

// Confirm and update status
async function confirmStatusUpdate() {
    const newStatus = document.getElementById('newStatusSelect').value;
    
    if (!newStatus) {
        alert('Please select a new status');
        return;
    }
    
    if (newStatus === selectedCurrentStatus) {
        alert('New status is the same as current status. No change made.');
        closeStatusModal();
        return;
    }
    
    if (confirm(`Change status from "${selectedCurrentStatus}" to "${newStatus}"?`)) {
        try {
            await db.collection('appointments').doc(selectedAppointmentId).update({
                status: newStatus,
                updated_at: new Date().toISOString()
            });
            alert(`Status updated to "${newStatus}" successfully!`);
            await loadAppointments();
            closeStatusModal();
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Error updating status. Please try again.");
        }
    }
}

// Load appointments from Firestore
async function loadAppointments() {
    const tableBody = document.getElementById('appointmentsTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '<tr><td colspan="9" style="text-align: center;">Loading appointments...<\/div>';

    try {
        const snapshot = await db.collection('appointments').orderBy('appointment_date', 'desc').get();
        
        if (snapshot.empty) {
            tableBody.innerHTML = '<tr><td colspan="9" style="text-align: center;">No appointments found. Click "+ New Appointment" to add.<\/div>';
            allAppointments = [];
            return;
        }
        
        allAppointments = [];
        tableBody.innerHTML = '';
        
        snapshot.forEach(doc => {
            const appointment = doc.data();
            allAppointments.push(appointment);
            
            // Get patient name
            let patientName = '-';
            const patient = allPatients.find(p => p.patient_id === appointment.patient_id);
            if (patient) {
                patientName = `${patient.first_name} ${patient.last_name}`;
            }
            
            const statusBadge = `<span class="status-badge ${getStatusBadgeClass(appointment.status)}">${appointment.status}</span>`;
            const priorityBadge = appointment.priority && appointment.priority !== 'Normal' 
                ? `<span class="priority-badge ${getPriorityBadgeClass(appointment.priority)}">${appointment.priority}</span>` 
                : '';
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${appointment.appointment_id || '-'}<\/div>
                <td>${appointment.patient_id || '-'}<\/div>
                <td>${patientName}<\/div>
                <td>${appointment.appointment_date || '-'}<\/div>
                <td>${appointment.appointment_time || '-'}<\/div>
                <td>${appointment.purpose || '-'} ${priorityBadge}<\/div>
                <td>${statusBadge}<\/div>
                <td>${appointment.remarks || '-'}<\/div>
                <td>
                    <div class="action-buttons">
                        <button class="view-btn" onclick="viewAppointment('${appointment.appointment_id}')">View</button>
                        <button class="edit-btn" onclick="editAppointment('${appointment.appointment_id}')">Edit</button>
                        <button class="status-update-btn" onclick="openStatusModal('${appointment.appointment_id}', '${appointment.status}')">Update Status</button>
                        ${appointment.status !== 'Completed' && appointment.status !== 'Cancelled' ? 
                            `<button class="cancel-appointment-btn" onclick="cancelAppointment('${appointment.appointment_id}')">Cancel</button>` : ''}
                    </div>
                <\/div>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Error loading appointments:", error);
        tableBody.innerHTML = '<tr><td colspan="9" style="text-align: center; color: red;">Error loading data. Please check your connection.<\/div>';
    }
}

// Search appointments
function searchAppointments() {
    const searchTerm = document.getElementById('appointmentSearch').value.toLowerCase();
    const filteredAppointments = allAppointments.filter(app => 
        app.appointment_id.toLowerCase().includes(searchTerm) ||
        app.patient_id.toLowerCase().includes(searchTerm) ||
        (app.purpose && app.purpose.toLowerCase().includes(searchTerm)) ||
        (app.status && app.status.toLowerCase().includes(searchTerm)) ||
        (app.remarks && app.remarks.toLowerCase().includes(searchTerm))
    );
    displayFilteredAppointments(filteredAppointments);
}

// Sort appointments
function sortAppointments() {
    const sortBy = document.getElementById('sortBy').value;
    const sortedAppointments = [...allAppointments].sort((a, b) => {
        let valA = a[sortBy] || '';
        let valB = b[sortBy] || '';
        
        if (sortBy === 'appointment_id' || sortBy === 'patient_id') {
            return valA.localeCompare(valB);
        }
        if (sortBy === 'appointment_date') {
            return new Date(valA) - new Date(valB);
        }
        if (sortBy === 'appointment_time') {
            return valA.localeCompare(valB);
        }
        return String(valA).localeCompare(String(valB));
    });
    displayFilteredAppointments(sortedAppointments);
}

// Display filtered/sorted appointments
function displayFilteredAppointments(appList) {
    const tableBody = document.getElementById('appointmentsTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    appList.forEach(app => {
        let patientName = '-';
        const patient = allPatients.find(p => p.patient_id === app.patient_id);
        if (patient) {
            patientName = `${patient.first_name} ${patient.last_name}`;
        }
        
        const statusBadge = `<span class="status-badge ${getStatusBadgeClass(app.status)}">${app.status}</span>`;
        const priorityBadge = app.priority && app.priority !== 'Normal' 
            ? `<span class="priority-badge ${getPriorityBadgeClass(app.priority)}">${app.priority}</span>` 
            : '';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${app.appointment_id || '-'}<\/div>
            <td>${app.patient_id || '-'}<\/div>
            <td>${patientName}<\/div>
            <td>${app.appointment_date || '-'}<\/div>
            <td>${app.appointment_time || '-'}<\/div>
            <td>${app.purpose || '-'} ${priorityBadge}<\/div>
            <td>${statusBadge}<\/div>
            <td>${app.remarks || '-'}<\/div>
            <td>
                <div class="action-buttons">
                    <button class="view-btn" onclick="viewAppointment('${app.appointment_id}')">View</button>
                    <button class="edit-btn" onclick="editAppointment('${app.appointment_id}')">Edit</button>
                    <button class="status-update-btn" onclick="openStatusModal('${app.appointment_id}', '${app.status}')">Update Status</button>
                    ${app.status !== 'Completed' && app.status !== 'Cancelled' ? 
                        `<button class="cancel-appointment-btn" onclick="cancelAppointment('${app.appointment_id}')">Cancel</button>` : ''}
                </div>
            <\/div>
        `;
        tableBody.appendChild(row);
    });
}

// Generate new appointment ID
function generateAppointmentId() {
    if (allAppointments.length === 0) return 'A001';
    const lastId = allAppointments[allAppointments.length - 1].appointment_id;
    const num = parseInt(lastId.substring(1)) + 1;
    return 'A' + String(num).padStart(3, '0');
}

// Show add appointment modal
function showAddAppointmentModal() {
    document.getElementById('addAppointmentModal').classList.add('show');
    loadPatientsForDropdown();
}

// Hide add appointment modal
function hideAddAppointmentModal() {
    document.getElementById('addAppointmentModal').classList.remove('show');
    clearAppointmentForm();
}

// Clear appointment form
function clearAppointmentForm() {
    document.getElementById('appointmentForm').reset();
    document.getElementById('patientNameDisplay').value = '';
}

// Save new appointment to Firestore
async function saveAppointment() {
    const patientId = document.getElementById('patientId').value;
    const appointmentDate = document.getElementById('appointmentDate').value;
    const appointmentTime = document.getElementById('appointmentTime').value;
    const purpose = document.getElementById('purpose').value;
    const status = document.getElementById('status').value;
    const priority = document.getElementById('priority').value;
    const remarks = document.getElementById('remarks').value.trim();
    
    if (!patientId || !appointmentDate || !appointmentTime || !purpose || !status) {
        alert('Please fill in all required fields');
        return;
    }
    
    const appointmentId = generateAppointmentId();
    
    // Get patient name
    let patientName = '';
    const patient = allPatients.find(p => p.patient_id === patientId);
    if (patient) {
        patientName = `${patient.first_name} ${patient.last_name}`;
    }
    
    const newAppointment = {
        appointment_id: appointmentId,
        patient_id: patientId,
        patient_name: patientName,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        purpose: purpose,
        status: status,
        priority: priority || 'Normal',
        remarks: remarks || null,
        created_at: new Date().toISOString()
    };
    
    try {
        await db.collection('appointments').doc(appointmentId).set(newAppointment);
        alert(`Appointment ${appointmentId} scheduled successfully for Patient ${patientId}`);
        await loadAppointments();
        hideAddAppointmentModal();
    } catch (error) {
        console.error("Error saving appointment:", error);
        alert("Error saving appointment. Please try again.");
    }
}

// View appointment
function viewAppointment(appointmentId) {
    const appointment = allAppointments.find(a => a.appointment_id === appointmentId);
    if (appointment) {
        let patientName = '-';
        const patient = allPatients.find(p => p.patient_id === appointment.patient_id);
        if (patient) {
            patientName = `${patient.first_name} ${patient.last_name}`;
        }
        
        alert(`APPOINTMENT DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ID: ${appointment.appointment_id}
Patient: ${patientName} (ID: ${appointment.patient_id})
Date: ${appointment.appointment_date}
Time: ${appointment.appointment_time}
Purpose: ${appointment.purpose}
Status: ${appointment.status}
Priority: ${appointment.priority || 'Normal'}
Remarks: ${appointment.remarks || 'N/A'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    }
}

// Edit appointment
function editAppointment(appointmentId) {
    alert(`Edit appointment ${appointmentId}\n\nThis feature will be implemented in the next phase.`);
}

// Cancel appointment from Firestore
async function cancelAppointment(appointmentId) {
    const appointment = allAppointments.find(a => a.appointment_id === appointmentId);
    if (appointment) {
        if (confirm(`Cancel appointment ${appointmentId} for Patient ${appointment.patient_id}?`)) {
            try {
                await db.collection('appointments').doc(appointmentId).update({
                    status: 'Cancelled',
                    updated_at: new Date().toISOString()
                });
                alert(`Appointment ${appointmentId} has been cancelled.`);
                await loadAppointments();
            } catch (error) {
                console.error("Error cancelling appointment:", error);
                alert("Error cancelling appointment. Please try again.");
            }
        }
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    displayCurrentDate();
    loadAppointments();
    
    const searchInput = document.getElementById('appointmentSearch');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchAppointments();
            }
        });
    }
});