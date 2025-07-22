// Client-side JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const loginBtn = document.querySelector('.header-top-btn[href="login.html"]');
    
    // Check login state
    if (localStorage.getItem('isLoggedIn') === 'true') {
        loginBtn.textContent = 'Logout';
        loginBtn.href = 'login.html';
        
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('isLoggedIn');
            alert('Logged out successfully!');
            location.reload();
        });
    }
});