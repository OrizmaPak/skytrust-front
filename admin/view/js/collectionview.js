let collectionviewid
async function collectionviewActive() {
    collectionviewid = ''
    const form2 = document.querySelector('#viewcollectionviewform')
    if(form2.querySelector('#querySubmit')) form2.querySelector('#querySubmit').addEventListener('click', fetchcollectiondailyview)
    if(document.querySelector('#querySubmit2')) document.querySelector('#querySubmit2').addEventListener('click', fetchcollectionmonthview)
    if(document.querySelector('#querySubmit3')) document.querySelector('#querySubmit3').addEventListener('click', fetchcollectionyearview)
    datasource = []
    await getAllbranch(true);
    await getAllbranch(true, 'branchmonth');
    await getAllbranch(true, 'branchyear');
    await getAllUsers('useridday', 'name')
    await getAllUsers('useridmonth', 'name')
    await getAllUsers('useridyear', 'name')
    new TomSelect('#branch', {
        plugins: ['dropdown_input'],
        onInitialize: function() {
            console.log(checkpermission('FILTER BRANCH'))
            if(!checkpermission('FILTER BRANCH')) this.setValue(the_user.branch);
            if(!checkpermission('FILTER BRANCH')) this.setTextboxValue('readonly', true);
            // handleRegistrationPointChange(this.getValue())
        },
        onChange: function() {
            handleRegistrationPointChange(this.getValue());
        }
        
    });
    new TomSelect('#useridday', {
        plugins: ['dropdown_input'],
        onInitialize: function() {
            console.log(checkpermission('FILTER ALL USERS'))
            if(!checkpermission('FILTER ALL USERS')) this.setValue(the_user.id);
            if(!checkpermission('FILTER ALL USERS')) this.setTextboxValue('readonly', true);
        }
    });
    new TomSelect('#branchmonth', {
        plugins: ['dropdown_input'],
        onInitialize: function() {
            console.log(checkpermission('FILTER BRANCH'))
            if(!checkpermission('FILTER BRANCH')) this.setValue(the_user.branch);
            if(!checkpermission('FILTER BRANCH')) this.setTextboxValue('readonly', true);
        },
        onChange: function() {
            handleRegistrationPointChange(this.getValue(), 'registrationpointmonth');
        }
    });
    new TomSelect('#useridmonth', {
        plugins: ['dropdown_input'],
        onInitialize: function() {
            console.log(checkpermission('FILTER ALL USERS'))
            if(!checkpermission('FILTER ALL USERS')) this.setValue(the_user.id);
            if(!checkpermission('FILTER ALL USERS')) this.setTextboxValue('readonly', true);
        }
    });
    new TomSelect('#branchyear', {
        plugins: ['dropdown_input'],
        onInitialize: function() {
            console.log(checkpermission('FILTER BRANCH'))
            if(!checkpermission('FILTER BRANCH')) this.setValue(the_user.branch);
            if(!checkpermission('FILTER BRANCH')) this.setTextboxValue('readonly', true);
        },
        onChange: function() {
            handleRegistrationPointChange(this.getValue(), 'registrationpointyear');
        }
    });
    new TomSelect('#useridyear', {
        plugins: ['dropdown_input'],
        onInitialize: function() {
            console.log(checkpermission('FILTER ALL USERS'))
            if(!checkpermission('FILTER ALL USERS')) this.setValue(the_user.id);
            if(!checkpermission('FILTER ALL USERS')) this.setTextboxValue('readonly', true);
        }
    });

}

async function handleRegistrationPointChange(id, reg='registrationpointid') {
    const element = document.getElementById(reg);
    element.value = '';
    element.disabled = true;
    element.placeholder = 'Loading...';
    let request = await httpRequest2(`api/v1/admin/registrationpoints?branch=${id}`, null, null, 'json', 'GET');
    if (request.status) {
        if (request.data.length) {
            element.disabled = false;
            element.innerHTML = `<option value="">-- All Registration Point --</option>`;
            element.innerHTML += request.data.map(data => `<option value="${data.id}">${data.registrationpoint}</option>`).join('');
        } else {
            element.disabled = false;
            element.placeholder = 'No Registration Points found';
        }
    } else {
        return notification('No records retrieved');
    }
}

