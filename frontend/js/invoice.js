import { invoicesUrl, domElements, state } from './config.js';
import { updateCustomerDropdowns } from './customer.js';
import { updateProductDropdowns } from './product.js';
import { loadProducts } from './product.js';

export async function loadInvoices() {
  try {
    const response = await fetch(invoicesUrl);
    state.invoices = await response.json();
    renderInvoices();
  } catch (error) {
    console.error("Error loading invoice: ", error);
  }
}

function renderInvoices() {
  domElements.invoicesTable.innerHTML = "";
  state.invoices.forEach(invoice => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${invoice.invoiceId}</td>
      <td>${invoice.customer.name}</td>
      <td>${new Date(invoice.invoiceDate).toLocaleDateString()}</td>
      <td>${new Date(invoice.dueDate).toLocaleDateString()}</td>
      <td>Rs. ${invoice.totalAmount.toFixed(2)}</td>
      <td>${invoice.status}</td>
      <td>
        <button onclick="invoice.viewInvoice(${invoice.invoiceId})">View</button>
        <button onclick="invoice.deleteInvoice(${invoice.invoiceId})">Delete</button>
      </td>
    `;
    domElements.invoicesTable.appendChild(row);
  });
}

export function addInvoiceItem() {
  const productSelect = this.parentElement.querySelector(".invoice-product");
  const quantityInput = this.parentElement.querySelector(".invoice-quantity");

  const productId = parseInt(productSelect.value);
  const quantity = parseInt(quantityInput.value);

  if (!productId || isNaN(quantity) || quantity < 1) {
    alert("Please select a product and a valid quantity.");
    return;
  }

  const product = state.products.find(p => p.productId === productId);
  state.currentInvoiceItems.push({
    productId,
    quantity,
    unitPrice: product.price,
    product
  });

  renderInvoiceItems();
  productSelect.value = "";
  quantityInput.value = "1";
}

function renderInvoiceItems() {
  domElements.invoiceItemsList.innerHTML = "";
  state.currentInvoiceItems.forEach((item, index) => {
    const itemDiv = document.createElement('div');
    itemDiv.className = "item-row";
    itemDiv.innerHTML = `
      <input type="text" value="${item.product.name}" readonly>
      <input type="number" value="${item.quantity}" readonly>
      <input type="text" value="Rs. ${item.unitPrice}" readonly>
      <input type="text" value="Rs. ${item.unitPrice * item.quantity}" readonly>
      <button onclick="invoice.removeInvoiceItem(${index})">Remove</button>
    `;
    domElements.invoiceItemsList.appendChild(itemDiv);
  });
}

export function removeInvoiceItem(index) {
  state.currentInvoiceItems.splice(index, 1);
  renderInvoiceItems();
}

export async function createInvoice() {
  const customerId = parseInt(domElements.invoiceCustomerSelect.value);
  const dueDate = document.getElementById('invoice-due-date').value;
  
  if (!customerId || !dueDate || state.currentInvoiceItems.length === 0) {
    alert("Please select a customer, due date and at least one product.");
    return;
  }

  const invoiceRequest = {
    customerId,
    dueDate,
    items: state.currentInvoiceItems.map(item => ({
      productId: item.productId,
      quantity: item.quantity
    }))
  };

  try {
    const response = await fetch(invoicesUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(invoiceRequest)
    });

    if (response.ok) {
      const invoice = await response.json();
      await viewInvoice(invoice.invoiceId);
      await loadInvoices();
    } else {
      alert("Error creating invoice");
    }
  } catch (error) {
    console.error("Error creating invoice: ", error);
  }
}

export async function deleteInvoice(id) {
  if (!confirm("Are you sure you want to delete the invoice?")) return;

  try {
    const response = await fetch(`${invoicesUrl}/${id}`, {
      method: "DELETE"
    });
    if (response.ok) {
      await loadInvoices();
      alert("Invoice deleted successfully.");
    } else {
      alert("Error deleting invoice.");
    }
  } catch (error) {
    console.error("Error deleting invoice: ", error);
  }
}

export async function viewInvoice(id) {
  try {
    const response = await fetch(`${invoicesUrl}/${id}`);
    const invoice = await response.json();

    // Populate preview
    document.getElementById("preview-invoice-id").textContent = invoice.invoiceId;
    document.getElementById("preview-invoice-date").textContent = new Date(invoice.invoiceDate).toLocaleDateString();
    document.getElementById("preview-invoice-due-date").textContent = new Date(invoice.dueDate).toLocaleDateString();
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
    domElements.invoicePreview.classList.remove('hidden');
    window.scrollTo(0, document.body.scrollHeight);
  } catch (error) {
    console.error('Error viewing invoice:', error);
  }
}

export function resetInvoiceForm() {
  state.currentInvoiceItems = [];
  domElements.invoiceItemsList.innerHTML = '';
  domElements.invoiceCustomerSelect.value = '';

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30);
  document.getElementById('invoice-due-date').valueAsDate = dueDate;

  domElements.invoicePreview.classList.add('hidden');
}

export function printInvoice() {
  window.print();
}

export async function downloadInvoiceAsPdf() {
  const { jsPDF } = window.jspdf;
  const invoicePreview = domElements.invoicePreview;
  
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

// Make functions available globally for HTML onclick attributes
window.invoice = { 
  viewInvoice, 
  deleteInvoice, 
  removeInvoiceItem,
  downloadInvoiceAsPdf
};