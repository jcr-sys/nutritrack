// ===== PAYROLL PAGE FUNCTIONALITY WITH FIREBASE REAL DATA =====

let allStaff = [];
let payrollRecords = [];
let currentPayPeriod = null;

// Display current date
function displayCurrentDate() {
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        const today = new Date();
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        dateElement.textContent = today.toLocaleDateString('en-US', options);
    }
}

// Load staff from Firestore
async function loadStaffData() {
    console.log("Loading staff data for payroll...");
    
    try {
        const snapshot = await db.collection('staff').orderBy('doctor_id').get();
        
        if (snapshot.empty) {
            console.log("No staff found");
            allStaff = [];
            document.getElementById('totalStaff').textContent = '0';
            return;
        }
        
        allStaff = [];
        snapshot.forEach(doc => {
            const staff = doc.data();
            allStaff.push(staff);
        });
        
        console.log(`Loaded ${allStaff.length} staff members`);
        document.getElementById('totalStaff').textContent = allStaff.length;
        
        // Initialize payroll records from staff data
        initializePayrollFromStaff();
        
    } catch (error) {
        console.error("Error loading staff:", error);
        document.getElementById('totalStaff').textContent = 'Error';
    }
}

// Initialize payroll records from staff data
function initializePayrollFromStaff() {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    currentPayPeriod = `${monthNames[currentMonth]} ${currentYear}`;
    document.getElementById('payPeriod').textContent = currentPayPeriod;
    
    // Calculate payroll for each staff member
    payrollRecords = allStaff.map(staff => {
        // Get salary from staff data, default based on position if not set
        let baseSalary = staff.salary || getDefaultSalary(staff.specialty);
        
        // Calculate allowances (10% of base salary for most, higher for doctors)
        let allowances = 0;
        if (staff.specialty === 'Doctor' || staff.specialty === 'Obstetrics and Gynecology') {
            allowances = Math.round(baseSalary * 0.12);
        } else if (staff.specialty === 'Nurse') {
            allowances = Math.round(baseSalary * 0.10);
        } else {
            allowances = Math.round(baseSalary * 0.08);
        }
        
        // Calculate deductions (SSS, PhilHealth, Pag-IBIG approximations)
        let deductions = calculateDeductions(baseSalary);
        
        // Calculate net salary
        let netSalary = baseSalary + allowances - deductions;
        
        // Determine status (can be customized - for now, set as 'Pending')
        let status = 'Pending';
        
        return {
            id: staff.doctor_id,
            doc_id: staff.doc_id,
            name: `Dr. ${staff.first_name} ${staff.last_name}`,
            first_name: staff.first_name,
            last_name: staff.last_name,
            position: staff.specialty,
            department: staff.department || getDepartmentFromSpecialty(staff.specialty),
            base_salary: baseSalary,
            allowances: allowances,
            deductions: deductions,
            net_salary: netSalary,
            status: status,
            pay_date: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-15`,
            date_joined: staff.date_joined
        };
    });
    
    // Load payroll into table
    loadPayroll();
    calculateTotals();
}

// Get default salary based on position/specialty
function getDefaultSalary(specialty) {
    switch(specialty) {
        case 'Doctor':
        case 'Obstetrics and Gynecology':
            return 50000;
        case 'Pediatrics':
            return 45000;
        case 'Geriatrics':
            return 45000;
        case 'Nutritionist':
            return 35000;
        case 'Nurse':
            return 30000;
        case 'BNS Worker':
            return 20000;
        case 'IT':
            return 25000;
        default:
            return 25000;
    }
}

// Get department from specialty
function getDepartmentFromSpecialty(specialty) {
    switch(specialty) {
        case 'Pediatrics':
            return 'Pediatrics Department';
        case 'Obstetrics and Gynecology':
            return 'Obstetrics Department';
        case 'Geriatrics':
            return 'Geriatrics Department';
        case 'Nutritionist':
            return 'Nutrition Department';
        case 'BNS Worker':
            return 'Barangay Nutrition';
        case 'Nurse':
            return 'Nursing';
        case 'IT':
            return 'IT Department';
        case 'Doctor':
            return 'Medical';
        default:
            return 'Health Center';
    }
}

// Calculate deductions (SSS, PhilHealth, Pag-IBIG approximations)
function calculateDeductions(salary) {
    // SSS contribution (approximate)
    let sss = 0;
    if (salary <= 25000) sss = 800;
    else if (salary <= 50000) sss = 1200;
    else sss = 1500;
    
    // PhilHealth (3% of salary, split equally with employer - employee pays 1.5%)
    let philhealth = Math.round(salary * 0.015);
    if (philhealth < 300) philhealth = 300;
    if (philhealth > 1800) philhealth = 1800;
    
    // Pag-IBIG (fixed rate)
    let pagibig = 100;
    
    // Withholding tax (approximate)
    let tax = 0;
    if (salary > 20833) {
        tax = Math.round((salary - 20833) * 0.15);
    }
    
    return sss + philhealth + pagibig + tax;
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// Calculate totals
function calculateTotals() {
    const totalBase = payrollRecords.reduce((sum, emp) => sum + emp.base_salary, 0);
    const totalAllowances = payrollRecords.reduce((sum, emp) => sum + emp.allowances, 0);
    const totalDeductions = payrollRecords.reduce((sum, emp) => sum + emp.deductions, 0);
    const grandTotal = payrollRecords.reduce((sum, emp) => sum + emp.net_salary, 0);
    
    document.getElementById('totalBase').textContent = formatCurrency(totalBase);
    document.getElementById('totalAllowances').textContent = formatCurrency(totalAllowances);
    document.getElementById('totalDeductions').textContent = formatCurrency(totalDeductions);
    document.getElementById('grandTotal').textContent = formatCurrency(grandTotal);
    document.getElementById('totalPayroll').textContent = formatCurrency(grandTotal);
}

// Get status badge class
function getStatusBadgeClass(status) {
    switch(status) {
        case 'Paid': return 'status-paid';
        case 'Processing': return 'status-processing';
        case 'Pending': return 'status-pending';
        default: return '';
    }
}

// Load payroll into table
function loadPayroll() {
    const tableBody = document.getElementById('payrollTableBody');
    if (!tableBody) return;
    
    if (payrollRecords.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="10" style="text-align: center;">No staff found. Please add staff members first.<\/div><\/div>';
        return;
    }
    
    tableBody.innerHTML = '';
    
    payrollRecords.forEach(emp => {
        const row = document.createElement('tr');
        const statusClass = getStatusBadgeClass(emp.status);
        
        row.innerHTML = `
            <td>${emp.id}</div>
            <td>${emp.name}</div>
            <td>${emp.position}</div>
            <td>${emp.department}</div>
            <td>${formatCurrency(emp.base_salary)}</div>
            <td>${formatCurrency(emp.allowances)}</div>
            <td>${formatCurrency(emp.deductions)}</div>
            <td><strong>${formatCurrency(emp.net_salary)}</strong></div>
            <td><span class="status-badge ${statusClass}">${emp.status}</span></div>
            <td>
                <div class="action-buttons">
                    <button class="view-btn" onclick="viewPayroll(${emp.id})">View</button>
                    <button class="edit-btn" onclick="editPayroll(${emp.id})">Edit</button>
                    <button class="print-btn" onclick="printPayslip(${emp.id})">Print</button>
                </div>
            </div>
        `;
        tableBody.appendChild(row);
    });
}

// Search payroll
function searchPayroll() {
    const searchTerm = document.getElementById('payrollSearch').value.toLowerCase();
    const filteredPayroll = payrollRecords.filter(emp => 
        emp.name.toLowerCase().includes(searchTerm) ||
        emp.position.toLowerCase().includes(searchTerm) ||
        emp.department.toLowerCase().includes(searchTerm) ||
        emp.status.toLowerCase().includes(searchTerm)
    );
    
    displayFilteredPayroll(filteredPayroll);
}

// Sort payroll
function sortPayroll() {
    const sortBy = document.getElementById('sortBy').value;
    const sortedPayroll = [...payrollRecords].sort((a, b) => {
        let valA = a[sortBy];
        let valB = b[sortBy];
        
        if (sortBy === 'id') {
            return valA - valB;
        }
        if (sortBy === 'base_salary' || sortBy === 'allowances' || sortBy === 'deductions' || sortBy === 'net_salary') {
            return valA - valB;
        }
        return String(valA).localeCompare(String(valB));
    });
    
    displayFilteredPayroll(sortedPayroll);
}

// Display filtered/sorted payroll
function displayFilteredPayroll(payrollList) {
    const tableBody = document.getElementById('payrollTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    payrollList.forEach(emp => {
        const row = document.createElement('tr');
        const statusClass = getStatusBadgeClass(emp.status);
        
        row.innerHTML = `
            <td>${emp.id}</div>
            <td>${emp.name}</div>
            <td>${emp.position}</div>
            <td>${emp.department}</div>
            <td>${formatCurrency(emp.base_salary)}</div>
            <td>${formatCurrency(emp.allowances)}</div>
            <td>${formatCurrency(emp.deductions)}</div>
            <td><strong>${formatCurrency(emp.net_salary)}</strong></div>
            <td><span class="status-badge ${statusClass}">${emp.status}</span></div>
            <td>
                <div class="action-buttons">
                    <button class="view-btn" onclick="viewPayroll(${emp.id})">View</button>
                    <button class="edit-btn" onclick="editPayroll(${emp.id})">Edit</button>
                    <button class="print-btn" onclick="printPayslip(${emp.id})">Print</button>
                </div>
            </div>
        `;
        tableBody.appendChild(row);
    });
}

// Generate monthly payroll
async function generatePayroll() {
    const today = new Date();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const month = monthNames[today.getMonth()];
    const year = today.getFullYear();
    
    // Refresh staff data first
    await loadStaffData();
    
    document.getElementById('payPeriod').textContent = `${month} ${year}`;
    
    // Update all pending to processing (simulate payroll run)
    payrollRecords.forEach(emp => {
        if (emp.status === 'Pending') {
            emp.status = 'Processing';
        }
    });
    
    loadPayroll();
    calculateTotals();
    alert(`Payroll for ${month} ${year} has been generated successfully!`);
    
    // Optional: Save payroll record to Firestore
    await savePayrollToDatabase();
}

// Save payroll record to Firestore
async function savePayrollToDatabase() {
    const today = new Date();
    const payrollId = `payroll_${today.getFullYear()}_${today.getMonth() + 1}`;
    
    const payrollData = {
        payroll_id: payrollId,
        period: document.getElementById('payPeriod').textContent,
        generated_date: today.toISOString(),
        total_staff: payrollRecords.length,
        total_base: payrollRecords.reduce((sum, e) => sum + e.base_salary, 0),
        total_allowances: payrollRecords.reduce((sum, e) => sum + e.allowances, 0),
        total_deductions: payrollRecords.reduce((sum, e) => sum + e.deductions, 0),
        total_net: payrollRecords.reduce((sum, e) => sum + e.net_salary, 0),
        employees: payrollRecords.map(e => ({
            id: e.id,
            name: e.name,
            position: e.position,
            department: e.department,
            base_salary: e.base_salary,
            allowances: e.allowances,
            deductions: e.deductions,
            net_salary: e.net_salary,
            status: e.status
        }))
    };
    
    try {
        await db.collection('payroll_records').doc(payrollId).set(payrollData);
        console.log("Payroll saved to database");
    } catch (error) {
        console.error("Error saving payroll:", error);
    }
}

// Update employee status
async function updateEmployeeStatus(employeeId, newStatus) {
    const employee = payrollRecords.find(e => e.id === employeeId);
    if (employee) {
        employee.status = newStatus;
        loadPayroll();
        calculateTotals();
        
        // Update in database if needed
        const today = new Date();
        const payrollId = `payroll_${today.getFullYear()}_${today.getMonth() + 1}`;
        try {
            await db.collection('payroll_records').doc(payrollId).update({
                [`employees.${payrollRecords.findIndex(e => e.id === employeeId)}.status`]: newStatus
            });
        } catch (error) {
            console.error("Error updating status:", error);
        }
    }
}

// View payroll details
function viewPayroll(id) {
    const emp = payrollRecords.find(e => e.id === id);
    if (!emp) return;
    
    const modalBody = document.getElementById('payrollModalBody');
    modalBody.innerHTML = `
        <div class="payslip-detail">
            <h3 style="color: #2B6896; margin-bottom: 15px;">Payslip - ${emp.name}</h3>
            <div class="detail-row">
                <span class="detail-label">Employee ID:</span>
                <span class="detail-value">${emp.id}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Position:</span>
                <span class="detail-value">${emp.position}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Department:</span>
                <span class="detail-value">${emp.department}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Pay Period:</span>
                <span class="detail-value">${document.getElementById('payPeriod').textContent}</span>
            </div>
            <div style="margin: 20px 0; border-top: 2px solid #2B6896;"></div>
            <div class="detail-row">
                <span class="detail-label">Base Salary:</span>
                <span class="detail-value">${formatCurrency(emp.base_salary)}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Allowances:</span>
                <span class="detail-value">${formatCurrency(emp.allowances)}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Deductions:</span>
                <span class="detail-value">(${formatCurrency(emp.deductions)})</span>
            </div>
            <div style="margin: 15px 0; border-top: 1px dashed #ddd;"></div>
            <div class="detail-row">
                <span class="detail-label" style="font-weight: 700;">NET SALARY:</span>
                <span class="detail-value" style="color: #2B6896; font-size: 18px;">${formatCurrency(emp.net_salary)}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span class="detail-value">
                    <select id="statusSelect" onchange="updateEmployeeStatus(${emp.id}, this.value)" style="padding: 4px 8px; border-radius: 4px;">
                        <option value="Pending" ${emp.status === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option value="Processing" ${emp.status === 'Processing' ? 'selected' : ''}>Processing</option>
                        <option value="Paid" ${emp.status === 'Paid' ? 'selected' : ''}>Paid</option>
                    </select>
                </span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Payment Date:</span>
                <span class="detail-value">${emp.pay_date}</span>
            </div>
        </div>
    `;
    
    document.getElementById('payrollModal').classList.add('show');
}

// Edit payroll
function editPayroll(id) {
    alert(`Edit payroll for employee ID ${id}\n\nTo edit salary, please update the staff record in the Staff Management page.`);
}

// Print payslip
function printPayslip(id) {
    const emp = payrollRecords.find(e => e.id === id);
    if (!emp) return;
    
    const payPeriod = document.getElementById('payPeriod').textContent;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>Payslip - ${emp.name}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 40px; max-width: 600px; margin: 0 auto; }
                    h2 { color: #2B6896; text-align: center; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .company { font-size: 20px; font-weight: bold; color: #2B6896; }
                    .payslip { border: 2px solid #2B6896; padding: 30px; border-radius: 10px; }
                    .row { display: flex; justify-content: space-between; margin-bottom: 15px; }
                    .label { font-weight: bold; color: #555; }
                    .value { color: #333; }
                    .total { font-size: 18px; color: #2B6896; font-weight: bold; border-top: 2px solid #2B6896; padding-top: 15px; margin-top: 15px; }
                    .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
                    @media print {
                        button { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="company">NutriTrack PH</div>
                    <div>Barangay Nutrition Scholar System</div>
                    <div>Brgy. Dalig, Teresa, Rizal</div>
                </div>
                <div class="payslip">
                    <h2>PAYSLIP</h2>
                    <div class="row">
                        <span class="label">Employee:</span>
                        <span class="value">${emp.name}</span>
                    </div>
                    <div class="row">
                        <span class="label">Employee ID:</span>
                        <span class="value">${emp.id}</span>
                    </div>
                    <div class="row">
                        <span class="label">Position:</span>
                        <span class="value">${emp.position}</span>
                    </div>
                    <div class="row">
                        <span class="label">Department:</span>
                        <span class="value">${emp.department}</span>
                    </div>
                    <div class="row">
                        <span class="label">Pay Period:</span>
                        <span class="value">${payPeriod}</span>
                    </div>
                    <hr>
                    <div class="row">
                        <span class="label">Base Salary:</span>
                        <span class="value">${formatCurrency(emp.base_salary)}</span>
                    </div>
                    <div class="row">
                        <span class="label">Allowances:</span>
                        <span class="value">${formatCurrency(emp.allowances)}</span>
                    </div>
                    <div class="row">
                        <span class="label">Deductions:</span>
                        <span class="value">(${formatCurrency(emp.deductions)})</span>
                    </div>
                    <div class="row total">
                        <span class="label">NET PAY:</span>
                        <span class="value">${formatCurrency(emp.net_salary)}</span>
                    </div>
                    <div class="row">
                        <span class="label">Status:</span>
                        <span class="value">${emp.status}</span>
                    </div>
                </div>
                <div class="footer">
                    <p>This is a computer-generated document. No signature required.</p>
                    <p>Generated on: ${new Date().toLocaleDateString()}</p>
                </div>
            </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
        printWindow.print();
    }, 500);
}

// Print full payroll report
function printPayroll() {
    const printWindow = window.open('', '_blank');
    const payPeriod = document.getElementById('payPeriod').textContent;
    
    let tableRows = '';
    payrollRecords.forEach(emp => {
        tableRows += `
            <tr>
                <td>${emp.id}</td>
                <td>${emp.name}</td>
                <td>${emp.position}</td>
                <td>${emp.department}</td>
                <td>${formatCurrency(emp.base_salary)}</td>
                <td>${formatCurrency(emp.allowances)}</td>
                <td>${formatCurrency(emp.deductions)}</td>
                <td><strong>${formatCurrency(emp.net_salary)}</strong></td>
                <td>${emp.status}</td>
            </tr>
        `;
    });
    
    printWindow.document.write(`
        <html>
            <head>
                <title>Payroll Report - ${payPeriod}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 40px; }
                    h2 { color: #2B6896; text-align: center; }
                    .header { text-align: center; margin-bottom: 30px; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th { background: #2B6896; color: white; padding: 10px; text-align: left; }
                    td { padding: 8px; border-bottom: 1px solid #ddd; }
                    .total-row { font-weight: bold; background: #f0f4ff; }
                    .footer { margin-top: 40px; text-align: right; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h2>NutriTrack PH - Payroll Report</h2>
                    <h3>${payPeriod}</h3>
                    <p>Brgy. Dalig, Teresa, Rizal</p>
                </div>
                
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Employee Name</th>
                            <th>Position</th>
                            <th>Department</th>
                            <th>Base Salary</th>
                            <th>Allowances</th>
                            <th>Deductions</th>
                            <th>Net Salary</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                        <tr class="total-row">
                            <td colspan="4"><strong>TOTAL</strong></td>
                            <td><strong>${formatCurrency(payrollRecords.reduce((sum, e) => sum + e.base_salary, 0))}</strong></td>
                            <td><strong>${formatCurrency(payrollRecords.reduce((sum, e) => sum + e.allowances, 0))}</strong></td>
                            <td><strong>${formatCurrency(payrollRecords.reduce((sum, e) => sum + e.deductions, 0))}</strong></td>
                            <td><strong>${formatCurrency(payrollRecords.reduce((sum, e) => sum + e.net_salary, 0))}</strong></td>
                            <td></td>
                        </tr>
                    </tbody>
                </table>
                
                <div class="footer">
                    <p>Generated on: ${new Date().toLocaleDateString()}</p>
                </div>
            </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
        printWindow.print();
    }, 500);
}

// Export to PDF
function exportPayrollPDF() {
    alert('PDF export will be available in the full version.\n\nFor now, you can print individual payslips or the full report.');
}

// Export to Excel
function exportPayrollExcel() {
    alert('Excel export will be available in the full version.\n\nFor now, you can print individual payslips or the full report.');
}

// Hide payroll modal
function hidePayrollModal() {
    document.getElementById('payrollModal').classList.remove('show');
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    displayCurrentDate();
    
    // Show loading indicator
    const tableBody = document.getElementById('payrollTableBody');
    if (tableBody) {
        tableBody.innerHTML = '<tr><td colspan="10" style="text-align: center;">Loading staff data...<\/div><\/div>';
    }
    
    // Load staff data and initialize payroll
    loadStaffData();
    
    const searchInput = document.getElementById('payrollSearch');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchPayroll();
            }
        });
    }
});