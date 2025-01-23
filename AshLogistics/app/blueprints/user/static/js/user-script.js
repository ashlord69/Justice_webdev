const container = document.getElementById('login-container');
const registerBtn = document.getElementById('register');
const loginBtn = document.getElementById('login-btn');

registerBtn.addEventListener('click', () => {
    container.classList.add("active");
});

loginBtn.addEventListener('click', () => {
    container.classList.remove("active");
});