async function fetchcollectiondailyview() {
    if(!validateForm('viewcollectionviewform', getIdFromCls('comp'))) return notification('Please ensure all inputs are filled', 0)

    // Show loading state using SweetAlert
    const loadingAlert = Swal.fire({
        title: 'Please wait...',
        text: 'Fetching collectionview data, please wait.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    let form = document.querySelector('#viewcollectionviewform');
    let formData = new FormData(form);
    // formData.set('department', '');
    // formData.set('collectionview', '');
    let queryParams = new URLSearchParams(formData).toString();

    document.getElementById('tabledataday').innerHTML = `<td colspan="100%" class="text-center opacity-70"> Loading... </td>`

    let request = await httpRequest2(`api/v1/transactions/viewcollectionsfortheday?${queryParams ? `${queryParams}` : ''}`, null, document.querySelector('#viewcollectionviewform #submit'), 'json', 'GET');
    swal.close(); // Close the loading alert once the request is complete
    document.getElementById('tabledataday').innerHTML = `<td colspan="100%" class="text-center opacity-70"> No Records Retrieved </td>`
    if(request.status) {
            if(request.data.length) {
                datasource = request.data
                did('tabledataday').innerHTML = request.data.map((data, i)=>`
                    <tr>
                        <td>${i+1}</td>
                        <td>${data.fullname??data.userid}</td>
                        <td>${data.depositcode}</td>
                        <td>${data.branchname}</td>
                        <td>${data.registrationpointname}</td>
                        <td style="color: ${data.collected > 0 ? 'green' : 'black'};">${formatCurrency(data.collected)}</td>
                        <td style="color: ${data.remitted > 0 ? 'blue' : 'black'};">${formatCurrency(data.remitted)}</td>
                        <td style="color: ${data.penalty > 0 ? 'brown' : 'black'};">${formatCurrency(data.penalty)}</td>
                        <td style="color: ${data.excess > 0 ? 'purple' : 'black'};">${formatCurrency(data.excess)}</td>
                        <td style="color: ${data.balance > 0 ? 'red' : 'black'};">${formatCurrency(data.balance)}</td>
                        <td class="flex items-center gap-3 ">
                        <button title="View Transactions" onclick="viewcollectionviewdaily('${data.depositcode}')" class="material-symbols-outlined rounded-full bg-orange-600 h-8 w-8 text-white drop-shadow-md text-xs" style="font-size: 18px;">receipt_long</button>
                        </td>
                    </tr>
                `).join('')
            }
    } else {
        return notification('No records retrieved');
    }
}

async function fetchcollectionmonthview(){
    if(!validateForm('viewmonthlycollectionviewform', getIdFromCls('comp'))) return notification('Please enter the day you want to check for', 0)
    // Show loading state using SweetAlert
    const loadingAlert = Swal.fire({
        title: 'Please wait...',
        text: 'Fetching monthly collection data, please wait.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    did('totalCollectedmonth').innerHTML = 'Loading...';
    did('totalPaidmonth').innerHTML = 'Loading...';
    did('totalPenaltymonth').innerHTML = 'Loading...';
    did('totalRemainingmonth').innerHTML = 'Loading...'; 
    did('numbercollectionsmonth').innerHTML = 'Loading...';
    did('excessmonth').innerHTML = 'Loading...';    


    let form = document.querySelector('#viewmonthlycollectionviewform');
    let formData = new FormData(form);
    // formData.set('department', '');
    // formData.set('collection', '');
    let queryParams = new URLSearchParams(formData).toString();

    document.getElementById('tabledatamonth').innerHTML = `<td colspan="100%" class="text-center opacity-70"> Loading... </td>`

    let request = await httpRequest2(`api/v1/transactions/getusermonthlycviewollection?${queryParams ? `${queryParams}` : ''}`, null, document.querySelector('#viewmonthlycollectionviewform #submit'), 'json', 'GET');
    swal.close(); // Close the loading alert once the request is complete
    document.getElementById('tabledatamonth').innerHTML = `<td colspan="100%" class="text-center opacity-70"> No Records Retrieved </td>`
    did('totalCollectedmonth').innerHTML = '0.00';
    did('totalPaidmonth').innerHTML = '0.00';
    did('totalPenaltymonth').innerHTML = '0.00';
    did('totalRemainingmonth').innerHTML = '0.00';
    if(request.status) {
        if(request.data.length) {
            did('tabledatamonth').innerHTML = request.data.map((data, i)=>`
                <tr>
                    <td>${formatDate(data.day)}</td>
                    <td>${formatNumber(data.noofcollections)}</td>
                    <td style="color: ${data.amountcollected > 0 ? 'green' : 'inherit'};">${formatCurrency(data.amountcollected)}</td>
                    <td style="color: ${data.remitted > 0 ? 'blue' : 'inherit'};">${formatCurrency(data.remitted)}</td>
                    <td style="color: ${data.penalty > 0 ? 'red' : 'inherit'};">${formatCurrency(data.penalty)}</td>
                    <td style="color: ${data.excess > 0 ? 'purple' : 'inherit'};">${formatCurrency(data.excess)}</td>
                    <td style="color: ${data.tobalance > 0 ? 'orange' : 'inherit'};">${formatCurrency(data.tobalance)}</td>
                    <td class="flex items-center gap-3 hidden">
                        <button title="View Transactions" onclick="viewcollectionviewdaily('${data.tobalance}')" class="material-symbols-outlined rounded-full bg-orange-600 h-8 w-8 text-white drop-shadow-md text-xs" style="font-size: 18px;">receipt_long</button>
                    </td>
                </tr>`
            ).join('')
                did('numbercollectionsmonth').innerHTML = request.totals.totalNoOfCollections;
                did('totalCollectedmonth').innerHTML = formatCurrency(request.totals.totalAmountCollected);
                did('totalPaidmonth').innerHTML = formatCurrency(request.totals.totalRemitted);
                did('totalPenaltymonth').innerHTML = formatCurrency(request.totals.totalPenalty);
                did('excessmonth').innerHTML = formatCurrency(request.totals.totalExcess);
                did('totalRemainingmonth').innerHTML = formatCurrency(request.totals.totalToBalance);
            }
    } else {
        return notification('No records retrieved');
    }
}

async function fetchcollectionyearview() {
    if(!validateForm('viewyearlycollectionviewform', getIdFromCls('comp'))) return notification('Please enter the day you want to check for', 0)
    // Show loading state using SweetAlert
    const loadingAlert = Swal.fire({
        title: 'Please wait...',
        text: 'Fetching monthly collection data, please wait.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    did('totalCollectedyear').innerHTML = 'Loading...';
    did('totalPaidyear').innerHTML = 'Loading...';
    did('totalPenaltyyear').innerHTML = 'Loading...';
    did('totalRemainingyear').innerHTML = 'Loading...'; 
    did('numbercollectionsyear').innerHTML = 'Loading...';
    did('excessyear').innerHTML = 'Loading...';    


    let form = document.querySelector('#viewyearlycollectionviewform');
    let formData = new FormData(form);
    // formData.set('department', '');
    // formData.set('collection', '');
    let queryParams = new URLSearchParams(formData).toString();

    document.getElementById('tabledata4').innerHTML = `<td colspan="100%" class="text-center opacity-70"> Loading... </td>`

    let request = await httpRequest2(`api/v1/transactions/viewcollectionsfortheyear?${queryParams ? `${queryParams}` : ''}`, null, document.querySelector('#viewyearlycollectionviewform #submit'), 'json', 'GET');
    swal.close(); // Close the loading alert once the request is complete
    document.getElementById('tabledata4').innerHTML = `<td colspan="100%" class="text-center opacity-70"> No Records Retrieved </td>`
    did('totalCollectedyear').innerHTML = '0.00';
    did('totalPaidyear').innerHTML = '0.00';
    did('totalPenaltyyear').innerHTML = '0.00';
    did('totalRemainingyear').innerHTML = '0.00';
    if(request.status) {
        if(request.data.length) {
            did('tabledata4').innerHTML = request.data.map((data, i)=>`
                <tr>
                    <td>${data.month}</td>
                    <td>${formatNumber(data.noofcollections)}</td>
                    <td style="color: ${data.amountcollected > 0 ? 'green' : 'inherit'};">${formatCurrency(data.amountcollected)}</td>
                    <td style="color: ${data.remitted > 0 ? 'blue' : 'inherit'};">${formatCurrency(data.remitted)}</td>
                    <td style="color: ${data.penalty > 0 ? 'red' : 'inherit'};">${formatCurrency(data.penalty)}</td>
                    <td style="color: ${data.excess > 0 ? 'purple' : 'inherit'};">${formatCurrency(data.excess)}</td>
                    <td style="color: ${data.tobalance > 0 ? 'orange' : 'inherit'};">${formatCurrency(data.tobalance)}</td>
                </tr>`
            ).join('')
                did('numbercollectionsyear').innerHTML = request.totals.totalNoOfCollections;
                did('totalCollectedyear').innerHTML = formatCurrency(request.totals.totalAmountCollected);
                did('totalPaidyear').innerHTML = formatCurrency(request.totals.totalRemitted);
                did('totalPenaltyyear').innerHTML = formatCurrency(request.totals.totalPenalty);
                did('excessyear').innerHTML = formatCurrency(request.totals.totalExcess);
                did('totalRemainingyear').innerHTML = formatCurrency(request.totals.totalToBalance);
            }
    } else {
        return notification('No records retrieved');
    }
}

async function viewcollectionviewdaily(depositcode) {
    const thedata = datasource.find(item => item.depositcode == depositcode);
    
    if (!thedata) {
        Swal.fire({
            icon: 'error',
            title: 'Collection View Not Found',
            text: `No collection view found with Reference ${depositcode}.`,
        });
        return;
    }

    const transactionDetails = thedata.transactions.map((transaction, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${transaction.accountnumber}</td>
            <td>${transaction.accountname}</td>
            <td>${transaction.accounttype}</td>
            <td>${transaction.tfrom}</td>
            <td>${formatCurrency(transaction.credit)}</td>
        </tr>
    `).join('');

    const htmlContent = `
        <div class="summary-card bg-white shadow-md rounded-lg p-6 mb-6">
            <div class="summary-header mb-3">
                <h2 class="text-xl font-semibold text-gray-800 flex gap-6">Summary </h2> 
                <p class="text-xs text-purple-500 italic">If you have excess, please inform your manager to resolve the issue.</p>
                <p class="text-xs text-red-500 italic">Note: Penalty is charged for incomplete remittance every 2 days.</p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div class="summary-item bg-gradient-to-r from-blue-400 to-purple-500 p-3 rounded-md shadow-sm">
                <h3 class="text-sm font-medium text-white mb-1">Full Name</h3>
                <p class="text-white text-2xl font-semibold">${thedata.fullname}</p>
            </div>
            <div class="summary-item bg-gradient-to-r from-green-400 to-teal-500 p-3 rounded-md shadow-sm">
                <h3 class="text-sm font-medium text-white mb-1">Branch Name</h3>
                <p class="text-white text-2xl font-semibold">${thedata.branchname}</p>
            </div>
            <div class="summary-item bg-gradient-to-r from-yellow-400 to-orange-500 p-3 rounded-md shadow-sm">
                <h3 class="text-sm font-medium text-white mb-1">Registration Point Name</h3>
                <p class="text-white text-2xl font-semibold">${thedata.registrationpointname}</p>
            </div>
                <div class="summary-item bg-gray-50 p-3 rounded-md shadow-sm">
                    <h3 class="text-sm font-medium text-gray-600 mb-1">Total Collected</h3>
                    <p class="text-green-500 text-2xl font-semibold">${formatCurrency(thedata.collected)}</p>
                </div>
                <div class="summary-item bg-gray-50 p-3 rounded-md shadow-sm">
                    <h3 class="text-sm font-medium text-gray-600 mb-1">Total Remitted</h3>
                    <p class="text-blue-500 text-2xl font-semibold">${formatCurrency(thedata.remitted)}</p>
                </div>
                <div class="summary-item bg-gray-50 p-3 rounded-md shadow-sm">
                    <h3 class="text-sm font-medium text-gray-600 mb-1">Total Penalty</h3>
                    <p class="text-red-500 text-2xl font-semibold">${formatCurrency(thedata.penalty)}</p>
                </div>
                <div class="summary-item bg-gray-50 p-3 rounded-md shadow-sm">
                    <h3 class="text-sm font-medium text-gray-600 mb-1">Total Remaining to be Remitted</h3>
                    <p class="text-yellow-500 text-2xl font-semibold">${formatCurrency(thedata.balance)}</p>
                </div>
                <div class="summary-item bg-gray-50 p-3 rounded-md shadow-sm">
                    <h3 class="text-sm font-medium text-gray-600 mb-1">Excess</h3>
                    <p class="text-purple-500 text-2xl font-semibold">${formatCurrency(thedata.excess)}</p>
                </div>
                <div class="summary-item bg-gray-50 p-3 rounded-md shadow-sm">
                    <h3 class="text-sm font-medium text-gray-600 mb-1">Deposit Code</h3>
                    <p class="text-gray-700 text-2xl font-semibold cursor-pointer" id="depositCode" onclick="copyToClipboard(this)">${thedata.depositcode}</p>
                </div>
                
            </div>
        </div>
        <div class="table-content">
            <table class="table-auto w-full text-sm text-left">
                <thead>
                    <tr>
                        <th style="width: 10px">s/n</th>
                        <th>Account Number</th>
                        <th>Account Name</th>
                        <th>Account Type</th>
                        <th>From</th>
                        <th>Credit</th>
                    </tr>
                </thead>
                <tbody>
                    ${transactionDetails || `
                        <tr>
                            <td colspan="100%" class="text-center opacity-70">Table is empty</td>
                        </tr>
                    `}
                </tbody>
            </table>
        </div>
    `;

    Swal.fire({
        title: 'Collection View Details',
        html: htmlContent,
        width: '80%',
        showCloseButton: true,
        focusConfirm: false,
        confirmButtonColor: '#3085d6'
    });
}



async function removecollectionview(id) {
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
        fetchcollectionview();
        return notification(confirmed.value.message);
    }
}


async function oncollectionviewTableDataSignal() {
    let rows = getSignaledDatasource().map((item, index) => `
    <tr>
        <td>${index + 1}</td>
        <td>${item.collectionview}</td>
        <td>${item.useridname??item.userid}</td>
        <td>${item.country}</td>
        <td>${item.state}</td>
        <td>${item.lga}</td>
        <td>${item.address}</td>
        <td class="flex items-center gap-3 ${item.collectionview == default_collectionview ? 'hidden' : ''}">
            <button title="Edit row entry" onclick="fetchcollectionview('${item.id}')" class="material-symbols-outlined rounded-full bg-primary-g h-8 w-8 text-white drop-shadow-md text-xs" style="font-size: 18px;">edit</button>
            <button title="Delete row entry" onclick="removecollectionview('${item.id}')" class="hidden material-symbols-outlined rounded-full bg-red-600 h-8 w-8 text-white drop-shadow-md text-xs" style="font-size: 18px;">delete</button>
        </td>
    </tr>`
    )
    .join('')
    injectPaginatatedTable(rows)
}

async function collectionviewFormSubmitHandler() {
    if(!validateForm('collectionviewform', getIdFromCls('comp'))) return
    
    let payload = getFormData2(document.querySelector('#collectionviewform'), collectionviewid ? [['id', collectionviewid]] : null);

    const confirmed = await Swal.fire({
        title: collectionviewid ? 'Updating...' : 'Submitting...',
        text: 'Please wait while we submit your data.',
        icon: 'info',
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: async () => {
            Swal.showLoading();
            let request = await httpRequest2('api/v1/admin/collectionview', payload, document.querySelector('#collectionviewform #submit'), 'json', 'POST');
            Swal.close();

            if (request.status) {
                notification('Success!', 1);
                const form = document.querySelector('#collectionviewform');
                form.reset();
                if(collectionviewid)form.querySelectorAll('input, select, textarea').forEach(input => input.value = '');
                collectionviewid = '';
                document.getElementsByClassName('viewer')[0].click();
                fetchcollectionview();
            } else {    
                notification(request.message, 0);
            }
        }
    });
}
