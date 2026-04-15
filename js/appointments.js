// appointments.js
// ===== APPOINTMENT SCHEDULING PAGE WITH FIREBASE =====

let allAppointments = [];
let allPatients = [];
let allDoctors = [];
let allBNSAndNurses = [];
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

// Load Doctors for dropdown
async function loadDoctorsForDropdown() {
    try {
        const doctorSelect = document.getElementById('doctorId');
        const editDoctorSelect = document.getElementById('editDoctorId');
        
        allDoctors = [];
        
        const snapshot = await db.collection('staff').orderBy('doctor_id').get();
        
        if (doctorSelect) {
            doctorSelect.innerHTML = '<option value="">Select Doctor</option>';
        }
        if (editDoctorSelect) {
            editDoctorSelect.innerHTML = '<option value="">Select Doctor</option>';
        }
        
        if (snapshot.empty) {
            if (doctorSelect) doctorSelect.innerHTML = '<option value="">No doctors found</option>';
            if (editDoctorSelect) editDoctorSelect.innerHTML = '<option value="">No doctors found</option>';
            return;
        }
        
        snapshot.forEach(doc => {
            const staff = doc.data();
            allDoctors.push(staff);
            const optionText = `Dr. ${staff.first_name} ${staff.last_name}`;
            
            if (doctorSelect) {
                const option = document.createElement('option');
                option.value = staff.doctor_id;
                option.textContent = optionText;
                doctorSelect.appendChild(option);
            }
            if (editDoctorSelect) {
                const editOption = document.createElement('option');
                editOption.value = staff.doctor_id;
                editOption.textContent = optionText;
                editDoctorSelect.appendChild(editOption);
            }
        });
        
    } catch (error) {
        console.error("Error loading doctors:", error);
    }
}

// Load BNS and Nurses for dropdown
async function loadBNSAndNursesForDropdown() {
    try {
        const handledBySelect = document.getElementById('handledBy');
        const editHandledBySelect = document.getElementById('editHandledBy');
        
        allBNSAndNurses = [];
        
        if (handledBySelect) handledBySelect.innerHTML = '<option value="">Select BNS or Nurse</option>';
        if (editHandledBySelect) editHandledBySelect.innerHTML = '<option value="">Select BNS or Nurse</option>';
        
        const bnsSnapshot = await db.collection('bns_workers').get();
        bnsSnapshot.forEach(doc => {
            const staff = doc.data();
            allBNSAndNurses.push({
                id: staff.bns_id,
                name: `${staff.first_name} ${staff.last_name} (BNS)`,
                type: 'bns'
            });
            if (handledBySelect) {
                const option = document.createElement('option');
                option.value = staff.bns_id;
                option.textContent = `${staff.first_name} ${staff.last_name} (BNS)`;
                handledBySelect.appendChild(option);
            }
            if (editHandledBySelect) {
                const editOption = document.createElement('option');
                editOption.value = staff.bns_id;
                editOption.textContent = `${staff.first_name} ${staff.last_name} (BNS)`;
                editHandledBySelect.appendChild(editOption);
            }
        });
        
        const nursesSnapshot = await db.collection('nurses').get();
        nursesSnapshot.forEach(doc => {
            const staff = doc.data();
            allBNSAndNurses.push({
                id: staff.nurse_id,
                name: `${staff.first_name} ${staff.last_name} (Nurse)`,
                type: 'nurse'
            });
            if (handledBySelect) {
                const option = document.createElement('option');
                option.value = staff.nurse_id;
                option.textContent = `${staff.first_name} ${staff.last_name} (Nurse)`;
                handledBySelect.appendChild(option);
            }
            if (editHandledBySelect) {
                const editOption = document.createElement('option');
                editOption.value = staff.nurse_id;
                editOption.textContent = `${staff.first_name} ${staff.last_name} (Nurse)`;
                editHandledBySelect.appendChild(editOption);
            }
        });
        
    } catch (error) {
        console.error("Error loading BNS/Nurses:", error);
    }
}

// Helper function to get patient name by ID
function getPatientNameById(patientId) {
    const patient = allPatients.find(p => p.patient_id === patientId);
    if (patient) {
        return `${patient.first_name} ${patient.last_name}`;
    }
    return '-';
}

