document.addEventListener("DOMContentLoaded", function () {
  function copyDataCartToButtons() {
    const buttons = document.querySelectorAll(".btn-add-cart");
    const welcomeMessage = document.getElementById("welcome-message");

    buttons.forEach((button) => {
      button.setAttribute(
        "data-cart",
        welcomeMessage.getAttribute("data-cart")
      );
      let priceElement = button.parentElement.querySelector("#price");
      let priceText = priceElement ? priceElement.innerText : "";
      let price = parseFloat(priceText.replace(/[^0-9.-]+/g, ""));
      button.setAttribute("price", price.toString());
    });
  }

  copyDataCartToButtons();

  let buttonList = document.getElementsByClassName("btn-add-cart");
  for (let button of buttonList) {
    button.addEventListener("click", (e) => {
      const welcomeMessage = document.getElementById("welcome-message");
      const userId = welcomeMessage.getAttribute("data-userid");
      const owner = e.target.getAttribute("data-owner");
      let productId = e.target.getAttribute("data-id");
      let cartId = e.target.getAttribute("data-cart");
      let price = e.target.getAttribute("price");

      fetch(`/api/cart/${cartId}/product/${productId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: productId,
          quantity: 1,
          price: Number(price),
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (owner === userId) {
            alert("No puedes agregar tu propio producto al carrito");
          } else {
            console.log(data);
            alert("Producto añadido al carrito!");
          }
        })
        .catch((error) => {
          console.log("error al agregar producto", error);
        });
    });
  }
});
