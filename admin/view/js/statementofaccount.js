let statementofaccountid 
async function statementofaccountActive() {
    statementofaccountid = ''
    const form = document.querySelector('#viewstatementofaccountform');
    if(form.querySelector('#querySubmit')) form.querySelector('#querySubmit').addEventListener('click', fetchstatementofaccount)
    datasource = [];
}

async function fetchstatementofaccount() {
    if(!validateForm('viewstatementofaccountform', getIdFromCls('comp'))) return notification('Please ensure all inputs are filled', 0)
    // Show loading state using SweetAlert
    const loadingAlert = Swal.fire({
        title: 'Please wait...',
        text: 'Fetching statementofaccount data, please wait.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    let form = document.querySelector('#viewstatementofaccountform');
    let formData = new FormData(form);
    // formData.set('department', '');
    // formData.set('statementofaccount', '');
    let queryParams = new URLSearchParams(formData).toString();

    document.getElementById('accountNumberDisplay').innerHTML = 'Loading...';
    document.getElementById('accountHolder').innerHTML = 'Loading...';
    document.getElementById('accountType').innerHTML = 'Loading...';
    document.getElementById('accountProduct').innerHTML = 'Loading...';
    document.getElementById('bbf').innerHTML = 'Loading...';
    document.getElementById('balance').innerHTML = 'Loading...';
    document.getElementById('startDateDisplay').innerHTML = 'Loading...';
    document.getElementById('endDateDisplay').innerHTML = 'Loading...';
    document.getElementById('accountStatus').innerHTML = 'Loading...';
    document.getElementById('branch').innerHTML = 'Loading...';
    document.getElementById('membership').innerHTML = 'Loading...';

    document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> Loading... </td>`

    let request = await httpRequest2(`api/v1/transactions/account?status=ACTIVE&${queryParams ? `${queryParams}` : ''}`, null, document.querySelector('#viewrequisitionform #submit'), 'json', 'GET');
    swal.close(); // Close the loading alert once the request is complete
    document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> No Records Retrieved </td>`
    document.getElementById('accountNumberDisplay').innerHTML = '';
    document.getElementById('accountHolder').innerHTML = '';
    document.getElementById('accountType').innerHTML = '';
    document.getElementById('accountProduct').innerHTML = '';
    document.getElementById('bbf').innerHTML = '';
    document.getElementById('balance').innerHTML = '';
    document.getElementById('startDateDisplay').innerHTML = '';
    document.getElementById('endDateDisplay').innerHTML = '';
    document.getElementById('accountStatus').innerHTML = '';
    document.getElementById('branch').innerHTML = '';
    document.getElementById('membership').innerHTML = '';
    if(request.status) {
            if(request.data.length) {
                datasource = request.data
                statementofaccountid = request.balancebroughtforward;
                resolvePagination(datasource, onstatementofaccountTableDataSignal);
            }else{
                document.getElementById('accountNumberDisplay').innerHTML = '<span style="color: red;">No Transaction has been made with this account</span>';
            }
            let whichaccount = request.data[0].whichaccount;
            let accountDetails;

            if (whichaccount == 'SAVINGS') {
                accountDetails = await httpRequest2(`api/v1/savings/account?accountnumber=${request.data[0].accountnumber}`, null, null, 'json', 'GET');
            } else if (whichaccount == 'LOAN') {
                accountDetails = await httpRequest2(`api/v1/loan/account?accountnumber=${request.data[0].accountnumber}`, null, null, 'json', 'GET');
            } else if (whichaccount == 'GLACCOUNT') {
                accountDetails = await httpRequest2(`api/v1/accounts/details?accountnumber=${request.data[0].accountnumber}`, null, null, 'json', 'GET');
            } else if (whichaccount == 'PERSONAL') {
                accountDetails = await httpRequest2(`api/v1/members/userregistration?phone=${request.data[0].accountnumber.replaceAll(organisationSettings.personal_account_prefix, '')}`, null, null, 'json', 'GET');
            } else if (whichaccount == 'PROPERTY') {   
                accountDetails = await httpRequest2(`api/v1/property/account?accountnumber=${request.data[0].accountnumber}`, null, null, 'json', 'GET');
            } else if (whichaccount == 'ROTARY') {
                accountDetails = await httpRequest2(`api/v1/rotary/account?accountnumber=${request.data[0].accountnumber}`, null, null, 'json', 'GET');
            }

            console.log('accountDetails', accountDetails, whichaccount)

            if (accountDetails && whichaccount == 'PROPERTY') {
                accountDetails = accountDetails.data;
            }else{
                accountDetails = accountDetails.data[0];
            }
            console.log('accountDetails', accountDetails, whichaccount)    

            if (accountDetails && whichaccount == 'SAVINGS') {
                document.getElementById('accountNumberDisplay').innerHTML = accountDetails.accountnumber;
                document.getElementById('accountHolder').innerHTML = accountDetails.useridname;
                document.getElementById('accountType').innerHTML = 'Savings';
                document.getElementById('accountProduct').innerHTML = accountDetails.savingsproduct;
                document.getElementById('bbf').innerHTML = formatCurrency(request.balancebroughtforward);
                document.getElementById('balance').innerHTML = formatCurrency(request.balance);
                document.getElementById('startDateDisplay').innerHTML = formatDate(did('startdate').value);
                document.getElementById('endDateDisplay').innerHTML = formatDate(did('enddate').value);
                document.getElementById('accountStatus').innerHTML = accountDetails.status;
                document.getElementById('branch').innerHTML = accountDetails.branchname;
                document.getElementById('membership').innerHTML = accountDetails.membername;
            }else if(accountDetails && whichaccount == 'LOAN') {
                document.getElementById('accountNumberDisplay').innerHTML = accountDetails.accountnumber;
                document.getElementById('accountHolder').innerHTML = accountDetails.useridname;
                document.getElementById('accountType').innerHTML = 'Loan';
                document.getElementById('accountProduct').innerHTML = accountDetails.loanproductname;
                document.getElementById('bbf').innerHTML = formatCurrency(request.balancebroughtforward);
                document.getElementById('balance').innerHTML = formatCurrency(request.balance);
                document.getElementById('startDateDisplay').innerHTML = formatDate(did('startdate').value);
                document.getElementById('endDateDisplay').innerHTML = formatDate(did('enddate').value);
                document.getElementById('accountStatus').innerHTML = accountDetails.status;
                document.getElementById('branch').innerHTML = accountDetails.branchname;
                document.getElementById('membership').innerHTML = accountDetails.membername;
            }else if(accountDetails && whichaccount == 'PERSONAL') {
                document.getElementById('accountNumberDisplay').innerHTML = request.data[0].accountnumber;
                document.getElementById('accountHolder').innerHTML = accountDetails.firstname + ' ' + accountDetails.lastname+ ' (' + accountDetails.othernames + ')';
                document.getElementById('accountType').innerHTML = 'Personal';
                document.getElementById('accountProduct').innerHTML = '-';
                document.getElementById('bbf').innerHTML = formatCurrency(request.balancebroughtforward);
                document.getElementById('balance').innerHTML = formatCurrency(request.balance);
                document.getElementById('startDateDisplay').innerHTML = formatDate(did('startdate').value);
                document.getElementById('endDateDisplay').innerHTML = formatDate(did('enddate').value);
                document.getElementById('accountStatus').innerHTML = accountDetails.status;
                document.getElementById('branch').innerHTML = accountDetails.branchname;
                document.getElementById('membership').innerHTML = '-';
            } else if (accountDetails && whichaccount == 'ROTARY') {
                document.getElementById('accountNumberDisplay').innerHTML = accountDetails.accountnumber;
                document.getElementById('accountHolder').innerHTML = accountDetails.accountname;
                document.getElementById('accountType').innerHTML = 'Rotary';
                document.getElementById('accountProduct').innerHTML = accountDetails.productname;
                document.getElementById('bbf').innerHTML = formatCurrency(request.balancebroughtforward);
                document.getElementById('balance').innerHTML = formatCurrency(request.balance);
                document.getElementById('startDateDisplay').innerHTML = formatDate(did('startdate').value);
                document.getElementById('endDateDisplay').innerHTML = formatDate(did('enddate').value);
                document.getElementById('accountStatus').innerHTML = accountDetails.status;
                document.getElementById('branch').innerHTML = accountDetails.branchname;
                document.getElementById('membership').innerHTML = accountDetails.membername;
            }else if(accountDetails.accounts[0] && whichaccount == 'PROPERTY'){
                console.log('accountDetails here', accountDetails.accounts[0])
                document.getElementById('accountNumberDisplay').innerHTML = accountDetails.accounts[0].account.accountnumber;
                document.getElementById('accountHolder').innerHTML = accountDetails.accounts[0].account.fullname;
                document.getElementById('accountType').innerHTML = 'Property';
                document.getElementById('accountProduct').innerHTML = accountDetails.accounts[0].product.product;
                document.getElementById('bbf').innerHTML = formatCurrency(request.balancebroughtforward);
                document.getElementById('balance').innerHTML = formatCurrency(request.balance);
                document.getElementById('startDateDisplay').innerHTML = formatDate(did('startdate').value);
                document.getElementById('endDateDisplay').innerHTML = formatDate(did('enddate').value);
                document.getElementById('accountStatus').innerHTML = accountDetails.accounts[0].account.status;
                document.getElementById('branch').innerHTML = accountDetails.accounts[0].account.branchname;
                document.getElementById('membership').innerHTML = accountDetails.accounts[0].account.membernames;
            }  else {
                notification('Failed to retrieve account details');
            }
            
    } else {
        return notification('No records retrieved');
    }
}

async function onstatementofaccountTableDataSignal() {
    let cumulativeBalance = statementofaccountid;
    let rows = getSignaledDatasource().map((item, index) => {
        // if (item.status == 'ACTIVE') {
            cumulativeBalance += (Number(item.credit) || 0) - (Number(item.debit) || 0);
            console.log(cumulativeBalance)
        // }
        return `
        <tr>
            <td>${index + 1}</td>
            <td>${formatDate(item.transactiondate)}</td>
            <td>${item.valuedate ? formatDate(item.valuedate) : (item.status === "ACTIVE" && !item.valuedate) ? formatDate(item.transactiondate) : 'N/A'}</td>
            <td>${item.description}</td>
            <td>${item.reference}</td>
            <td>${item.ttype}</td>
            <td style="color: ${item.credit == 0 ? 'black' : 'green'};">${formatCurrency(item.credit)}</td>
            <td style="color: ${item.debit == 0 ? 'black' : 'red'};">${formatCurrency(item.debit)}</td>
            <td>${formatCurrency(cumulativeBalance)}</td>
        </tr>`;
    }).join('');
    injectPaginatatedTable(rows)
}
