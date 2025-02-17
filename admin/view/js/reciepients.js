let reciepientsid
async function reciepientsActive() {
    reciepientsid = ''
    const form = document.querySelector('#reciepientsform')
    const form2 = document.querySelector('#viewreciepientsform')
    if(form.querySelector('#submit')) form.querySelector('#submit').addEventListener('click', reciepientsFormSubmitHandler)
    if(form2.querySelector('#querySubmit')) form2.querySelector('#querySubmit').addEventListener('click', e=>{fetchreciepients()})
    datasource = []
    await fetchreciepients()
    await getbanks()
    new TomSelect('#bank', {
        plugins: ['dropdown_input'],
        // onInitialize: function() {
        //     console.log(checkpermission('FILTER reciepients'))
        //     if(!checkpermission('FILTER reciepients')) this.setValue(the_user.reciepients);
        //     if(!checkpermission('FILTER reciepients')) this.setTextboxValue('readonly', true);
        // }
    });
    // await getAllUsers('useridlist', 'id')
}

async function fetchreciepients(id) {

    // Show loading state using SweetAlert
    const loadingAlert = Swal.fire({
        title: 'Please wait...',
        text: 'Fetching reciepients data, please wait.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    let form = document.querySelector('#viewreciepientsform');
    let formData = new FormData(form);
    // formData.set('department', '');
    // formData.set('reciepients', '');
    let queryParams = new URLSearchParams(formData).toString();

    if(!id)document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> Loading... </td>`

    let request = await httpRequest2(`api/v1/bank/reciepients?${queryParams ? `${queryParams}` : ''}${id ? `&id=${id}` : ''}`, null, document.querySelector('#viewrequisitionform #submit'), 'json', 'GET');
    swal.close(); // Close the loading alert once the request is complete
    if(!id)document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> No Records Retrieved </td>`
    if(request.status) {
        if(!id){
            if(request.data.length) {
                datasource = request.data
                resolvePagination(datasource, onreciepientsTableDataSignal);
            }
        } else {
            document.getElementsByClassName('updater')[0].click();
            reciepientsid = request.data[0].id;
            populateData(request.data[0]);
        }
    } else {
        return notification('No records retrieved');
    }
}

async function getbanks() {
    try {
        const response = await httpRequest2(`api/v1/bank/list`, null, null, 'json', 'GET');
        if (response.status) {
            const bankSelect = document.getElementById('bank');
            bankSelect.innerHTML = `<option value="">-- Select Bank --</option>`;
            bankSelect.innerHTML += response.data.map(data => `<option value="${data.id}">${data.bank}</option>`).join('');
        } else {
            notification(response.message, 0);
        }
    } catch (error) {
        console.error('Error fetching banks:', error);
        notification('Failed to fetch banks. Please try again later.', 0);
    }
}

async function removereciepients(id) {
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
        fetchreciepients();
        return notification(confirmed.value.message);
    }
}


async function onreciepientsTableDataSignal() {
    let rows = getSignaledDatasource().map((item, index) => `
    <tr>
        <td>${index + 1}</td>
        <td>${item.accountnumber}</td>
        <td>${item.bankname}</td>
        <td>${item.fullname}</td>
        <td class="flex items-center gap-3 ">
            <button title="Edit row entry" onclick="fetchreciepients('${item.id}')" class="material-symbols-outlined h-8 w-8 rounded-full bg-primary-g text-xs text-white drop-shadow-md" style="font-size: 18px;">edit</button>
            <button title="Delete row entry" onclick="removereciepients('${item.id}')" class="material-symbols-outlined hidden h-8 w-8 rounded-full bg-red-600 text-xs text-white drop-shadow-md" style="font-size: 18px;">delete</button>
        </td>
        <td>${formatDate(item.dateadded)}</td>
    </tr>`
    )
    .join('')
    injectPaginatatedTable(rows)
}

async function reciepientsFormSubmitHandler() {
    if(!validateForm('reciepientsform', getIdFromCls('comp'))) return notification('Please fill all required fields', 0)
    
    let payload = getFormData2(document.querySelector('#reciepientsform'), reciepientsid ? [['id', reciepientsid]] : null);

    const confirmed = await Swal.fire({
        title: reciepientsid ? 'Updating...' : 'Submitting...',
        text: 'Please wait while we submit your data.',
        icon: 'info',
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: async () => {
            Swal.showLoading();
            let request = await httpRequest2('api/v1/bank/reciepients', payload, document.querySelector('#reciepientsform #submit'), 'json', 'POST');
            Swal.close();

            if (request.status) {
                notification('Success!', 1);
                const form = document.querySelector('#reciepientsform');
                form.reset();
                if(reciepientsid)form.querySelectorAll('input, select, textarea').forEach(input => input.value = '');
                reciepientsid = '';
                document.getElementsByClassName('viewer')[0].click();
                fetchreciepients();
            } else {    
                notification(request.message, 0);
            }
        }
    });
}
