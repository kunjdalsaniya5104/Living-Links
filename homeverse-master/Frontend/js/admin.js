async function viewEnquiry(id) {
    try {
        const response = await fetch(`http://localhost:3000/admin/enquiry/${id}`, {
            credentials: 'include'
        });
        const data = await response.json();
        // Show enquiry details in a modal
        alert(JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error viewing enquiry:', error);
    }
}

async function deleteEnquiry(id) {
    if (!confirm('Are you sure you want to delete this enquiry?')) return;
    
    try {
        const response = await fetch(`http://localhost:3000/admin/enquiry/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        if (response.ok) {
            loadPage('enquiries');
        }
    } catch (error) {
        console.error('Error deleting enquiry:', error);
    }
}

async function editUser(id) {
    // Implement user edit functionality
}

async function deleteUser(id) {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
        const response = await fetch(`http://localhost:3000/admin/user/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        if (response.ok) {
            loadPage('users');
        }
    } catch (error) {
        console.error('Error deleting user:', error);
    }
}

async function editProperty(id) {
    // Implement property edit functionality
}

async function deleteProperty(id) {
    if (!confirm('Are you sure you want to delete this property?')) return;
    
    try {
        const response = await fetch(`http://localhost:3000/admin/property/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        if (response.ok) {
            loadPage('properties');
        }
    } catch (error) {
        console.error('Error deleting property:', error);
    }
} 