// document.addEventListener('DOMContentLoaded', function() {
    const signupButton = document.getElementById('signup-btn');

    alert()

    signupButton.addEventListener('click', async function(event) {
        event.preventDefault();

        const firstName = document.getElementById('fname').value;
        const lastName = document.getElementById('lname').value;
        const otherNames = document.getElementById('othernames').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const country = document.getElementById('country').value;
        const state = document.getElementById('state').value;
        const password = document.getElementById('password2').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (!firstName || !lastName || !email || !phone || !country || !state || !password || !confirmPassword) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Information',
                text: 'Please fill in all required fields.',
            });
            return;
        }

        if (password !== confirmPassword) {
            Swal.fire({
                icon: 'error',
                title: 'Password Mismatch',
                text: 'Passwords do not match. Please try again.',
            });
            return;
        }

        // Show loading indicator
        Swal.fire({
            title: 'Signing up...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            const formData = new FormData();
            formData.append('firstname', firstName);
            formData.append('lastname', lastName);
            formData.append('othernames', otherNames);
            formData.append('email', email);
            formData.append('phone', phone);
            formData.append('country', country);
            formData.append('state', state);
            formData.append('password', password);

            const response = await fetch(`${baseurl}/auth/signup`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Signup Successful',
                    text: 'Your account has been created successfully.',
                }).then(() => {
                    window.location.href = 'sign-in';
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Signup Failed',
                    text: data.message || 'Signup failed. Please try again.',
                });
            }
        } catch (error) {
            console.error('Error during signup:', error);
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
