document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        const result = await response.json();

        if (response.ok) {
            // Save user data in sessionStorage for later use
            sessionStorage.setItem('playerData', JSON.stringify(result));
            window.location.href = '/overview'; // Redirect to overview page
        } else {
            document.getElementById('loginError').style.display = 'block';
        }
    } catch (error) {
        console.error('Login failed:', error);
    }
});


console.log(`Login attempt with username: ${username}`);
if (rows.length === 0) {
    console.log('No user found with the provided username');
} else {
    console.log(`User found: ${JSON.stringify(rows[0])}`);
    const isPasswordMatch = await bcrypt.compare(password, rows[0].password_hash);
    console.log(`Password match: ${isPasswordMatch}`);
}