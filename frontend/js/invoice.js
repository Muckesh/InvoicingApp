document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const customerSelect = document.getElementById('customer');
    const addCustomerBtn = document.getElementById('addCustomerBtn');
    const customerModal = document.getElementById('customerModal');
    const closeModal = document.querySelector('.close');
    const customerForm = document.getElementById('customerForm');
    const itemsBody = document.getElementById('itemsBody');
    const addItemBtn = document.getElementById('addItemBtn');
    const subtotalEl = document.getElementById('subtotal');
    const taxEl = document.getElementById('tax');
    const grandTotalEl = document.getElementById('grandTotal');
    const saveInvoiceBtn = document.getElementById('saveInvoiceBtn');
    const printInvoiceBtn = document.getElementById('printInvoiceBtn');
    
    // Set default dates
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('invoiceDate').value = today;
    
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);
    document.getElementById('dueDate').value = dueDate.toISOString().split('T')[0];
    
    // Load customers from API
    async function loadCustomers() {
        try {
            const response = await fetch('http://localhost:7021/api/customers');
            if (!response.ok) throw new Error('Failed to load customers');
            
            const customers = await response.json();
            customerSelect.innerHTML = '<option value="">Select Customer</option>';
            
            customers.forEach(customer => {
                const option = document.createElement('option');
                option.value = customer.customerId;
                option.textContent = customer.name;
                customerSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading customers:', error);
            alert('Failed to load customers. Please try again.');
        }
    }
    
    // Load items from API
    async function loadItems() {
        try {
            const response = await fetch('http://localhost:7021/api/items');
            if (!response.ok) throw new Error('Failed to load items');
            return await response.json();
        } catch (error) {
            console.error('Error loading items:', error);
            return [];
        }
    }
    
    // Add item row to the table
    async function addItemRow(item = null) {
        const items = await loadItems();
        
        const row = document.createElement('tr');
        row.className = 'item-row';
        
        // Item select
        const itemCell = document.createElement('td');
        const itemSelect = document.createElement('select');
        itemSelect.className = 'item-select';
        itemSelect.innerHTML = '<option value="">Select Item</option>';
        
        items.forEach(i => {
            const option = document.createElement('option');
            option.value = i.itemId;
            option.textContent = i.name;
            if (item && i.itemId === item.itemId) option.selected = true;
            itemSelect.appendChild(option);
        });
        
        itemSelect.addEventListener('change', async function() {
            const selectedItemId = this.value;
            if (selectedItemId) {
                const selectedItem = items.find(i => i.itemId == selectedItemId);
                row.querySelector('.item-desc').value = selectedItem.description || '';
                row.querySelector('.item-price').value = selectedItem.price.toFixed(2);
                row.querySelector('.item-tax').value = selectedItem.taxRate.toFixed(2);
                calculateRowTotal(row);
            }
        });
        
        itemCell.appendChild(itemSelect);
        row.appendChild(itemCell);
        
        // Description
        const descCell = document.createElement('td');
        const descInput = document.createElement('input');
        descInput.type = 'text';
        descInput.className = 'item-desc';
        descInput.readOnly = true;
        if (item) descInput.value = item.description || '';
        descCell.appendChild(descInput);
        row.appendChild(descCell);
        
        // Quantity
        const qtyCell = document.createElement('td');
        const qtyInput = document.createElement('input');
        qtyInput.type = 'number';
        qtyInput.className = 'item-qty';
        qtyInput.min = '1';
        qtyInput.value = item ? item.quantity : '1';
        qtyInput.addEventListener('input', () => calculateRowTotal(row));
        qtyCell.appendChild(qtyInput);
        row.appendChild(qtyCell);
        
        // Price
        const priceCell = document.createElement('td');
        const priceInput = document.createElement('input');
        priceInput.type = 'number';
        priceInput.className = 'item-price';
        priceInput.step = '0.01';
        priceInput.min = '0';
        priceInput.value = item ? item.unitPrice : '0.00';
        priceInput.addEventListener('input', () => calculateRowTotal(row));
        priceCell.appendChild(priceInput);
        row.appendChild(priceCell);
        
        // Tax
        const taxCell = document.createElement('td');
        const taxInput = document.createElement('input');
        taxInput.type = 'number';
        taxInput.className = 'item-tax';
        taxInput.step = '0.01';
        taxInput.min = '0';
        taxInput.value = item ? item.taxRate : '0.00';
        taxInput.addEventListener('input', () => calculateRowTotal(row));
        taxCell.appendChild(taxInput);
        row.appendChild(taxCell);
        
        // Total
        const totalCell = document.createElement('td');
        const totalSpan = document.createElement('span');
        totalSpan.className = 'item-total';
        totalSpan.textContent = item ? `$${(item.quantity * item.unitPrice).toFixed(2)}` : '$0.00';
        totalCell.appendChild(totalSpan);
        row.appendChild(totalCell);
        
        // Remove button
        const removeCell = document.createElement('td');
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-item';
        removeBtn.textContent = '×';
        removeBtn.addEventListener('click', () => {
            row.remove();
            calculateTotals();
        });
        removeCell.appendChild(removeBtn);
        row.appendChild(removeCell);
        
        itemsBody.appendChild(row);
    }
    
    // Calculate row total
    function calculateRowTotal(row) {
        const qty = parseFloat(row.querySelector('.item-qty').value) || 0;
        const price = parseFloat(row.querySelector('.item-price').value) || 0;
        const total = qty * price;
        row.querySelector('.item-total').textContent = `$${total.toFixed(2)}`;
        calculateTotals();
    }
    
    // Calculate invoice totals
    function calculateTotals() {
        let subtotal = 0;
        let tax = 0;
        
        document.querySelectorAll('.item-row').forEach(row => {
            const qty = parseFloat(row.querySelector('.item-qty').value) || 0;
            const price = parseFloat(row.querySelector('.item-price').value) || 0;
            const taxRate = parseFloat(row.querySelector('.item-tax').value) || 0;
            
            subtotal += qty * price;
            tax += qty * price * taxRate / 100;
        });
        
        subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
        taxEl.textContent = `$${tax.toFixed(2)}`;
        grandTotalEl.textContent = `$${(subtotal + tax).toFixed(2)}`;
    }
    
    // Save invoice
    async function saveInvoice() {
        const customerId = customerSelect.value;
        const invoiceDate = document.getElementById('invoiceDate').value;
        const dueDate = document.getElementById('dueDate').value;
        const notes = document.getElementById('notes').value;
        
        if (!customerId) {
            alert('Please select a customer');
            return;
        }
        
        const items = [];
        document.querySelectorAll('.item-row').forEach(row => {
            const itemSelect = row.querySelector('.item-select');
            if (itemSelect.value) {
                items.push({
                    itemId: itemSelect.value,
                    quantity: parseFloat(row.querySelector('.item-qty').value) || 1,
                    unitPrice: parseFloat(row.querySelector('.item-price').value) || 0,
                    taxRate: parseFloat(row.querySelector('.item-tax').value) || 0
                });
            }
        });
        
        if (items.length === 0) {
            alert('Please add at least one item');
            return;
        }
        
        const invoiceData = {
            customerId: parseInt(customerId),
            invoiceDate,
            dueDate,
            notes,
            items
        };
        
        try {
            const response = await fetch('http://localhost:7021/api/invoices', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(invoiceData)
            });
            
            if (response.ok) {
                const result = await response.json();
                alert('Invoice saved successfully!');
                window.location.href = `invoices.html`;
            } else {
                const error = await response.json();
                alert(`Error: ${error.message}`);
            }
        } catch (error) {
            console.error('Error saving invoice:', error);
            alert('Failed to save invoice. Please try again.');
        }
    }
    
    // Generate PDF
    async function generatePDF() {
        alert('Please save the invoice first before generating PDF');
    }
    
    // Save new customer
    async function saveCustomer(customerData) {
        try {
            const response = await fetch('http://localhost:7021/api/customers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(customerData)
            });
            
            if (response.ok) {
                const newCustomer = await response.json();
                // Add to select and select it
                const option = document.createElement('option');
                option.value = newCustomer.customerId;
                option.textContent = newCustomer.name;
                customerSelect.appendChild(option);
                customerSelect.value = newCustomer.customerId;
                
                // Reset form and close modal
                customerForm.reset();
                customerModal.style.display = 'none';
            } else {
                const error = await response.json();
                alert(`Error: ${error.message}`);
            }
        } catch (error) {
            console.error('Error saving customer:', error);
            alert('Failed to save customer. Please try again.');
        }
    }
    
    // Event Listeners
    addCustomerBtn.addEventListener('click', () => {
        customerModal.style.display = 'block';
    });
    
    closeModal.addEventListener('click', () => {
        customerModal.style.display = 'none';
    });
    
    window.addEventListener('click', (event) => {
        if (event.target === customerModal) {
            customerModal.style.display = 'none';
        }
    });
    
    customerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const customerData = {
            name: document.getElementById('customerName').value.trim(),
            email: document.getElementById('customerEmail').value.trim(),
            phone: document.getElementById('customerPhone').value.trim(),
            address: document.getElementById('customerAddress').value.trim()
        };
        
        if (!customerData.name) {
            alert('Customer name is required');
            return;
        }
        
        saveCustomer(customerData);
    });
    
    addItemBtn.addEventListener('click', () => {
        addItemRow();
    });
    
    saveInvoiceBtn.addEventListener('click', saveInvoice);
    printInvoiceBtn.addEventListener('click', generatePDF);
    
    // Initialize
    loadCustomers();
    addItemRow(); // Add one empty row by default
});