let depositid
async function depositActive() {
    dynamiccomma(true)
    depositid = ''
    const form = document.querySelector('#depositform')
    if(form.querySelector('#submit')) form.querySelector('#submit').addEventListener('click', depositFormSubmitHandler)
    if(document.querySelector('#accountnumber')) document.querySelector('#accountnumber').addEventListener('change', fetchdepositaccountdetails)
    datasource = []
    const today = new Date().toISOString().split('T')[0];
    document.querySelector('#transactionDate').value = today;
    document.querySelector('#valueDate').value = today;
    await getAllUsers('depositor', 'name')
    new TomSelect('#depositor', {
        plugins: ['dropdown_input'],
        onInitialize: function() {
            this.setValue(the_user.id);
            this.setTextboxValue('readonly', true);
        }
    });
    // await fetchdeposit()
    // await getAlldeposit(true)
    // new TomSelect('#deposit', {
    //     // plugins: ['remove_button'],
    //     onInitialize: function() {
    //         console.log(checkpermission('FILTER deposit'))
    //         if(!checkpermission('FILTER deposit')) this.setValue(the_user.deposit);
            // if(!checkpermission('FILTER deposit')) this.setTextboxValue('readonly', true);
    //     }
    // });
}

async function fetchdepositaccountdetails() {
    notification('Fetching account details, please wait...');
    did('detail_profilepic').src = '';
    did('detail_accountnumber').value = '';
    did('detail_accountname').value = '';
    did('detail_accounttype').value = '';
    did('detail_paymentmethod').value = '';
    did('detail_mobilenumber').value = '';
    did('detail_domiciledbranch').value = '';
    did('detail_age').value = '';
    did('detail_gender').value = '';
    did('detail_role').value = '';
    did('detail_dateopened').value = '';
    if(did('accountnumber').value == '') return notification('Please enter the account number', 0);
    let request = await httpRequest2(`api/v1/transactions/getaccounttypefull?accountnumber=${did('accountnumber').value}`, null, document.querySelector('#viewrequisitionform #submit'), 'json', 'GET');
    if(request.status) {
        notification(request.message, 1);
            if(request.data) {
                datasource = request.data
                    did('detail_profilepic').setAttribute('src', request.data.person.image);
                    did('detail_accountnumber').value = request.data.accountnumber;
                    did('accountnumber').value = request.data.accountnumber;    
                    did('detail_accountname').value = request.data.accountname;
                    did('detail_accounttype').value = request.data.accounttype;
                    did('detail_paymentmethod').value = "CASH";
                    did('detail_mobilenumber').value = request.data.person.phone;
                    did('detail_domiciledbranch').value = request.data.person.branchname;
                    did('detail_age').value = request.data.person.age;
                    did('detail_gender').value = request.data.person.gender;
                    did('detail_role').value = request.data.person.role;
                    did('detail_dateopened').value = formatDate(request.data.person.dateofbirth);
        }
    } else {
        did('accountnumber').value = '';
        return notification('No records retrieved');
    }
}

async function fetchdeposit(id) {

    // Show loading state using SweetAlert
    const loadingAlert = Swal.fire({
        title: 'Please wait...',
        text: 'Fetching deposit data, please wait.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    let form = document.querySelector('#viewdepositform');
    let formData = new FormData(form);
    // formData.set('department', '');
    // formData.set('deposit', '');
    let queryParams = new URLSearchParams(formData).toString();

    if(!id)document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> Loading... </td>`

    let request = await httpRequest2(`api/v1/inventory/requisition/view?${queryParams ? `${queryParams}` : ''}${id ? `&id=${id}` : ''}`, null, document.querySelector('#viewrequisitionform #submit'), 'json', 'GET');
    swal.close(); // Close the loading alert once the request is complete
    if(!id)document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> No Records Retrieved </td>`
    if(request.status) {
        if(!id){
            if(request.data.length) {
                datasource = request.data
                resolvePagination(datasource, ondepositTableDataSignal);
            }
        } else {
            document.getElementsByClassName('updater')[0].click();
            depositid = request.data[0].id;
            populateData(request.data[0]);
        }
    } else {
        return notification('No records retrieved');
    }
}

async function depositFormSubmitHandler() {
    dynamiccomma(false)
    if(did('accountnumber').value != did('detail_accountnumber').value) return notification('Account number does not match', 0);
    if(!did('amountPaid').value)return notification('Please enter the amount paid', 0);
    if(!did('depositor').value)return notification('Please reset the page, cant find the depositor', 0);

    
    
    
    let payload = getFormData2(did('depositform'), [
        ['branch', the_user.branch],
        ['userid', the_user.id],
        ['rowsize', 1],
        ['accountnumber1', did('accountnumber').value],
        ['credit1', did('amountPaid').value],
        ['location', 'BRANCH']
    ]);
    
    const pinStatus = await getAndVerifyPin();
    if(!pinStatus) return;
    
    const confirmed = await Swal.fire({
        title: depositid ? 'Depositing...' : 'Depositing...',
        text: 'Please wait while the deposit is been made.',
        icon: 'info',
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: async () => {
            Swal.showLoading();
            let request = await httpRequest2('api/v1/transactions/deposit', payload, document.querySelector('#depositform #submit'), 'json', 'POST');
            Swal.close();

            if (request.status) {
                notification('Deposit Successful', 1);
                did('deposit').click()
            } else {    
                notification(request.message, 0);
            }
        }
    });
}
