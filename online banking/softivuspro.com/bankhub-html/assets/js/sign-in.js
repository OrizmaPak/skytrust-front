// document.addEventListener('DOMContentLoaded', function() {
    const loginFormm = document.getElementById('login-btn');

    loginFormm.addEventListener('click', async function(event) {
        event.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password2').value;

        if (!email || !password) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Information',
                text: 'Please enter both email and password.',
            });
            return;
        }

        // Show loading indicator
        Swal.fire({
            title: 'Logging in...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            const response = await fetch(`${baseurl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                sessionStorage.setItem('user', JSON.stringify(data.data.user));
                sessionStorage.setItem('token', data.data.token);
                window.location.href = 'dashboard';
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Login Failed',
                    text: data.message || 'Login failed. Please try again.',
                });
            }
        } catch (error) {
            console.error('Error during login:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'An error occurred. Please try again later.',
            });
        } finally {
            // Swal.close(); // Close the loading indicator
        }
    });
// });
