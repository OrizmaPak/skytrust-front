window.onload = function() {
    let form = document.getElementById('passwordform')
    if(form.querySelector('button#submit')) form.querySelector('button#submit').addEventListener('click', passwordRecoverSubmitHander, false)
}

async function httpRequestcustom2(url, payload=null, button=null, type="text", method="POST") {
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

async function passwordRecoverSubmitHander() {
    if(!validatePasswordForm()) return

    let paramstr = new FormData(document.getElementById('passwordform'))
    let result = await httpRequestcustom2('api/v1/auth/forgotpassword', paramstr, document.querySelector('button#submit'), 'json', 'POST')
    console.log('result', result)
    if(result.status) { 
        Swal.fire({
            title: 'Successful!',
            text: 'Please check your email for reset link',
            icon: 'success',
            confirmButtonText: 'OK',
            confirmButtonColor: '#3085d6',
            allowOutsideClick: false
        }).then(() => {
            window.location.href = './login.html';
        });
        // setTimeout(() => window.location.href = './login.html', 3000)
    }else {
        if(result.message) return notification(result.message, 0)
        else return notification('Unable to reset password', 0)
    }
}

function validatePasswordForm() {

    let form = document.getElementById('passwordform')
    let errorElements = form.querySelectorAll('.control-error')
    let controls = []

    if(form.querySelector('#email').value.length < 1)  controls.push([form.querySelector('#email'), 'Provide your email address'])
    
    else if(!form.querySelector('#email').value.toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)) controls.push([form.querySelector('#email'), 'Email not a valid address'])

    errorElements.forEach( item => {
        item.previousElementSibling.style.borderColor = '';
        item.remove()
    })

    if(controls.length) {
        controls.map( item => {
            let errorElement = document.createElement('span')
            errorElement.classList.add('control-error','dom-entrance')
            let control = item[0] , mssg = item[1]
            errorElement.textContent = mssg;
            control.parentElement.appendChild(errorElement)            
        })
        return false
    }
    
    return true

} 