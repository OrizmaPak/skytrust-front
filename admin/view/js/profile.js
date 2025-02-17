let profileid
async function profileActive() {
    // await profiledepartment()
    await getAllbranch()
    await fetchprofile()
    const form = document.querySelector('#profilesform')
    entername()
    if(form.querySelector('#submit')) form.querySelector('#submit').addEventListener('click', profileFormSubmitHandler)
        // await profileuserlist()
}

async function profileFormSubmitHandler(){
    const form = document.querySelector('#profilesform');
    const phoneInput = form.querySelector('input[name="phone"]');
    const currentPhone = the_user.phone;

    if (phoneInput && phoneInput.value !== currentPhone) {
        await Swal.fire({
            title: 'Phone Number Change Not Allowed',
            text: 'Changing of phone number is not allowed. Please contact support.',
            icon: 'warning',
            confirmButtonText: 'OK',
            confirmButtonColor: '#3085d6' // Blue color for the OK button
        });
        return; // Exit the function to prevent form submission
    }
    if(!validateForm('profilesform', [`email`, 'dateofbirth'])) return
    
    let payload

    payload = getFormData2(document.querySelector('#profilesform'), profileid ? [['id', profileid]] : [['id', the_user.id]])
    let request = await httpRequest2('api/v1/auth/updateprofile', payload, document.querySelector('#profilesform #submit'), 'json')
    if(request.status) {
        notification('Success!', 1);
        // document.querySelector('#profilesform').reset();
        
        return fetchprofile();
    }
    document.querySelector('#profilesform').reset();
    fetchprofile();
    return notification(request.message, 0);
}


async function profileuserlist() {
    let request = await httpRequest('../controllers/fetchusers')
    request = JSON.parse(request)
    if(request.status) {
        if(request.data.length) {
            document.getElementById('supervisorid').innerHTML += request.data.map(data=>`<option value="${data.id}">${data.firstname} ${data.lastname}</option>`).join('')
        }
    }
    else return notification('No records retrieved')
}

async function profiledepartment() {
    if (departmentsbybranch) {
        document.getElementById('department').innerHTML += departmentsbybranch.map(data => `<option value="${data.id}">${data.department}</option>`).join('');
    }

    let branchValue = JSON.parse(sessionStorage.getItem('user')).branch;
    let request = await httpRequest2(`api/v1/admin/department?branch=${branchValue}`, null, null, 'json', 'GET')
    if(request.status) {
        departmentsbybranch = request.data
        if(request.data.length) {
            document.getElementById('department').innerHTML += request.data.map(data=>`<option value="${data.id}">${data.department}</option>`).join('')
        }else{
            document.getElementById('department').innerHTML = `<option value="">No departments found</option>`
        }
    }
    else return notification('No records retrieved')
}




async function fetchprofile() {
    function getparamm() {
        let paramstr = new FormData();
        paramstr.append('email', JSON.parse(sessionStorage.getItem('user')).email);
        return paramstr;
    }

    const confirmed = await Swal.fire({
        title: 'Fetching Profile...',
        text: 'Please wait while we retrieve your profile data.',
        icon: 'info',
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: async () => {
            Swal.showLoading();
            let request = await httpRequest2('api/v1/auth/profile', getparamm(), null, 'json', 'GET');
            Swal.close();

            if (request.status) {
                if (request) {
                    refreshprofile(request.data)
                    populateData(request.data);
                    if(request.data.image != '-')did('logoFrame').src = `${request.data.image}`;
                }
            } else {
                notification('No records retrieved', 0);
            }
        }
    });
}