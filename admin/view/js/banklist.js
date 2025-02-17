let banklistid
async function banklistActive() {
    banklistid = ''
    const form = document.querySelector('#banklistform')
    const form2 = document.querySelector('#viewbanklistform')
    if(form.querySelector('#submit')) form.querySelector('#submit').addEventListener('click', banklistFormSubmitHandler)
    if(form2.querySelector('#querySubmit')) form2.querySelector('#querySubmit').addEventListener('click', e=>{fetchbanklist()})
    datasource = []
    await fetchbanklist()
    // await getAllbanklist(true)
    // new TomSelect('#banklist', {
    //     // plugins: ['remove_button', 'dropdown_input'],
    //     onInitialize: function() {
    //         console.log(checkpermission('FILTER banklist'))
    //         if(!checkpermission('FILTER banklist')) this.setValue(the_user.banklist);
    //         if(!checkpermission('FILTER banklist')) this.setTextboxValue('readonly', true);
    //     }
    // });
    // await getAllUsers('useridlist', 'id')
}

async function fetchbanklist(id) {

    // Show loading state using SweetAlert
    const loadingAlert = Swal.fire({
        title: 'Please wait...',
        text: 'Fetching banklist data, please wait.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    let form = document.querySelector('#viewbanklistform');
    let formData = new FormData(form);
    // formData.set('department', '');
    // formData.set('banklist', '');
    let queryParams = new URLSearchParams(formData).toString();

    if(!id)document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> Loading... </td>`

    let request = await httpRequest2(`api/v1/bank/list?${queryParams ? `${queryParams}` : ''}${id ? `&id=${id}` : ''}`, null, document.querySelector('#viewrequisitionform #submit'), 'json', 'GET');
    swal.close(); // Close the loading alert once the request is complete
    if(!id)document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> No Records Retrieved </td>`
    if(request.status) {
        if(!id){
            if(request.data.length) {
                datasource = request.data
                resolvePagination(datasource, onbanklistTableDataSignal);
            }
        } else {
            document.getElementsByClassName('updater')[0].click();
            banklistid = request.data[0].id;
            populateData(request.data[0]);
        }
    } else {
        return notification('No records retrieved');
    }
}

async function removebanklist(id) {
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

            let request = await httpRequest2('../controllers/removevisacountries', id ? getparamm() : null, null, 'json', "DELETE");
            return request;
        },
        allowOutsideClick: () => !Swal.isLoading()
    });

    // Show notification based on the result
    if (confirmed.isConfirmed) {
        fetchbanklist();
        return notification(confirmed.value.message);
    }
}


async function onbanklistTableDataSignal() {
    let rows = getSignaledDatasource().map((item, index) => `
    <tr>
        <td>${index + 1}</td>
        <td>${item.bank}</td>
        <td>${item.country}</td>
        <td style="color: ${item.status === 'ACTIVE' ? 'green' : 'red'};">${item.status}</td>
        <td class="flex items-center gap-3">
        <button title="Edit row entry" onclick="fetchbanklist('${item.id}')" class="material-symbols-outlined h-8 w-8 rounded-full bg-primary-g text-xs text-white drop-shadow-md" style="font-size: 18px;">edit</button>
        <button title="Delete row entry" onclick="removebanklist('${item.id}')" class="material-symbols-outlined hidden h-8 w-8 rounded-full bg-red-600 text-xs text-white drop-shadow-md" style="font-size: 18px;">delete</button>
        </td>
        <td>${formatDate(item.dateadded)}</td>
    </tr>`
    )
    .join('')
    injectPaginatatedTable(rows)
}

async function banklistFormSubmitHandler() {
    if(!validateForm('banklistform', getIdFromCls('comp'))) return notification('Please fill all required fields', 0)
    
    let payload = getFormData2(document.querySelector('#banklistform'), banklistid ? [['id', banklistid]] : null);

    const confirmed = await Swal.fire({
        title: banklistid ? 'Updating...' : 'Submitting...',
        text: 'Please wait while we submit your data.',
        icon: 'info',
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: async () => {
            Swal.showLoading();
            let request = await httpRequest2('api/v1/bank/list', payload, document.querySelector('#banklistform #submit'), 'json', 'POST');
            Swal.close();

            if (request.status) {
                notification('Success!', 1);
                const form = document.querySelector('#banklistform');
                form.reset();
                if(banklistid)form.querySelectorAll('input, select, textarea').forEach(input => input.value = '');
                banklistid = '';
                document.getElementsByClassName('viewer')[0].click();
                fetchbanklist();
            } else {    
                notification(request.message, 0);
            }
        }
    });
}
