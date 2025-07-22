function checkAuth(redirectTo) {
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        alert('Please login first');
        // Store the intended destination
        localStorage.setItem('redirectAfterLogin', redirectTo);
        window.location.href = 'login.html';
        return false;
    }
    return true;
} 