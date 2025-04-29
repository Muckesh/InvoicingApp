import { domElements } from './config.js';
import { loadCustomers, addCustomer, updateCustomerDropdowns } from './customer.js';
import { loadProducts, addProduct, updateProductDropdowns } from './product.js';
import { loadInvoices, createInvoice, addInvoiceItem, resetInvoiceForm, printInvoice, downloadInvoiceAsPdf } from './invoice.js';

// Initialize the app
document.addEventListener("DOMContentLoaded", function() {
  // Set default due date
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30);
  document.getElementById('invoice-due-date').valueAsDate = dueDate;

  // Load initial data
  loadCustomers();
  loadProducts();
  loadInvoices();

  // Set up event listeners
  document.getElementById('add-customer').addEventListener('click', addCustomer);
  document.getElementById('add-product').addEventListener('click', addProduct);
  document.getElementById('create-invoice').addEventListener('click', createInvoice);
  document.querySelector('.add-item').addEventListener('click', addInvoiceItem);
  document.getElementById('new-invoice').addEventListener('click', resetInvoiceForm);
//   document.getElementById('print-invoice').addEventListener('click', printInvoice);
  document.getElementById('download-pdf').addEventListener('click', downloadInvoiceAsPdf);
});