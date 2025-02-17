let onlineusersid
async function onlineusersActive() {
    onlineusersid = ''
    datasource = []
    await getAllUsers('userid', 'name')
    await getAllbranch(true)
    new TomSelect('#userid', {
        plugins: ['dropdown_input'],
    });
    new TomSelect('#branch', {
        plugins: ['dropdown_input'],
        onInitialize: function() {
            console.log(checkpermission('FILTER BRANCH'))
            if(!checkpermission('FILTER BRANCH')) this.setValue(the_user.branch);
            if(!checkpermission('FILTER BRANCH')) this.setTextboxValue('readonly', true);
        }
    });
    const form = document.querySelector('#onlineusersform')
    if(form.querySelector('#submit'))form.querySelector('#submit').addEventListener('click', async e=>{
        await fetchonlineusers()        
    })
    await fetchonlineusers()
}

async function fetchonlineusers(id) {
    if(!id)document.getElementById('tabledata').innerHTML = ``
    if(!id)document.getElementById('active-users').innerHTML = ``
    if(!id)document.getElementById('total-branches').innerHTML = ``
    // scrollToTop('scrolldiv')
    function getparamm() {
        let paramstr = new FormData();
        paramstr.append('id', id);
        return paramstr;
    }

    // Show loading state using SweetAlert
    const loadingAlert = Swal.fire({
        title: 'Please wait...',
        text: 'Fetching onlineusers data, please wait.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    let form = document.querySelector('#onlineusersform');
        let formData = new FormData(form);
        let queryParams = new URLSearchParams(formData).toString();
        console.log('Query Parameters:', queryParams);

        let request = await httpRequest2(`api/v1/admin/onlineusers?${queryParams ? `&${queryParams}` : ''}`, null, null, 'json', 'GET');

        Swal.close(); // Close the loading alert once the request is complete

    if (!id) document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> No Records Retrieved </td>`;
    if (request.status) {
        if (!id) {
            if (request.data.onlineUsers.length) {
                document.getElementById('active-users').innerHTML = request.data.onlineUsers.length
                document.getElementById('total-branches').innerHTML = new Set(request.data.onlineUsers.map(user => user.branchname)).size;
                datasource = request.data.onlineUsers;
                console.log('datasourceer', datasource)
                resolvePagination(datasource, ononlineusersTableDataSignal);
            }
        } else {
            document.getElementsByClassName('updater')[0].click();
            onlineusersid = request.data[0].id;
            populateData(request.data[0]);
        }
    } else {
        return notification('No records retrieved');
    }
}

async function removeonlineusers(id) {
    // Ask for confirmation using SweetAlert with async and loader
    const confirmed = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
        showLoaderOnConfirm: true,
        preConfirm: async () => {
            function getparamm() {
                let paramstr = new FormData();
                paramstr.append('id', id);
                return paramstr;
            }

            let request = await httpRequest2('../controllers/removevisacountries', id ? getparamm() : null, null, 'json');
            return request;
        },
        allowOutsideClick: () => !Swal.isLoading()
    });

    // Show notification based on the result
    if (confirmed.isConfirmed) {
        fetchonlineusers();
        return notification(confirmed.value.message);
    }
}


async function ononlineusersTableDataSignal() {
    let rows = getSignaledDatasource().map((item, index) => `
    <tr>
        <td>${index + 1}</td>
        <td>${item.fullname}</td>
        <td>${item.email}</td>
        <td>${item.role}</td>
        <td>${item.branchname??item.branch}</td>
        <td>${item.phone}</td>
        <td>${item.address}</td>
        <td>${item.online_status}</td>
        <td>${item.time_ago}</td>
    </tr>`
    )
    .join('')
    injectPaginatatedTable(rows)
}

async function onlineusersFormSubmitHandler() {
    if(!validateForm('onlineusersform', getIdFromCls('comp'))) return
    
    let payload = getFormData2(document.querySelector('#onlineusersform'), onlineusersid ? [['id', onlineusersid]] : null);

    const confirmed = await Swal.fire({
        title: onlineusersid ? 'Updating...' : 'Submitting...',
        text: 'Please wait while we submit your data.',
        icon: 'info',
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: async () => {
            Swal.showLoading();
            let request = await httpRequest2('api/v1/admin/onlineusers', payload, document.querySelector('#onlineusersform #submit'), 'json', 'POST');
            Swal.close();

            if (request.status) {
                notification('Success!', 1);
                onlineusersid = '';
                document.getElementsByClassName('viewer')[0].click();
                fetchonlineusers();
            } else {
                notification(request.message, 0);
            }
        }
    });
}
