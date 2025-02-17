let savingaccountid
async function savingaccountActive() {
    savingaccountid = ''
    const form = document.querySelector('#savingaccountform')
    if(form.querySelector('#submit')) form.querySelector('#submit').addEventListener('click', savingaccountFormSubmitHandler)
    datasource = []
    did('registrationdate').value = new Date().toISOString().split('T')[0];
    fetchsavingaccount()
    await Promise.all([
        getAllSavingsProducts(),
        getAllbranch(),
        getAllUsers('userid', 'name'),
        getAllUsers('accountofficer', 'name')
    ]);
    new TomSelect('#savingsproductid', {
        plugins: ['dropdown_input'],
        onChange: function() {
            savingshandleproductchangeforcharge(this.getValue())
        }
    });
    new TomSelect('#branch', {
        plugins: ['dropdown_input'],
        onInitialize: function() {
            // if(!checkpermission('FILTER BRANCH')) this.setValue(the_user.branch);
            this.setTextboxValue('readonly', true);
            // if(!checkpermission('FILTER savingaccount')) this.setTextboxValue('disabled', true);
        }   
    });
    new TomSelect('#userid', {
        plugins: ['dropdown_input'], 
        onChange: function() { 
            handlepersonelchange(this.getValue());
         }, 
        onInitialize: function() {
            if(!checkpermission('FILTER ALL USERS')) this.setValue(the_user.id);
            if(!checkpermission('FILTER ALL USERS')) this.setTextboxValue('readonly', true);
        }   
    });
    new TomSelect('#accountofficer', {
        plugins: ['dropdown_input'],
        onInitialize: function() {
            if(!checkpermission('FILTER ALL USERS')) this.setValue(the_user.id);
            if(!checkpermission('FILTER ALL USERS')) this.setTextboxValue('readonly', true);
        }   
    });
    did('member').addEventListener('change', e=>{
        savingshandlememberchange(e.target.value);
    })
    // await fetchsavingaccount()
    // await getAllsavingaccount(true)
    // new TomSelect('#savingaccount', {
    //     // plugins: ['remove_button'],
    //     onInitialize: function() {
    //         console.log(checkpermission('FILTER savingaccount'))
    //         if(!checkpermission('FILTER savingaccount')) this.setValue(the_user.savingaccount);
            // if(!checkpermission('FILTER savingaccount')) this.setTextboxValue('readonly', true);
    //     }
    // });
    // await getAllUsers('useridlist', 'id')
}

function handlepersonelchange(id) {
    const user = userlistdata.data.find(data => data.id == id);
    if (user) {
        const branch = user.branch;
        const branchElement = document.getElementById('branch').tomselect;
        branchElement.setValue(branch);
        branchElement.setTextboxValue('readonly', true);
    }
    console.log('id', id)
    if(!id)return did('memberdetails').classList.add('hidden');
    else did('memberdetails').classList.remove('hidden');
    if (id) {
        did('member').disabled = false; 
        let list = userlistdata.data.filter(data => data.id == id)[0].membership?.filter(data => data.status == 'ACTIVE') || [];
        const element = document.getElementById('member');
        element.innerHTML = `<option value="">--SELECT MEMBER--</option>`;
        element.innerHTML += list.map(data => `<option value="${data.member}">${data.membername}</option>`).join('');
        if(savingaccountid)did('member').disabled = true;
    }
}

function savingshandlememberchange(id) {
    const element = document.getElementById('savingsproductid').tomselect;
    element.setValue('');
    element.clearOptions();

    console.log('id', id)
    if(!id)return did('accountdetails').classList.add('hidden');
    else did('accountdetails').classList.remove('hidden');
    console.log('product', savingsProductData)
    if (id) {
        let list = savingsProductData.data.filter(data => data.membership.split('||').includes(id));
        console.log('list', list);
        element.addOption({value: '', text: '--SELECT SAVINGS PRODUCT--'});
        list.forEach(data => element.addOption({value: data.id, text: data.productname}));
        element.refreshOptions();
    }
}

function savingshandleproductchangeforcharge(id) {
    console.log('theid', id)
    if(!id)return did('registrationcharge').value = '';
    let list = savingsProductData.data.filter(data => data.id == id)[0]
    console.log('lister', list);
    did('registrationcharge').value = list.activationfee;
}

