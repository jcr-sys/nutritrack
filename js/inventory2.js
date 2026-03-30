// ===== VACCINES INVENTORY PAGE FUNCTIONALITY =====

// Sample vaccine inventory data
let inventory = [
    {
        no: 1,
        name: "BCG Vaccine",
        description: "Tuberculosis vaccine given at birth",
        dosage: "0.05 mL",
        form: "Injection",
        expiry: "2026-08-10",
        quantity: 120
    },
    {
        no: 2,
        name: "Hepatitis B Vaccine",
        description: "Protects against Hepatitis B virus",
        dosage: "0.5 mL",
        form: "Injection",
        expiry: "2026-05-15",
        quantity: 80
    },
    {
        no: 3,
        name: "DPT Vaccine",
        description: "Diphtheria, Tetanus, Pertussis",
        dosage: "0.5 mL",
        form: "Injection",
        expiry: "2026-12-20",
        quantity: 95
    },
    {
        no: 4,
        name: "Oral Polio Vaccine",
        description: "Protects against Polio",
        dosage: "2 drops",
        form: "Oral",
        expiry: "2027-03-10",
        quantity: 200
    },
    {
        no: 5,
        name: "IPV Vaccine",
        description: "Inactivated Polio Vaccine",
        dosage: "0.5 mL",
        form: "Injection",
        expiry: "2026-09-30",
        quantity: 70
    },
    {
        no: 6,
        name: "MMR Vaccine",
        description: "Measles, Mumps, Rubella",
        dosage: "0.5 mL",
        form: "Injection",
        expiry: "2026-11-01",
        quantity: 150
    },
    {
        no: 7,
        name: "Rotavirus Vaccine",
        description: "Protects against rotavirus infection",
        dosage: "1.5 mL",
        form: "Oral",
        expiry: "2026-07-20",
        quantity: 60
    },
    {
        no: 8,
        name: "Influenza Vaccine",
        description: "Seasonal flu protection",
        dosage: "0.5 mL",
        form: "Injection",
        expiry: "2026-10-15",
        quantity: 45
    },
    {
        no: 9,
        name: "HPV Vaccine",
        description: "Human Papillomavirus vaccine",
        dosage: "0.5 mL",
        form: "Injection",
        expiry: "2027-01-30",
        quantity: 90
    },
    {
        no: 10,
        name: "Pneumococcal Vaccine",
        description: "Protects against pneumonia",
        dosage: "0.5 mL",
        form: "Injection",
        expiry: "2026-06-25",
        quantity: 55
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

// Load inventory into table
function loadInventory() {
    const tableBody = document.getElementById('inventoryTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    inventory.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
             <td>${item.no}</td>
             <td><strong>${item.name}</strong></td>
             <td>${item.description || '-'}</td>
             <td>${item.dosage}</td>
             <td>${item.form}</td>
             <td>${item.expiry}</td>
             <td>${item.quantity}</td>
             <td>
                <div class="action-buttons">
                    <button class="view-btn" onclick="viewItem(${item.no})">View</button>
                    <button class="edit-btn" onclick="editItem(${item.no})">Edit</button>
                    <button class="delete-btn" onclick="deleteItem(${item.no})">Delete</button>
                </div>
             </td>
        `;
        tableBody.appendChild(row);
    });
}

// Search inventory
function searchInventory() {
    const searchTerm = document.getElementById('inventorySearch')?.value.toLowerCase() || '';
    const filtered = inventory.filter(item =>
        item.name.toLowerCase().includes(searchTerm) ||
        (item.description || '').toLowerCase().includes(searchTerm) ||
        item.form.toLowerCase().includes(searchTerm) ||
        item.dosage.toLowerCase().includes(searchTerm)
    );
    displayFilteredInventory(filtered);
}

// Sort inventory
function sortInventory() {
    const sortBy = document.getElementById('sortBy').value;
    const sorted = [...inventory].sort((a, b) => {
        let valA = a[sortBy];
        let valB = b[sortBy];
        if (sortBy === 'no' || sortBy === 'quantity') {
            return valA - valB;
        }
        if (sortBy === 'expiry') {
            return new Date(valA) - new Date(valB);
        }
        return String(valA).localeCompare(String(valB));
    });
    displayFilteredInventory(sorted);
}

// Display filtered/sorted inventory
function displayFilteredInventory(list) {
    const tableBody = document.getElementById('inventoryTableBody');
    if (!tableBody) return;
    tableBody.innerHTML = '';
    list.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
             <td>${item.no}</td>
             <td><strong>${item.name}</strong></td>
             <td>${item.description || '-'}</td>
             <td>${item.dosage}</td>
             <td>${item.form}</td>
             <td>${item.expiry}</td>
             <td>${item.quantity}</td>
             <td>
                <div class="action-buttons">
                    <button class="view-btn" onclick="viewItem(${item.no})">View</button>
                    <button class="edit-btn" onclick="editItem(${item.no})">Edit</button>
                    <button class="delete-btn" onclick="deleteItem(${item.no})">Delete</button>
                </div>
             </td>
        `;
        tableBody.appendChild(row);
    });
}

// Show modal
function showAddInventoryModal() {
    document.getElementById('addInventoryModal').classList.add('show');
}

// Hide modal
function hideAddInventoryModal() {
    document.getElementById('addInventoryModal').classList.remove('show');
    document.getElementById('inventoryForm').reset();
}

// Save inventory
function saveInventory() {
    const name = document.getElementById('vaccineName')?.value.trim();
    const description = document.getElementById('description')?.value.trim();
    const dosage = document.getElementById('dosage')?.value.trim();
    const form = document.getElementById('form')?.value;
    const expiry = document.getElementById('expiryDate')?.value;
    const quantity = document.getElementById('quantity')?.value;

    if (!name || !dosage || !form || !expiry || !quantity) {
        alert('Please fill in all required fields');
        return;
    }

    const newItem = {
        no: inventory.length + 1,
        name,
        description: description || '',
        dosage,
        form,
        expiry,
        quantity: parseInt(quantity)
    };

    inventory.push(newItem);
    loadInventory();
    hideAddInventoryModal();
    alert('Vaccine added successfully!');
}

// View item
function viewItem(no) {
    const item = inventory.find(i => i.no === no);
    if (item) {
        alert(`Vaccine Details:
Name: ${item.name}
Dosage: ${item.dosage}
Form: ${item.form}
Description: ${item.description || 'N/A'}
Expiry: ${item.expiry}
Quantity: ${item.quantity}`);
    }
}

// Edit item
function editItem(no) {
    alert(`Edit feature will be implemented soon for item #${no}`);
}

// Delete item
function deleteItem(no) {
    if (confirm(`Delete item #${no}?`)) {
        const index = inventory.findIndex(i => i.no === no);
        if (index !== -1) {
            inventory.splice(index, 1);
            // Re-number items
            inventory.forEach((item, idx) => { item.no = idx + 1; });
            loadInventory();
            alert('Item deleted successfully');
        }
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    displayCurrentDate();
    loadInventory();
    
    document.getElementById('inventorySearch')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') searchInventory();
    });
});