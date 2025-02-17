let loanaccountid
async function loanaccountActive() {
    loanaccountid = ''
    const form = document.querySelector('#loanaccountform')
    if(form.querySelector('#submit')) form.querySelector('#submit').addEventListener('click', loanaccountFormSubmitHandler)
    datasource = []
    await fetchloanaccount();
    await fetchloansavingproducts();
    did('loanproducter').innerHTML = `<option value="">-- Select Loan Product --</option>`;
    did('loanproducter').innerHTML += eligibilityloans.map(data=>`<option value="${data.id}">${data.productname}</option>`).join('')
    await getAllUsers('userid', 'name')
    await getAllUsers('accountofficer', 'name')
    await getAllbranch()
    await getfees();
    did('registrationdate').value = new Date().toISOString().split('T')[0];
    did('registrationdate').setAttribute('readonly', true);
    new TomSelect('#branch', {
        plugins: ['dropdown_input'],
        onInitialize: function() {
            // console.log(checkpermission('FILTER Branch'))
            // if(!checkpermission('FILTER Branch')) this.setValue(the_user.branch);
            this.setTextboxValue('readonly', true);
        }
    });
    new TomSelect('#loanproducter', {
        plugins: ['dropdown_input'],
        onChange: function(value) {
            checkloanproductsettings(value);
        }
    });
    new TomSelect('#userid', {
        plugins: ['dropdown_input'],
        onChange: function() { 
            handleloanpersonelchange(this.getValue());
         },
        onInitialize: function() {
            if(!checkpermission('FILTER ALL USERS')) this.setValue(the_user.id);
            if(!checkpermission('FILTER ALL USERS')) this.setTextboxValue('readonly', true);
        }   
    });
    new TomSelect('#accountofficer', {
        plugins: ['dropdown_input'],
    });
    did('member').addEventListener('change', e=>{
        handleloanmemberchange(e.target.value);
    })
}

function handleloanmemberchange(id) {
    const element = document.getElementById('loanproducter').tomselect;
    element.setValue('');
    element.clearOptions();

    console.log('id', id)
    if(!id)return did('loanproductcontainer').classList.add('hidden');
    else did('loanproductcontainer').classList.remove('hidden');
    console.log('product', eligibilityloans)
    if (id) {
        let list = eligibilityloans.filter(data=>data.status == 'ACTIVE').filter(data => data.membership.split('||').includes(id));
        console.log('list', list);
        element.addOption({value: '', text: '--SELECT LOAN PRODUCT--'});
        list.forEach(data => element.addOption({value: data.id, text: data.productname}));
        element.refreshOptions();
    }
}

function handleloanpersonelchange(id) {
    console.log('id', id)
    const user = userlistdata.data.find(data => data.id == id);
    const element = document.getElementById('member');
    element.innerHTML = `<option value="">--SELECT MEMBER--</option>`;
    if (user) {
        const branch = user.branch;
        const branchElement = document.getElementById('branch').tomselect;
        branchElement.setValue(branch);
        branchElement.setTextboxValue('readonly', true);
    }
    if(!id)return did('membership').classList.add('hidden');
    else did('membership').classList.remove('hidden');
    if (id) {
        did('member').removeAttribute('disabled');
        let list = userlistdata.data.filter(data => data.id == id)[0].membership.filter(data => data.status == 'ACTIVE');
        element.innerHTML = `<option value="">--SELECT MEMBER--</option>`;
        element.innerHTML += list.map(data => `<option value="${data.member}">${data.membername}</option>`).join('');
        if(loanaccountid)did('member').setAttribute('disabled', true);
    }
}

async function fetchloansavingproducts() {
    let request = await httpRequest2(`api/v1/savings/product`, null, document.querySelector('#viewrequisitionform #submit'), 'json', 'GET');
    let requestloan = await httpRequest2(`api/v1/loan/product`, null, document.querySelector('#viewrequisitionform #submit'), 'json', 'GET');
    if(request.status) {
            eligibilityloans = requestloan.data;
            eligibilitysavings = request.data;
            console.log('eligibilityloans', eligibilityloans)
            console.log('eligibilitysavings', eligibilitysavings)
            return
    } else {
        return notification('No records retrieved');
    }
}

