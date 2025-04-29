import { customersUrl, domElements, state } from './config.js';

export async function loadCustomers() {
  try {
    const response = await fetch(customersUrl);
    state.customers = await response.json();
    renderCustomers();
    updateCustomerDropdowns();
  } catch (error) {
    console.error("Error loading customers: ", error);
  }
}

function renderCustomers() {
  domElements.customersTable.innerHTML = '';
  state.customers.forEach(customer => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${customer.customerId}</td>
      <td>${customer.name}</td>
      <td>${customer.email || ''}</td>
      <td>${customer.phone || ''}</td>
      <td>
        <button onclick = "customer.deleteCustomer(${customer.customerId})">Delete</button>
      </td>
    `;
    domElements.customersTable.appendChild(row);
  });
}

export async function addCustomer() {
  const name = document.getElementById('customer-name').value.trim();
  const email = document.getElementById('customer-email').value.trim();
  const phone = document.getElementById("customer-phone").value.trim();
  const address = document.getElementById('customer-address').value.trim();

  if (!name) {
    alert("Name is required");
    return;
  }

  const customer = { name, email, phone, address };

  try {
    const response = await fetch(customersUrl, {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customer)
    });

    if (response.ok) {
      document.getElementById('customer-name').value = "";
      document.getElementById('customer-email').value = "";
      document.getElementById('customer-phone').value = "";
      document.getElementById('customer-address').value = "";
      await loadCustomers();
      alert("Customer Added Successfully");
    } else {
      alert("Error Adding Customer");
    }
  } catch (error) {
    console.error('Error adding customer: ', error);
  }
}

export async function deleteCustomer(id) {
  if (!confirm("Are you sure you want to delete this customer?")) return;

  try {
    const response = await fetch(`${customersUrl}/${id}`, {
      method: "DELETE"
    });

    if (response.ok) {
      await loadCustomers();
    } else {
      alert("Error deleting customer");
    }
  } catch (error) {
    console.error("Error deleting customer: ", error);
  }
}

export function updateCustomerDropdowns() {
  domElements.invoiceCustomerSelect.innerHTML = `<option value="">Select Customer</option>`;
  state.customers.forEach(customer => {
    const option = document.createElement('option');
    option.value = customer.customerId;
    option.textContent = customer.name;
    domElements.invoiceCustomerSelect.appendChild(option);
  });
}

// Make functions available globally for HTML onclick attributes
window.customer = { deleteCustomer };