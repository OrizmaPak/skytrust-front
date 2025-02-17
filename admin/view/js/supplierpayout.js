let supplierpayoutid
async function supplierpayoutActive() {
    dynamiccomma(true)
    supplierpayoutid = ''
    const form = document.querySelector('#supplierpayoutform')
    // const form2 = document.querySelector('#viewsupplierpayoutform')
    if(form.querySelector('#submit')) form.querySelector('#submit').addEventListener('click', supplierpayoutFormSubmitHandler)
    datasource = []
    await getAllSuppliers('supplier', 'id')
    await new TomSelect('#supplier', {
        plugins: ['dropdown_input'],
        onChange: async (value) => {
            await fetchsupplierpayoutexpensebalanceamount(value)
        }
    });
    fetchsupplierpayoutexpensebalance()
}

async function fetchsupplierpayoutexpensebalance() {

    let request = await httpRequest2(`api/v1/transactions/balance?accountnumber=${organisationSettings.default_allocation_account}&userid=${the_user.id}&status=ACTIVE`, null, null, 'json', 'GET');
    let requestbank = await httpRequest2(`api/v1/transactions/balance?accountnumber=${organisationSettings.default_allocation_account}&userid=${the_user.id}&status=ACTIVE&tfrom=BANK`, null, null, 'json', 'GET');
    let requestcash = await httpRequest2(`api/v1/transactions/balance?accountnumber=${organisationSettings.default_allocation_account}&userid=${the_user.id}&status=ACTIVE&tfrom=CASH`, null, null, 'json', 'GET');
    swal.close(); // Close the loading alert once the request is complete
    if(request.status) {
        expensebalance = request.data.balance
            did('allocatedbalance').innerHTML = formatCurrency(request.data.balance)
            did('cashatbank').innerHTML = formatCurrency(requestbank.data.balance)
            did('cashathand').innerHTML = formatCurrency(requestcash.data.balance)
    } else {
        did('expensebalance').innerHTML = 'Failed to get balance'
        return notification('No records retrieved');
    }
}

async function fetchsupplierpayoutexpensebalanceamount(id) {
    supplierpayoutid = id
    const phone = supplierData.data.find(item => item.id == id).contactpersonphone;
    let request = await httpRequest2(`api/v1/transactions/balance?accountnumber=${organisationSettings.personal_account_prefix}${phone}&status=ACTIVE`, null, null, 'json', 'GET');
    swal.close(); // Close the loading alert once the request is complete
    if(request.status) {
            did('supplierbalance').innerHTML = formatCurrency(request.data.balance)
            // expensebalance = request.data.balance
    } else {
        did('supplierbalance').innerHTML = 'Failed to get balance'
        return notification('No records retrieved');
    }
}


async function supplierpayoutFormSubmitHandler() {
    dynamiccomma(false)
    if(!validateForm('supplierpayoutform', getIdFromCls('comp'))) return dynamiccomma(true)
    
    let payload = getFormData2(document.querySelector('#supplierpayoutform'), supplierpayoutid ? [['id', supplierpayoutid]] : null);

    const pinStatus = await getAndVerifyPin();
    if(!pinStatus) return;
    
    dynamiccomma(true)
    const confirmed = await Swal.fire({
        title: supplierpayoutid ? 'Updating...' : 'Submitting...',
        text: 'Please wait while we submit your data.',
        icon: 'info',
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: async () => {
            Swal.showLoading();
            let request = await httpRequest2('api/v1/expense/payout', payload, document.querySelector('#supplierpayoutform #submit'), 'json', 'POST');
            Swal.close();

            if (request.status) {
                notification(request.message, 1);
                const userIdSelect = document.querySelector('#supplier');
                    userIdSelect.tomselect.clear();
                const form = document.querySelector('#supplierpayoutform');
                form.reset();
                if(supplierpayoutid)form.querySelectorAll('input, select, textarea').forEach(input => input.value = '');
                supplierpayoutid = '';
                fetchsupplierpayoutexpensebalance();
                fetchsupplierpayoutexpensebalanceamount(supplierpayoutid)
            } else {    
                notification(request.message, 0);
            }
        }
    });
}
