document.addEventListener("DOMContentLoaded", function () {
  let divMessage = document.getElementById("message");

  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);

  const message = urlParams.get("message");

  console.log("message:", message);

  if (message !== null) {
    divMessage.innerHTML = message + "<br><br>";
    divMessage.style.color = "green";
    divMessage.style.fontWeight = "bold";
  }
});
