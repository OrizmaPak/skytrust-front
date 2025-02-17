let loanfeesid
async function loanfeesActive() {
    loanfeesid = ''
    const form = document.querySelector('#loanfeesform')
    if(form.querySelector('#submit')) form.querySelector('#submit').addEventListener('click', loanfeesFormSubmitHandler)
    datasource = []
    await fetchaccounts()
    new TomSelect('#glaccount', {
        plugins: ['dropdown_input'],
    });
    await fetchloanfees()
    // await getAllloanfees(true)
    // new TomSelect('#loanfees', {
    //     // plugins: ['remove_button'],
    //     onInitialize: function() {
    //         console.log(checkpermission('FILTER loanfees'))
    //         if(!checkpermission('FILTER loanfees')) this.setValue(the_user.loanfees);
            // if(!checkpermission('FILTER loanfees')) this.setTextboxValue('readonly', true);
    //     }
    // });
    // await getAllUsers('useridlist', 'id')
}

async function fetchloanfees(id) {

    // Show loading state using SweetAlert
    const loadingAlert = Swal.fire({
        title: 'Please wait...',
        text: 'Fetching loanfees data, please wait.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    // let form = document.querySelector('#viewrequisitionform');
    // let formData = new FormData(form);
    // // formData.set('department', '');
    // // formData.set('loanfees', '');
    // let queryParams = new URLSearchParams(formData).toString();

    if(!id)document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> Loading... </td>`

    let request = await httpRequest2(`api/v1/loan/fee?${id ? `id=${id}` : ''}`, null, document.querySelector('#viewrequisitionform #submit'), 'json', 'GET');
    // let request = await httpRequest2(`api/v1/loan/fee?${queryParams ? `${queryParams}` : ''}${id ? `&id=${id}` : ''}`, null, document.querySelector('#viewrequisitionform #submit'), 'json', 'GET');
    swal.close(); // Close the loading alert once the request is complete
    if(!id)document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> No Records Retrieved </td>`
    if(request.status) {
        if(!id){
            if(request.data.length) {
                datasource = request.data
                resolvePagination(datasource, onloanfeesTableDataSignal);
            }
        } else {
            document.getElementsByClassName('updater')[0].click();
            loanfeesid = request.data[0].id;
            populateData(request.data[0]);
        }
    } else {
        return notification('No records retrieved');
    }
}

async function removeloanfees(id) {
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
        fetchloanfees();
        return notification(confirmed.value.message);
    }
}


async function onloanfeesTableDataSignal() {
    let rows = getSignaledDatasource().map((item, index) => `
    <tr>
        <td>${index + 1}</td>
        <td>${item.feename}</td>
        <td>${item.feemethod}</td>
        <td>${item.chargesbasedon}</td>
        <td>${item.chargeamount}(${item.chargetype})</td>
        <td>${item.glaccountname??''}</td>
        <td style="color: ${item.status === 'ACTIVE' ? 'green' : 'red'};">${item.status}</td>
        <td class="flex items-center gap-3">
            <button title="Edit row entry" onclick="fetchloanfees('${item.id}')" class="material-symbols-outlined rounded-full bg-primary-g h-8 w-8 text-white drop-shadow-md text-xs" style="font-size: 18px;">edit</button>
            <button title="Suspend Fee" onclick="toggleLoanFeeStatus('${item.id}', 'SUSPENDED')" class="${item.status == 'ACTIVE' ? '' : 'hidden'} material-symbols-outlined rounded-full bg-red-600 h-8 w-8 text-white drop-shadow-md text-xs" style="font-size: 18px;">block</button>
            <button title="Activate Fee" onclick="toggleLoanFeeStatus('${item.id}', 'ACTIVE')" class="${item.status == 'ACTIVE' ? 'hidden' : ''} material-symbols-outlined rounded-full bg-green-600 h-8 w-8 text-white drop-shadow-md text-xs" style="font-size: 18px;">play_arrow</button>
        </td>
    </tr>`
    )
    .join('')
    injectPaginatatedTable(rows)
}

async function toggleLoanFeeStatus(id, status) {
    const fee = datasource.find(item => item.id == id);
    if (status === 'ACTIVE') {
        const confirmed = await Swal.fire({
            title: 'Are you sure?',
            text: "Do you really want to activate this fee?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, activate it!',
            showLoaderOnConfirm: true,
            preConfirm: async () => {
                // Add logic to activate the fee
            },
            allowOutsideClick: () => !Swal.isLoading()
        });

        if (confirmed.isConfirmed) {
            const params = new FormData();
            for (const key in fee) {
                if (fee.hasOwnProperty(key)) {
                    params.append(key, fee[key]);
                }
            }
            params.set('id', id);
            params.set('status', status);
            let request = await httpRequest2('api/v1/loan/fee', params, null, 'json', 'POST');
            if (request.status) {
                notification('Fee activated successfully!', 1);
                fetchloanfees();
            } else {
                notification(request.message, 0);
            }
        }
    } else {
        const confirmed = await Swal.fire({
            title: 'Are you sure?',
            text: "Do you really want to suspend this fee?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, suspend it!',
            showLoaderOnConfirm: true,
            preConfirm: async () => {
                // Add logic to suspend the fee
            },
            allowOutsideClick: () => !Swal.isLoading()
        });

        if (confirmed.isConfirmed) {
            const params = new FormData();
            for (const key in fee) {
                if (fee.hasOwnProperty(key)) {
                    params.append(key, fee[key]);
                }
            }
            params.set('id', id);
            params.set('status', status);
            let request = await httpRequest2('api/v1/loan/fee', params, null, 'json', 'POST');
            if (request.status) {
                notification('Fee suspended successfully!', 1);
                fetchloanfees();
            } else {
                notification(request.message, 0);
            }
        }
    }
}

async function loanfeesFormSubmitHandler() {
    if(!validateForm('loanfeesform', getIdFromCls('comp'))) return
    
    let payload = getFormData2(document.querySelector('#loanfeesform'), loanfeesid ? [['id', loanfeesid]] : null);

    const confirmed = await Swal.fire({
        title: loanfeesid ? 'Updating...' : 'Submitting...',
        text: 'Please wait while we submit your data.',
        icon: 'info',
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: async () => {
            Swal.showLoading();
            let request = await httpRequest2('api/v1/loan/fee', payload, document.querySelector('#loanfeesform #submit'), 'json', 'POST');
            Swal.close();

            if (request.status) {
                notification('Success!', 1);
                const form = document.querySelector('#loanfeesform');
                form.reset();
                if(loanfeesid)form.querySelectorAll('input, select, textarea').forEach(input => input.value = '');
                loanfeesid = '';
                document.getElementsByClassName('viewer')[0].click();
                fetchloanfees();
            } else {    
                notification(request.message, 0);
            }
        }
    });
}
