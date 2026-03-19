// ===== PAYROLL PAGE FUNCTIONALITY =====

// Payroll data based on your staffing requirements:
// - 1 Doctor: ₱50,000
// - 2 Nutritionists: ₱40,000 each
// - 1 Nurse: ₱35,000
// - 5 BNS Workers: ₱20,000 each
let payroll = [
    // DOCTOR (1)
    {
        id: 1,
        name: 'Dr. Mary Filio',
        position: 'Doctor',
        department: 'Medical',
        base_salary: 50000,
        allowances: 5000,
        deductions: 3500,
        net_salary: 51500,
        status: 'Paid',
        pay_date: '2026-03-15'
    },
    
    // NUTRITIONISTS (2)
    {
        id: 2,
        name: 'Dr. Jose Reyes',
        position: 'Nutritionist',
        department: 'Nutrition',
        base_salary: 40000,
        allowances: 4000,
        deductions: 2800,
        net_salary: 41200,
        status: 'Paid',
        pay_date: '2026-03-15'
    },
    {
        id: 3,
        name: 'Dr. Lisa Garcia',
        position: 'Nutritionist',
        department: 'Nutrition',
        base_salary: 40000,
        allowances: 4000,
        deductions: 2800,
        net_salary: 41200,
        status: 'Paid',
        pay_date: '2026-03-15'
    },
    
    // NURSE (1)
    {
        id: 4,
        name: 'Jane Cruz',
        position: 'Nurse',
        department: 'Nursing',
        base_salary: 35000,
        allowances: 3500,
        deductions: 2500,
        net_salary: 36000,
        status: 'Paid',
        pay_date: '2026-03-15'
    },
    
    // BNS WORKERS (5)
    {
        id: 5,
        name: 'Maria Santos',
        position: 'BNS Worker',
        department: 'Barangay Nutrition',
        base_salary: 20000,
        allowances: 2000,
        deductions: 1500,
        net_salary: 20500,
        status: 'Paid',
        pay_date: '2026-03-15'
    },
    {
        id: 6,
        name: 'Juan Dela Cruz',
        position: 'BNS Worker',
        department: 'Barangay Nutrition',
        base_salary: 20000,
        allowances: 2000,
        deductions: 1500,
        net_salary: 20500,
        status: 'Paid',
        pay_date: '2026-03-15'
    },
    {
        id: 7,
        name: 'Pedro Reyes',
        position: 'BNS Worker',
        department: 'Barangay Nutrition',
        base_salary: 20000,
        allowances: 2000,
        deductions: 1500,
        net_salary: 20500,
        status: 'Processing',
        pay_date: '2026-03-15'
    },
    {
        id: 8,
        name: 'Ana Lopez',
        position: 'BNS Worker',
        department: 'Barangay Nutrition',
        base_salary: 20000,
        allowances: 2000,
        deductions: 1500,
        net_salary: 20500,
        status: 'Processing',
        pay_date: '2026-03-15'
    },
    {
        id: 9,
        name: 'Rosa Villanueva',
        position: 'BNS Worker',
        department: 'Barangay Nutrition',
        base_salary: 20000,
        allowances: 2000,
        deductions: 1500,
        net_salary: 20500,
        status: 'Pending',
        pay_date: '2026-03-15'
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
    const totalBase = payroll.reduce((sum, emp) => sum + emp.base_salary, 0);
    const totalAllowances = payroll.reduce((sum, emp) => sum + emp.allowances, 0);
    const totalDeductions = payroll.reduce((sum, emp) => sum + emp.deductions, 0);
    const grandTotal = payroll.reduce((sum, emp) => sum + emp.net_salary, 0);
    
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
    
    tableBody.innerHTML = '';
    
    payroll.forEach(emp => {
        const row = document.createElement('tr');
        const statusClass = getStatusBadgeClass(emp.status);
        
        row.innerHTML = `
            <td>${emp.id}</td>
            <td>${emp.name}</td>
            <td>${emp.position}</td>
            <td>${emp.department}</td>
            <td>${formatCurrency(emp.base_salary)}</td>
            <td>${formatCurrency(emp.allowances)}</td>
            <td>${formatCurrency(emp.deductions)}</td>
            <td><strong>${formatCurrency(emp.net_salary)}</strong></td>
            <td><span class="status-badge ${statusClass}">${emp.status}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="view-btn" onclick="viewPayroll(${emp.id})">View</button>
                    <button class="edit-btn" onclick="editPayroll(${emp.id})">Edit</button>
                    <button class="print-btn" onclick="printPayslip(${emp.id})">Print</button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
    
    calculateTotals();
}

// Search payroll
function searchPayroll() {
    const searchTerm = document.getElementById('payrollSearch').value.toLowerCase();
    const filteredPayroll = payroll.filter(emp => 
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
    const sortedPayroll = [...payroll].sort((a, b) => {
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
            <td>${emp.id}</td>
            <td>${emp.name}</td>
            <td>${emp.position}</td>
            <td>${emp.department}</td>
            <td>${formatCurrency(emp.base_salary)}</td>
            <td>${formatCurrency(emp.allowances)}</td>
            <td>${formatCurrency(emp.deductions)}</td>
            <td><strong>${formatCurrency(emp.net_salary)}</strong></td>
            <td><span class="status-badge ${statusClass}">${emp.status}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="view-btn" onclick="viewPayroll(${emp.id})">View</button>
                    <button class="edit-btn" onclick="editPayroll(${emp.id})">Edit</button>
                    <button class="print-btn" onclick="printPayslip(${emp.id})">Print</button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Generate monthly payroll
function generatePayroll() {
    const today = new Date();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const month = monthNames[today.getMonth()];
    const year = today.getFullYear();
    
    document.getElementById('payPeriod').textContent = `${month} ${year}`;
    
    // Update all pending/processing to paid (simulate payroll run)
    payroll.forEach(emp => {
        if (emp.status !== 'Paid') {
            emp.status = 'Paid';
        }
    });
    
    loadPayroll();
    alert(`Payroll for ${month} ${year} has been generated successfully!`);
}

// View payroll details
function viewPayroll(id) {
    const emp = payroll.find(e => e.id === id);
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
                <span class="detail-value"><span class="status-badge ${getStatusBadgeClass(emp.status)}">${emp.status}</span></span>
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
    alert(`Edit payroll for employee ID ${id}\n\nThis feature will be implemented in the next phase.`);
}

// Print payslip
function printPayslip(id) {
    const emp = payroll.find(e => e.id === id);
    if (!emp) return;
    
    const payPeriod = document.getElementById('payPeriod').textContent;
    
    // Create printable payslip
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

// Hide payroll modal
function hidePayrollModal() {
    document.getElementById('payrollModal').classList.remove('show');
}

// Export to PDF
function exportPayrollPDF() {
    alert('PDF export will be available in the full version.\n\nFor now, you can print individual payslips.');
}

// Export to Excel
function exportPayrollExcel() {
    alert('Excel export will be available in the full version.\n\nFor now, you can print individual payslips.');
}

// Print full payroll report
function printPayroll() {
    const printWindow = window.open('', '_blank');
    const payPeriod = document.getElementById('payPeriod').textContent;
    
    let tableRows = '';
    payroll.forEach(emp => {
        tableRows += `
            <tr>
                <td>${emp.name}</td>
                <td>${emp.position}</td>
                <td>${formatCurrency(emp.base_salary)}</td>
                <td>${formatCurrency(emp.allowances)}</td>
                <td>${formatCurrency(emp.deductions)}</td>
                <td><strong>${formatCurrency(emp.net_salary)}</strong></td>
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
                            <th>Employee Name</th>
                            <th>Position</th>
                            <th>Base Salary</th>
                            <th>Allowances</th>
                            <th>Deductions</th>
                            <th>Net Salary</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                        <tr class="total-row">
                            <td colspan="3"><strong>TOTAL</strong></td>
                            <td><strong>${formatCurrency(payroll.reduce((sum, e) => sum + e.allowances, 0))}</strong></td>
                            <td><strong>${formatCurrency(payroll.reduce((sum, e) => sum + e.deductions, 0))}</strong></td>
                            <td><strong>${formatCurrency(payroll.reduce((sum, e) => sum + e.net_salary, 0))}</strong></td>
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

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    displayCurrentDate();
    loadPayroll();
    
    document.getElementById('payrollSearch')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchPayroll();
        }
    });
});