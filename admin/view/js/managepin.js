let managepinid
let pinstate
async function managepinActive() {
    managepinid = ''
    // const form = document.querySelector('#managepinform')
    // const form2 = document.querySelector('#viewmanagepinform')
    // if(form.querySelector('#submit')) form.querySelector('#submit').addEventListener('click', managepinFormSubmitHandler)
    // if(form2.querySelector('#querySubmit')) form2.querySelector('#querySubmit').addEventListener('click', managepinFormSubmitHandler)
    datasource = []
    // await fetchmanagepin()
    // await getAllmanagepin(true)
    // new TomSelect('#managepin', {
    //     // plugins: ['remove_button'],
    //     onInitialize: function() {
    //         console.log(checkpermission('FILTER managepin'))
    //         if(!checkpermission('FILTER managepin')) this.setValue(the_user.managepin);
            // if(!checkpermission('FILTER managepin')) this.setTextboxValue('readonly', true);
    //     }
    // });
    // await getAllUsers('useridlist', 'id')
}

async function fetchmanagepin(id) {

    // Show loading state using SweetAlert
    const loadingAlert = Swal.fire({
        title: 'Please wait...',
        text: 'Fetching managepin data, please wait.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    let form = document.querySelector('#viewmanagepinform');
    let formData = new FormData(form);
    // formData.set('department', '');
    // formData.set('managepin', '');
    let queryParams = new URLSearchParams(formData).toString();

    if(!id)document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> Loading... </td>`

    let request = await httpRequest2(`api/v1/inventory/requisition/view?${queryParams ? `${queryParams}` : ''}${id ? `&id=${id}` : ''}`, null, document.querySelector('#viewrequisitionform #submit'), 'json', 'GET');
    swal.close(); // Close the loading alert once the request is complete
    if(!id)document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> No Records Retrieved </td>`
    if(request.status) {
        if(!id){
            if(request.data.length) {
                datasource = request.data
                resolvePagination(datasource, onmanagepinTableDataSignal);
            }
        } else {
            document.getElementsByClassName('updater')[0].click();
            managepinid = request.data[0].id;
            populateData(request.data[0]);
        }
    } else {
        return notification('No records retrieved');
    }
}

async function validatePassword() {
    const passwordInput = document.getElementById('passwordInput');
    const param = new FormData();
    param.append('password', passwordInput.value);
    let request = await httpRequest2(`api/v1/auth/verifypasswordaccess`, param, document.querySelector('#confirmButton'), 'json', 'POST');
    if (request.status) {
        pinstate = "CURRENT"
        notification('Password verified successfully!', 1);
        did('passwordsection').classList.add('hidden');
        did('pinSection').classList.remove('hidden');
        did('pinheader').innerHTML = 'Enter Current PIN'
        if(request.data.pin){
            did('redwarning').innerHTML = 'Enter Current PIN to change your PIN'
        }else{
            did('redwarning').innerHTML = 'You have not set up your PIN yet, your default PIN is 1234.'
            did('lostpin').classList.add('hidden')
        }
    } else {
        notification('Invalid password', 0);
    }
}   

function togglePasswordVisibility() {
    const passwordInput = document.getElementById('passwordInput');
    const type = passwordInput.getAttribute('type') == 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
}

function playSound() {
    const audio = new Audio('sounds/cell-phone-buttons.mp3');
    audio.addEventListener('canplaythrough', () => {
        audio.play().catch(error => console.error('Error playing sound:', error));
    });
    audio.load();
}

function enterDigit(digit) {
    playSound();
    const pinInput = document.getElementById('pinInput');
    if (pinInput.value.length < 4) {
        pinInput.value += digit;
    }
}

function clearPin() {
    // playSound();
    const pinInput = document.getElementById('pinInput');
    pinInput.value = '';
}

async function submitPin() {
    // playSound();
    const pinInput = document.getElementById('pinInput');
    const thepin = pinInput.value;
    if (pinInput.value.length === 4) {
        if(pinstate == "CURRENT"){
            Swal.fire({
                title: 'Verifying PIN...',
                text: 'Please wait while we verify your PIN.',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            const params = new FormData();
            params.append('pin', pinInput.value);
            params.append('id', the_user.id);
            const request = await httpRequest2(`api/v1/admin/verifypin`, params, null, 'json', 'POST');

            Swal.close();

            if (request.status) {
                    pinstate = "NEW"
                    notification('PIN submitted successfully!', 1);
                    did('pinheader').innerHTML = 'Enter New PIN'
                    did('redwarning').innerHTML = 'Enter New PIN to change your PIN'
                    did('lostpin').classList.remove('hidden');
                    did('redwarning').classList.add('text-green-400');
                    did('redwarning').classList.remove('text-red-400'); 
                } else {
                    notification(request.message, 0);
                if(request.message.includes('blocked') && request.message.includes('reset')){
                    pinstate = "NEW"
                    did('pinheader').innerHTML = 'Enter New PIN'
                    did('redwarning').innerHTML = 'Enter New PIN to change your PIN'
                    did('lostpin').classList.remove('hidden');
                    did('redwarning').classList.add('text-green-400');
                    did('redwarning').classList.remove('text-red-400'); 
                }
            }
            return clearPin();
        }
        if(pinstate == "NEW"){
           getAndVerifyOTP().then(otpstatus => {
               console.log('otpstatus', otpstatus);
               if (otpstatus) {
                   Swal.fire({
                       title: 'Verifying PIN...',
                       text: 'Please wait while we update your PIN.',
                       allowOutsideClick: false,
                       didOpen: () => {
                           Swal.showLoading();
                       }
                   });

                   const params = new FormData();
                   params.append('pin', thepin);
                   params.append('id', the_user.id);
                   httpRequest2(`api/v1/admin/managepin`, params, null, 'json', 'POST').then(request => {
                       Swal.close();

                       if (request.status) {
                           pinstate = "CURRENT";
                           did('pinheader').innerHTML = 'Enter Current PIN';
                           did('redwarning').innerHTML = 'Enter Current PIN to change your PIN';
                           did('lostpin').classList.add('hidden');
                           did('redwarning').classList.remove('text-green-400');
                           did('redwarning').classList.add('text-red-400');
                           Swal.fire({
                               title: 'Success!',
                               text: 'PIN submitted successfully!',
                               icon: 'success',
                               confirmButtonText: 'OK',
                               confirmButtonColor: '#3085d6',
                               allowOutsideClick: false
                           });
                       }
                   }).catch(error => {
                       console.error('Error during PIN update:', error);
                       Swal.fire({
                           title: 'Error!',
                           text: 'An error occurred while updating your PIN. Please try again.',
                           icon: 'error',
                           confirmButtonText: 'OK',
                           confirmButtonColor: '#d33',
                           allowOutsideClick: false
                       });
                   });
               }
           }).catch(error => {
               console.error('Error during OTP verification:', error);
               Swal.fire({
                   title: 'Error!',
                   text: 'An error occurred while verifying OTP. Please try again.',
                   icon: 'error',
                   confirmButtonText: 'OK',
                   confirmButtonColor: '#d33',
                   allowOutsideClick: false
               });
           });
           return clearPin();
        }
        
    } else {
        Swal.fire({
            title: 'Invalid PIN',
            text: 'Please enter a 4-digit PIN.',
            icon: 'error',
            confirmButtonText: 'Try Again'
        });
    }
}


