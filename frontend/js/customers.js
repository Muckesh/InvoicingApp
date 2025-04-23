document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const customersBody = document.getElementById('customersBody');
    const customerSearch = document.getElementById('customerSearch');
    const addCustomerBtn = document.getElementById('addCustomerBtn');
    const customerModal = document.getElementById('customerModal');
    const closeModal = document.querySelector('.close');
    const customerForm = document.getElementById('customerForm');
    const deleteCustomerBtn = document.getElementById('deleteCustomerBtn');
    
    let currentCustomerId = null;
    
    // Load customers from API
    async function loadCustomers() {
        try {
            const response = await fetch('http://localhost:7021/api/customers');
            if (!response.ok) throw new Error('Failed to load customers');
            
            const customers = await response.json();
            renderCustomers(customers);
        } catch (error) {
            console.error('Error loading customers:', error);
            alert('Failed to load customers. Please try again.');
        }
    }
    
    // Render customers in the table
    function renderCustomers(customers) {
        customersBody.innerHTML = '';
        
        if (customers.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="5" class="text-center">No customers found</td>';
            customersBody.appendChild(row);
            return;
        }
        
        customers.forEach(customer => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${customer.name}</td>
                <td>${customer.email || '-'}</td>
                <td>${customer.phone || '-'}</td>
                <td>${customer.invoices ? customer.invoices.length : 0}</td>
                <td>
                    <button class="btn-edit" data-id="${customer.customerId}">Edit</button>
                </td>
            `;
            
            customersBody.appendChild(row);
        });
        
        // Add event listeners to edit buttons
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const customerId = btn.getAttribute('data-id');
                editCustomer(customerId);
            });
        });
    }
    
    // Edit customer
    async function editCustomer(customerId) {
        try {
            const response = await fetch(`http://localhost:7021/api/customers/${customerId}`);
            if (!response.ok) throw new Error('Failed to load customer');
            
            const customer = await response.json();
            
            // Populate form
            document.getElementById('modalTitle').textContent = 'Edit Customer';
            document.getElementById('customerId').value = customer.customerId;
            document.getElementById('customerName').value = customer.name;
            document.getElementById('customerEmail').value = customer.email || '';
            document.getElementById('customerPhone').value = customer.phone || '';
            document.getElementById('customerAddress').value = customer.address || '';
            
            // Show delete button
            deleteCustomerBtn.classList.remove('hidden');
            
            // Open modal
            customerModal.style.display = 'block';
            
            currentCustomerId = customerId;
        } catch (error) {
            console.error('Error loading customer:', error);
            alert('Failed to load customer. Please try again.');
        }
    }
    
    // Save customer (create or update)
    async function saveCustomer(customerData) {
        const method = customerData.customerId ? 'PUT' : 'POST';
        const url = customerData.customerId 
            ? `http://localhost:7021/api/customers/${customerData.customerId}`
            : 'http://localhost:7021/api/customers';
            
        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(customerData)
            });
            
            if (response.ok) {
                const savedCustomer = await response.json();
                alert('Customer saved successfully!');
                customerModal.style.display = 'none';
                loadCustomers();
            } else {
                const error = await response.json();
                alert(`Error: ${error.message}`);
            }
        } catch (error) {
            console.error('Error saving customer:', error);
            alert('Failed to save customer. Please try again.');
        }
    }
    
    // Delete customer
    async function deleteCustomer(customerId) {
        if (!confirm('Are you sure you want to delete this customer?')) return;
        
        try {
            const response = await fetch(`http://localhost:7021/api/customers/${customerId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                alert('Customer deleted successfully!');
                customerModal.style.display = 'none';
                loadCustomers();
            } else {
                const error = await response.json();
                alert(`Error: ${error.message}`);
            }
        } catch (error) {
            console.error('Error deleting customer:', error);
            alert('Failed to delete customer. Please try again.');
        }
    }
    
    // Filter customers based on search
    function filterCustomers() {
        // In a real app, you would make an API call with search parameter
        console.log('Filtering customers...');
    }
    
    // Event Listeners
    addCustomerBtn.addEventListener('click', () => {
        document.getElementById('modalTitle').textContent = 'Add New Customer';
        document.getElementById('customerId').value = '';
        customerForm.reset();
        deleteCustomerBtn.classList.add('hidden');
        customerModal.style.display = 'block';
        currentCustomerId = null;
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
            customerId: currentCustomerId,
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
    
    deleteCustomerBtn.addEventListener('click', () => {
        if (currentCustomerId) {
            deleteCustomer(currentCustomerId);
        }
    });
    
    customerSearch.addEventListener('input', filterCustomers);
    
    // Initialize
    loadCustomers();
});