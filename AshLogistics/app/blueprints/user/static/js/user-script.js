document.addEventListener("DOMContentLoaded", function () {
  const container = document.getElementById("login-container");
  const registerBtn = document.getElementById("register");
  const loginBtn = document.getElementById("login");
  const verificationModal = new bootstrap.Modal(
    document.getElementById("verificationModal"),
    {
      backdrop: "static",
      keyboard: false,
    }
  );
  let currentEmail = "";

  // Show registration form
  registerBtn.addEventListener("click", () => {
    container.classList.add("active");
  });

  // Show login form
  loginBtn.addEventListener("click", () => {
    container.classList.remove("active");
  });

  // Show Alert
  function showAlert(elementId, message, type) {
    const alert = document.getElementById(elementId);
    alert.textContent = message;
    alert.className = `alert-message ${type}`;
  }

  // Handle Login
  window.handleLogin = async function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    const rememberMe = document.getElementById("rememberMe").checked;

    try {
      const response = await fetch("/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          remember_me: rememberMe,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      localStorage.setItem("token", data.token);
      const redirectUrl = data.redirect_url || "/dashboard";
      window.location.href = redirectUrl;
    } catch (error) {
      showAlert("loginAlert", error.message, "error");
    }
  };

  // Handle Registration
  window.handleRegister = async function (event) {
    event.preventDefault();

    const email = document.getElementById("registerEmail").value;
    const fullName = document.getElementById("registerFullName").value;
    const phone = document.getElementById("registerPhone").value;

    try {
      const response = await fetch("/user/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          full_name: fullName,
          phone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      currentEmail = email;
      verificationModal.show();
    } catch (error) {
      showAlert("registerAlert", error.message, "error");
    }
  };

  // Handle Verification
  window.handleVerification = async function () {
    try {
      const response = await fetch("/user/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: currentEmail,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Verification failed");
      }

      showAlert("verificationAlert", data.message, "success");
      verificationModal.hide();
    } catch (error) {
      showAlert("verificationAlert", error.message, "error");
    }
  };
});