function checkloanproductsettings(id) {
    console.log('id we eentered', id)
    if(id) {
        const loanproduct = eligibilityloans.filter(item => item.id == id)[0];
        console.log('loanproduct', loanproduct)
        did('registrationcharge').value = Number(loanproduct.registrationcharge);
        if(loanproduct.repaymentsettings == 'ACCOUNT') {
            did('loan-terms').classList.remove('hidden');
        }else{
            did('loan-terms').classList.add('hidden');
        }
    }
}

function resetloanform(){
    const useridElement = document.getElementById('userid').tomselect;
    useridElement.setValue('');
    const branchElement = document.getElementById('branch').tomselect;
    branchElement.setValue('');
    did('membership').classList.add('hidden');
    const memberElement = document.getElementById('member');
    memberElement.value = '';
    did('loanproductcontainer').classList.add('hidden');
    did('loan-terms').classList.add('hidden');
}

async function fetchloanaccount(id) {

    // Show loading state using SweetAlert
    const loadingAlert = Swal.fire({
        title: 'Please wait...',
        text: 'Fetching loan account data, please wait.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    for(let i=0; i<document.getElementsByClassName('disa').length; i++){
        const element = document.getElementsByClassName('disa')[i];
        element.readOnly = false;
        if (element.tomselect) {
            element.tomselect.setTextboxValue('readonly', false);
        }
    }
    // let form = document.querySelector('#viewrequisitionform');
    // let formData = new FormData(form);
    // // formData.set('department', '');
    // // formData.set('loanaccount', '');
    // let queryParams = new URLSearchParams(formData).toString();

    if(!id)document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> Loading... </td>`

    let request = await httpRequest2(`api/v1/loan/account`, null, document.querySelector('#viewrequisitionform #submit'), 'json', 'GET');
    swal.close(); // Close the loading alert once the request is complete
    if(!id)document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> No Records Retrieved </td>`
    if(request.status) {
        if(!id){
            did('loanproduct').tom
            if(request.data.length) {
                datasource = request.data
                resolvePagination(datasource, onloanaccountTableDataSignal);
            }
        } else {
            let thedata = request.data.filter(item => item.id == id)[0];
            resetloanform();
            document.getElementsByClassName('updater')[0].click();
            loanaccountid = thedata.id;
            populateData(thedata);
            did('loanproductcontainer').classList.remove('hidden')
            for(let i=0; i<document.getElementsByClassName('disa').length; i++){
                const element = document.getElementsByClassName('disa')[i];
                element.readOnly = true;
                if (element.tomselect) {
                    element.tomselect.setTextboxValue('readonly', true);
                }
            }
            if(did('repaymentfrequency').value)did('loan-terms').classList.remove('hidden')
        }
    } else {
        return notification('No records retrieved');
    }
}

async function removeloanaccount(id) {
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
        fetchloanaccount();
        return notification(confirmed.value.message);
    }
}


async function onloanaccountTableDataSignal() {
    let rows = getSignaledDatasource().map((item, index) => `
    <tr>
        <td>${index + 1}</td>
        <td>${formatDate(item.registrationdate)}</td>
        <td>${item.accountnumber}</td>
        <td>${item.useridname??''}</td>
        <td>${formatCurrency(item.loanamount)}</td>
        <td>${item.loanproductname}</td>
        <td>${item.membername}</td>
        <td>${item.branchname}</td>
        <td>${item.registrationpointname}</td>
        <td>${item.accountofficername??''}</td>
        <td class="${item.status === 'ACTIVE' ? 'text-green-600' : 'text-red-600'}">${item.status}</td>
        <td class="flex items-center gap-3">
            <button title="View All Loan Details" onclick="viewloanaccount('${item.id}')" class="material-symbols-outlined h-8 w-8 rounded-full bg-green-600 text-xs text-white drop-shadow-md" style="font-size: 18px;">visibility</button>
            <button title="View Schedules and Transaction" onclick="viewloanaccountschedule('${item.id}')" class="material-symbols-outlined h-8 w-8 rounded-full bg-yellow-600 text-xs text-white drop-shadow-md" style="font-size: 18px;">date_range</button>
            <button title="Edit Loan" onclick="fetchloanaccount('${item.id}')" class="material-symbols-outlined h-8 w-8 rounded-full bg-primary-g text-xs text-white drop-shadow-md" style="font-size: 18px;">edit</button>
            <button title="Delete row entry" onclick="removeloanaccount('${item.id}')" class="material-symbols-outlined hidden h-8 w-8 rounded-full bg-red-600 text-xs text-white drop-shadow-md" style="font-size: 18px;">delete</button>
        </td>
    </tr>`
    )
    .join('')
    injectPaginatatedTable(rows)
}

