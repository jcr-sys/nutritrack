// inventory2.js
// ===== VACCINES INVENTORY PAGE WITH FIREBASE =====

let allVaccines = [];

// Display current date
function displayCurrentDate() {
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        const today = new Date();
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        dateElement.textContent = today.toLocaleDateString('en-US', options);
    }
}

// Load vaccines from Firestore
async function loadInventory() {
    const tableBody = document.getElementById('inventoryTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '<tr><td colspan="8" style="text-align: center;">Loading vaccines...<\/div>';

    try {
        const snapshot = await db.collection('vaccines_inventory').orderBy('no').get();

        if (snapshot.empty) {
            tableBody.innerHTML = '<tr><td colspan="8" style="text-align: center;">No vaccines found. Click "+ Add Vaccine" to add.<\/div>';
            allVaccines = [];
            return;
        }

        allVaccines = [];
        tableBody.innerHTML = '';

        snapshot.forEach(doc => {
            const item = doc.data();
            allVaccines.push(item);

            // Stock color coding
            let quantityColor = '#2e7d32'; // Green for good stock
            if (item.quantity <= 5) {
                quantityColor = '#f44336'; // Red for critical stock
            } else if (item.quantity <= 10) {
                quantityColor = '#ff9800'; // Orange for low stock
            }

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.no || '-'}<\/div>
                <td><strong>${item.name || '-'}</strong><\/div>
                <td>${item.description || '-'}<\/div>
                <td>${item.dosage || '-'}<\/div>
                <td>${item.form || '-'}<\/div>
                <td>${item.expiry || '-'}<\/div>
                <td style="color: ${quantityColor}; font-weight: bold;">${item.quantity || 0}<\/div>
                <td>
                    <div class="action-buttons">
                        <button class="view-btn" onclick="viewItem('${item.doc_id}')">View</button>
                        <button class="edit-btn" onclick="editItem('${item.doc_id}')">Edit</button>
                        <button class="delete-btn" onclick="deleteItem('${item.doc_id}')">Delete</button>
                    </div>
                <\/div>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Error loading vaccines:", error);
        tableBody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: red;">Error loading data. Please check your connection.<\/div>';
    }
}

// Search inventory
function searchInventory() {
    const searchTerm = document.getElementById('inventorySearch')?.value.toLowerCase() || '';
    const filtered = allVaccines.filter(item =>
        (item.name && item.name.toLowerCase().includes(searchTerm)) ||
        (item.description && item.description.toLowerCase().includes(searchTerm)) ||
        (item.form && item.form.toLowerCase().includes(searchTerm)) ||
        (item.dosage && item.dosage.toLowerCase().includes(searchTerm))
    );
    displayFilteredInventory(filtered);
}

// Sort inventory
function sortInventory() {
    const sortBy = document.getElementById('sortBy').value;
    const sorted = [...allVaccines].sort((a, b) => {
        let valA = a[sortBy];
        let valB = b[sortBy];
        if (sortBy === 'no' || sortBy === 'quantity') {
            return (valA || 0) - (valB || 0);
        }
        if (sortBy === 'expiry') {
            return new Date(valA) - new Date(valB);
        }
        return String(valA || '').localeCompare(String(valB || ''));
    });
    displayFilteredInventory(sorted);
}

// Display filtered/sorted inventory
function displayFilteredInventory(list) {
    const tableBody = document.getElementById('inventoryTableBody');
    if (!tableBody) return;
    tableBody.innerHTML = '';
    list.forEach(item => {
        let quantityColor = '#2e7d32';
        if (item.quantity <= 5) {
            quantityColor = '#f44336';
        } else if (item.quantity <= 10) {
            quantityColor = '#ff9800';
        }
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.no || '-'}<\/div>
            <td><strong>${item.name || '-'}</strong><\/div>
            <td>${item.description || '-'}<\/div>
            <td>${item.dosage || '-'}<\/div>
            <td>${item.form || '-'}<\/div>
            <td>${item.expiry || '-'}<\/div>
            <td style="color: ${quantityColor}; font-weight: bold;">${item.quantity || 0}<\/div>
            <td>
                <div class="action-buttons">
                    <button class="view-btn" onclick="viewItem('${item.doc_id}')">View</button>
                    <button class="edit-btn" onclick="editItem('${item.doc_id}')">Edit</button>
                    <button class="delete-btn" onclick="deleteItem('${item.doc_id}')">Delete</button>
                </div>
            <\/div>
        `;
        tableBody.appendChild(row);
    });
}

// Get next sequential number
async function getNextNumber() {
    try {
        const snapshot = await db.collection('vaccines_inventory').orderBy('no', 'desc').limit(1).get();
        if (snapshot.empty) {
            return 1;
        }
        const lastItem = snapshot.docs[0].data();
        return (lastItem.no || 0) + 1;
    } catch (error) {
        console.error("Error getting next number:", error);
        return allVaccines.length + 1;
    }
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

// Save vaccine to Firestore
async function saveInventory() {
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

    // Get the next sequential number
    const nextNumber = await getNextNumber();
    
    // Use the sequential number as the document ID
    const docId = nextNumber.toString();

    const newItem = {
        doc_id: docId,
        no: nextNumber,
        name: name,
        description: description || '',
        dosage: dosage,
        form: form,
        expiry: expiry,
        quantity: parseInt(quantity),
        created_at: new Date().toISOString()
    };

    try {
        await db.collection('vaccines_inventory').doc(docId).set(newItem);
        alert('Vaccine added successfully!');
        await loadInventory();
        hideAddInventoryModal();
    } catch (error) {
        console.error("Error saving vaccine:", error);
        alert("Error saving vaccine. Please try again.");
    }
}

// View item
function viewItem(docId) {
    const item = allVaccines.find(i => i.doc_id === docId);
    if (item) {
        alert(`VACCINE DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
No.: ${item.no}
Name: ${item.name}
Dosage: ${item.dosage}
Form: ${item.form}
Description: ${item.description || 'N/A'}
Expiry: ${item.expiry}
Quantity: ${item.quantity}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    }
}

// Edit item
function editItem(docId) {
    alert(`Edit feature will be implemented soon for vaccine #${docId}`);
}

// Delete item from Firestore
async function deleteItem(docId) {
    if (confirm('Delete this vaccine?')) {
        try {
            await db.collection('vaccines_inventory').doc(docId).delete();
            alert('Vaccine deleted successfully');
            await loadInventory();
        } catch (error) {
            console.error("Error deleting vaccine:", error);
            alert("Error deleting vaccine. Please try again.");
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