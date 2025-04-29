import { productsUrl, domElements, state } from './config.js';

export async function loadProducts() {
  try {
    const response = await fetch(productsUrl);
    state.products = await response.json();
    renderProducts();
    updateProductDropdowns();
  } catch (error) {
    console.error("Error Loading products: ", error);
  }
}

function renderProducts() {
  domElements.productsTable.innerHTML = "";
  state.products.forEach(product => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${product.productId}</td>
      <td>${product.name}</td>
      <td>${product.description || ''}</td>
      <td>${product.price.toFixed(2)}</td>
      <td>
        <button onclick="product.deleteProduct(${product.productId})">Delete</button>
      </td>
    `;
    domElements.productsTable.appendChild(row);
  });
}

export async function addProduct() {
  const name = document.getElementById("product-name").value.trim();
  const price = parseFloat(document.getElementById("product-price").value);
  const description = document.getElementById("product-description").value.trim();

  if (!name) {
    alert("Name field is required.");
    return;
  }

  if (isNaN(price)) {
    alert("Valid price is required.");
    return;
  }

  const product = { name, price, description };

  try {
    const response = await fetch(productsUrl, {
      method: "POST",
      headers: { 'Content-Type': "application/json" },
      body: JSON.stringify(product)
    });

    if (response.ok) {
      document.getElementById("product-name").value = "";
      document.getElementById("product-price").value = "";
      document.getElementById("product-description").value = "";
      await loadProducts();
      alert("Product added successfully");
    } else {
      alert("Error adding product");
    }
  } catch (error) {
    console.error("Error adding product: ", error);
  }
}

export async function deleteProduct(id) {
  if (!confirm("Are you sure you want to delete this product?")) return;

  try {
    const response = await fetch(`${productsUrl}/${id}`, {
      method: "DELETE"
    });

    if (response.ok) {
      await loadProducts();
    } else {
      alert("Error deleting product.");
    }
  } catch (error) {
    console.error("Error deleting product: ", error);
  }
}

export function updateProductDropdowns() {
  domElements.invoiceProductSelect.innerHTML = `<option value="">Select Product</option>`;
  state.products.forEach(product => {
    const option = document.createElement('option');
    option.value = product.productId;
    option.textContent = product.name;
    domElements.invoiceProductSelect.appendChild(option);
  });
}

// Make functions available globally for HTML onclick attributes
window.product = { deleteProduct };