async function viewloanaccountschedule(id) {
    const account = datasource.find(item => item.id == id);
    try {
        // 1. Show Loading State
        Swal.fire({
            title: 'Loading...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        // 2. Prepare Payload
        const payload = new FormData();
        payload.append('accountnumber', account.accountnumber);

        // 3. Make the HTTP Request
        const request = await httpRequest2(
            'api/v1/loan/account/details',
            payload,
            document.querySelector('#savingaccountform #submit'),
            'json',
            'POST'
        );

        // 4. Handle Response
        if (request.status) {
            account.installments = request.data.installments;
            account.refund = request.data.refund;
            console.log('account', account)

            // 5. Helper Function to Safely Access Data
            const getValue = (value) => {
                if (value === null || value === undefined) return 'N/A';
                if (typeof value === 'string' && value.trim() === '') return 'N/A';
                return value;
            };

            // 7. Helper Function to Generate Table Rows
            const generateRow = (label, value, bgColor = '#fafafa') => `
                <tr style="background-color: ${bgColor};">
                    <td style="padding: 12px; width: 35%; font-weight: 500;">${label}</td>
                    <td style="padding: 12px;">${value}</td>
                </tr>
            `;

            // 11. Generate Installments HTML
            const generateInstallmentsHtml = () => {
                if (!account.installments || account.installments.length === 0) {
                    return `
                        <div class="table-content">
                        <table class="table-auto">
                            <thead>
                                <tr>
                                    <th colspan="8">
                                        Installments
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td colspan="8" class="text-center opacity-70" style="padding: 12px;">No installments available.</td>
                                </tr>
                            </tbody>
                        </table>
                        </div>
                    `;
                }

                // Calculate totals
                const totalScheduleAmount = account.installments.reduce((sum, installment) => sum + parseFloat(getValue(installment.scheduleamount) || 0), 0);
                const totalInterest = account.installments.reduce((sum, installment) => sum + parseFloat(getValue(installment.interestamount) || 0), 0);
                const totalPaid = account.installments.reduce((sum, installment) => sum + parseFloat(getValue(installment.amountpaid) || 0), 0);
                let totalUnpaid = account.installments.reduce((sum, installment) => sum + parseFloat(getValue(installment.amountunpaid) || 0), 0);

                // Adjust totalUnpaid if disbursementref is empty
                if (!account.disbursementref) {
                    totalUnpaid = 0;
                }

                // Define table headers
                const headers = ['Scheduled Payment Date', 'Schedule Amount', 'Interest Amount', 'Amount Paid', 'Status', 'Payment Status', 'Amount Unpaid', 'Action'];

                // Generate table header row
                const headerRow = `
                    <tr>
                        ${headers.map(header => `<th style="padding: 12px;">${header}</th>`).join('')}
                    </tr>
                `;
                
                // Generate table body rows
                const bodyRows = account.installments
                    .map((installment, index) => `
                        <tr style="background-color: ${index % 2 === 0 ? '#fafafa' : '#fff'};">
                            <td style="padding: 12px;">${formatDate(installment.scheduledpaymentdate)}</td>
                            <td style="padding: 12px;">${formatCurrency(getValue(installment.scheduleamount))}</td>
                            <td style="padding: 12px;">${formatCurrency(getValue(installment.interestamount))}</td>
                            <td style="padding: 12px;">${formatCurrency(getValue(installment.amountpaid))}</td>
                            <td style="padding: 12px;">${getValue(installment.status)}</td>
                            <td style="padding: 12px; color: ${
                                getValue(installment.scheduleamount) == '0' && getValue(installment.interestamount) == '0' 
                                ? 'orange' 
                                : getValue(installment.paymentstatus) == 'FULLY PAID' 
                                ? 'green' 
                                : 'red'
                            };">${
                                getValue(installment.scheduleamount) == '0' && getValue(installment.interestamount) == '0' 
                                ? 'NO PAYMENT NEEDED' 
                                : getValue(installment.paymentstatus)
                            }</td>
                            <td style="padding: 12px;">${formatCurrency(getValue(installment.amountunpaid))}</td>
                            <td class="flex items-center gap-3">
                                <button title="View Payment" onclick="viewdloanaccount('')" class="material-symbols-outlined h-8 w-8 rounded-full bg-green-600 text-xs text-white drop-shadow-md" style="font-size: 18px;">payments</button>
                            </td>
                        </tr>
                    `)
                    .join('');

                return `
                <div class="table-content">
                    <table class="table-auto">
                        <thead>
                            <tr>
                                <th colspan="8" style="position: relative;">
                                    Installments (scroll right to see all)
                                    <button onclick="viewAllTransactions()"
                                    class="bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 text-white"
                                    style="
                                        position: absolute;
                                        right: 10px;
                                        top: 50%;
                            
                                        border: none;
                                        padding: 8px 16px;
                                        border-radius: 4px;
                                        cursor: pointer;
                                        font-size: 10px;
                                        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
                                        transition: background-color 0.3s ease, transform 0.3s ease;
                                    " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                                        View All Transactions
                                    </button>
                                </th>
                            </tr>
                            <tr>
                                <th colspan="2" style="padding: 12px; background-color: #e0f7fa; color: #00796b;">Total Schedule Amount: ${formatCurrency(totalScheduleAmount)}</th>
                                <th colspan="2" style="padding: 12px; background-color: #fce4ec; color: #c2185b;">Total Interest: ${formatCurrency(totalInterest)}</th>
                                <th colspan="2" style="padding: 12px; background-color: #f3e5f5; color: #6a1b9a;">Total Paid: ${formatCurrency(totalPaid)}</th>
                                <th colspan="2" style="padding: 12px; background-color: #fff3e0; color: #e65100;">Total Unpaid: ${formatCurrency(totalUnpaid)}</th>
                            </tr>
                            <tr>
                                <th colspan="4" style="padding: 12px; background-color: #e8f5e9; color: #2e7d32;">TO BE REFUNDED: ${formatCurrency(account.refund)}</th>
                                <th colspan="4" style="padding: 12px; background-color: ${account.disbursementref ? '#e8f5e9' : '#ffebee'}; color: ${account.disbursementref ? '#2e7d32' : '#c62828'};">
                                    ${account.disbursementref ? 'Loan has been disbursed' : 'Loan has not been disbursed yet'}
                                </th>
                            </tr>
                            ${headerRow}
                        </thead>
                        <tbody>
                            ${bodyRows}
                        </tbody>
                    </table>
                </div>
                `;
            };

            const installmentsHtml = generateInstallmentsHtml();

            // 12. Combine All Sections with Spacing
            const accountDetailsHtml = `
                <div style="
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    color: #333;
                    margin: 0 auto;
                    text-align: left;
                    line-height: 1.5;
                    max-width: 900px;
                ">
                    <div style="overflow:auto">
                    <div style="min-width: 800px;">
                        ${installmentsHtml}
                    </div>
                    </div>
                </div>
            `;

            // 13. Present the SweetAlert2 Modal with Account Details
            Swal.fire({
                title: 'Schedules and Transactions',
                html: accountDetailsHtml,
                width: '85%',
                showCloseButton: true,
                showConfirmButton: true,
                confirmButtonText: 'Close',
                confirmButtonColor: '#3085d6',
                background: '#fff',
                customClass: {
                    popup: 'modern-swal-popup', // Define .modern-swal-popup in your CSS if desired
                },
                // Optional: Adjust scrolling if content overflows
                // scrollbarPadding: false,
            });
        } else {
            // 14. Handle Non-Success Status
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: request.message || 'Failed to fetch loan account details.',
                confirmButtonText: 'OK',
                confirmButtonColor: '#3085d6'
            });
        }
    } catch (error) {
        // 15. Handle Exceptions
        console.error('Error fetching loan account details:', error);
        Swal.fire({
            icon: 'error',
            title: 'Unexpected Error',
            text: 'An unexpected error occurred while fetching account details.',
            confirmButtonText: 'OK',
            confirmButtonColor: '#3085d6'
        });
    }
}