// Helper function to get doctor name by ID
function getDoctorNameById(doctorId) {
    const doctor = allDoctors.find(d => d.doctor_id.toString() === doctorId);
    if (doctor) {
        return `Dr. ${doctor.first_name} ${doctor.last_name}`;
    }
    return '-';
}

// Helper function to get handled by name
function getHandledByName(handledById) {
    if (!handledById) return '-';
    const staff = allBNSAndNurses.find(s => s.id.toString() === handledById.toString());
    return staff ? staff.name : '-';
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

// Get status badge class
function getStatusBadgeClass(status) {
    if (!status) return 'status-pending';
    switch(status) {
        case 'Scheduled': return 'status-scheduled';
        case 'Confirmed': return 'status-confirmed';
        case 'Completed': return 'status-completed';
        case 'Cancelled': return 'status-cancelled';
        case 'No Show': return 'status-no-show';
        case 'Pending': return 'status-pending';
        default: return 'status-pending';
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

// ========== VIEW APPOINTMENT MODAL ==========
function viewAppointmentModal(docId) {
    const appointment = allAppointments.find(a => a.doc_id === docId);
    if (appointment) {
        let patientName = getPatientNameById(appointment.patient_id);
        let doctorName = getDoctorNameById(appointment.doctor_id);
        let handledByName = getHandledByName(appointment.handled_by);
        
        const content = `
            <div style="line-height: 1.8; font-family: 'Segoe UI', Arial, sans-serif;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; width: 35%; font-weight: 600; color: #2B6896;">Appointment ID:<\/td><td style="padding: 8px 0;">${appointment.appointment_id || appointment.doc_id}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Patient ID:<\/td><td style="padding: 8px 0;">${appointment.patient_id}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Patient Name:<\/td><td style="padding: 8px 0;">${patientName}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Appointment Date:<\/td><td style="padding: 8px 0;">${appointment.appointment_date}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Appointment Time:<\/td><td style="padding: 8px 0;">${appointment.appointment_time}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Meeting With (Doctor):<\/td><td style="padding: 8px 0;">${doctorName}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Handled By (BNS/Nurse):<\/td><td style="padding: 8px 0;">${handledByName}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Purpose:<\/td><td style="padding: 8px 0;">${appointment.purpose}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Status:<\/td><td style="padding: 8px 0;"><span class="status-badge ${getStatusBadgeClass(appointment.status)}">${appointment.status || 'Pending'}</span><\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Priority:<\/td><td style="padding: 8px 0;">${appointment.priority || 'Normal'}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Remarks:<\/td><td style="padding: 8px 0;">${appointment.remarks || 'N/A'}<\/td><\/tr>
                </table>
            </div>
        `;
        
        const modal = document.getElementById('viewAppointmentModal');
        if (modal) {
            document.getElementById('viewAppointmentModalBody').innerHTML = content;
            modal.classList.add('show');
        }
    }
}

function closeViewAppointmentModal() {
    const modal = document.getElementById('viewAppointmentModal');
    if (modal) modal.classList.remove('show');
}

// ========== EDIT APPOINTMENT MODAL ==========
function editAppointmentModal(docId) {
    const appointment = allAppointments.find(a => a.doc_id === docId);
    if (!appointment) {
        showToast('Appointment not found.', 'error');
        return;
    }
    
    if (appointment.status === 'Cancelled') {
        showToast('Cannot edit a cancelled appointment.', 'warning');
        return;
    }
    if (appointment.status === 'Completed') {
        showToast('Cannot edit a completed appointment.', 'warning');
        return;
    }
    
    document.getElementById('editAppointmentId').value = docId;
    document.getElementById('editPatientId').value = appointment.patient_id || '';
    document.getElementById('editPatientId').disabled = true;
    document.getElementById('editAppointmentDate').value = appointment.appointment_date || '';
    document.getElementById('editAppointmentTime').value = appointment.appointment_time || '';
    document.getElementById('editDoctorId').value = appointment.doctor_id || '';
    document.getElementById('editHandledBy').value = appointment.handled_by || '';
    document.getElementById('editPurpose').value = appointment.purpose || '';
    document.getElementById('editStatus').value = appointment.status || 'Pending';
    document.getElementById('editPriority').value = appointment.priority || 'Normal';
    document.getElementById('editRemarks').value = appointment.remarks || '';
    
    updateEditPatientNameDisplay();
    
    loadPatientsForDropdown();
    loadDoctorsForDropdown();
    loadBNSAndNursesForDropdown();
    
    document.getElementById('editAppointmentModal').classList.add('show');
}

function closeEditAppointmentModal() {
    document.getElementById('editAppointmentModal').classList.remove('show');
    document.getElementById('editPatientId').disabled = false;
}

async function updateAppointment() {
    const docId = document.getElementById('editAppointmentId').value;
    const patientId = document.getElementById('editPatientId').value;
    const appointmentDate = document.getElementById('editAppointmentDate').value;
    const appointmentTime = document.getElementById('editAppointmentTime').value;
    const doctorId = document.getElementById('editDoctorId').value;
    const handledBy = document.getElementById('editHandledBy').value;
    const purpose = document.getElementById('editPurpose').value;
    const status = document.getElementById('editStatus').value;
    const priority = document.getElementById('editPriority').value;
    const remarks = document.getElementById('editRemarks').value.trim();
    
    if (!patientId || !appointmentDate || !appointmentTime || !doctorId || !purpose || !status) {
        showToast('Please fill in all required fields', 'warning');
        return;
    }
    
    let patientName = getPatientNameById(patientId);
    let doctorName = getDoctorNameById(doctorId);
    let handledByName = getHandledByName(handledBy);
    
    try {
        await db.collection('appointments').doc(docId).update({
            patient_id: patientId,
            patient_name: patientName,
            appointment_date: appointmentDate,
            appointment_time: appointmentTime,
            doctor_id: doctorId,
            doctor_name: doctorName,
            handled_by: handledBy || null,
            handled_by_name: handledByName,
            purpose: purpose,
            status: status,
            priority: priority || 'Normal',
            remarks: remarks || null,
            updated_at: new Date().toISOString()
        });
        
        showToast(`Appointment updated successfully!`, 'success');
        await loadAppointments();
        closeEditAppointmentModal();
    } catch (error) {
        console.error("Error updating appointment:", error);
        showToast("Error updating appointment. Please try again.", 'error');
    }
}

// ========== UPDATE STATUS MODAL ==========
function openStatusModal(docId, currentStatus) {
    if (currentStatus === 'Cancelled') {
        showToast('Cannot update status of a cancelled appointment.', 'warning');
        return;
    }
    if (currentStatus === 'Completed') {
        showToast('Cannot update status of a completed appointment.', 'warning');
        return;
    }
    
    selectedAppointmentId = docId;
    selectedCurrentStatus = currentStatus || 'Pending';
    
    document.getElementById('currentStatusDisplay').value = currentStatus || 'Pending';
    
    const statusOptions = ['Pending', 'Scheduled', 'Confirmed', 'Completed', 'No Show'];
    const newStatusOptions = statusOptions.filter(s => s !== currentStatus);
    
    const newStatusSelect = document.getElementById('newStatusSelect');
    newStatusSelect.innerHTML = '<option value="">Select New Status</option>';
    newStatusOptions.forEach(status => {
        const option = document.createElement('option');
        option.value = status;
        option.textContent = status;
        newStatusSelect.appendChild(option);
    });
    
    document.getElementById('statusModal').classList.add('show');
}

function closeStatusModal() {
    document.getElementById('statusModal').classList.remove('show');
    selectedAppointmentId = null;
    selectedCurrentStatus = null;
}

async function confirmStatusUpdate() {
    const newStatus = document.getElementById('newStatusSelect').value;
    
    if (!newStatus) {
        showToast('Please select a new status', 'warning');
        return;
    }
    
    if (newStatus === selectedCurrentStatus) {
        showToast('New status is the same as current status. No change made.', 'warning');
        closeStatusModal();
        return;
    }
    
    if (!selectedAppointmentId) {
        showToast('Error: No appointment selected.', 'error');
        return;
    }
    
    try {
        await db.collection('appointments').doc(selectedAppointmentId).update({
            status: newStatus,
            updated_at: new Date().toISOString()
        });
        
        showToast(`Status updated to "${newStatus}" successfully!`, 'success');
        await loadAppointments();
        closeStatusModal();
    } catch (error) {
        console.error("Error updating status:", error);
        showToast("Error updating status: " + error.message, 'error');
    }
}

// Cancel appointment
async function cancelAppointment(docId) {
    const appointment = allAppointments.find(a => a.doc_id === docId);
    if (!appointment) return;
    
    if (appointment.status === 'Cancelled') {
        showToast('This appointment is already cancelled.', 'warning');
        return;
    }
    if (appointment.status === 'Completed') {
        showToast('Cannot cancel a completed appointment.', 'warning');
        return;
    }
    
    if (confirm(`Cancel appointment for Patient ${appointment.patient_id}? This action cannot be undone.`)) {
        try {
            await db.collection('appointments').doc(docId).update({
                status: 'Cancelled',
                updated_at: new Date().toISOString()
            });
            showToast(`Appointment has been cancelled.`, 'success');
            await loadAppointments();
        } catch (error) {
            console.error("Error cancelling appointment:", error);
            showToast("Error cancelling appointment. Please try again.", 'error');
        }
    }
}

// Load appointments from Firestore
async function loadAppointments() {
    const tableBody = document.getElementById('appointmentsTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '<tr><td colspan="11" style="text-align: center;">Loading appointments...<\/div>';

    try {
        const snapshot = await db.collection('appointments').orderBy('appointment_date', 'desc').get();
        
        if (snapshot.empty) {
            tableBody.innerHTML = '<tr><td colspan="11" style="text-align: center;">No appointments found. Click "+ New Appointment" to add.<\/div>';
            allAppointments = [];
            return;
        }
        
        allAppointments = [];
        tableBody.innerHTML = '';
        
        for (const doc of snapshot.docs) {
            const appointment = doc.data();
            // Store the document ID along with the data
            appointment.doc_id = doc.id;
            allAppointments.push(appointment);
            
            let patientName = getPatientNameById(appointment.patient_id);
            let doctorName = getDoctorNameById(appointment.doctor_id);
            let handledByName = getHandledByName(appointment.handled_by);
            
            const statusBadge = `<span class="status-badge ${getStatusBadgeClass(appointment.status)}">${appointment.status || 'Pending'}</span>`;
            const priorityBadge = appointment.priority && appointment.priority !== 'Normal' 
                ? `<span class="priority-badge ${getPriorityBadgeClass(appointment.priority)}">${appointment.priority}</span>` 
                : '';
            
            const isCancelled = appointment.status === 'Cancelled';
            const isCompleted = appointment.status === 'Completed';
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${appointment.appointment_id || doc.id.substring(0, 8)}<\/div>
                <td>${appointment.patient_id || '-'}<\/div>
                <td>${patientName}<\/div>
                <td>${appointment.appointment_date || '-'}<\/div>
                <td>${appointment.appointment_time || '-'}<\/div>
                <td>${doctorName}<\/div>
                <td>${handledByName}<\/div>
                <td>${appointment.purpose || '-'} ${priorityBadge}<\/div>
                <td>${statusBadge}<\/div>
                <td>${appointment.remarks || '-'}<\/div>
                <td>
                    <div class="action-buttons">
                        <button class="view-btn" onclick="viewAppointmentModal('${doc.id}')">View</button>
                        ${!isCancelled && !isCompleted ? `<button class="edit-btn" onclick="editAppointmentModal('${doc.id}')">Edit</button>` : ''}
                        ${!isCancelled && !isCompleted ? `<button class="status-update-btn" onclick="openStatusModal('${doc.id}', '${appointment.status}')">Update Status</button>` : ''}
                        ${!isCancelled && !isCompleted ? `<button class="cancel-appointment-btn" onclick="cancelAppointment('${doc.id}')">Cancel</button>` : ''}
                    </div>
                <\/div>
            `;
            tableBody.appendChild(row);
        }
    } catch (error) {
        console.error("Error loading appointments:", error);
        tableBody.innerHTML = '<tr><td colspan="11" style="text-align: center; color: red;">Error loading data. Please check your connection.<\/div>';
    }
}

// Search appointments
function searchAppointments() {
    const searchTerm = document.getElementById('appointmentSearch').value.toLowerCase();
    const filteredAppointments = allAppointments.filter(app => 
        (app.appointment_id && app.appointment_id.toLowerCase().includes(searchTerm)) ||
        (app.patient_id && app.patient_id.toLowerCase().includes(searchTerm)) ||
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
            return String(valA).localeCompare(String(valB));
        }
        if (sortBy === 'appointment_date') {
            return new Date(valA) - new Date(valB);
        }
        if (sortBy === 'appointment_time') {
            return String(valA).localeCompare(String(valB));
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
        let patientName = getPatientNameById(app.patient_id);
        let doctorName = getDoctorNameById(app.doctor_id);
        let handledByName = getHandledByName(app.handled_by);
        
        const statusBadge = `<span class="status-badge ${getStatusBadgeClass(app.status)}">${app.status || 'Pending'}</span>`;
        const priorityBadge = app.priority && app.priority !== 'Normal' 
            ? `<span class="priority-badge ${getPriorityBadgeClass(app.priority)}">${app.priority}</span>` 
            : '';
        
        const isCancelled = app.status === 'Cancelled';
        const isCompleted = app.status === 'Completed';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${app.appointment_id || app.doc_id.substring(0, 8)}<\/div>
            <td>${app.patient_id || '-'}<\/div>
            <td>${patientName}<\/div>
            <td>${app.appointment_date || '-'}<\/div>
            <td>${app.appointment_time || '-'}<\/div>
            <td>${doctorName}<\/div>
            <td>${handledByName}<\/div>
            <td>${app.purpose || '-'} ${priorityBadge}<\/div>
            <td>${statusBadge}<\/div>
            <td>${app.remarks || '-'}<\/div>
            <td>
                <div class="action-buttons">
                    <button class="view-btn" onclick="viewAppointmentModal('${app.doc_id}')">View</button>
                    ${!isCancelled && !isCompleted ? `<button class="edit-btn" onclick="editAppointmentModal('${app.doc_id}')">Edit</button>` : ''}
                    ${!isCancelled && !isCompleted ? `<button class="status-update-btn" onclick="openStatusModal('${app.doc_id}', '${app.status}')">Update Status</button>` : ''}
                    ${!isCancelled && !isCompleted ? `<button class="cancel-appointment-btn" onclick="cancelAppointment('${app.doc_id}')">Cancel</button>` : ''}
                </div>
            <\/div>
        `;
        tableBody.appendChild(row);
    });
}

// Generate new appointment ID for web-created appointments
function generateAppointmentId() {
    if (allAppointments.length === 0) return 'A001';
    const lastId = allAppointments[allAppointments.length - 1].appointment_id;
    if (lastId && lastId.startsWith('A')) {
        const num = parseInt(lastId.substring(1)) + 1;
        return 'A' + String(num).padStart(3, '0');
    }
    return 'A001';
}

// Show add appointment modal
function showAddAppointmentModal() {
    document.getElementById('addAppointmentModal').classList.add('show');
    loadPatientsForDropdown();
    loadDoctorsForDropdown();
    loadBNSAndNursesForDropdown();
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
    const doctorId = document.getElementById('doctorId').value;
    const handledBy = document.getElementById('handledBy').value;
    const purpose = document.getElementById('purpose').value;
    const status = document.getElementById('status').value;
    const priority = document.getElementById('priority').value;
    const remarks = document.getElementById('remarks').value.trim();
    
    if (!patientId || !appointmentDate || !appointmentTime || !doctorId || !purpose || !status) {
        showToast('Please fill in all required fields', 'warning');
        return;
    }
    
    const appointmentId = generateAppointmentId();
    
    let patientName = getPatientNameById(patientId);
    let doctorName = getDoctorNameById(doctorId);
    let handledByName = getHandledByName(handledBy);
    
    const newAppointment = {
        appointment_id: appointmentId,
        patient_id: patientId,
        patient_name: patientName,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        doctor_id: doctorId,
        doctor_name: doctorName,
        handled_by: handledBy || null,
        handled_by_name: handledByName,
        purpose: purpose,
        status: status,
        priority: priority || 'Normal',
        remarks: remarks || null,
        created_at: new Date().toISOString()
    };
    
    try {
        const docRef = await db.collection('appointments').add(newAppointment);
        showToast(`Appointment ${appointmentId} scheduled successfully for Patient ${patientId}`, 'success');
        await loadAppointments();
        hideAddAppointmentModal();
    } catch (error) {
        console.error("Error saving appointment:", error);
        showToast("Error saving appointment. Please try again.", 'error');
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

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    displayCurrentDate();
    loadPatientsForDropdown().then(() => {
        loadDoctorsForDropdown();
        loadBNSAndNursesForDropdown();
        loadAppointments();
    });
    
    const searchInput = document.getElementById('appointmentSearch');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchAppointments();
            }
        });
    }
});