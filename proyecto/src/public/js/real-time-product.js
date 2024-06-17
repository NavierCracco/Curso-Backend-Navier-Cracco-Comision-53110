const socket = io();

const updateProductsList = (products) => {
  let list = document.getElementById("product-list");
  let html = "";
  products.forEach((product) => {
    html += `
      <ul id="${product.id}" class="products">
          <p class="title-product">${product.title}</p>
          <li class="img-product">${product.thumbnail}</li>
          <li>$${product.price}</li>
          <li><strong>Descripción:</strong> ${product.description}</li>
          <li><strong>Categoría:</strong> ${product.category}</li>
          <li><strong>Stock:</strong> ${product.stock}</li>
          <li><strong>Estado:</strong> ${product.status}</li>
          <li><strong>Code:</strong> ${product.code}</li> 
          <li><strong>Owner:</strong> ${product.owner}</li>
          <button data-id="${product._id}" class="btn-delete">Borrar</button>
      </ul>`;
  });
  list.innerHTML = html;

  const deleteButtons = document.querySelectorAll(".btn-delete");
  deleteButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const productId = btn.getAttribute("data-id");
      // console.log(productId);
      socket.emit("deleteProduct", productId);
    });
  });
};

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("product-form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const productData = Object.fromEntries(formData);

    const statusValue = document.getElementById("status-true").value;
    const statusBoolean = statusValue === "true" ? true : false;
    console.log(productData);

    productData.status = statusBoolean;

    const userId = document.getElementById("user-id");
    if (userId) {
      let ownerId = userId.dataset.id;
      productData.owner = ownerId;
    }

    socket.emit("newProduct", productData);

    form.reset();
  });
});

socket.on("products", (products) => {
  updateProductsList(products);
});

document.addEventListener("DOMContentLoaded", () => {
  socket.emit("requestInitialProducts");
});

socket.on("initialProducts", (products) => {
  updateProductsList(products);
});
