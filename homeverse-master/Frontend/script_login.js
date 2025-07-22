const wrapper = document.querySelector('.wrapper')
const registerLink = document.querySelector('.register-link')
const loginLink = document.querySelector('.login-link')

registerLink.onclick = () => {
    wrapper.classList.add('active')
}

loginLink.onclick = () => {
    wrapper.classList.remove('active')
}
// Get the login form
const loginForm = document.querySelector(".form-box.login form");

loginForm.addEventListener("submit", function (e) {
  e.preventDefault(); // Prevent actual form submission

  // You can add validation here if needed
  // For example, check username/password inputs

  // Simulate successful login and redirect
  window.location.href = "index.html";
});
