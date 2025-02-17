let allocateexpenditureid
let expensebalance
let expensedata
async function allocateexpenditureActive() {
    dynamiccomma(true)
    allocateexpenditureid = ''
    const form = document.querySelector('#allocateexpenditureform')
    // const form2 = document.querySelector('#viewallocateexpenditureform')
    if(form.querySelector('#submit')) form.querySelector('#submit').addEventListener('click', allocateexpenditureFormSubmitHandler)
    if(document.querySelector('#querySubmit')) document.querySelector('#querySubmit').addEventListener('click', e=>fetchallocateexpenditure('viewallocateexpenditureForm'))
    if(document.querySelector('#querySubmit2')) document.querySelector('#querySubmit2').addEventListener('click', e=>fetchallocateexpenditure('viewallocateexpenditureFormdraft'))
    datasource = []
    await getAllUsers('userid', 'staff')
    await getAllUsers('userid1', 'staff')
    await getAllUsers('userid2', 'staff')
    await getAllbranch(!checkpermission('FILTER BRANCH'), 'branch')
    await new TomSelect('#userid', {
        plugins: ['dropdown_input'],
        onInitialize: function() {
            console.log(checkpermission('FILTER ALL USERS'))
            if(!checkpermission('FILTER ALL USERS')) this.setValue(the_user.id);
            if(!checkpermission('FILTER ALL USERS')) this.setTextboxValue('readonly', true);
        }
    });
    await new TomSelect('#userid1', {
        plugins: ['dropdown_input'],
        onInitialize: function() {
            console.log(checkpermission('FILTER ALL USERS'))
            if(!checkpermission('FILTER ALL USERS')) this.setValue(the_user.id);
            if(!checkpermission('FILTER ALL USERS')) this.setTextboxValue('readonly', true);
        }
    });
    await new TomSelect('#userid2', {
        plugins: ['dropdown_input'],
        onInitialize: function() {
            console.log(checkpermission('FILTER ALL USERS'))
            if(!checkpermission('FILTER ALL USERS')) this.setValue(the_user.id);
            if(!checkpermission('FILTER ALL USERS')) this.setTextboxValue('readonly', true);
        }
    });
    await new TomSelect('#branch', {
        plugins: ['dropdown_input'],
        onInitialize: function() {
            console.log(checkpermission('FILTER ALL BRANCH'))
            if(!checkpermission('FILTER ALL BRANCH')) this.setValue(the_user.branch);
            if(!checkpermission('FILTER ALL BRANCH')) this.setTextboxValue('readonly', true);
        }
    });

    // await fetchallocateexpenditureexpensebalance()
    await fetchallocateexpenditure()
    // await getAllallocateexpenditure(true)
    // new TomSelect('#allocateexpenditure', {
    //     // plugins: ['remove_button'],
    //     onInitialize: function() {
    //         console.log(checkpermission('FILTER allocateexpenditure'))
    //         if(!checkpermission('FILTER allocateexpenditure')) this.setValue(the_user.allocateexpenditure);
            // if(!checkpermission('FILTER allocateexpenditure')) this.setTextboxValue('readonly', true);
    //     }
    // });
}

async function fetchallocateexpenditureexpensebalance() {

    let request = await httpRequest2(`api/v1/transactions/balance?accountnumber=${organisationSettings.default_expense_account}&status=ACTIVE`, null, null, 'json', 'GET');
    swal.close(); // Close the loading alert once the request is complete
    if(request.status) {
            did('expensebalance').innerHTML = formatCurrency(request.data.balance)
            expensebalance = request.data.balance
    } else {
        did('expensebalance').innerHTML = 'Failed to get balance'
        return notification('No records retrieved');
    }
}

