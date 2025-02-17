window.onload = function() {
    let form = document.getElementById('changepasswordform');
    const urlParams = new URLSearchParams(window.location.search);
    const passwordToken = urlParams.get('passwordtoken');
    document.getElementById('passwordtoken').value = passwordToken;

    if (!passwordToken) {
        Swal.fire({
            title: 'Invalid Token',
            text: 'The password reset token is invalid or missing.',
            icon: 'error',
            confirmButtonText: 'OK',
            confirmButtonColor: '#3085d6',
            allowOutsideClick: false
        }).then(() => {
            window.location.href = './login.html';
        });
    }
    if (form.querySelector('button#submit')) {
        form.querySelector('button#submit').addEventListener('click', changePasswordSubmitHandler, false);
    }
}

async function httpRequestcustom(url, payload=null, button=null, type="text", method="POST") {
    runpermissioncheck()
    
    try {
        let result, res;
        const headers = new Headers();

        // Add authentication token to headers
        const authToken = sessionStorage.getItem('authToken');
        if (authToken) {
            headers.append('Authorization', `Bearer ${authToken}`);
        }

        if(button) { 
            button.disabled = true 
        }

        if(button?.querySelector('.btnloader')) { 
            button.querySelector('.btnloader').style.display = 'block' 
        }

        if(method === "GET") {
            result = await fetch(`${baseurl}/${url}`, { headers });
        } else if(payload) {
            console.log('payload', payload)
            result = await fetch(`${baseurl}/${url}`, {method, body: payload, headers});
        } else {
            result = await fetch(`${baseurl}/${url}`, {method, headers});
        }

        if(result) {
            if(type !== "json") {
                res = await result.text();
            } else {
                res = await result.json();
            }
            // if(markallcomp) markallcomp();
            if(res.message === 'Expired Session') return window.location.href = './login.html'; 
        } else {
            return notification('Unable to perform request.', 0);
        }

        var inputs = document.getElementsByTagName('input');

        // Loop through the inputs
        for (var i = 0; i < inputs.length; i++) {
            // Check if the input is of type "date"
            if (inputs[i].type === 'date') {
                // Set the value to the current date (YYYY-MM-DD format)
                var currentDate = new Date().toISOString().split('T')[0];
                // if(!inputs[i].value) inputs[i].value = currentDate;
            }
        }
        return res;
    }
    catch(e) { 
        console.log(e);
    }
    finally {
        if(button) { 
            button.disabled = false; 
        }
        if(button?.querySelector('.btnloader')) { 
            button.querySelector('.btnloader').style.display = 'none'; 
        }
        // markallcomp()
        // setDepartureTimetotwelveoclock(); 
        // modifyButtons();
    }
}

async function changePasswordSubmitHandler() {
    if (!validateChangePasswordForm()) return;

    let paramstr = new FormData(document.getElementById('changepasswordform'));
    let result = await httpRequestcustom('api/v1/auth/resetpassword', paramstr, document.querySelector('button#submit'), 'json');
    if (result.status) {
        notification('Password changed successfully! Redirecting to login...', 1);
        setTimeout(() => window.location.href = './login.html', 3000);
    } else {
        if (result.message) return notification(result.message, 0);
        else return notification(result.message, 0);
    }
}

function validateChangePasswordForm() {
    let form = document.getElementById('changepasswordform');
    let errorElements = form.querySelectorAll('.control-error');
    let controls = [];

    let newPassword = form.querySelector('#newpassword').value;
    let confirmPassword = form.querySelector('#confirmpassword').value;

    if (newPassword.length < 1) {
        controls.push([form.querySelector('#newpassword'), 'Provide your new password']);
    } else if (!newPassword.match(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/)) {
        controls.push([form.querySelector('#newpassword'), 'Password must be at least 8 characters long and include both letters and numbers']);
    }

    if (confirmPassword.length < 1) {
        controls.push([form.querySelector('#confirmpassword'), 'Confirm your new password']);
    } else if (newPassword !== confirmPassword) {
        controls.push([form.querySelector('#confirmpassword'), 'Passwords do not match']);
    }

    errorElements.forEach(item => {
        item.previousElementSibling.style.borderColor = '';
        item.remove();
    });

    if (controls.length) {
        controls.map(item => {
            let errorElement = document.createElement('span');
            errorElement.classList.add('control-error', 'dom-entrance');
            let control = item[0], mssg = item[1];
            errorElement.textContent = mssg;
            control.parentElement.appendChild(errorElement);
        });
        return false;
    }

    return true;
}
