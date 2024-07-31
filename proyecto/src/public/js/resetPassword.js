document.addEventListener("DOMContentLoaded", function () {
  async function handleSubmit(event) {
    event.preventDefault();

    const newPassword = document.getElementById("new-password").value;
    const confirmPassword = document.getElementById(
      "confirm-new-password"
    ).value;

    if (newPassword !== confirmPassword) {
      alert("Las contraseñas no coinciden.");
      return;
    }

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const token = urlParams.get("token");

    if (!token) {
      console.error("No se pudo encontrar el token en la URL");
      return;
    }

    document.getElementById("reset-token").value = token;

    const formData = new FormData(
      document.getElementById("reset-password-form")
    );

    const data = Object.fromEntries(formData);
    try {
      const response = await fetch("/api/sessions/createdpassword", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      console.log(result);
      window.location.href =
        "/sessions/login?message=contrasena creada exitosamente";
    } catch (error) {
      console.log("Error al enviar formulario:", error);
    }
  }

  document
    .getElementById("reset-password-form")
    .addEventListener("submit", handleSubmit);
});
