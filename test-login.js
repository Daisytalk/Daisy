// Simple test to verify login functionality
const testLogin = async () => {
    try {
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'admin@example.com',
                password: 'password'
            }),
        });

        const result = await response.json();

        if (response.ok) {
            console.log('✅ Login successful!');
            console.log('User:', result.user);
            console.log('Token received:', !!result.token);
        } else {
            console.log('❌ Login failed:', result.message);
        }
    } catch (error) {
        console.log('❌ Error:', error.message);
    }
};

testLogin();