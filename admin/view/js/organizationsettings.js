let organizationsettingsid
async function organizationsettingsActive() {
    organizationsettingsid = ''
    const form = document.querySelector('#organizationsettingsform')
    if(form.querySelector('#submit')) form.querySelector('#submit').addEventListener('click', organizationsettingsFormSubmitHandler)
    datasource = []
    await fetchaccounts()
    await fetchorganizationsettings()
    // await getAllorganizationsettings(true)
    // new TomSelect('#organizationsettings', {
    //     // plugins: ['remove_button'],
    //     onInitialize: function() {
    //         console.log(checkpermission('CHANGE organizationsettings'))
    //         if(!checkpermission('CHANGE organizationsettings'))this.disable();
    //     }
    // });
    // await getAllUsers('useridlist', 'id')
}

async function fetchaccounts() {
    
    // scrollToTop('scrolldiv')
    function getparamm() {
        let paramstr = new FormData();
        paramstr.append('id', id);
        return paramstr;
    }

    // Show loading state using SweetAlert
    const loadingAlert = Swal.fire({
        title: 'Please wait...',
        text: 'Fetching Accounts, please wait.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    let request = await httpRequest2(`api/v1/glaccounts/manageglaccounts`,  null, null, 'json', 'GET');
    Swal.close(); // Close the loading alert once the request is complete

    if (request.status) {
            if (request.data.length) {
                for(let i=0;i<document.getElementsByClassName('defaultacc').length;i++){
                    document.getElementsByClassName('defaultacc')[i].innerHTML += request.data.map(data=>`<option value="${data.accountnumber}">${data.accounttype} - ${data.groupname}</option>`).join('')
                }
            }
    } else {
        return notification('No records retrieved');
    }

}

async function fetchorganizationsettings(id) {
    // scrollToTop('scrolldiv')
    function getparamm() {
        let paramstr = new FormData();
        paramstr.append('id', id);
        return paramstr;
    }

    // Show loading state using SweetAlert
    const loadingAlert = Swal.fire({
        title: 'Please wait...',
        text: 'Fetching organizationsettings data, please wait.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    let request = await httpRequest2(`api/v1/admin/organizationsettings`,  null, null, 'json', 'GET');
    Swal.close(); // Close the loading alert once the request is complete

    if (request.status) {
            // document.getElementsByClassName('updater')[0].click();
            organizationsettingsid = request.data[0].id;
            populateData(request.data[0]);
            if(request.data[0].logo != '-')did('logoFrame').src = `${request.data[0].logo}`;
    } else {
        return notification('No records retrieved');
    }
}


async function organizationsettingsFormSubmitHandler() {
    if(!validateForm('organizationsettingsform', getIdFromCls('comp'))) return
    
    let payload = getFormData2(document.querySelector('#organizationsettingsform'), organizationsettingsid ? [['id', organizationsettingsid]] : null);

    const confirmed = await Swal.fire({
        title: organizationsettingsid ? 'Updating...' : 'Submitting...',
        text: 'Please wait while we submit your data.',
        icon: 'info',
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: async () => {
            Swal.showLoading();
            let request = await httpRequest2('api/v1/admin/organizationsettings', payload, document.querySelector('#organizationsettingsform #submit'), 'json', 'POST');
            Swal.close();

            if (request.status) {
                notification('Success!', 1);
                const form = document.querySelector('#organizationsettingsform');
                form.reset();
                if(organizationsettingsid)form.querySelectorAll('input, select, textarea').forEach(input => input.value = '');
                organizationsettingsid = '';
                fetchorganizationsettings();
            } else {    
                notification(request.message, 0);
            }
        }
    });
}
