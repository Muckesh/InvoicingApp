document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const invoicesBody = document.getElementById('invoicesBody');
    const searchInput = document.getElementById('searchInput');
    const dateFilter = document.getElementById('dateFilter');
    const customDateRange = document.getElementById('customDateRange');
    
    // Load invoices from API
    async function loadInvoices() {
        try {
            const response = await fetch('http://localhost:7021/api/invoices');
            if (!response.ok) throw new Error('Failed to load invoices');
            
            const invoices = await response.json();
            renderInvoices(invoices);
        } catch (error) {
            console.error('Error loading invoices:', error);
            alert('Failed to load invoices. Please try again.');
        }
    }
    
    // Render invoices in the table
    function renderInvoices(invoices) {
        invoicesBody.innerHTML = '';
        
        if (invoices.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="6" class="text-center">No invoices found</td>';
            invoicesBody.appendChild(row);
            return;
        }
        
        invoices.forEach(invoice => {
            const row = document.createElement('tr');
            
            // Format date
            const invoiceDate = new Date(invoice.invoiceDate);
            const formattedDate = invoiceDate.toLocaleDateString();
            
            // Determine status
            const dueDate = new Date(invoice.dueDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            let status = 'Paid'; // In a real app, you'd check payment status
            if (dueDate < today) {
                status = 'Overdue';
            } else if (dueDate >= today) {
                status = 'Pending';
            }
            
            row.innerHTML = `
                <td>${invoice.invoiceId}</td>
                <td>${formattedDate}</td>
                <td>${invoice.customer.name}</td>
                <td>$${invoice.grandTotal.toFixed(2)}</td>
                <td><span class="status ${status.toLowerCase()}">${status}</span></td>
                <td>
                    <a href="#" class="btn-view" data-id="${invoice.invoiceId}">View</a>
                    <a href="http://localhost:7021/api/invoices/${invoice.invoiceId}/pdf" target="_blank" class="btn-pdf">PDF</a>
                </td>
            `;
            
            invoicesBody.appendChild(row);
        });
    }
    
    // Filter invoices based on search and date filter
    function filterInvoices() {
        // In a real app, you would make an API call with filter parameters
        console.log('Filtering invoices...');
    }
    
    // Event Listeners
    searchInput.addEventListener('input', filterInvoices);
    
    dateFilter.addEventListener('change', function() {
        if (this.value === 'custom') {
            customDateRange.classList.remove('hidden');
        } else {
            customDateRange.classList.add('hidden');
            filterInvoices();
        }
    });
    
    document.getElementById('startDate').addEventListener('change', filterInvoices);
    document.getElementById('endDate').addEventListener('change', filterInvoices);
    
    // Initialize
    loadInvoices();
});