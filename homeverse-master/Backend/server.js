// server.js

const express = require('express');
const app = express();  // ✅ This line defines "app"
const mysql = require('mysql');
const path = require('path');
const cors = require('cors');
const session = require('express-session');
const PORT = 3000;
const bcrypt = require('bcrypt'); // Install with: npm install bcrypt
const saltRounds = 10;

// Session middleware configuration
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, // set to true if using https
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true // Important for sessions
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Define frontend path
const frontendPath = path.join(__dirname, '..', 'Frontend');

// Serve static files
app.use(express.static(frontendPath));
app.use('/css', express.static(path.join(frontendPath, 'css')));
app.use('/assets', express.static(path.join(frontendPath, 'assets')));

// MySQL Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',      // Your MySQL root password
    database: 'living_links'
  });
  db.connect(err => {
    if (err) {
      console.error('Database connection failed:', err.stack);
      return;
    }
    console.log('Connected to MySQL database.');
  });

// Session check middleware
const checkAuth = (req, res, next) => {
    if (req.session && req.session.userId) {
        next();
    } else {
        res.status(401).send('Please login first');
    }
};

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

app.get('/login.html', (req, res) => {
    res.sendFile(path.join(frontendPath, 'login.html'));
});

// Single login endpoint
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    console.log('Login attempt:', { username, password }); // Debug log

    const query = 'SELECT * FROM users WHERE username = ? OR email = ?';
    db.query(query, [username, username], async (err, results) => {
        if (err) {
            console.error('Login error:', err);
            return res.status(500).json({
                success: false,
                message: 'Server error'
            });
        }

        if (results.length > 0) {
            const match = await bcrypt.compare(password, results[0].password);
            if (match) {
                req.session.userId = results[0].id;
                req.session.username = results[0].username;
                res.json({
                    success: true,
                    message: 'Login Successful',
                    user: {
                        username: results[0].username
                    }
                });
            } else {
                res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
            }
        } else {
            res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
    });
});

// Check session status
app.get('/check-session', (req, res) => {
    if (req.session.userId) {
        res.json({
            isLoggedIn: true,
            username: req.session.username
        });
    } else {
        res.json({
            isLoggedIn: false
        });
    }
});

// Logout route
app.post('/logout', (req, res) => {
    if (req.session) {
        req.session.destroy(err => {
            if (err) {
                res.status(500).send('Could not log out');
            } else {
                res.send('Logged out successfully');
            }
        });
    } else {
        res.send('Not logged in');
    }
});

// Protected route example
app.get('/protected-route', checkAuth, (req, res) => {
    res.json({ message: 'This is protected data' });
});

// Serve static files (CSS, JS, images)
app.use(express.static(path.join(__dirname, 'public')));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/homeverse-master', express.static(path.join(__dirname, 'homeverse-master')));
const assetsPath = path.join(__dirname, '..', 'assets');

app.use(express.static(frontendPath));
app.use('/assets', express.static(assetsPath));

// Routes to serve HTML pages
// app.post('/', (req, res) => {
//     res.sendFile(path.join(__dirname, '../Frontend/index.html'));
// });
app.get('/', (req, res) => {
    // Use absolute path to index.html
    const indexPath = path.resolve(frontendPath, '../Frontend/index.html');
    console.log('Trying to serve:', indexPath); // Debug log
    res.sendFile(indexPath);
});
app.post('/login', (req, res) => {
    res.sendFile(path.join(frontendPath, "../Fronted/login.html"));
});

app.post('/neighborhood', (req, res) => {
    res.sendFile(path.join(__dirname, "../Frontend/neighborhood.html"));
});
app.post('/enquiry', (req, res) => {
    res.sendFile(path.join(__dirname, '../Frontend/enquiry.html'));
});
app.post('/addlisting', (req, res) => {
    res.sendFile(path.join(__dirname, '../Frontend/addlisting.html'));
});

app.use(express.static(path.join(__dirname, '../Frontend')));
// Login API
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Simple static login check
    if (username === 'admin' && password === 'password') {
        res.send('Login Successful');
    } else {
        res.status(401).send('Invalid Username or Password');
    }
});

// Add this registration endpoint after your login endpoint
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    
    try {
        // Hash password
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        // Check existing user
        const checkQuery = 'SELECT * FROM users WHERE username = ? OR email = ?';
        db.query(checkQuery, [username, email], (err, results) => {
            if (err) {
                console.error('Registration error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Server error'
                });
            }

            if (results.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Username or email already exists'
                });
            }

            // Insert new user with hashed password
            const insertQuery = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
            db.query(insertQuery, [username, email, hashedPassword], (err, result) => {
                if (err) {
                    console.error('Registration error:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Server error'
                    });
                }

                res.json({
                    success: true,
                    message: 'Registration successful'
                });
            });
        });
    } catch (error) {
        console.error('Password hashing error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Add this route to handle enquiry submissions
app.post('/submit-enquiry', (req, res) => {
    // Check if user is logged in
    if (!req.session.userId) {
        return res.status(401).json({
            success: false,
            message: 'Please login to submit an enquiry'
        });
    }

    const {
        name,
        city,
        state,
        country,
        searching,
        priceRange,
        contact,
        email
    } = req.body;

    // Validate required fields
    if (!name || !city || !state || !country || !searching || !priceRange || !contact || !email) {
        return res.status(400).json({
            success: false,
            message: 'All fields are required'
        });
    }

    // Insert enquiry into database
    const query = `
        INSERT INTO enquiries 
        (name, city, state, country, searching, price_range, contact, email) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        query,
        [name, city, state, country, searching, priceRange, contact, email],
        (err, result) => {
            if (err) {
                console.error('Error submitting enquiry:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to submit enquiry'
                });
            }

            res.json({
                success: true,
                message: 'Enquiry submitted successfully',
                enquiryId: result.insertId
            });
        }
    );
});

// Add a route to get all enquiries (for admin purposes)
app.get('/get-enquiries', checkAuth, (req, res) => {
    const query = 'SELECT * FROM enquiries ORDER BY created_at DESC';
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching enquiries:', err);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch enquiries'
            });
            return;
        }
        
        res.json({
            success: true,
            enquiries: results
        });
    });
});

// Admin middleware
const checkAdmin = (req, res, next) => {
    if (!req.session.userId && !req.session.isAdmin) {
        return res.status(401).json({
            success: false,
            message: 'Admin access required'
        });
    }
    next();
};

// Get all users
app.get('/admin/users', checkAdmin, (req, res) => {
    const query = 'SELECT id, username, email, is_admin, status, created_at FROM users';
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch users'
            });
        }
        
        res.json({
            success: true,
            users: results
        });
    });
});

// Get all enquiries
app.get('/admin/enquiries', checkAdmin, (req, res) => {
    const query = `
        SELECT 
            id,
            name,
            email,
            contact,
            city,
            state,
            country,
            searching as property_type,
            price_range,
            created_at,
            status
        FROM enquiries
        ORDER BY created_at DESC
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch enquiries'
            });
        }
        
        res.json({
            success: true,
            enquiries: results
        });
    });
});

