document.addEventListener("DOMContentLoaded", function () {
  let divMessage = document.getElementById("message");
  const emailForm = document.getElementById("email-form");

  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);

  const message = urlParams.get("message");

  console.log("message:", message);

  if (message !== null) {
    divMessage.innerHTML = message + "<br><br>";
    divMessage.style.color = "green";
    divMessage.style.fontWeight = "bold";
  }
  emailForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;

    try {
      const response = await fetch("/api/sessions/resetpassword", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      const result = await response.json();
      console.log("Success:", result);
      window.location.href =
        "/sessions/forgotpassword/?message=" + result.message;
    } catch (error) {
      console.error("Error:", error);
    }
  });
});
