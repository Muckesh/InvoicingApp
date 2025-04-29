// Shared variables and configuration
export const apiUrl = "http://localhost:5173";
export const customersUrl = `${apiUrl}/api/customer`;
export const productsUrl = `${apiUrl}/api/product`;
export const invoicesUrl = `${apiUrl}/api/invoice`;

// DOM Elements
export const domElements = {
  customersTable: document.getElementById('customers-table').getElementsByTagName('tbody')[0],
  productsTable: document.getElementById('products-table').getElementsByTagName('tbody')[0],
  invoicesTable: document.getElementById('invoices-table').getElementsByTagName('tbody')[0],
  invoiceCustomerSelect: document.getElementById("invoice-customer"),
  invoiceProductSelect: document.querySelector('.invoice-product'),
  invoiceItemsList: document.getElementById('invoice-items-list'),
  invoicePreview: document.getElementById('invoice-preview')
};

// State management
export const state = {
  customers: [],
  products: [],
  invoices: [],
  currentInvoiceItems: []
};