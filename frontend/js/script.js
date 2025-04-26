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

    // setting up event listeners
    document.getElementById('add-customer').addEventListener('click', addCustomer);
    document.getElementById('add-product').addEventListener('click',addProduct);
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
            <td>${product.price.toFixed(2)}</td>
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