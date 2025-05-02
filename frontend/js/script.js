// Global Variables
let customers =[];
let products = [];
let invoices = [];
let currentInvoiceItems = [];

// DOM elements
const customersTable = document.getElementById('customers-table').getElementsByTagName('tbody')[0];
const productsTable = document.getElementById('products-table').getElementsByTagName('tbody')[0];
const invoicesTable = document.getElementById('invoices-table').getElementsByTagName('tbody')[0];
const invoiceCustomerSelect = document.getElementById("invoice-customer");
const invoiceProductSelect = document.querySelector('.invoice-product');
const invoiceItemsList = document.getElementById('invoice-items-list');
const invoicePreview = document.getElementById('invoice-preview');

// API URLS
const apiUrl = "http://localhost:5173";
const customersUrl = `${apiUrl}/api/customer`;
const productsUrl = `${apiUrl}/api/product`;
const invoicesUrl = `${apiUrl}/api/invoice`;

// Initialize the app
document.addEventListener("DOMContentLoaded", function(){
    // set default due date
    const dueDate = new Date();
    console.log(dueDate);
    dueDate.setDate(dueDate.getDate()+30);
    document.getElementById('invoice-due-date').valueAsDate = dueDate;

    loadCustomers();
    loadProducts();
    loadInvoices();
    // setting up event listeners
    document.getElementById('add-customer').addEventListener('click', addCustomer);
    document.getElementById('add-product').addEventListener('click',addProduct);
    document.getElementById('create-invoice').addEventListener('click', createInvoice);
    document.querySelector('.add-item').addEventListener('click', addInvoiceItem);
    document.getElementById('new-invoice').addEventListener('click', resetInvoiceForm);
    document.getElementById('print-invoice').addEventListener('click', printInvoice);
});

// load customers from API
async function loadCustomers() {
    try {
        const response = await fetch(customersUrl);
        customers = await response.json();

        renderCustomers();
        updateCustomerDropdowns();

    } catch (error) {
        console.error("Error loading customers : ",error);      
    }
}

function renderCustomers(){
    customersTable.innerHTML='';
    customers.forEach(customer => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${customer.customerId}</td>
            <td>${customer.name}</td>
            <td>${customer.email || ''}</td>
            <td>${customer.phone || ''}</td>
            <td>
                <button onclick = "deleteCustomer(${customer.customerId})">Delete</button>
            </td>
        `;
        customersTable.appendChild(row);
    });
}

async function addCustomer() {
    const name = document.getElementById('customer-name').value.trim();
    const email = document.getElementById('customer-email').value.trim();
    const phone = document.getElementById("customer-phone").value.trim();
    const address = document.getElementById('customer-address').value.trim();

    if (!name) {
        alert("Name is required")
        return;
    }

    const customer = {
        name,
        email,
        phone,
        address
    };

    try {
        const response = await fetch(customersUrl,{
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(customer)
        });

        if(response.ok){
            document.getElementById('customer-name').value="";
            document.getElementById('customer-email').value="";
            document.getElementById('customer-phone').value="";
            document.getElementById('customer-address').value="";
            loadCustomers();
            alert("Customer Added Successfully");
        }else{
            alert("Error Adding Customer");
        }
    } catch (error) {
        console.error('Error adding customer : ',error);
    }
}

async function deleteCustomer(id) {
    if(!confirm("Are you sure you want to delete this customer?")) return;

    try {
        const response = await fetch(`${customersUrl}/${id}`,{
            method: "DELETE"
        });

        if (response.ok) {
            loadCustomers();
        }else{
            alert("Error deleting customer");
        }
    } catch (error) {
        console.error("Error deleting customer : ",error);
    }
}

function updateCustomerDropdowns(){
    invoiceCustomerSelect.innerHTML = `<option value = "">Select Customer</option>`;
    customers.forEach(customer => {
        const option = document.createElement('option');
        option.value=customer.customerId;
        option.textContent = customer.name;
        invoiceCustomerSelect.appendChild(option);
    });
}

async function loadProducts() {
    try {
        const response = await fetch(productsUrl);
        products = await response.json();

        renderProducts();
        updateProductDropdowns();


    } catch (error) {
        console.error("Error Loading products : ",error);
    }
}

function renderProducts(){
    productsTable.innerHTML="";
    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.productId}</td>
            <td>${product.name}</td>
            <td>${product.description || ''}</td>
            <td>Rs. ${product.price.toFixed(2)}</td>
            <td>
                <button onclick="deleteProduct(${product.productId})">Delete</button>
            </td>
        `;
        productsTable.appendChild(row);
    });
}

