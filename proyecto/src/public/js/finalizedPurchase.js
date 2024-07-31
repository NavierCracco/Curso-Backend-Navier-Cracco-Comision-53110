document.addEventListener("DOMContentLoaded", function () {
  const finalizedPurchaseForm = document.getElementById("finalized-purchase");

  finalizedPurchaseForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formdata = new FormData(finalizedPurchaseForm);
    const ticketId = formdata.get("ticketId");

    try {
      const response = await fetch(`/api/cart/${ticketId}/finalizedpurchase`, {
        method: "POST",
        body: formdata,
      });

      const result = await response.json();
      console.log(result);
      alert(
        "Compra finalizada con éxito. Pronto le llegará un email con los datos de su compra!"
      );
      window.location.href = "/";
    } catch (error) {
      console.error("Error:", error);
    }
  });
});
