document.addEventListener("DOMContentLoaded", () => {
  loadNavbar();
});

function loadNavbar() {
  const xhr = new XMLHttpRequest();

  xhr.onload = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      const data = JSON.parse(xhr.responseText);

      if (data.loggedIn) {
        //loggedin navbar
        fetchNavbar("mainNavbarLoggedIn.html");
      } else {
        //guest navbar
        fetchNavbar("mainNavbar.html");
      }
    }
  };

  xhr.open("GET", "/session");
  xhr.setRequestHeader("Accept", "application/json");
  xhr.send();
}

function fetchNavbar(file) {
  fetch(file)
    .then(res => res.text())
    .then(html => {
      const container = document.getElementById("navbar-container");
      if (container) {
        container.innerHTML = html;
      }
    });
}

function logout() {
  const xhr = new XMLHttpRequest();

  xhr.onload = function () {
    if (xhr.status === 200) {
      
      window.location.href = "LoginPG.html";
    } else {
      alert("Logout failed");
    }
  };

  xhr.open("POST", "/logout");
  xhr.send();
}