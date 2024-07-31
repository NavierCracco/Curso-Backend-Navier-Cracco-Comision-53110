document.addEventListener("DOMContentLoaded", function () {
  const purchaseForm = document.getElementById("purchase-form");
  const deleteBtns = document.querySelectorAll(".delete-btn");

  deleteBtns.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const productId = btn.getAttribute("data-id");

      const formdata = new FormData(purchaseForm);
      const cartId = formdata.get("cartId");

      try {
        await fetch(`/api/cart/${cartId}/product/${productId}`, {
          method: "DELETE",
        });

        btn.closest(".cart-item").remove();
        alert("Producto eliminado del carrito");
        location.reload();
      } catch (error) {
        console.error("Error al eliminar el producto", error);
      }
    });
  });

  purchaseForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formdata = new FormData(purchaseForm);
    const cartId = formdata.get("cartId");

    try {
      const response = await fetch(`/api/cart/${cartId}/purchase`, {
        method: "POST",
        body: formdata,
      });

      const result = await response.json();
      console.log(result);

      window.location.href = `/cart/${cartId}/purchase/${result.ticket._id}`;
    } catch (error) {
      console.error(error);
    }
  });
});
