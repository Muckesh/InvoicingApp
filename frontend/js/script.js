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
const apiUrl = "http://localhost:5210";
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

    // setting up event listeners
    document.getElementById('add-customer').addEventListener('click', addCustomer);
});

// load customers from API
async function loadCustomers() {
    try {
        const response = await fetch(customersUrl);
        customers = await response.json();

        renderCustomers();
        // updateCustomerDropdowns();

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