let withdrawalid
async function withdrawalActive() {
    dynamiccomma(true)
    withdrawalid = ''
    const form = document.querySelector('#withdrawalform')
    if(form.querySelector('#submit')) form.querySelector('#submit').addEventListener('click', withdrawalFormSubmitHandler)
    if(document.querySelector('#accountnumber')) document.querySelector('#accountnumber').addEventListener('change', fetchwithdrawalaccountdetails)
    datasource = []
    const today = new Date().toISOString().split('T')[0];
    document.querySelector('#transactionDate').value = today;
    document.querySelector('#valueDate').value = today;
    await getAllUsers('withdrawalor', 'name')
    new TomSelect('#withdrawalor', {
        plugins: ['dropdown_input'],
        onInitialize: function() {
            this.setValue(the_user.id);
            this.setTextboxValue('readonly', true);
        }
    });
    // await fetchwithdrawal()
    // await getAllwithdrawal(true)
    // new TomSelect('#withdrawal', {
    //     // plugins: ['remove_button'],
    //     onInitialize: function() {
    //         console.log(checkpermission('FILTER withdrawal'))
    //         if(!checkpermission('FILTER withdrawal')) this.setValue(the_user.withdrawal);
            // if(!checkpermission('FILTER withdrawal')) this.setTextboxValue('readonly', true);
    //     }
    // });
}

async function fetchwithdrawalaccountdetails() {
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

async function withdrawalFormSubmitHandler() {
    if (document.querySelector('#withdrawAllocationCheckbox').checked) {
        if (did('detail_accounttype').value != 'Personal') {
            return notification('Account type must be Personal when Withdraw Allocation is checked', 0);
        }
    }
    dynamiccomma(false)
    if(did('accountnumber').value != did('detail_accountnumber').value) return notification('Account number does not match', 0);
    if(!did('amountPaid').value)return notification('Please enter the amount paid', 0);
    if(!did('withdrawalor').value)return notification('Please reset the page, cant find the withdrawalor', 0);

    
    
    
    let payload = getFormData2(did('withdrawalform'), [
        ['branch', the_user.branch],
        ['userid', the_user.id],
        ['rowsize', 1],
        ['accountnumber1', did('accountnumber').value],
        ['debit1', did('amountPaid').value],
        ['location', 'BRANCH'],
        ['allocation', document.querySelector('#withdrawAllocationCheckbox').checked ? 1 : 0],
        ['cashref', did('depositCode').value]
    ]);

    if (did('depositCode').value) {
        const confirmed = await Swal.fire({
            title: 'Warning',
            text: 'The cashier should ensure it\'s an excess the marketer is withdrawing, else he would be held responsible for it.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Proceed',
            cancelButtonText: 'Cancel'
        });

        if (!confirmed.isConfirmed) {
            return;
        }
    }
    
    const pinStatus = await getAndVerifyPin();
    if(!pinStatus) return;

    if (did('depositCode').value) {
        const otpStatus = await getAndVerifyOTP();
        if(!otpStatus) return;
    }
    
    if(Number(did('amountPaid').value) > 100000){
        alert('Please enter a valid account number')
        const otpStatus = await getAndVerifyOTP();
        if(!otpStatus) return;
    }
    // return
    const confirmed = await Swal.fire({
        title: withdrawalid ? 'Withdrawing...' : 'Withdrawing...',
        text: 'Please wait while the withdrawal is been made.',
        icon: 'info',
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: async () => {
            Swal.showLoading();
            let request = await httpRequest2('api/v1/transactions/withdrawal', payload, document.querySelector('#withdrawalform #submit'), 'json', 'POST');
            Swal.close();

            if (request.status) {
                notification('withdrawal Successful', 1);
                did('withdrawal').click()
            } else {    
                notification(request.message, 0);
            }
        }
    });
}