async function addProduct() {
    const name = document.getElementById("product-name").value.trim();
    const price = parseInt(document.getElementById("product-price").value);
    const description = document.getElementById("product-description").value.trim();
    // console.log("price : ",price, typeof price);
    if(!name){
        alert("Name field is required.");
        return;
    }

    if(isNaN(price)){
        alert("Valid price is required.");
        return;
    }

    const product = {
        name,
        price,
        description
    }

    try {
        const response = await fetch(productsUrl,{
            method: "POST",
            headers: {
                'Content-Type': "application/json"
            },
            body: JSON.stringify(product)
        });

        if (response.ok) {
            document.getElementById("product-name").value = "";
            document.getElementById("product-price").value = "";
            document.getElementById("product-description").value = "";
            loadProducts();
            alert("Product added successfully");
        }else{
            alert("Error adding product");
        }
    } catch (error) {
        console.error("Error adding product : ",error);
    }
}

async function deleteProduct(id) {
    alert("Are you sure you want to delete this product");

    try {
        const response = await fetch(`${productsUrl}/${id}`,{
            method: "DELETE"
        });

        if(response.ok){
            loadProducts();
        }else{
            alert("Error deleting product.");
        }
    } catch (error) {
        console.error("Error deleting product : ",error);
    }
}

function updateProductDropdowns(){
    invoiceProductSelect.innerHTML = `<option value = "">Select Product</option>`;
    products.forEach(product => {
        const option = document.createElement('option');
        option.value=product.productId;
        option.textContent=product.name;

        invoiceProductSelect.appendChild(option);
    });
}

async function loadInvoices() {
    try {
        const response = await fetch(invoicesUrl);
        invoices = await response.json();

        renderInvoices();
    } catch (error) {
        console.error("Error loading invoice : ",error);
    }
}

function renderInvoices(){
    invoicesTable.innerHTML = "";
    invoices.forEach(invoice => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${invoice.invoiceId}</td>
            <td>${invoice.customer.name}</td>
            <td>${new Date(invoice.invoiceDate).toLocaleDateString()}</td>
            <td>${new Date(invoice.dueDate).toLocaleDateString()}</td>
            <td>Rs. ${invoice.totalAmount.toFixed(2)}</td>
            <td>${invoice.status}</td>
            <td>
                <button onclick = viewInvoice(${invoice.invoiceId}) >View</button>
                <button onclick = deleteInvoice(${invoice.invoiceId}) >Delete</button>
            </td>
        `;
        invoicesTable.appendChild(row);
    });
}

function addInvoiceItem(){
    const productSelect = this.parentElement.querySelector(".invoice-product");
    const quantityInput = this.parentElement.querySelector(".invoice-quantity");

    const productId = parseInt(productSelect.value);
    const quantity = parseInt(quantityInput.value);

    if (!productId || isNaN(quantity) || quantity<1) {
        alert("Please select a product and a valid quantity.");
        return;
    }

    const product = products.find(p => p.productId === productId );
    currentInvoiceItems.push({
        productId,
        quantity,
        unitPrice: product.price,
        product
    });

    renderInvoiceItems();

    productSelect.value="";
    quantityInput.value="1";
}


function renderInvoiceItems(){
    invoiceItemsList.innerHTML="";
    currentInvoiceItems.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = "item-row";
        itemDiv.innerHTML = `
            <input type = "text" value = "${item.product.name}" readonly>
            <input type = "number" value = "${item.quantity}" readonly>
            <input type = "text" value = "Rs. ${item.unitPrice}" readonly>
            <input type = "text" value = "Rs. ${item.unitPrice * item.quantity}" readonly>
            <button onclick = "removeInvoiceItem(${index})" >Remove</button>
        `;
        invoiceItemsList.appendChild(itemDiv);
        console.log(currentInvoiceItems);

    });
}

function removeInvoiceItem(index){
    currentInvoiceItems.splice(index,1);
    renderInvoiceItems();
}

async function createInvoice() {
    const customerId = parseInt(invoiceCustomerSelect.value);
    const dueDate = document.getElementById('invoice-due-date').value;
    if (!customerId || !dueDate || currentInvoiceItems.length === 0) {
        alert("Please select a customer, due date and atleast one product.");
        return;
    }

    const invoiceRequest = {
        customerId,
        dueDate,
        items: currentInvoiceItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity
        }))
    };

    try {
        const response = await fetch(invoicesUrl,{
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(invoiceRequest)
        });

        if (response.ok) {
            const invoice = await response.json();
            viewInvoice(invoice.invoiceId);
            loadInvoices();
        }else{
            alert("Error creating invoice");
        }
    } catch (error) {
        console.error("Error creating invoice : ",error);
    }
}

async function deleteInvoice(id){
    if (!confirm("Are you sure you want to delete the invoice?")) {
        return;
    }
    try {
        const response = await fetch(`${invoicesUrl}/${id}`,{
            method: "DELETE"
        });
        if (response.ok) {
            loadInvoices(); 
            alert("Invoice deleted successfully.");
        } else {
            alert("Error deleting invoice.");
        }
    } catch (error) {
        console.error("Error deleting invoice : ",error);        
    }
}

async function viewInvoice(id) {
    try {
        const response = await fetch(`${invoicesUrl}/${id}`);
        const invoice = await response.json();

        // populate preview
        document.getElementById("preview-invoice-id").textContent=invoice.invoiceId;
        document.getElementById("preview-invoice-date").textContent = new Date(invoice.invoiceDate).toLocaleDateString();
        document.getElementById("preview-invoice-due-date").textContent=new Date(invoice.dueDate).toLocaleDateString();
        document.getElementById("preview-customer-name").textContent = invoice.customer.name;
        
        let customerDetails = "";
        if (invoice.customer.email) customerDetails += `<p>Email: ${invoice.customer.email}</p>`;
        if (invoice.customer.phone) customerDetails += `<p>Phone: ${invoice.customer.phone}</p>`;
        if (invoice.customer.address) customerDetails += `<p>Address: ${invoice.customer.address}</p>`;
        document.getElementById('preview-customer-details').innerHTML = customerDetails;
        
        const itemsTable = document.getElementById('preview-items-table').getElementsByTagName('tbody')[0];
        itemsTable.innerHTML = '';

        invoice.items.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.product.name}</td>
                <td>${item.product.description || ''}</td>
                <td>${item.quantity}</td>
                <td>Rs. ${item.unitPrice.toFixed(2)}</td>
                <td>Rs. ${(item.quantity * item.unitPrice).toFixed(2)}</td>
            `;
            itemsTable.appendChild(row);
        });
        
        document.getElementById('preview-total-amount').textContent = invoice.totalAmount.toFixed(2);
        
        // Show preview
        invoicePreview.classList.remove('hidden');
        window.scrollTo(0, document.body.scrollHeight);

    } catch (error) {
        console.error('Error viewing invoice:', error);
    }
}

