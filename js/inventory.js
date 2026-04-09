// inventory.js
// ===== MEDICINES INVENTORY PAGE WITH FIREBASE =====

let allMedicines = [];

// Display current date
function displayCurrentDate() {
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        const today = new Date();
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        dateElement.textContent = today.toLocaleDateString('en-US', options);
    }
}

// Load medicines from Firestore
async function loadInventory() {
    const tableBody = document.getElementById('inventoryTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '<tr><td colspan="8" style="text-align: center;">Loading medicines...<\/div>';

    try {
        const snapshot = await db.collection('medicines_inventory').orderBy('no').get();

        if (snapshot.empty) {
            tableBody.innerHTML = '<tr><td colspan="8" style="text-align: center;">No medicines found. Click "+ Add Medicine" to add.<\/div>';
            allMedicines = [];
            return;
        }

        allMedicines = [];
        tableBody.innerHTML = '';

        snapshot.forEach(doc => {
            const item = doc.data();
            allMedicines.push(item);

            // Add low stock warning color
            const quantityClass = item.quantity <= 10 ? 'low-stock' : '';
            const quantityColor = item.quantity <= 5 ? '#f44336' : (item.quantity <= 10 ? '#ff9800' : '#2e7d32');

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
        console.error("Error loading medicines:", error);
        tableBody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: red;">Error loading data. Please check your connection.<\/div>';
    }
}

// Search inventory
function searchInventory() {
    const searchTerm = document.getElementById('inventorySearch')?.value.toLowerCase() || '';
    const filtered = allMedicines.filter(item =>
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
    const sorted = [...allMedicines].sort((a, b) => {
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
        const quantityColor = item.quantity <= 5 ? '#f44336' : (item.quantity <= 10 ? '#ff9800' : '#2e7d32');
        
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
        const snapshot = await db.collection('medicines_inventory').orderBy('no', 'desc').limit(1).get();
        if (snapshot.empty) {
            return 1;
        }
        const lastItem = snapshot.docs[0].data();
        return (lastItem.no || 0) + 1;
    } catch (error) {
        console.error("Error getting next number:", error);
        return allMedicines.length + 1;
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

// Save inventory to Firestore
async function saveInventory() {
    const name = document.getElementById('medicineName')?.value.trim();
    const description = document.getElementById('description')?.value.trim();
    const dosage = document.getElementById('dosage')?.value.trim();
    const form = document.getElementById('form')?.value;
    const expiry = document.getElementById('expiryDate')?.value;
    const quantity = document.getElementById('quantity')?.value;

    if (!name || !dosage || !form || !expiry || !quantity) {
        alert('Please fill in all required fields');
        return;
    }

    const nextNumber = await getNextNumber();
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
        await db.collection('medicines_inventory').doc(docId).set(newItem);
        alert('Medicine added successfully!');
        await loadInventory();
        hideAddInventoryModal();
    } catch (error) {
        console.error("Error saving medicine:", error);
        alert("Error saving medicine. Please try again.");
    }
}

// View item
function viewItem(docId) {
    const item = allMedicines.find(i => i.doc_id === docId);
    if (item) {
        alert(`MEDICINE DETAILS
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
    alert(`Edit feature will be implemented soon for medicine #${docId}`);
}

// Delete item from Firestore
async function deleteItem(docId) {
    if (confirm('Delete this medicine?')) {
        try {
            await db.collection('medicines_inventory').doc(docId).delete();
            alert('Medicine deleted successfully');
            await loadInventory();
        } catch (error) {
            console.error("Error deleting medicine:", error);
            alert("Error deleting medicine. Please try again.");
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