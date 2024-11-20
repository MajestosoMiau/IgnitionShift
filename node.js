// server.js
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const stripe = require('stripe')('your-stripe-secret-key');
const app = express();

// Use express's built-in JSON middleware
app.use(express.json());  // Replaces the need for body-parser

// Database Configuration
const dbConfig = {
    host: 'localhost',
    user: 'ZenithInteractive',
    password: '1234',
    database: 'ignition_shift',
};

// Login Route
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);

        // Fetch user details
        const query = `
            SELECT username, password_hash
            FROM players
            WHERE username = ?
        `;
        const [rows] = await connection.execute(query, [username]);

        // Check if user exists
        if (rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = rows[0];

        // Verify password
        const isPasswordMatch = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Login success
        res.json({
            id: user.id,
            username: user.username,
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Server error' });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
});

// Payment Processing Route
app.post('/pay', async (req, res) => {
    const { packageId } = req.body;  // Player's selected package

    // Ensure you have a function to calculate the price based on the packageId
    const amount = calculateAmount(packageId);  // Define this function as needed

    try {
        // Create a Stripe payment session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: { name: 'Diamonds' },
                    unit_amount: amount,  // in cents
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `${YOUR_URL}/success`,
            cancel_url: `${YOUR_URL}/cancel`,
        });

        res.json({ id: session.id });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// VIP Logic
function checkVIP(player) {
    if (player.vipStatus && Date.now() < player.vipExpiry) {
        hideAds();
    } else {
        showAds();
    }
}

function checkVIPExpiry(player) {
    if (player.vipStatus && Date.now() >= player.vipExpiry) {
        player.vipStatus = false;
        player.vipExpiry = null;
        alert("Your VIP status has expired!");
    }
}

function displayVIPStore() {
    document.getElementById('vipStoreContainer').style.display = 'block';
    // Hide other items in the shop
    document.querySelectorAll('.shop-item-container').forEach(function(container) {
        container.style.display = 'none';
    });
}

// Start Server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

app.get('/', (req, res) => {
    res.send('Welcome to Ignition Shift!');
});


app.use(express.static('public'));