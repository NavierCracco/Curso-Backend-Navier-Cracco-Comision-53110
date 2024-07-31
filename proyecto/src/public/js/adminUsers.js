document.addEventListener("DOMContentLoaded", function () {
  const roleUpdateForms = document.querySelectorAll("#role-update-form");
  const deleteUserForms = document.querySelectorAll("#delete-user-form");

  roleUpdateForms.forEach((form) => {
    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      const userData = {
        _method: "PUT",
        role: this.elements["role"].value,
      };
      const userId = this.getAttribute("action").split("/").pop();

      try {
        const response = await fetch(`/api/users/premium/${userId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        });
        const result = await response.json();
        console.log("Rol actualizado: ", result);
      } catch (error) {
        console.error(error);
      }
    });
  });

  deleteUserForms.forEach((form) => {
    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      const userId = this.getAttribute("action").split("/").pop();

      try {
        const response = await fetch(`/api/users/delete/${userId}`, {
          method: "DELETE",
        });

        await fetch("/cart", {
          method: "DELETE",
        });

        const result = await response.json();
        console.log("Usuario eliminado: ", result);
      } catch (error) {
        console.log(error);
      }
    });
  });
});
