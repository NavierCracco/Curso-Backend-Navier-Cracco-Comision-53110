// let btnSubmit = document.getElementById("submit");
// let inputEmail = document.getElementById("email");
// let inputPassword = document.getElementById("password");
// let divMensaje = document.getElementById("mensaje");

document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);
  console.log(data);

  try {
    const response = await fetch("/api/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    console.log(result);
  } catch (error) {
    console.log(error);
  }
});

// btnSubmit.addEventListener("click", async (e) => {
//   e.preventDefault();

//   let body = {
//     email: inputEmail.value,
//     password: inputPassword.value,
//   };

//   let resultado = await fetch("/api/users/login", {
//     method: "post",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(body),
//   });
// });
