let collectionid
async function collectionActive() {
    dynamiccomma(true)
    
    collectionid = ''
    const form = document.querySelector('#collectionform')
    const form2 = document.querySelector('#viewcollectionform')
    const form3 = document.querySelector('#viewmonthlycollectionform')
    const form4 = document.querySelector('#viewyearlycollectionform')
    if(form.querySelector('#submit')) form.querySelector('#submit').addEventListener('click', collectionFormSubmitHandler)
    if(form2.querySelector('#querySubmit')) form2.querySelector('#querySubmit').addEventListener('click', fetchcollection)
    if(form3.querySelector('#querySubmit2')) form3.querySelector('#querySubmit2').addEventListener('click', fetchmonthlycollection)
    if(form4.querySelector('#querySubmit3')) form4.querySelector('#querySubmit3').addEventListener('click', fetchyearlycollection)
        datasource = []
    await getAllbranch(true);
    await getAllUsers('userid', 'staff')
    new TomSelect('#branch', {
        plugins: ['dropdown_input'],
        onInitialize: function() {
            console.log(checkpermission('FILTER BRANCH'))
            if(!checkpermission('FILTER BRANCH')) this.setValue(the_user.branch);
            if(!checkpermission('FILTER BRANCH')) this.setTextboxValue('readonly', true);
        }
    });
    new TomSelect('#userid', {
        plugins: ['dropdown_input'],
        onInitialize: function() {
            console.log(checkpermission('FILTER STAFF'))
            if(!checkpermission('FILTER STAFF')) this.setValue(the_user.id);
            if(!checkpermission('FILTER STAFF')) this.setTextboxValue('readonly', true);
        }
    });
    // await fetchcollection()
    // await getAllcollection(true)
    // new TomSelect('#collection', {
    //     // plugins: ['remove_button'],
    //     onInitialize: function() {
    //         console.log(checkpermission('FILTER collection'))
    //         if(!checkpermission('FILTER collection')) this.setValue(the_user.collection);
            // if(!checkpermission('FILTER collection')) this.setTextboxValue('readonly', true);
    //     }
    // });
    // await getAllUsers('useridlist', 'id')
}

