let cashierlimitid
async function cashierlimitActive() {
    cashierlimitid = ''
    const form = document.querySelector('#cashierlimitform')
    if(form.querySelector('#submit')) form.querySelector('#submit').addEventListener('click', cashierlimitFormSubmitHandler)
    datasource = []
    dynamiccomma()
    await getAllUsers('cashier', 'name')
    await getAllUsers('queryUser', 'name')
    new TomSelect('#cashier', {
        plugins: ['dropdown_input'],
    });
    new TomSelect('#queryUser', {
        plugins: ['dropdown_input'],
    });
    const queryForm = document.querySelector('#queryUserForm')
    if(queryForm.querySelector('#querySubmit'))queryForm.querySelector('#querySubmit').addEventListener('click', async e=>{
        await queryUser(document.getElementById('queryUser').value)        
    })
    await fetchcashierlimit()
}

async function queryUser(cashier='') {
    if(!cashier)return notification('Please enter a valid cashier name', 0)
    // Show loading state using SweetAlert
    const loadingAlert = Swal.fire({
        title: 'Please wait...',
        text: 'Fetching cashier.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    let request = await httpRequest2(`api/v1/admin/cashierlimit${cashier ? `?cashier=${cashier}`: ''}`,  null, null, 'json', 'GET');
    Swal.close(); // Close the loading alert once the request is complete

    document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> No Records Retrieved </td>`;
    if (request.status) {
            if (request.data.length) {
                datasource = request.data;
                resolvePagination(datasource, oncashierlimitTableDataSignal);
            }
    } else {
        return notification('No records retrieved');
    }
}

async function fetchcashierlimit(id) {
    // scrollToTop('scrolldiv')
    function getparamm() {
        let paramstr = new FormData();
        paramstr.append('id', id);
        return paramstr;
    }

    // Show loading state using SweetAlert
    const loadingAlert = Swal.fire({
        title: 'Please wait...',
        text: 'Fetching cashierlimit data, please wait.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    let request = await httpRequest2(`api/v1/admin/cashierlimit${id ? `?id=${id}`: ''}`,  null, null, 'json', 'GET');
    Swal.close(); // Close the loading alert once the request is complete

    if (!id) document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> No Records Retrieved </td>`;
    if (request.status) {
        if (!id) {
            if (request.data.length) {
                datasource = request.data;
                resolvePagination(datasource, oncashierlimitTableDataSignal);
            }
        } else {
            document.getElementsByClassName('updater')[0].click();
            cashierlimitid = request.data[0].id;
            populateData(request.data[0]);
        }
    } else {
        return notification('No records retrieved');
    }
}

async function removecashierlimit(id) {
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
        fetchcashierlimit();
        return notification(confirmed.value.message);
    }
}


async function oncashierlimitTableDataSignal() {
    let rows = getSignaledDatasource().map((item, index) => `
    <tr>
        <td>${index + 1}</td>
        <td>${item.cashiername}</td>
        <td>${formatCurrency(item.depositlimit)}</td>
        <td>${formatCurrency(item.withdrawallimit)}</td>
        <td class="flex items-center gap-3 ">
            <button title="Edit row entry" onclick="fetchcashierlimit('${item.id}')" class="material-symbols-outlined  rounded-full bg-primary-g h-8 w-8 text-white drop-shadow-md text-xs" style="font-size: 18px;">edit</button>
            <button title="Delete row entry" onclick="removecashierlimit('${item.id}')" class="hidden material-symbols-outlined  rounded-full bg-red-600 h-8 w-8 text-white drop-shadow-md text-xs" style="font-size: 18px;">delete</button>
        </td>
    </tr>`
    )
    .join('')
    injectPaginatatedTable(rows)
}

async function cashierlimitFormSubmitHandler() {
    dynamiccomma(false)
    if(!validateForm('cashierlimitform', getIdFromCls('comp'))) return dynamiccomma()
    
    let payload = getFormData2(document.querySelector('#cashierlimitform'), cashierlimitid ? [['id', cashierlimitid]] : null);

    const confirmed = await Swal.fire({
        title: cashierlimitid ? 'Updating...' : 'Submitting...',
        text: 'Please wait while we submit your data.',
        icon: 'info',
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: async () => {
            Swal.showLoading();
            let request = await httpRequest2('api/v1/admin/cashierlimit', payload, document.querySelector('#cashierlimitform #submit'), 'json', 'POST');
            Swal.close();

            if (request.status) {
                notification('Success!', 1);
                cashierlimitid = '';
                fetchcashierlimit();
                document.getElementsByClassName('viewer')[0].click();
                document.querySelector('#cashierlimitform').reset()
                dynamiccomma()
            } else {
                dynamiccomma()
                notification(request.message, 0);
            }
        }
    }); 
}
