let accountid
let totalaccountsdata
async function accountActive() {
    accountid = ''
    const form = document.querySelector('#accountform')
    if(form.querySelector('#submit')) form.querySelector('#submit').addEventListener('click', accountFormSubmitHandler)
    document.querySelector('#filterAccountType').addEventListener('change', e=>{
        fetchaccount(null, e.target.value)
    })
    datasource = []
    await fetchaccount()
    // await getAllaccount(true)
    // new TomSelect('#account', {
    //     // plugins: ['remove_button'],
    //     onInitialize: function() {
    //         console.log(checkpermission('CHANGE account'))
    //         if(!checkpermission('CHANGE account'))this.disable();
    //     }
    // });
    // await getAllUsers('useridlist', 'id')
}

async function fetchaccount(id, filter=null) {
    // scrollToTop('scrolldiv')
    function getparamm() {
        let paramstr = new FormData();
        paramstr.append('id', id);
        return paramstr;
    }

    if(filter){
        let data = totalaccountsdata.filter(data=>data.accounttype == filter)
        if(data.length){
            resolvePagination(data, onaccountTableDataSignal);
        }else{
            document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> No Records Retrieved For ${filter} </td>`;
        }
        return;
    }

    // Show loading state using SweetAlert
    const loadingAlert = Swal.fire({
        title: 'Please wait...',
        text: 'Fetching account data, please wait.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    let request = await httpRequest2(`api/v1/glaccounts/manageglaccounts${id ? `?id=${id}`: ''}`,  null, null, 'json', 'GET');
    Swal.close(); // Close the loading alert once the request is complete

    if (!id) document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> No Records Retrieved </td>`;
    if (request.status) {
        if (!id) {
            if (request.data.length) {
                totalaccountsdata = request.data;
                datasource = request.data;
                resolvePagination(datasource, onaccountTableDataSignal);
            }
        } else {
            document.getElementsByClassName('updater')[0].click();
            accountid = request.data[0].id;
            populateData(request.data[0]);
        }
    } else {
        return notification('No records retrieved');
    }
}

async function removeaccount(id) {
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
        fetchaccount();
        return notification(confirmed.value.message);
    }
}


async function onaccountTableDataSignal() {
    let rows = getSignaledDatasource().map((item, index) => `
    <tr>
        <td>${index + 1}</td>
        <td>${item.accountnumber}</td>
        <td>${item.accounttype}</td>
        <td>${item.groupname}</td>
        <td>${item.description}</td>     
        <td class="flex items-center gap-3">
            <button title="Edit row entry" onclick="fetchaccount('${item.id}')" class="material-symbols-outlined rounded-full bg-primary-g h-8 w-8 text-white drop-shadow-md text-xs" style="font-size: 18px;">edit</button>
            <button title="Delete row entry" onclick="removeaccount('${item.id}')" class="hidden material-symbols-outlined rounded-full bg-red-600 h-8 w-8 text-white drop-shadow-md text-xs" style="font-size: 18px;">delete</button>
        </td>
    </tr>`
    )
    .join('')
    injectPaginatatedTable(rows)
}

async function accountFormSubmitHandler() {
    if(!validateForm('accountform', getIdFromCls('comp'))) return
    
    let payload = getFormData2(document.querySelector('#accountform'), accountid ? [['id', accountid]] : null);

    const confirmed = await Swal.fire({
        title: accountid ? 'Updating...' : 'Submitting...',
        text: 'Please wait while we submit your data.',
        icon: 'info',
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: async () => {
            Swal.showLoading();
            let request = await httpRequest2('api/v1/glaccounts/manageglaccounts', payload, document.querySelector('#accountform #submit'), 'json', 'POST');
            Swal.close();

            if (request.status) {
                notification('Success!', 1);
                const form = document.querySelector('#accountform');
                form.reset();
                if(accountid)form.querySelectorAll('input, select, textarea').forEach(input => input.value = '');
                accountid = '';
                document.getElementsByClassName('viewer')[0].click();
                fetchaccount();
            } else {    
                notification(request.message, 0);
            }
        }
    });
}