async function fetchcollection() {
    if(!validateForm('viewcollectionform', getIdFromCls('comp'))) return notification('Please enter the day you want to check for', 0)
    // Show loading state using SweetAlert
    const loadingAlert = Swal.fire({
        title: 'Please wait...',
        text: 'Fetching collection data, please wait.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    did('totalCollected').innerHTML = 'Loading...';
    did('totalPaid').innerHTML = 'Loading...';
    did('totalPenalty').innerHTML = 'Loading...';
    did('totalRemaining').innerHTML = 'Loading...'; 
    did('depositCode').innerHTML = 'Loading...';
    did('numbercollections').innerHTML = 'Loading...';

    let form = document.querySelector('#viewcollectionform');
    let formData = new FormData(form);
    // formData.set('department', '');
    // formData.set('collection', '');
    let queryParams = new URLSearchParams(formData).toString();

    document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> Loading... </td>`
    const today = new Date(did('transactiondate').value);
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(today.getDate()).padStart(2, '0');
    const dateString = `${year}${month}${day}`;

    let request = await httpRequest2(`api/v1/transactions?status=ACTIVE&userid=${the_user.id}&tfrom=CASH&cashref=CR-${dateString}`+'-'+the_user.id, null, document.querySelector('#viewcollectionform #submit'), 'json', 'GET');
    swal.close(); // Close the loading alert once the request is complete
    document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> No Records Retrieved </td>`
    did('totalCollected').innerHTML = '0.00';
    did('totalPaid').innerHTML = '0.00';
    did('totalPenalty').innerHTML = '0.00';
    did('totalRemaining').innerHTML = '0.00';
    did('depositCode').innerHTML = 'N/A';
    did('numbercollections').innerHTML = '0';
    if(request.status) {
        if(request.data.length) {
                let request2 = await httpRequest2(`api/v1/transactions/bank?transactionref=${request.data[0].cashref}`, null, document.querySelector('#viewrequisitionform #submit'), 'json', 'GET');
                datasource = request.data.filter(data=>data.accountnumber != organisationSettings.default_cash_account)
                request.data = request.data.filter(data=>data.accountnumber != organisationSettings.default_cash_account)
                resolvePagination(datasource, oncollectionTableDataSignal);
                const collected = request.data.reduce((sum, data) => sum + Number(data.credit), 0);
                const paidfrompersonnalaccount = request.data.reduce((sum, data) => sum + Number(data.debit), 0);
                did('numbercollections').innerHTML = request.data.length;
                did('totalCollected').innerHTML = formatCurrency(collected);
                did('totalPaid').innerHTML = formatCurrency(0);
                did('totalRemaining').innerHTML = formatCurrency(0);
                did('excess').innerHTML = formatCurrency(0);
                if(request2.status){
                    let bankpayment = 0;
                    if(request2.data.length){
                        bankpayment = request2.data.reduce((sum, data) => {
                            const credit = parseFloat(data.credit) || 0;
                            const debit = parseFloat(data.debit) || 0;
                            return sum + (credit - debit);
                        }, 0);
                    }
                    did('totalPaid').innerHTML = formatCurrency(parseFloat(bankpayment)+parseFloat(paidfrompersonnalaccount));
                    const totalRemaining = parseFloat(collected) - parseFloat(bankpayment) - parseFloat(paidfrompersonnalaccount);
                    console.log(collected, bankpayment, paidfrompersonnalaccount, totalRemaining)
                    if (totalRemaining < 0) {
                        did('excess').innerHTML = formatCurrency(Math.abs(totalRemaining));
                        did('totalRemaining').innerHTML = formatCurrency(0);
                    } else {
                        did('totalRemaining').innerHTML = formatCurrency(totalRemaining);
                    }
                }
                did('totalPenalty').innerHTML = formatCurrency(0);
                let request3 = await httpRequest2(`api/v1/transactions?cashref=${request.data[0].cashref}-P`, null, document.querySelector('#viewrequisitionform #submit'), 'json', 'GET');
                if(request3.status){
                    if(request3.data.length){
                        const penaltybalance = request3.data.reduce((sum, data) => {
                            const credit = parseFloat(data.credit) || 0;
                            const debit = parseFloat(data.debit) || 0;
                            return sum + (debit - credit);
                        }, 0);
                        did('totalPenalty').innerHTML = formatCurrency(penaltybalance);
                    }
                }
                did('depositCode').innerHTML = request.data[0].cashref;
            }
    } else {
        return notification('No records retrieved');
    }
}

async function fetchmonthlycollection() {
    if(!validateForm('viewmonthlycollectionform', getIdFromCls('comp'))) return notification('Please enter the day you want to check for', 0)
    // Show loading state using SweetAlert
    const loadingAlert = Swal.fire({
        title: 'Please wait...',
        text: 'Fetching monthly collection data, please wait.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    did('totalCollected2').innerHTML = 'Loading...';
    did('totalPaid2').innerHTML = 'Loading...';
    did('totalPenalty2').innerHTML = 'Loading...';
    did('totalRemaining2').innerHTML = 'Loading...'; 
    did('numbercollections2').innerHTML = 'Loading...';
    did('excess2').innerHTML = 'Loading...';    


    let form = document.querySelector('#viewmonthlycollectionform');
    let formData = new FormData(form);
    // formData.set('department', '');
    // formData.set('collection', '');
    let queryParams = new URLSearchParams(formData).toString();

    document.getElementById('tabledata3').innerHTML = `<td colspan="100%" class="text-center opacity-70"> Loading... </td>`

    let request = await httpRequest2(`api/v1/transactions/collection/usermonthly?userid=${the_user.id}&${queryParams ? `${queryParams}` : ''}`, null, document.querySelector('#viewmonthlycollectionform #submit'), 'json', 'GET');
    swal.close(); // Close the loading alert once the request is complete
    document.getElementById('tabledata3').innerHTML = `<td colspan="100%" class="text-center opacity-70"> No Records Retrieved </td>`
    did('totalCollected2').innerHTML = '0.00';
    did('totalPaid2').innerHTML = '0.00';
    did('totalPenalty2').innerHTML = '0.00';
    did('totalRemaining2').innerHTML = '0.00';
    if(request.status) {
        if(request.data.length) {
            did('tabledata3').innerHTML = request.data.map((data, i)=>`
                <tr>
                    <td>${formatDate(data.day)}</td>
                    <td>${formatNumber(data.noofcollections)}</td>
                    <td style="color: ${data.amountcollected > 0 ? 'green' : 'inherit'};">${formatCurrency(data.amountcollected)}</td>
                    <td style="color: ${data.remitted > 0 ? 'blue' : 'inherit'};">${formatCurrency(data.remitted)}</td>
                    <td style="color: ${data.penalty > 0 ? 'red' : 'inherit'};">${formatCurrency(data.penalty)}</td>
                    <td style="color: ${data.excess > 0 ? 'purple' : 'inherit'};">${formatCurrency(data.excess)}</td>
                    <td style="color: ${data.tobalance > 0 ? 'orange' : 'inherit'};">${formatCurrency(data.tobalance)}</td>
                </tr>`
            ).join('')
                did('numbercollections2').innerHTML = request.totals.totalNoOfCollections;
                did('totalCollected2').innerHTML = formatCurrency(request.totals.totalAmountCollected);
                did('totalPaid2').innerHTML = formatCurrency(request.totals.totalRemitted);
                did('totalPenalty2').innerHTML = formatCurrency(request.totals.totalPenalty);
                did('excess2').innerHTML = formatCurrency(request.totals.totalExcess);
                did('totalRemaining2').innerHTML = formatCurrency(request.totals.totalToBalance);
            }
    } else {
        return notification('No records retrieved');
    }
}

async function fetchyearlycollection() {
    if(!validateForm('viewyearlycollectionform', getIdFromCls('comp'))) return notification('Please enter the day you want to check for', 0)
    // Show loading state using SweetAlert
    const loadingAlert = Swal.fire({
        title: 'Please wait...',
        text: 'Fetching monthly collection data, please wait.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    did('totalCollected3').innerHTML = 'Loading...';
    did('totalPaid3').innerHTML = 'Loading...';
    did('totalPenalty3').innerHTML = 'Loading...';
    did('totalRemaining3').innerHTML = 'Loading...'; 
    did('numbercollections3').innerHTML = 'Loading...';
    did('excess3').innerHTML = 'Loading...';    


    let form = document.querySelector('#viewyearlycollectionform');
    let formData = new FormData(form);
    // formData.set('department', '');
    // formData.set('collection', '');
    let queryParams = new URLSearchParams(formData).toString();

    document.getElementById('tabledata4').innerHTML = `<td colspan="100%" class="text-center opacity-70"> Loading... </td>`

    let request = await httpRequest2(`api/v1/transactions/collection/useryearly?userid=${the_user.id}&${queryParams ? `${queryParams}` : ''}`, null, document.querySelector('#viewyearlycollectionform #submit'), 'json', 'GET');
    swal.close(); // Close the loading alert once the request is complete
    document.getElementById('tabledata4').innerHTML = `<td colspan="100%" class="text-center opacity-70"> No Records Retrieved </td>`
    did('totalCollected3').innerHTML = '0.00';
    did('totalPaid3').innerHTML = '0.00';
    did('totalPenalty3').innerHTML = '0.00';
    did('totalRemaining3').innerHTML = '0.00';
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
                did('numbercollections3').innerHTML = request.totals.totalNoOfCollections;
                did('totalCollected3').innerHTML = formatCurrency(request.totals.totalAmountCollected);
                did('totalPaid3').innerHTML = formatCurrency(request.totals.totalRemitted);
                did('totalPenalty3').innerHTML = formatCurrency(request.totals.totalPenalty);
                did('excess3').innerHTML = formatCurrency(request.totals.totalExcess);
                did('totalRemaining3').innerHTML = formatCurrency(request.totals.totalToBalance);
            }
    } else {
        return notification('No records retrieved');
    }
}

async function getaccounttype(el) {
    const id = el.id.split('-')[1]; 
    did('accounttype-'+id).innerHTML = 'Loading...';
    did('accountname-'+id).innerHTML = 'Loading...'; 
    did('accountnumb-'+id).innerHTML = 'Loading...';
    let request = await httpRequest2(`api/v1/transactions/getaccounttype?accountnumber=${el.value}`, null, null, 'json', 'GET');
    if(request.status) {
            document.getElementById('accounttype-'+id).innerHTML = request.data.accounttype;
            document.getElementById('accountname-'+id).innerHTML = request.data.accountname;
            did('accountnumb-'+id).innerHTML = request.data.accountnumber;
    } else {
        did('accounttype-'+id).innerHTML = '-';
        did('accountname-'+id).innerHTML = '-';
        did('accountnumb-'+id).innerHTML = '-';
        return notification('No records retrieved');
    }
}

function addcollectionrow(event) {
    event.preventDefault();
    const id = Math.floor(Math.random() * 100000000);
    const element = document.createElement('tr');
    element.classList.add('accrow')
    element.id = 'row-' + id;
    element.innerHTML = `
            <td class="text-center relative opacity-70">
              <div class="relative">
                <input type="text" style="width: 160px;" id="accountnumber-${id}" placeholder="Enter account number" class="form-control " onkeydown="if(event.key === 'Enter'){event.preventDefault();getaccounttype(this)}" />
                <button type="button" onclick="getaccounttype(this.previousElementSibling)" class="btn-small absolute right-2 scale-[1.5] top-0 mt-2 ml-2 hover:scale-[1.7] hover:content-['🔍'] active:animate-bounce">🔍</button>
              </div>
            </td>
            <td class="text-center">
              <label class="hidden" for="accountnumb-${id}">Account Number</label>
              <p class="text-center text-md compulsory accountnumber" style="width: 130px;" id="accountnumb-${id}">-</p>
            </td>
            <td class="text-center">
              <label class="hidden" for="accountname-${id}">Account Name</label>
              <p class="text-center text-md compulsory accountname" style="width: 130px;" id="accountname-${id}">-</p>
            </td>
            <td class="text-center">
              <label class="hidden" for="accounttype-${id}">Account Type</label>
              <p class="text-center text-md compulsory accounttype" style="width: 130px;" id="accounttype-${id}">-</p>
            </td>
            <td class="text-center opacity-70">
              <select class="form-control" style="width: 150px;" id="tfrom-${id}" name="tfrom">
                <option value="CASH">CASH</option>
              </select>
            </td>
            <td class="text-center opacity-70">
              <label class="hidden">Credit Amount</label>
              <input type="text" placeholder="Enter credit amount" style="width: 130px;" id="credit-${id}" class="form-control credit comma comp" />
            </td>
            <td class="flex items-center gap-3" >
              <button title="Add row entry" onclick="addcollectionrow(event)" class="material-symbols-outlined rounded-full bg-green-600 h-8 w-8 text-white drop-shadow-md text-xs" style="font-size: 18px;"><div class="btnloader" style="display: none;"></div>add</button>
              <button title="Delete row entry" onclick="did('row-${id}').remove()" class="material-symbols-outlined rounded-full bg-red-600 h-8 w-8 text-white drop-shadow-md text-xs" style="font-size: 18px;"><div class="btnloader" style="display: none;"></div>remove</button>
          </td>
    `;
    document.querySelector('#tabledata2').appendChild(element);
    dynamiccomma(true);
}


async function oncollectionTableDataSignal() {
    let rows = getSignaledDatasource().map((item, index) => `
    <tr>
        <td>${index + 1}</td>
        <td>${item.accountnumber}</td>
        <td>${item.accountname}</td>
        <td>${item.whichaccount}</td>
        <td>${item.tfrom}</td>
        <td class="text-green-500">${formatCurrency(item.credit)}</td>
    </tr>`
    )
    .join('')
    injectPaginatatedTable(rows)
}

async function collectionFormSubmitHandler() {
    if(!validateForm('collectionform', getIdFromCls('comp'))) return notification('Please ensure all inputs are filled', 0)
        for(let i=0;i<document.getElementsByClassName('compulsory').length;i++){
            if(document.getElementsByClassName('compulsory')[i].innerHTML.length < 2){
                let label = document.getElementsByClassName('compulsory')[i].previousElementSibling.textContent;
                Swal.fire({
                    icon: 'error',
                    title: 'Validation Error',
                    text: `${label} doesn't have a value`,
                    confirmButtonColor: '#3085d6',
                });
                
                return;
            }
        }

        const accountNumbers = Array.from(document.getElementsByClassName('accountnumber')).map(element => element.innerHTML);
        const duplicates = accountNumbers.filter((item, index) => accountNumbers.indexOf(item) !== index);

        if (duplicates.length > 0) {
            Swal.fire({
                icon: 'error',
                title: 'Duplicate Account Number',
                text: `The account number ${duplicates[0]} is duplicated. Please ensure all account numbers are unique.`,
                confirmButtonColor: '#3085d6',
            });
            return;
        }
        
        dynamiccomma(false)

    const tableData = Array.from(document.querySelectorAll('.accrow')).map((row, index) => {
        const accountNumber = row.querySelector('.accountnumber').innerHTML || '-';
        const accountName = row.querySelector('.accountname').innerHTML || '-';
        const accountType = row.querySelector('.accounttype').innerHTML || '-';
        const paymentMethod = row.querySelector('select[name="tfrom"]').value || '-';
        const credit = formatCurrency(row.querySelector('.credit').value || '0');
        
        return `
            <tr>
                <td style="width: 10px">${index + 1}</td>
                <td>${accountNumber}</td>
                <td>${accountName}</td>
                <td>${accountType}</td>
                <td>${paymentMethod}</td>
                <td class="text-green-600 text-lg">${credit}</td>
            </tr>
        `;
    }).join('');

    // Calculate total credit
    const totalCredit = Array.from(document.querySelectorAll('.credit'))
        .reduce((sum, input) => sum + parseFloat(input.value || 0), 0);

    const { isConfirmed } = await Swal.fire({
        title: 'Confirm Transaction Details',
        html: `
            <div class="table-content">
                <table class="table-auto">
                    <thead>
                        <tr>
                            <th class="!text-center" style="width: 10px">S/N</th>
                            <th class="!text-center">Account Number</th>
                            <th class="!text-center">Account Name</th>
                            <th class="!text-center">Account Type</th>
                            <th class="!text-center">Payment Method</th>
                            <th class="!text-center">Credit</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableData}
                        <tr>
                            <td colspan="5" class="text-right font-bold">Total</td>
                            <td class="text-center font-bold">${formatCurrency(totalCredit.toFixed(2))}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        allowOutsideClick: false,
        width: '90%'
    });

    if (!isConfirmed) {
        return dynamiccomma(true);
    }


        const thedata = [
            ['rowsize', document.getElementsByClassName('accrow').length],         
        ]
        for(let i=0;i<document.getElementsByClassName('accountnumber').length;i++) {
            thedata.push([`accountnumber${i+1}`, document.getElementsByClassName('accountnumber')[i].innerHTML],
                    [`credit${i+1}`, document.getElementsByClassName('credit')[i].value]
                )
        }
    let payload = getFormData2(document.querySelector('#collectionform'), thedata);

    const pinStatus = await getAndVerifyPin();
    if(!pinStatus) return;

    const confirmed = await Swal.fire({
        title: collectionid ? 'Updating...' : 'Submitting...',
        text: 'Please wait while we submit your data.',
        icon: 'info',
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: async () => {
            Swal.showLoading();
            let request = await httpRequest2('api/v1/transactions/collection', payload, document.querySelector('#collectionform #submit'), 'json', 'POST');
            Swal.close();

            if (request.status) {
                dynamiccomma(true)
                notification('Success!', 1);
                did('tabledata2').innerHTML = ` <tr id="row-1" class="accrow">
            <td class="text-center relative opacity-70">
              <div class="relative">
                <input type="text" style="width: 160px;" id="accountnumber-1" placeholder="Enter account number" class="form-control" onkeydown="if(event.key === 'Enter'){event.preventDefault();getaccounttype(this)}" />
                <button type="button" onclick="getaccounttype(this.previousElementSibling)" class="btn-small absolute right-2 scale-[1.5] top-0 mt-2 ml-2 hover:scale-[1.7] hover:content-['🔍'] active:animate-bounce">🔍</button>
              </div>
            </td>
            <td class="text-center">
              <label class="hidden" for="accountnumb-1">Account Number</label>
              <p class="text-center text-md compulsory accountnumber" style="width: 130px;" id="accountnumb-1">-</p>
            </td>
            <td class="text-center">
              <label class="hidden" for="accountname-1">Account Name</label>
              <p class="text-center text-md compulsory accountname" style="width: 130px;" id="accountname-1">-</p>
            </td>
            <td class="text-center">
              <label class="hidden" for="accounttype-1">Account Type</label>
              <p class="text-center text-md compulsory accounttype" style="width: 130px;" id="accounttype-1">-</p>
            </td>
            <td class="text-center opacity-70">
              <select class="form-control comp" style="width: 150px;" id="tfrom-1" name="tfrom">
                <!-- <option value="">Payment Method</option> -->
                <option value="CASH">CASH</option>
              </select>
            </td>
            <td class="text-center opacity-70">
              <label class="hidden">Credit Amount</label>
              <input type="text" placeholder="Enter credit amount " style="width: 130px;" id="credit-1" class="form-control credit comp comma" />
            </td>
            <td class="flex items-center gap-3" >
              <button title="Add row entry" onclick="addcollectionrow(event)" class="material-symbols-outlined rounded-full bg-green-600 h-8 w-8 text-white drop-shadow-md text-xs" style="font-size: 18px;"><div class="btnloader" style="display: none;"></div>add</button>
          </td>
          </tr>`
            } else {    
                dynamiccomma(true)
                await Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: request.message,
                    confirmButtonColor: '#d33'
                });
            }
        }
    });
}
