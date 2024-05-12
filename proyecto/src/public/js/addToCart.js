document.addEventListener("DOMContentLoaded", function () {
  let buttonList = document.getElementsByClassName("btn-add-cart");
  for (let button of buttonList) {
    button.addEventListener("click", (e) => {
      let productId = e.target.getAttribute("data-id");
      let cartId = e.target.getAttribute("data-cart");
      fetch(`/cart/${cartId}/product/${productId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: productId,
          quantity: 1,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("producto agregado con exito", data);
          alert("Producto agregado con exito!");
        })
        .catch((error) => {
          console.log("error al agregar producto", error);
        });
    });
  }
});
