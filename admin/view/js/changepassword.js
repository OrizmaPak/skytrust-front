let changepasswordid
async function changepasswordActive() {
    const form = document.querySelector('#changepasswordform')
    if(form.querySelector('#submit')) form.querySelector('#submit').addEventListener('click', changepasswordFormSubmitHandler)
    datasource = []
    // await fetchchangepassword()
}

function togglePasswordVisibility(id, btn) {
    const input = document.getElementById(id);
    if (input.type === 'password') {
        input.type = 'text';
        btn.innerHTML = 'visibility';
    } else {
        input.type = 'password';
        btn.innerHTML = 'visibility_off';
    }
}

function isValidNewPassword(password) {
    const hasMinimumLength = password.length >= 6;
    const containsNumber = /\d/.test(password);
    return hasMinimumLength && containsNumber;
}

async function changepasswordFormSubmitHandler() {
    if(!validateForm('changepasswordform', getIdFromCls('comp'))) return
    
    const newPassword = did('newpassword').value;
    const confirmPassword = did('confirmpassword').value;

    if(newPassword !== confirmPassword) return notification('New password and Current password do not match', 0)
    
    if(!isValidNewPassword(newPassword)) return notification('New password must be at least 6 characters long and contain a number', 0)

    let payload = getFormData2(document.querySelector('#changepasswordform'))
    let request = await httpRequest2('api/v1/auth/changepassword', payload, document.querySelector('#changepasswordform #submit'), 'json', 'POST')
    if(request.status) {
        notification(request.message, 1);
        document.querySelector('#changepasswordform').reset();
        // fetchchangepassword();
        return
    }
    document.querySelector('#changepasswordform').reset();
    // fetchchangepassword();
    return notification(request.message, 0);
}