function resetInvoiceForm() {
    currentInvoiceItems = [];
    invoiceItemsList.innerHTML = '';
    invoiceCustomerSelect.value = '';
    
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);
    document.getElementById('invoice-due-date').valueAsDate = dueDate;
    
    invoicePreview.classList.add('hidden');
}

function printInvoice() {
    window.print();
}

const downloadPdfBtn = document.getElementById('download-pdf');
downloadPdfBtn.addEventListener('click', downloadInvoiceAsPdf);

async function downloadInvoiceAsPdf() {
    const { jsPDF } = window.jspdf;
    const invoicePreview = document.getElementById('invoice-preview');
    
    // Temporarily show the preview if hidden
    const wasHidden = invoicePreview.classList.contains('hidden');
    if (wasHidden) {
        invoicePreview.classList.remove('hidden');
    }
    
    // Add class to hide buttons
    invoicePreview.classList.add('generating-pdf');
    
    // Create PDF
    const pdf = new jsPDF('p', 'pt', 'a4');
    await html2canvas(invoicePreview).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pdf.internal.pageSize.getWidth();
        const imgHeight = canvas.height * imgWidth / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.save(`Invoice_${document.getElementById('preview-invoice-id').textContent}.pdf`);
    });
    
    // Remove the hiding class
    invoicePreview.classList.remove('generating-pdf');
    
    // Hide again if it was hidden
    if (wasHidden) {
        invoicePreview.classList.add('hidden');
    }
}


// async function downloadInvoiceAsPdf() {
//     const invoiceId = document.getElementById('preview-invoice-id').textContent;
//     if (!invoiceId) {
//         alert('No invoice selected');
//         return;
//     }

//     try {
//         // Show loading indicator
//         const downloadBtn = document.getElementById('download-pdf');
//         const originalText = downloadBtn.textContent;
//         downloadBtn.textContent = 'Generating PDF...';
//         downloadBtn.disabled = true;

//         const response = await fetch(`${invoicesUrl}/${invoiceId}/pdf`);
        
//         if (!response.ok) {
//             const errorData = await response.json().catch(() => ({}));
//             throw new Error(errorData.message || 'Failed to generate PDF');
//         }
        
//         const blob = await response.blob();
//         const url = window.URL.createObjectURL(blob);
//         const a = document.createElement('a');
//         a.href = url;
//         a.download = `Invoice_${invoiceId}.pdf`;
//         document.body.appendChild(a);
//         a.click();
        
//         // Clean up
//         window.URL.revokeObjectURL(url);
//         document.body.removeChild(a);
//     } catch (error) {
//         console.error('Error downloading PDF:', error);
//         alert(`Error downloading PDF: ${error.message}`);
//     } finally {
//         // Restore button state
//         const downloadBtn = document.getElementById('download-pdf');
//         downloadBtn.textContent = originalText;
//         downloadBtn.disabled = false;
//     }
// }