async function fetchsavingaccount(id) {
    if(!id)savingaccountid = '';
    did('accountdetails').classList.add('hidden');
    if(!id)did('accountnumber').value = '';
    for(let i=0; i<document.getElementsByClassName('disa').length; i++){
        const element = document.getElementsByClassName('disa')[i];
        element.readOnly = false;
        if (element.tomselect) {
            element.tomselect.setTextboxValue('readonly', false);
        }
    }
    // Show loading state using SweetAlert
    const loadingAlert = Swal.fire({
        title: 'Please wait...',
        text: 'Fetching saving account data, please wait.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    // let form = document.querySelector('#viewrequisitionform');
    // let formData = new FormData(form);
    // // formData.set('department', '');
    // // formData.set('savingaccount', '');
    // let queryParams = new URLSearchParams(formData).toString();

    if(!id)document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> Loading... </td>`

    let request = await httpRequest2(`api/v1/savings/account?${id ? `id=${id}` : ''}`, null, null, 'json', 'GET');
    // let request = await httpRequest2(`api/v1/inventory/requisition/view?${queryParams ? `${queryParams}` : ''}${id ? `&id=${id}` : ''}`, null, document.querySelector('#viewrequisitionform #submit'), 'json', 'GET');
    swal.close(); // Close the loading alert once the request is complete
    if(!id)document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> No Records Retrieved </td>`
    if(request.status) {
        if(!id){
            if(request.data.length) {
                datasource = request.data
                resolvePagination(datasource, onsavingaccountTableDataSignal);
            }
        } else {
            document.getElementsByClassName('updater')[0].click();
            savingaccountid = request.data[0].id;
            populateData(request.data[0]);
            did('accountdetails').classList.remove('hidden');
            for(let i=0; i<document.getElementsByClassName('disa').length; i++){
                const element = document.getElementsByClassName('disa')[i];
                element.readOnly = true;
                if (element.tomselect) {
                    element.tomselect.setTextboxValue('readonly', true);
                }
            }
        }
    } else {
        return notification('No records retrieved');
    }
}




async function onsavingaccountTableDataSignal() {
    let rows = getSignaledDatasource().map((item, index) => `
    <tr>
        <td>${index + 1}</td>
        <td>${formatDate(item.registrationdate)}</td>
        <td>${item.accountnumber}</td>
        <td>${item.useridname??item.userid}</td>
        <td>${item.savingsproduct??item.savingsproductid}</td>
        <td>${item.membername??item.member}</td>
        <td>${item.branchname??item.branch}</td>
        <td>${item.registrationpointname??' '}</td>
        <td>${formatCurrency(item.registrationcharge)}</td>
        <td>${item.accountofficername??item.accountofficer}</td>
        <td>${item.sms ? 'SMS' : ''} ${item.whatsapp ? 'WhatsApp' : ''} ${item.email ? 'Email' : ''}</td>
        <td class="${item.status === 'ACTIVE' ? 'text-green-600' : 'text-red-600'}">${item.status}</td>
        <td class="flex items-center justify-center gap-3">
                <button title="View Account" onclick="viewsavingaccount('${item.id}')" class="material-symbols-outlined h-8 w-8 rounded-full bg-green-600 text-xs text-white drop-shadow-md" style="font-size: 18px;">visibility</button>
                <button title="Edit row entry" onclick="fetchsavingaccount('${item.id}')" class="material-symbols-outlined h-8 w-8 rounded-full bg-primary-g text-xs text-white drop-shadow-md" style="font-size: 18px;">edit</button>
                <button title="Edit row entry" onclick="generatetransactions('${item.id}')" class="material-symbols-outlined h-8 w-8 rounded-full bg-yellow-600 text-xs text-white drop-shadow-md" style="font-size: 18px;">receipt_long</button>
                <button title="Block Account" onclick="blockandactivatesavingsaccount('${item.id}', 'SUSPENDED')" class="${item.status == 'ACTIVE' ? '' : 'hidden'} material-symbols-outlined rounded-full bg-red-600 h-8 w-8 text-white drop-shadow-md text-xs" style="font-size: 18px;">block</button>
                <button title="Unblock Account" onclick="blockandactivatesavingsaccount('${item.id}', 'ACTIVE')" class="${item.status == 'ACTIVE' ? 'hidden' : ''} material-symbols-outlined rounded-full bg-green-600 h-8 w-8 text-white drop-shadow-md text-xs" style="font-size: 18px;">verified</button>
        </td>
    </tr>`
    )
    .join('')
    injectPaginatatedTable(rows)
}

async function generatetransactions(id) {
    let account = datasource.find(item => item.id == id);

    // Show initial information modal
    const proceed = await Swal.fire({
        title: 'Generate Sample Transactions',
        text: 'You are about to generate sample transactions for this account.',
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Okay',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33'
    });

    if (!proceed.isConfirmed) return; // Close the modal if cancel is clicked

    // Ask for the beginning date
    const { value: startDate } = await Swal.fire({
        title: 'Select Start Date',
        input: 'date',
        inputLabel: 'Please select the beginning date for the transactions:',
        inputAttributes: {
            required: 'required'
        },
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33'
    });

    if (!startDate) return;

    // Ask for the ending date
    const { value: endDate } = await Swal.fire({
        title: 'Select End Date',
        input: 'date',
        inputLabel: 'Please select the ending date for the transactions:',
        inputAttributes: {
            required: 'required'
        },
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33'
    });

    if (!endDate) return;

    // Ask for the number of credits
    const { value: numCredits } = await Swal.fire({
        title: 'Number of Credits',
        input: 'number',
        inputLabel: 'How many credits do you want?',
        inputAttributes: {
            min: 0,
            required: 'required'
        },
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33'
    });

    if (numCredits === null) return;

    // Ask for the number of debits
    const { value: numDebits } = await Swal.fire({
        title: 'Number of Debits',
        input: 'number',
        inputLabel: 'How many debits do you want?',
        inputAttributes: {
            min: 0,
            required: 'required'
        },
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33'
    });

    if (numDebits === null) return;

    // Ask for the total amount to be spent
    const { value: totalAmount } = await Swal.fire({
        title: 'Total Amount',
        input: 'number',
        inputLabel: 'What is the total amount to be spent?',
        inputAttributes: {
            min: 0,
            required: 'required'
        },
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33'
    });

    if (totalAmount === null) return;

    // Prepare data to send to the endpoint
    const requestData = new FormData();
    if (!account.accountnumber || !startDate || !endDate || numCredits === undefined || numDebits === undefined || !totalAmount || !account.userid || !account.branch) {
        notification('Cannot continue, parameters not complete', 0);
        return;
    }

    requestData.append('accountnumber', account.accountnumber);
    requestData.append('startdate', startDate);
    requestData.append('enddate', endDate);
    requestData.append('creditsno', numCredits);
    requestData.append('debitsno', numDebits);
    requestData.append('totalamount', totalAmount);
    requestData.append('userid', account.userid);
    requestData.append('branch', account.branch);

    // Show loading state using SweetAlert
    const loadingAlert = Swal.fire({
        title: 'Please wait...',
        text: 'Generating sample transactions...',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    // Send data to the endpoint
    try {
        let response = await httpRequest2('api/v1/bank/generatetransactions', requestData, null, 'json', 'POST');
        Swal.close(); // Close the loading alert once the request is complete
        if (response.status) {
            Swal.fire({
                title: 'Success',
                text: 'Sample transactions generated successfully!',
                icon: 'success',
                confirmButtonColor: '#3085d6' // Color the okay button
            });
        } else {
            Swal.fire({
                title: 'Error',
                text: 'Failed to generate transactions.',
                icon: 'error',
                confirmButtonColor: '#3085d6' // Color the okay button
            });
        }
    } catch (error) {
        Swal.close(); // Close the loading alert in case of an error
        Swal.fire('Error', 'An unexpected error occurred.', 'error');
    }
}

async function blockandactivatesavingsaccount(id, status) {
  if (status === 'SUSPENDED') {
      let account = datasource.find(item => item.id == id);
        // Show loading for one second
        await Swal.fire({
            title: 'Loading...',
            timer: 1000,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        // Ask for the reason to suspend the account
        const { value: reason } = await Swal.fire({
            title: 'Reason for Suspension',
            input: 'textarea',
            inputLabel: 'Please provide a reason for suspending the account:',
            inputPlaceholder: 'Enter your reason here...',
            inputAttributes: {
                required: 'required'
            },
            showCancelButton: true,
            cancelButtonColor: '#d33',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'Suspend Account',
            showLoaderOnConfirm: true,
            allowOutsideClick: () => !Swal.isLoading()
        });

        if (reason) {
            // Confirm suspension with the reason
            const confirmed = await Swal.fire({
                title: 'Are you sure?',
                html: `Are you sure you want to suspend the account because: "<b class='text-red-600'>${reason}</b>"?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, suspend it!',
                showLoaderOnConfirm: true,
                preConfirm: async () => {
                    let paramstr = new FormData();
                    for (const key in account) {
                      if (account.hasOwnProperty(key)) {
                          paramstr.append(key, account[key]);
                      }
                  }
                    paramstr.set('id', id);
                    paramstr.set('accountnumber', account.accountnumber);
                    paramstr.set('reason', reason);
                    paramstr.set('status', status);

                    let request = await httpRequest2('api/v1/savings/account', paramstr, null, 'json');
                    return request;
                },
                allowOutsideClick: () => !Swal.isLoading()
            });

            if (confirmed.isConfirmed) {
                fetchsavingaccount();
                return notification(confirmed.value.message);
            }
        }
    } else if (status === 'ACTIVE') {
        // Find the reason for suspension from the datasource
        const account = datasource.find(item => item.id == id);
        const reason = account ? account.reason : 'No reason provided';

        // Confirm activation with the reason
        const confirmed = await Swal.fire({
            title: 'Are you sure?',
            html: `This account was suspended because: "<b class='text-red-600'>${reason}</b>". Are you sure you want to activate the account?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, activate it!',
            showLoaderOnConfirm: true,
            preConfirm: async () => {
                let paramstr = new FormData();
                for (const key in account) {
                    if (account.hasOwnProperty(key)) {
                        paramstr.append(key, account[key]);
                    }
                }
                paramstr.set('id', id);
                paramstr.set('status', status);

                let request = await httpRequest2('api/v1/savings/account', paramstr, null, 'json');
                return request;
            },
            allowOutsideClick: () => !Swal.isLoading()
        });

        if (confirmed.isConfirmed) {
            fetchsavingaccount();
            return notification(confirmed.value.message);
        }
    }
}

function viewsavingaccount(id) {
    // 1. Locate the account
    const account = datasource.find(item => item.id == id);
  
    // 2. If the account doesn't exist, show an error
    if (!account) {
      return Swal.fire({
        icon: 'error',
        title: 'Account Not Found',
        text: 'The requested account does not exist or has been removed.',
        confirmButtonText: 'OK'
      });
    }
  
    // 3. Create an HTML snippet with segmented tables
    const accountDetailsHtml = `
      <div style="
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        color: #333;
        margin: 0 auto;
        text-align: left;
        line-height: 1.5;
      ">
        <!-- ====== Account Overview Table ====== -->
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
          <tr style="background-color: #fafafa;">
            <td style="padding: 12px; font-weight: 500;">Account Name</td>
            <td style="padding: 12px;">${account.useridname}</td>
          </tr>
          <tr style="background-color: #fff;">
          <td style="padding: 12px; font-weight: 500;">Account Number</td>
          <td style="padding: 12px;">${account.accountnumber}</td>
          </tr>
          <tr style="background-color: #fafafa;">
            <td style="padding: 12px; width: 35%; font-weight: 500;">Savings Product</td>
            <td style="padding: 12px;">${account.savingsproduct}</td>
          </tr>
            <tr style="background-color: #fff;">
              <td style="padding: 12px; font-weight: 500;">Member Name</td>
              <td style="padding: 12px;">${account.membername}</td>
            </tr>
            <tr style="background-color: #fafafa;">
              <td style="padding: 12px; font-weight: 500;">Branch</td>
              <td style="padding: 12px;">${account.branchname}</td>
            </tr>
            <tr style="background-color: #fff;">
              <td style="padding: 12px; font-weight: 500;">Status</td>
              <td style="padding: 12px;">${account.status}</td>
            </tr>
          </tbody>
        </table>
  
        <!-- Spacing -->
        <div style="height: 20px;"></div>
  
        <!-- ====== Registration Details Table ====== -->
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
            <tr style="background-color: #fafafa;">
              <td style="padding: 12px; width: 35%; font-weight: 500;">Registration Date</td>
              <td style="padding: 12px;">${new Date(account.registrationdate).toDateString()}</td>
            </tr>
            <tr style="background-color: #fff;">
              <td style="padding: 12px; font-weight: 500;">Registration Point</td>
              <td style="padding: 12px;">${account.registrationpointname || 'N/A'}</td>
            </tr>
            <tr style="background-color: #fafafa;">
              <td style="padding: 12px; font-weight: 500;">Description</td>
              <td style="padding: 12px;">${account.registrationdesc || 'N/A'}</td>
            </tr>
            <tr style="background-color: #fff;">
              <td style="padding: 12px; font-weight: 500;">Amount</td>
              <td style="padding: 12px;">${account.amount}</td>
            </tr>
            <tr style="background-color: #fafafa;">
              <td style="padding: 12px; font-weight: 500;">Registration Charge</td>
              <td style="padding: 12px;">${account.registrationcharge}</td>
            </tr>
          </tbody>
        </table>
  
        <!-- Spacing -->
        <div style="height: 20px;"></div>
  
        <!-- ====== Bank Details Table ====== -->
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
            <tr style="background-color: #fafafa;">
              <td style="padding: 12px; width: 35%; font-weight: 500;">Bank Name 1</td>
              <td style="padding: 12px;">${account.bankname1 || 'N/A'}</td>
            </tr>
            <tr style="background-color: #fff;">
              <td style="padding: 12px; font-weight: 500;">Bank Account Name 1</td>
              <td style="padding: 12px;">${account.bankaccountname1 || 'N/A'}</td>
            </tr>
            <tr style="background-color: #fafafa;">
              <td style="padding: 12px; font-weight: 500;">Bank Account Number 1</td>
              <td style="padding: 12px;">${account.bankaccountnumber1 || 'N/A'}</td>
            </tr>
            <tr style="background-color: #fff;">
              <td style="padding: 12px; font-weight: 500;">Bank Name 2</td>
              <td style="padding: 12px;">${account.bankname2 || 'N/A'}</td>
            </tr>
            <tr style="background-color: #fafafa;">
              <td style="padding: 12px; font-weight: 500;">Bank Account Name 2</td>
              <td style="padding: 12px;">${account.bankaccountname2 || 'N/A'}</td>
            </tr>
            <tr style="background-color: #fff;">
              <td style="padding: 12px; font-weight: 500;">Bank Account Number 2</td>
              <td style="padding: 12px;">${account.bankaccountnumber2 || 'N/A'}</td>
            </tr>
          </tbody>
        </table>
  
        <!-- Spacing -->
        <div style="height: 20px;"></div>
  
        <!-- ====== Contact Preferences Table ====== -->
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
            <tr style="background-color: #fafafa;">
              <td style="padding: 12px; width: 35%; font-weight: 500;">Email</td>
              <td style="padding: 12px;">${account.email ? 'Yes' : 'No'}</td>
            </tr>
            <tr style="background-color: #fff;">
              <td style="padding: 12px; font-weight: 500;">SMS</td>
              <td style="padding: 12px;">${account.sms ? 'Yes' : 'No'}</td>
            </tr>
            <tr style="background-color: #fafafa;">
              <td style="padding: 12px; font-weight: 500;">WhatsApp</td>
              <td style="padding: 12px;">${account.whatsapp ? 'Yes' : 'No'}</td>
            </tr>
          </tbody>
        </table>
  
        <!-- Spacing -->
        <div style="height: 20px;"></div>
  
        <!-- ====== Account Officer Table ====== -->
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
            <tr style="background-color: #fafafa;">
              <td style="padding: 12px; width: 35%; font-weight: 500;">Account Officer Name</td>
              <td style="padding: 12px;">${account.accountofficername}</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  
    // 4. Present the SweetAlert2 modal
    Swal.fire({
      title: 'Account Details',
      html: accountDetailsHtml,
    //   icon: 'info',
      width: 700,
      showCloseButton: true,
      showConfirmButton: true,
      confirmButtonText: 'Close',
      confirmButtonColor: '#3085d6',
      background: '#fff',
      customClass: {
        popup: 'modern-swal-popup', // define .modern-swal-popup in your CSS if desired
      }
    });
  }
  
  
  

async function savingaccountFormSubmitHandler() {
    if(!validateForm('savingaccountform', getIdFromCls('comp'))) return
    
    let payload = getFormData2(document.querySelector('#savingaccountform'), savingaccountid ? [['id', savingaccountid], ['amount', did('registrationcharge').value]] : [['amount', did('registrationcharge').value]]);

    const confirmed = await Swal.fire({
        title: savingaccountid ? 'Updating...' : 'Submitting...',
        text: 'Please wait while we submit your data.',
        icon: 'info',
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: async () => {
            Swal.showLoading();
            let request = await httpRequest2('api/v1/savings/account', payload, document.querySelector('#savingaccountform #submit'), 'json', 'POST');
            Swal.close();

            if (request.status) {
                notification('Success!', 1);
                const form = document.querySelector('#savingaccountform');
                form.reset();
                if(savingaccountid)form.querySelectorAll('input, select, textarea').forEach(input => input.value = '');
                savingaccountid = '';
                document.getElementsByClassName('viewer')[0].click();
                fetchsavingaccount();
            } else {    
                notification(request.message, 0);
            }
        }
    });
}