// Delete enquiry
app.delete('/admin/enquiry/:id', checkAdmin, (req, res) => {
    const { id } = req.params;
    
    db.query('DELETE FROM enquiries WHERE id = ?', [id], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to delete enquiry'
            });
        }
        
        res.json({
            success: true,
            message: 'Enquiry deleted successfully'
        });
    });
});

// Admin login route
app.post('/admin/login', async (req, res) => {
    const { username, password } = req.body;

    const query = 'SELECT * FROM users WHERE username = ? AND is_admin = 1';
    
    db.query(query, [username], async (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Login failed'
            });
        }

        if (results.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const user = results[0];
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        req.session.userId = user.id;
        req.session.isAdmin = true;
        
        res.json({
            success: true,
            message: 'Login successful'
        });
    });
});

// Add this function to create admin user
async function createAdminUser() {
    const adminUser = {
        username: 'admin',
        email: 'admin@livinglinks.com',
        password: 'Admin@123', // This is the admin password you'll use to login
        is_admin: true
    };

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(adminUser.password, 10);
        
        // Check if admin already exists
        const checkQuery = 'SELECT * FROM users WHERE username = ? OR email = ?';
        db.query(checkQuery, [adminUser.username, adminUser.email], (err, results) => {
            if (err) {
                console.error('Error checking admin:', err);
                return;
            }

            if (results.length > 0) {
                console.log('Admin user already exists');
                return;
            }

            // Insert admin user
            const insertQuery = 'INSERT INTO users (username, email, password, is_admin) VALUES (?, ?, ?, ?)';
            db.query(insertQuery, 
                [adminUser.username, adminUser.email, hashedPassword, adminUser.is_admin],
                (err, result) => {
                    if (err) {
                        console.error('Error creating admin:', err);
                        return;
                    }
                    console.log('Admin user created successfully');
                }
            );
        });
    } catch (error) {
        console.error('Error creating admin:', error);
    }
}

// Call this function when server starts
createAdminUser();

// Check admin authentication
app.get('/admin/check-auth', (req, res) => {
    if (req.session.userId && req.session.isAdmin) {
        res.json({ isAdmin: true });
    } else {
        res.json({ isAdmin: false });
    }
});

// Update user status
app.post('/admin/users/:id/status', checkAdmin, (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    const query = 'UPDATE users SET status = ? WHERE id = ?';
    db.query(query, [status, id], (err, result) => {
        if (err) {
            console.error('Error updating user status:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to update user status'
            });
        }
        
        res.json({
            success: true,
            message: 'User status updated successfully'
        });
    });
});

// Delete user
app.delete('/admin/users/:id', checkAdmin, (req, res) => {
    const { id } = req.params;
    
    // Don't allow deleting self
    if (parseInt(id) === req.session.userId) {
        return res.status(400).json({
            success: false,
            message: 'Cannot delete your own account'
        });
    }
    
    const query = 'DELETE FROM users WHERE id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error deleting user:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to delete user'
            });
        }
        
        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    });
});

// Add these routes to your server.js

app.get('/admin/dashboard', checkAdmin, (req, res) => {
    // Return dashboard data
    res.json({
        recentActivity: [] // Add your actual data here
    });
});

app.get('/admin/properties', checkAdmin, (req, res) => {
    // Return properties data
    db.query('SELECT * FROM properties', (err, results) => {
        if (err) {
            console.error('Error fetching properties:', err);
            return res.status(500).json({ error: 'Failed to fetch properties' });
        }
        res.json({ properties: results });
    });
});

// Get user profile
app.get('/user/profile', (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const query = 'SELECT id, username, email, created_at FROM users WHERE id = ?';
    db.query(query, [req.session.userId], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Server error' });
        }
        if (results.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, user: results[0] });
    });
});

// Get user listings
app.get('/user/listings', (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    // Add your query to fetch user's listings
    res.json({ success: true, listings: [] });
});

// Get user enquiries
app.get('/user/enquiries', (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const query = 'SELECT * FROM enquiries WHERE user_id = ?';
    db.query(query, [req.session.userId], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Server error' });
        }
        res.json({ success: true, enquiries: results });
    });
});

// Update user profile
app.post('/user/update-profile', (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const { username, email, phone, password } = req.body;
    
    // Add validation and update logic here
    res.json({ success: true, message: 'Profile updated' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


// -------------------------------------------------------------------------------------------------------------------------------------

