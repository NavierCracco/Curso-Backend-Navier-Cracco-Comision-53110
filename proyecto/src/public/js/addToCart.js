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
      let productId = e.target.getAttribute("data-id");
      let cartId = e.target.getAttribute("data-cart");
      let price = e.target.getAttribute("price");
      // console.log(price);
      // console.log(`cart id: ${cartId}, product id: ${productId}`);
      fetch(`/cart/${cartId}/product/${productId}`, {
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
          console.log("producto agregado con exito", data);
        })
        .catch((error) => {
          console.log("error al agregar producto", error);
        });
    });
  }
});
