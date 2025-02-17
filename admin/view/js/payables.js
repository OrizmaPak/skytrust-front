let payablesid
async function payablesActive() {
    payablesid = ''
    const form = document.querySelector('#payablesform')
    const form2 = document.querySelector('#viewpayablesform')
    if(form.querySelector('#submit')) form.querySelector('#submit').addEventListener('click', fetchpayables)
    // if(form2.querySelector('#querySubmit')) form2.querySelector('#querySubmit').addEventListener('click', payablesFormSubmitHandler)
    datasource = []
    await getAllSuppliers('accountnumber', 'phone');
    new TomSelect('#accountnumber', {
        plugins: ['dropdown_input'],
        // onInitialize: function() {
        //     if(!checkpermission('FILTER payables')) this.setValue(the_user.supplier);
        // }
    });
    // await fetchpayables()
    // await getAllpayables(true)
    // new TomSelect('#payables', {
    //     // plugins: ['remove_button'],
    //     onInitialize: function() {
    //         console.log(checkpermission('FILTER payables'))
    //         if(!checkpermission('FILTER payables')) this.setValue(the_user.payables);
            // if(!checkpermission('FILTER payables')) this.setTextboxValue('readonly', true);
    //     }
    // });
    // await getAllUsers('useridlist', 'id')
}

async function fetchpayables(id) {

    // Show loading state using SweetAlert
    const loadingAlert = Swal.fire({
        title: 'Please wait...',
        text: 'Fetching payables data, please wait.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    let form = document.querySelector('#payablesform');
    let formData = new FormData(form);
    // formData.set('department', '');
    // formData.set('payables', '');
    // formData.set('accountnumber', '1080000001')
    let queryParams = new URLSearchParams(formData).toString();

    document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> Loading... </td>`

    let request = await httpRequest2(`api/v1/transactions/account?status=ACTIVE&${queryParams ? `${queryParams}` : ''}`, null, document.querySelector('#viewrequisitionform #submit'), 'json', 'GET');
    swal.close(); // Close the loading alert once the request is complete
    document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> No Records Retrieved </td>`
    if(request.status) {
        did('bbf').innerHTML = '';
        if(request.data.length) {
                datasource = request.data
                // resolvePagination(datasource, onpayablesTableDataSignal);
                if (request.balance < 0) {
                    did('bbf').innerHTML = `<span style="color: red;">We owe this supplier: ${formatCurrency(Math.abs(request.balance))}</span>`;
                } else {
                    did('bbf').innerHTML = `<span style="color: green;">This supplier owes us: ${formatCurrency(request.balance)}</span>`;
                }
                runningBalance = 0;
                did('tabledata').innerHTML  = `<tr>
                                                <td colspan="6" class="text-center opacity-70">Balance Brought Forward(B/F)</td>
                                                <td class="text-center opacity-70">${formatNumber(request.balancebroughtforward)}</td>
                                              </tr>`;
                did('tabledata').innerHTML  += request.data.map((item, index)=>{
                                            if (item.credit > 0) {
                                                runningBalance += item.credit;
                                            } else{
                                                runningBalance -= item.debit;
                                            }
                                            const dateAdded = formatDate(item.dateadded);
                                            // const transactionDate = new Date(item.transactiondate).toLocaleString();
                                            // const valueDate = new Date(item.valuedate).toLocaleString();
                                            return`<tr>
                                                     <td>${index + 1}</td>
                                                    <td>${dateAdded}</td> 
                                                    <td>${item.reference}</td> 
                                                    <td>${item.description}</td> 
                                                    <td style="color: red;">${item.debit > 0 ? formatCurrency(item.debit) : '-'}</td> 
                                                    <td style="color: green;">${item.credit > 0 ? formatCurrency(item.credit) : '-'}</td> 
                                                    <td>${formatCurrency(runningBalance)}</td>
                                                </tr>`}).join('');
            }else{
                notification('No records retrieved', 0);
            }
    } else {
        return notification('No records retrieved');
    }
}

async function removepayables(id) {
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
        fetchpayables();
        return notification(confirmed.value.message);
    }
}


async function onpayablesTableDataSignal() {
    let rows = getSignaledDatasource().map((item, index) => `
    <tr>
        <td>${index + 1}</td>
        <td>${item.payables}</td>
        <td>${item.useridname??item.userid}</td>
        <td>${item.country}</td>
        <td>${item.state}</td>
        <td>${item.lga}</td>
        <td>${item.address}</td>
        <td class="flex items-center gap-3">
            <button title="Edit row entry" onclick="fetchpayables('${item.id}')" class="material-symbols-outlined rounded-full bg-primary-g h-8 w-8 text-white drop-shadow-md text-xs" style="font-size: 18px;">edit</button>
            <button title="Delete row entry" onclick="removepayables('${item.id}')" class="hidden material-symbols-outlined rounded-full bg-red-600 h-8 w-8 text-white drop-shadow-md text-xs" style="font-size: 18px;">delete</button>
        </td>
    </tr>`
    )
    .join('')
    injectPaginatatedTable(rows)
}

async function payablesFormSubmitHandler() {
    if(!validateForm('payablesform', getIdFromCls('comp'))) return
    
    let payload = getFormData2(document.querySelector('#payablesform'), payablesid ? [['id', payablesid]] : null);

    const confirmed = await Swal.fire({
        title: payablesid ? 'Updating...' : 'Submitting...',
        text: 'Please wait while we submit your data.',
        icon: 'info',
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: async () => {
            Swal.showLoading();
            let request = await httpRequest2('api/v1/admin/payables', payload, document.querySelector('#payablesform #submit'), 'json', 'POST');
            Swal.close();

            if (request.status) {
                notification('Success!', 1);
                const form = document.querySelector('#payablesform');
                form.reset();
                if(payablesid)form.querySelectorAll('input, select, textarea').forEach(input => input.value = '');
                payablesid = '';
                document.getElementsByClassName('viewer')[0].click();
                fetchpayables();
            } else {    
                notification(request.message, 0);
            }
        }
    });
}