async function fetchallocateexpenditure(id) {
    fetchallocateexpenditureexpensebalance()
    // Show loading state using SweetAlert
    const loadingAlert = Swal.fire({
        title: 'Please wait...',
        text: 'Fetching allocateexpenditure data, please wait.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    let form = document.querySelector('#viewallocateexpenditureForm');
    let formData = new FormData(form);
    // formData.set('department', '');
    // formData.set('allocateexpenditure', '');
    let queryParams = new URLSearchParams(formData).toString();

    document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> Loading... </td>`
    document.getElementById('tabledata2').innerHTML = `<td colspan="100%" class="text-center opacity-70"> Loading... </td>`

    // let request = await httpRequest2(`api/v1/expense/allocate?${id ? `&id=${id}` : ''}`, null, document.querySelector('#viewrequisitionform #submit'), 'json', 'GET');
    let request = await httpRequest2(`api/v1/expense/allocate?${queryParams ? `${queryParams}` : ''}${id ? `&id=${id}` : ''}`, null, document.querySelector('#viewrequisitionform #submit'), 'json', 'GET');
    swal.close(); // Close the loading alert once the request is complete
    document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> No Records Retrieved </td>`
    document.getElementById('tabledata2').innerHTML = `<td colspan="100%" class="text-center opacity-70"> No Records Retrieved </td>`
    if(request.status) {
            if(request.data.view.length) {
                datasource = request.data.view;
                expensedata = request.data;
                resolvePagination(datasource, onallocateexpenditureTableDataSignal);
                did('tabledata2').innerHTML = request.data.notactive.filter(item => item.status != 'ACTIVE').map((item, index)=>`
                    <tr>
                        <td>${index + 1}</td>
                        <td>${item.dateadded    }</td>
                        <td>${item.fullname}</td>
                        <td>${item.createdbyname}</td>
                        <td>${item.description}</td>
                        <td>${formatCurrency(item.credit)}</td>
                        <td class="${item.status === 'DECLINED' ? 'text-red-600' : item.status === 'PENDING' ? 'text-orange-600' : ''}">${item.status}</td>
                        <td class="flex items-center gap-3">
                            ${item.status == 'PENDING' ? `
                                <button title="Edit row entry" onclick="approvedeclineallocation('${item.reference}' , 'ACTIVE')" class="material-symbols-outlined h-8 w-8 rounded-full bg-green-600 text-xs text-white drop-shadow-md" style="font-size: 18px;">sync_saved_locally</button>
                                <button title="Edit row entry" onclick="approvedeclineallocation('${item.reference}' , 'DECLINED')" class="material-symbols-outlined h-8 w-8 rounded-full bg-red-600 text-xs text-white drop-shadow-md" style="font-size: 18px;">disabled_by_default</button>
                            ` : ''}
                    </tr>
                `).join('')
            } else {
                document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> No Records Retrieved </td>`;
            }
    } else {
        return notification('No records retrieved');
    }
}

async function approvedeclineallocation(ref, status) {
    let message = '';
    if (status === 'ACTIVE') {
        message = 'Are you sure you want to approve this allocation? This action cannot be reversed except the user allocated to sends it back to the expense account.';
    } else if (status === 'DECLINED') {
        message = 'Are you sure you want to decline this allocation? Declining cannot be reversed except a new allocation will be requested for.';
    }

    const confirmed = await Swal.fire({
        title: 'Warning',
        text: message,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, proceed!',
        showLoaderOnConfirm: true,
        preConfirm: async () => {
            let payload = new FormData();
            payload.append('reference', ref);
            payload.append('status', status);

            let request = await httpRequest2('api/v1/expense/approvedeclineallocation', payload, null, 'json', 'POST');
            return request;
        },
        allowOutsideClick: () => !Swal.isLoading()
    });

    if (confirmed.isConfirmed) {
        if (confirmed.value.status) {
            notification('Operation successful!', 1);
            fetchallocateexpenditure();
        } else {
            notification(confirmed.value.message, 0);
        }
    }
}

function toggleExpenseBalance(event) {
    if (checkpermission('VIEW COMPANY BALANCE')) {
        document.getElementById('expensebalance').classList.toggle('blur-sm');
    } else {
        notification('You do not have permission to view the amount.');
    }
}

async function removeallocateexpenditure(id) {
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
        fetchallocateexpenditure();
        return notification(confirmed.value.message);
    }
}


async function onallocateexpenditureTableDataSignal() {
    let rows = getSignaledDatasource().map((item, index) => `
    <tr>
        <td>${index + 1}</td>
        <td>${item.fullname}</td>
        <td>${formatCurrency(item.balance)}</td>
        <td class="flex items-center gap-3">
            <button title="View details" onclick="showUserTransactions('${item.userid}')" class="material-symbols-outlined h-8 w-8 rounded-full bg-green-600 text-xs text-white drop-shadow-md" style="font-size: 18px;">visibility</button>
        </td>
    </tr>`
    )
    .join('')
    injectPaginatatedTable(rows)
}

function showUserTransactions(userId) {
    // Locate the user in the data source
    const userData = datasource.find((u) => u.userid == userId);
  
    if (!userData) {
      Swal.fire({
        icon: 'error',
        title: 'Not Found',
        text: `No user found with userid = ${userId}`,
      });
      return;
    }
  
    // Generate the HTML content using the styled table function
    const htmlContent = generateTransactionsHtml(userData);
  
    // Display the SweetAlert modal with the generated HTML
    Swal.fire({
      title: `Transactions for ${userData.fullname}`,
      html: htmlContent,
    //   icon: "info",
      showConfirmButton: true,
      confirmButtonText: "Close",
      confirmButtonColor: "Blue",
      width: "80%",       // Adjust width as needed
      heightAuto: false,  // Allows modal to scroll if content is long
    });
  }
  

  function generateTransactionsHtml(userData) {
    if (!userData.transactions || userData.transactions.length === 0) {
      return `
        <div class="table-content">
          <table class="table-auto">
            <thead>
              <tr>
                <th colspan="6">
                  Transactions
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colspan="6" class="text-center opacity-70" style="padding: 12px;">
                  No transactions available.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      `;
    }
  
    // Filter transactions by status for calculations
    const activeTransactions = userData.transactions.filter(tx => tx.status === 'ACTIVE');
    const pendingTransactions = userData.transactions.filter(tx => tx.status === 'PENDING');
    const cashTransactions = userData.transactions.filter(tx => tx.status === 'ACTIVE' && tx.tfrom === 'CASH');
    const BankTransactions = userData.transactions.filter(tx => tx.status === 'ACTIVE' && tx.tfrom === 'BANK');
  
    // Calculate totals for ACTIVE transactions
    const totalActiveCredit = activeTransactions.reduce((sum, tx) => sum + parseFloat(tx.credit || 0), 0);
    const totalActiveDebit = activeTransactions.reduce((sum, tx) => sum + parseFloat(tx.debit || 0), 0);
    const activeBalance = totalActiveCredit - totalActiveDebit;
  
    // Calculate totals for PENDING transactions
    const totalPendingCredit = pendingTransactions.reduce((sum, tx) => sum + parseFloat(tx.credit || 0), 0);
    const totalPendingDebit = pendingTransactions.reduce((sum, tx) => sum + parseFloat(tx.debit || 0), 0);
    const pendingBalance = totalPendingCredit - totalPendingDebit;

    const totalCashCreditAtBank = cashTransactions.reduce((sum, tx) => sum + parseFloat(tx.credit || 0), 0);
    const totalCashDebitAtBank = cashTransactions.reduce((sum, tx) => sum + parseFloat(tx.debit || 0), 0);
    const cashBalance = totalCashCreditAtBank - totalCashDebitAtBank;

    const totalBankCreditAtBank = BankTransactions.reduce((sum, tx) => sum + parseFloat(tx.credit || 0), 0);
    const totalBankDebitAtBank = BankTransactions.reduce((sum, tx) => sum + parseFloat(tx.debit || 0), 0);
    const bankBalance = totalBankCreditAtBank - totalBankDebitAtBank;
  
    // Define table headers in desired order
    const headers = ["Transaction Date", "Description", "Reference", "tfrom", "Credit", "Debit", "Status"];
  
    // Generate table header row
    const headerRow = `
      <tr>
        ${headers.map(header => `<th style="padding: 12px;">${header}</th>`).join('')}
      </tr>
    `;
  
    // Generate table body rows with alternating colors
    const bodyRows = userData.transactions
      .map((tx, index) => `
        <tr style="background-color: ${index % 2 === 0 ? '#fafafa' : '#fff'};">
          <td style="padding: 12px;">${formatDate(tx.transactiondate)}</td>
          <td style="padding: 12px;">${tx.description || 'N/A'}</td>
          <td style="padding: 12px;">${tx.reference || 'N/A'}</td>
          <td style="padding: 12px;">${tx.tfrom || 'N/A'}</td>
          <td style="padding: 12px;">${formatCurrency(tx.credit)}</td>
          <td style="padding: 12px;">${formatCurrency(tx.debit)}</td>
          <td style="padding: 12px; color: ${tx.status === 'ACTIVE' ? 'green' : 'red'};">${tx.status}</td>
        </tr>
      `)
      .join('');
  
    // Construct final HTML table with totals and transactions
    return `
      <div class="table-content">
        <table class="table-auto">
          <thead>
            <tr>
              <th colspan="7" style="position: relative;">
                Transactions (scroll right to see all)
                <button onclick="viewAllTransactions()"
                  class="hidden bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 text-white"
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
                  "
                  onmouseover="this.style.transform='scale(1.05)'"
                  onmouseout="this.style.transform='scale(1)'">
                  View All Transactions
                </button>
              </th>
            </tr>
            <tr>
              <th colspan="2" style="padding: 12px; background-color: #d1c4e9; color: #4a148c;">
                Total Credit (ACTIVE): ${formatCurrency(totalActiveCredit)}
              </th>
              <th colspan="2" style="padding: 12px; background-color: #c5cae9; color: #1a237e;">
                Total Debit (ACTIVE): ${formatCurrency(totalActiveDebit)}
              </th>
              <th colspan="3" style="padding: 12px; background-color: #bbdefb; color: #0d47a1;">
                TotalBalance: ${formatCurrency(activeBalance)}
              </th>
            </tr>
            <tr>
              <th colspan="2" style="padding: 12px; background-color: #b2dfdb; color: #004d40;">
                Total Pending Credit: ${formatCurrency(totalPendingCredit)}
              </th>
              <th colspan="2" style="padding: 12px; background-color: #c8e6c9; color: #1b5e20;">
                Total Pending Debit: ${formatCurrency(totalPendingDebit)}
              </th>
              <th colspan="3" style="padding: 12px; background-color: #dcedc8; color: #33691e;">
                Pending Balance: ${formatCurrency(pendingBalance)}
              </th>
            </tr>
            <tr>
              <th colspan="2" style="padding: 12px; background-color: #ffe0b2; color: #e65100;">
                Cash At Hand: ${formatCurrency(cashBalance)}
              </th>
              <th colspan="2" style="padding: 12px; background-color: #ffccbc; color: #bf360c;">
                Cash At Bank: ${formatCurrency(bankBalance)}
              </th>
              <th colspan="3" style="padding: 12px; background-color: #fff; color: green;">
                Available Balance: ${formatCurrency(cashBalance + bankBalance)}
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
  }
  
  

async function allocateexpenditureFormSubmitHandler() {
    dynamiccomma(false)
    if(!validateForm('allocateexpenditureform', getIdFromCls('comp'))) return dynamiccomma(true)
    
    let payload = getFormData2(document.querySelector('#allocateexpenditureform'), allocateexpenditureid ? [['id', allocateexpenditureid]] : null);
    dynamiccomma(true)
    const confirmed = await Swal.fire({
        title: allocateexpenditureid ? 'Updating...' : 'Submitting...',
        text: 'Please wait while we submit your data.',
        icon: 'info',
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: async () => {
            Swal.showLoading();
            let request = await httpRequest2('api/v1/expense/allocate', payload, document.querySelector('#allocateexpenditureform #submit'), 'json', 'POST');
            Swal.close();

            if (request.status) {
                notification('Success!', 1);
                const userIdSelect = document.querySelector('#userid');
                    userIdSelect.tomselect.clear();
                const form = document.querySelector('#allocateexpenditureform');
                form.reset();
                if(allocateexpenditureid)form.querySelectorAll('input, select, textarea').forEach(input => input.value = '');
                allocateexpenditureid = '';
                document.getElementsByClassName('viewer')[0].click();
                fetchallocateexpenditure();
            } else {    
                notification(request.message, 0);
            }
        }
    });
}