async function viewloanaccount(id) {
    const account = datasource.find(item => item.id == id);
    try {
        // 1. Show Loading State
        Swal.fire({
            title: 'Loading...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        // 2. Prepare Payload
        const payload = new FormData();
        payload.append('accountnumber', account.accountnumber);

        // 3. Make the HTTP Request
        const request = await httpRequest2(
            'api/v1/loan/account/details',
            payload,
            document.querySelector('#savingaccountform #submit'),
            'json',
            'POST'
        );

        // 4. Handle Response
        if (request.status) {
            account.installments = request.data.installments;
            account.refund = request.data.refund;
            console.log('account refund', account.refund)

            // 5. Helper Function to Safely Access Data
            const getValue = (value) => {
                if (value === null || value === undefined) return 'N/A';
                if (typeof value === 'string' && value.trim() === '') return 'N/A';
                return value;
            };

            // 7. Helper Function to Generate Table Rows
            const generateRow = (label, value, bgColor = '#fafafa') => `
                <tr style="background-color: ${bgColor};">
                    <td style="padding: 12px; width: 35%; font-weight: 500;">${label}</td>
                    <td style="padding: 12px;">${value}</td>
                </tr>
            `;

            // 8. Generate HTML Snippets for Each Section
            const accountOverviewHtml = `
                <table style="
                    width: 100%;
                    border-collapse: separate;
                    border-spacing: 0px;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    overflow: hidden;
                ">
                    <thead>
                        <tr style="background-color: #eee;">
                            <th colspan="2" style="
                                padding: 12px;
                                font-size: 18px;
                                text-align: center;
                                color: #333;
                            ">
                                Account Overview
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        ${generateRow('Account Name', getValue(account.useridname), '#fafafa')}
                        ${generateRow('Account Number', getValue(account.accountnumber), '#fff')}
                        ${generateRow('Loan Product', getValue(account.loanproductname), '#fafafa')}
                        ${generateRow('Member Name', getValue(account.membername), '#fff')}
                        ${generateRow('Branch', getValue(account.branchname), '#fafafa')}
                        ${generateRow('Status', getValue(account.status), '#fff')}
                    </tbody>
                </table>
            `;

            const registrationDetailsHtml = `
                <table style="
                    width: 100%;
                    border-collapse: separate;
                    border-spacing: 0px;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    overflow: hidden;
                ">
                    <thead>
                        <tr style="background-color: #eee;">
                            <th colspan="2" style="
                                padding: 12px;
                                font-size: 18px;
                                text-align: center;
                                color: #333;
                            ">
                                Registration Details
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        ${generateRow('Registration Date', formatDate(account.registrationdate), '#fafafa')}
                        ${generateRow('Registration Point', getValue(account.registrationpointname), '#fff')}
                        ${generateRow('Description', getValue(account.registrationdesc), '#fafafa')}
                        ${generateRow('Amount', formatCurrency(getValue(account.loanamount)), '#fff')}
                        ${generateRow('Registration Charge', formatCurrency(getValue(account.registrationcharge)), '#fafafa')}
                    </tbody>
                </table>
            `;

            const bankDetailsHtml = `
                <table style="
                    width: 100%;
                    border-collapse: separate;
                    border-spacing: 0px;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    overflow: hidden;
                ">
                    <thead>
                        <tr style="background-color: #eee;">
                            <th colspan="2" style="
                                padding: 12px;
                                font-size: 18px;
                                text-align: center;
                                color: #333;
                            ">
                                Bank Details
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        ${generateRow('Bank Name 1', getValue(account.bankname1), '#fafafa')}
                        ${generateRow('Bank Account Name 1', getValue(account.bankaccountname1), '#fff')}
                        ${generateRow('Bank Account Number 1', getValue(account.bankaccountnumber1), '#fafafa')}
                        ${generateRow('Bank Name 2', getValue(account.bankname2), '#fff')}
                        ${generateRow('Bank Account Name 2', getValue(account.bankaccountname2), '#fafafa')}
                        ${generateRow('Bank Account Number 2', getValue(account.bankaccountnumber2), '#fff')}
                    </tbody>
                </table>
            `;

            const contactPreferencesHtml = `
                <table style="
                    width: 100%;
                    border-collapse: separate;
                    border-spacing: 0px;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    overflow: hidden;
                ">
                    <thead>
                        <tr style="background-color: #eee;">
                            <th colspan="2" style="
                                padding: 12px;
                                font-size: 18px;
                                text-align: center;
                                color: #333;
                            ">
                                Contact Preferences
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        ${generateRow('Email', account.email ? 'Yes' : 'No', '#fafafa')}
                        ${generateRow('SMS', account.sms ? 'Yes' : 'No', '#fff')}
                        ${generateRow('WhatsApp', account.whatsapp ? 'Yes' : 'No', '#fafafa')}
                    </tbody>
                </table>
            `;

            // 9. Handle Loan Terms based on repaymentsettings
            const productDetails = account.productdetails;
            let loanTermsTitle = 'Loan Terms';
            let loanTermsData = {
                // Modified 'Repayment Frequency' as per user request
                'Repayment Frequency': `<span id="repaymentfrequency-${account.id}" onclick="codemeaning('repaymentfrequency-${account.id}', false)" class="cp text-sm font-bold text-orange-700">${account.repaymentfrequency}</span>`,
                'Number of Repayments': getValue(account.numberofrepayments),
                'Interest Method': getValue(account.interestmethod),
                'Interest Rate': getValue(account.interestrate),
                'Interest Rate Type': getValue(account.interestratetype) || 'N/A',
                'Default Penalty ID': getValue(account.defaultpenaltyid) || 'N/A',
                'Separate Interest': account.seperateinterest ? 'Yes' : 'No'
            };

            if (productDetails && getValue(productDetails.repaymentsettings).toUpperCase() === 'PRODUCT') {
                loanTermsTitle = `Loan Terms from product (<span class="text-blue-300">${getValue(productDetails.productname)}</span>)`;
                loanTermsData = {
                    'Repayment Frequency': `<span id="repaymentfrequency-${account.id}" onclick="codemeaning('repaymentfrequency-${account.id}', false)" class="cp text-sm font-bold text-orange-700">${getValue(productDetails.repaymentfrequency)}</span>`,
                    'Number of Repayments': getValue(productDetails.numberofrepayments),
                    'Interest Method': getValue(productDetails.interestmethod),
                    'Interest Rate': getValue(productDetails.interestrate),
                    'Interest Rate Type': getValue(productDetails.interestratetype) || 'N/A',
                    'Default Penalty ID': getValue(productDetails.defaultpenaltyid) || 'N/A',
                    'Separate Interest': productDetails.seperateinterest ? 'Yes' : 'No'
                };
            }

            // 10. Generate Loan Terms HTML
            const loanTermsRows = Object.entries(loanTermsData)
                .map(([label, value], index) => generateRow(label, value, index % 2 === 0 ? '#fafafa' : '#fff'))
                .join('');

            const loanTermsHtml = `
                <table style="
                    width: 100%;
                    border-collapse: separate;
                    border-spacing: 0px;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    overflow: hidden;
                ">
                    <thead>
                        <tr style="background-color: #eee;">
                            <th colspan="2" style="
                                padding: 12px;
                                font-size: 18px;
                                text-align: center;
                                color: #333;
                            ">
                                ${loanTermsTitle}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        ${loanTermsRows}
                    </tbody>
                </table>
            `;

            const accountOfficerHtml = `
                <table style="
                    width: 100%;
                    border-collapse: separate;
                    border-spacing: 0px;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    overflow: hidden;
                ">
                    <thead>
                        <tr style="background-color: #eee;">
                            <th colspan="2" style="
                                padding: 12px;
                                font-size: 18px;
                                text-align: center;
                                color: #333;
                            ">
                                Account Officer
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        ${generateRow(
                            'Account Officer Name',
                            getValue(account.accountofficername).trim() !== '' ? getValue(account.accountofficername) : 'N/A',
                            '#fafafa'
                        )}
                    </tbody>
                </table>
            `;

            // 11. Generate Installments HTML
            const generateInstallmentsHtml = () => {
                if (!account.installments || account.installments.length === 0) {
                    return `
                        <div class="table-content">
                        <table class="table-auto">
                            <thead>
                                <tr>
                                    <th colspan="8">
                                        Installments
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td colspan="8" class="text-center opacity-70" style="padding: 12px;">No installments available.</td>
                                </tr>
                            </tbody>
                        </table>
                        </div>
                    `;
                }

                // Calculate totals
                const totalScheduleAmount = account.installments.reduce((sum, installment) => sum + parseFloat(getValue(installment.scheduleamount) || 0), 0);
                const totalInterest = account.installments.reduce((sum, installment) => sum + parseFloat(getValue(installment.interestamount) || 0), 0);
                const totalPaid = account.installments.reduce((sum, installment) => sum + parseFloat(getValue(installment.amountpaid) || 0), 0);
                let totalUnpaid = account.installments.reduce((sum, installment) => sum + parseFloat(getValue(installment.amountunpaid) || 0), 0);

                // Adjust totalUnpaid if disbursementref is empty
                if (!account.disbursementref) {
                    totalUnpaid = 0;
                }

                // Define table headers
                const headers = ['Scheduled Payment Date', 'Schedule Amount', 'Interest Amount', 'Amount Paid', 'Status', 'Payment Status', 'Amount Unpaid', 'Action'];

                // Generate table header row
                const headerRow = `
                    <tr>
                        ${headers.map(header => `<th style="padding: 12px;">${header}</th>`).join('')}
                    </tr>
                `;
                
                // Generate table body rows
                const bodyRows = account.installments
                    .map((installment, index) => `
                        <tr style="background-color: ${index % 2 === 0 ? '#fafafa' : '#fff'};">
                            <td style="padding: 12px;">${formatDate(installment.scheduledpaymentdate)}</td>
                            <td style="padding: 12px;">${formatCurrency(getValue(installment.scheduleamount))}</td>
                            <td style="padding: 12px;">${formatCurrency(getValue(installment.interestamount))}</td>
                            <td style="padding: 12px;">${formatCurrency(getValue(installment.amountpaid))}</td>
                            <td style="padding: 12px;">${getValue(installment.status)}</td>
                            <td style="padding: 12px; color: ${
                                getValue(installment.scheduleamount) == '0' && getValue(installment.interestamount) == '0' 
                                ? 'orange' 
                                : getValue(installment.paymentstatus) == 'FULLY PAID' 
                                ? 'green' 
                                : 'red'
                            };">${
                                getValue(installment.scheduleamount) == '0' && getValue(installment.interestamount) == '0' 
                                ? 'NO PAYMENT NEEDED' 
                                : getValue(installment.paymentstatus)
                            }</td>
                            <td style="padding: 12px;">${formatCurrency(getValue(installment.amountunpaid))}</td>
                            <td class="flex items-center gap-3">
                                <button title="View Payment" onclick="viewdloanaccount('')" class="material-symbols-outlined h-8 w-8 rounded-full bg-green-600 text-xs text-white drop-shadow-md" style="font-size: 18px;">payments</button>
                            </td>
                        </tr>
                    `)
                    .join('');

                return `
                <div class="table-content">
                    <table class="table-auto">
                        <thead>
                            <tr>
                                <th colspan="8" style="position: relative;">
                                    Installments (scroll right to see all)
                                    <button onclick="viewAllTransactions()"
                                    class="bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 text-white"
                                    style="
                                        position: absolute;
                                        right: 10px;
                                        top: 50%;
                            
                                        border: none;
                                        padding: 8px 16px;
                                        border-radius: 4px;
                                        cursor: pointer;
                                        font-size: 10px;
                                        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
                                        transition: background-color 0.3s ease, transform 0.3s ease;
                                    " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                                        View All Transactions
                                    </button>
                                </th>
                            </tr>
                            <tr>
                                <th colspan="2" style="padding: 12px; background-color: #e0f7fa; color: #00796b;">Total Schedule Amount: ${formatCurrency(totalScheduleAmount)}</th>
                                <th colspan="2" style="padding: 12px; background-color: #fce4ec; color: #c2185b;">Total Interest: ${formatCurrency(totalInterest)}</th>
                                <th colspan="2" style="padding: 12px; background-color: #f3e5f5; color: #6a1b9a;">Total Paid: ${formatCurrency(totalPaid)}</th>
                                <th colspan="2" style="padding: 12px; background-color: #fff3e0; color: #e65100;">Total Unpaid: ${formatCurrency(totalUnpaid)}</th>
                            </tr>
                            <tr>
                                <th colspan="4" style="padding: 12px; background-color: #e8f5e9; color: #2e7d32;">TO BE REFUNDED: ${formatCurrency(account.refund)}</th>
                                <th colspan="4" style="padding: 12px; background-color: ${account.disbursementref ? '#e8f5e9' : '#ffebee'}; color: ${account.disbursementref ? '#2e7d32' : '#c62828'};">
                                    ${account.disbursementref ? 'Loan has been disbursed' : 'Loan has not been disbursed yet'}
                                </th>
                            </tr>
                            ${headerRow}
                        </thead>
                        <tbody>
                            ${bodyRows}
                        </tbody>
                    </table>
                </div>
                `;
            };

            const installmentsHtml = generateInstallmentsHtml();

            // 12. Combine All Sections with Spacing
            const accountDetailsHtml = `
                <div style="
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    color: #333;
                    margin: 0 auto;
                    text-align: left;
                    line-height: 1.5;
                    max-width: 900px;
                ">
                    ${accountOverviewHtml}
                    <div style="height: 20px;"></div>
                    ${registrationDetailsHtml}
                    <div style="height: 20px;"></div>
                    ${bankDetailsHtml}
                    <div style="height: 20px;"></div>
                    ${contactPreferencesHtml}
                    <div style="height: 20px;"></div>
                    ${loanTermsHtml}
                    <div style="height: 20px;"></div>
                    ${accountOfficerHtml}
                    <div style="height: 20px;"></div>
                    <div style="overflow:auto">
                    <div style="min-width: 800px;">
                        ${installmentsHtml}
                    </div>
                    </div>
                </div>
            `;

            // 13. Present the SweetAlert2 Modal with Account Details
            Swal.fire({
                title: 'Account Details',
                html: accountDetailsHtml,
                width: '85%',
                showCloseButton: true,
                showConfirmButton: true,
                confirmButtonText: 'Close',
                confirmButtonColor: '#3085d6',
                background: '#fff',
                customClass: {
                    popup: 'modern-swal-popup', // Define .modern-swal-popup in your CSS if desired
                },
                // Optional: Adjust scrolling if content overflows
                // scrollbarPadding: false,
            });
        } else {
            // 14. Handle Non-Success Status
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: request.message || 'Failed to fetch loan account details.',
                confirmButtonText: 'OK',
                confirmButtonColor: '#3085d6'
            });
        }
    } catch (error) {
        // 15. Handle Exceptions
        console.error('Error fetching loan account details:', error);
        Swal.fire({
            icon: 'error',
            title: 'Unexpected Error',
            text: 'An unexpected error occurred while fetching account details.',
            confirmButtonText: 'OK',
            confirmButtonColor: '#3085d6'
        });
    }
}



async function loanaccountFormSubmitHandler() {
    if(!validateForm('loanaccountform', getIdFromCls('comp'))) return

    let themembership 
    if(loanaccountid)did('member').disabled = false
    
    let payload = getFormData2(document.querySelector('#loanaccountform'), loanaccountid ? [['id', loanaccountid]] : null);

    const confirmed = await Swal.fire({
        title: loanaccountid ? 'Updating...' : 'Submitting...',
        text: 'Please wait while we submit your data.',
        icon: 'info',
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: async () => {
            Swal.showLoading();
            let request = await httpRequest2('api/v1/loan/account', payload, document.querySelector('#loanaccountform #submit'), 'json', 'POST');
            Swal.close();

            if (request.status) {
                notification('Success!', 1);
                const form = document.querySelector('#loanaccountform');
                form.reset();
                if(loanaccountid)form.querySelectorAll('input, select, textarea').forEach(input => input.value = '');
                loanaccountid = '';
                document.getElementsByClassName('viewer')[0].click();
                resetloanform();
                fetchloanaccount();
            } else {    
                notification(request.message, 0, 15000);
            }
        }
    });
}
