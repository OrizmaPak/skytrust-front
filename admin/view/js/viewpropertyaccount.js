let viewpropertyaccountid
async function viewpropertyaccountActive() {
    viewpropertyaccountid = ''
    datasource = []
    await fetchviewpropertyaccount()
}

async function fetchviewpropertyaccount(id) {
    // Show loading state using SweetAlert
    const loadingAlert = Swal.fire({
        title: 'Please wait...',
        text: 'Fetching viewpropertyaccount data, please wait.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    // let form = document.querySelector('#viewviewpropertyaccountform');
    // let formData = new FormData(form);
    // formData.set('department', '');
    // formData.set('viewpropertyaccount', '');
    // let queryParams = new URLSearchParams(formData).toString();

    if(!id)document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> Loading... </td>`

    let request = await httpRequest2(`api/v1/property/account?${id ? `id=${id}` : ''}`, null, document.querySelector('#viewrequisitionform #submit'), 'json', 'GET');
    swal.close(); // Close the loading alert once the request is complete
    if(!id)document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> No Records Retrieved </td>`
    if(request.status) {
        if(!id){
            if(request.data && Object.keys(request.data).length) {
                datasource = request.data.accounts
                resolvePagination(datasource, onviewpropertyaccountTableDataSignal);
            }
        } else {
            // document.getElementsByClassName('updater')[0].click();
            viewpropertyaccountid = request.data[0].id;
            populateData(request.data[0]);
        }
    } else {
        return notification('No records retrieved');
    }
}

async function removeviewpropertyaccount(id) {
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
        fetchviewpropertyaccount();
        return notification(confirmed.value.message);
    }
}

async function editPropertyAccount(accountNumber) {
    // Find the account data using the account number
    const accountData = datasource.find((item) => item.account.accountnumber === accountNumber);

    if (!accountData) {
        Swal.fire({
            icon: "error",
            title: "Account Not Found",
            text: `No account found with Account Number: ${accountNumber}`,
        });
        return;
    }

    // Store the account data in localStorage to use on the edit page
    localStorage.setItem("editPropertyAccountData", JSON.stringify(accountData));

    // Redirect to the edit page
    window.location.href = "/view/index.html?r=propertyaccount";
}

async function onviewpropertyaccountTableDataSignal() {
    let rows = getSignaledDatasource()
        .map((item, index) => {
            const account = item.account; // Access the account object
            return `
            <tr>
                <td>${index + 1}</td>
                <td>${account.accountnumber}</td> 
                <td>${account.fullname}</td> 
                <td>${account.product}</td> 
                <td>₦${account.totalOwed.toFixed(2)}</td> 
                <td>${account.numberofrepayments}</td> 
                <td>${account.repaymentfrequency}</td> 
                <td>${formatDate(account.registrationdate.split("T")[0])}</td> 
                <td>${account.status}</td> 
                <td class="flex items-center gap-3">
                    <button title="Update property account"
                     onclick="editPropertyAccount('${account.accountnumber}')" 
                     class="material-symbols-outlined h-8 w-8 rounded-full bg-primary-g text-xs text-white drop-shadow-md" style="font-size: 18px;">edit</button>
                    <button 
                        title="View All Loan Details" 
                        onclick="showPropertyAccountDetails('${account.accountnumber}')" 
                        class="material-symbols-outlined h-8 w-8 rounded-full bg-green-600 text-xs text-white drop-shadow-md" 
                        style="font-size: 18px;">
                        visibility
                    </button>
                </td>
            </tr>`;
        })
        .join('');

    injectPaginatatedTable(rows); // Inject rows into the table
}

function showPropertyAccountDetails(accountNumber) {
    // Locate the account in the data source
    const accountData = datasource.find((item) => item.account.accountnumber == accountNumber);

    if (!accountData) {
        Swal.fire({
            icon: 'error',
            title: 'Not Found',
            text: `No account found with ID = ${accountNumber}`,
        });
        return;
    }

    // Generate the HTML content for the account details
    const htmlContent = generateAccountDetailsHtml(accountData);

    // Display the SweetAlert modal with the generated HTML
    Swal.fire({
        title: `Details for Account: ${accountData.account.accountnumber}`,
        html: htmlContent,
        showConfirmButton: true,
        confirmButtonText: "Close",
        confirmButtonColor: "blue",
        width: "80%", // Adjust width as needed
        heightAuto: false, // Allows modal to scroll if content is long
        customClass: {
            popup: 'bg-white shadow-lg rounded-lg p-5 text-left',
            title: 'text-xl font-bold mb-4',
            htmlContainer: 'text-sm leading-6',
        },
    });
}

function generateAccountDetailsHtml(accountData) {
    const account = accountData.account;
    const product = accountData.product || {};
    const items = accountData.items || [];
    const installments = accountData.installments || [];
    
    const getValue = (value) => {
        if (value === null || value === undefined) return 'N/A';
        if (typeof value === 'string' && value.trim() === '') return 'N/A';
        return value;
    };
    
    const totalPaid = installments.reduce((sum, installment) => sum + parseFloat(getValue(installment.amountpaid) || 0), 0);
    let totalUnpaid = installments.reduce((sum, installment) => sum + parseFloat(getValue(installment.amountowed) || 0), 0);

    // Generate items HTML
    const itemsHtml = items.length
        ? items
              .map(
                  (item, idx) => `
            <tr>
                <td>${idx + 1}</td>
                <td>${item.itemid}</td>
                <td>${item.itemname}</td>
                <td>${item.qty}</td>
                <td style="color: ${item.deliverystatus == "NOT STARTED" ? "#FF0000" : ""}">${item.deliverystatus}</td>
            </tr>`
              )
              .join('')
        : `<tr><td colspan="4" class="text-center opacity-70">No items found</td></tr>`;

    // Generate installments HTML
    const installmentsHtml = installments.length
        ? installments
              .map(
                  (installment, idx) => `
            <tr>
                <td>${idx + 1}</td>
                <td>₦${installment.amount.toFixed(2)}</td>
                <td>${formatDate(installment.duedate.split('T')[0])}</td>
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
            </tr>`
              )
              .join('')
        : `<tr><td colspan="4" class="text-center opacity-70">No installments found</td></tr>`;

    // HTML Content for the modal
    return `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; line-height: 1.5;">
            <!-- Account Details -->
              <table style="
                width: 100%;
                border-collapse: separate;
                border-spacing: 0px;
                border: 1px solid #ddd;
                border-radius: 8px;
                overflow: hidden;
                margin-bottom: 20px;
            ">
                <thead>
                    <tr style="background-color: #f4f6f9;">
                        <th colspan="2" style="
                            padding: 12px;
                            font-size: 20px;
                            text-align: center;
                            color: #333333;
                            font-weight: bold;
                        ">
                            Account Details
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr style="background-color: #fff;">
                        <td style="
                            padding: 12px;
                            width: 35%;
                            font-weight: bold;
                            border-bottom: 1px solid #ddd;
                        ">Full Name:</td>
                        <td style="
                            padding: 12px;
                            border-bottom: 1px solid #ddd;
                        ">${account.fullname}</td>
                    </tr>
                    <tr style="background-color: #f9f9f9;">
                        <td style="
                            padding: 12px;
                            font-weight: bold;
                            border-bottom: 1px solid #ddd;
                        ">Product:</td>
                        <td style="
                            padding: 12px;
                            border-bottom: 1px solid #ddd;
                        ">${account.product}</td>
                    </tr>
                    <tr style="background-color: #fff;">
                        <td style="
                            padding: 12px;
                            font-weight: bold;
                            border-bottom: 1px solid #ddd;
                        ">Registration Point:</td>
                        <td style="
                            padding: 12px;
                            border-bottom: 1px solid #ddd;
                        ">${account.registrationpoint}</td>
                    </tr>
                    <tr style="background-color: #f9f9f9;">
                        <td style="
                            padding: 12px;
                            font-weight: bold;
                            border-bottom: 1px solid #ddd;
                        ">Account Balance:</td>
                        <td style="
                            padding: 12px;
                            border-bottom: 1px solid #ddd;
                        ">₦${account.accountbalance.toFixed(2)}</td>
                    </tr>
                    <tr style="background-color: #f9f9f9;">
                        <td style="
                            padding: 12px;
                            font-weight: bold;
                            border-bottom: 1px solid #ddd;
                        ">Repayment Frequency:</td>
                        <td style="
                            padding: 12px;
                            border-bottom: 1px solid #ddd;
                        ">${account.repaymentfrequency}</td>
                    </tr>
                    <tr style="background-color: #fff;">
                        <td style="
                            padding: 12px;
                            font-weight: bold;
                            border-bottom: 1px solid #ddd;
                        ">Status:</td>
                        <td style="
                            padding: 12px;
                            border-bottom: 1px solid #ddd;
                        ">${account.status}</td>
                    </tr>
                    <tr style="background-color: #f9f9f9;">
                        <td style="
                            padding: 12px;
                            font-weight: bold;
                        ">Product Description:</td>
                        <td style="
                            padding: 12px;
                        ">${product.description || 'No description available'}</td>
                    </tr>
                    <tr style="background-color: #fff;">
                        <td style="
                            padding: 12px;
                            font-weight: bold;
                        ">Members:</td>
                        <td style="
                            padding: 12px;
                        ">
                            <ul>
                                ${(account.membernames || 'No members available').split(',').map(name => `<li>${name.trim()}</li>`).join('')}
                            </ul>
                        </td>
                    </tr>
                     <tr style="background-color: #f9f9f9;">
                        <td style="
                            padding: 12px;
                            font-weight: bold;
                            border-bottom: 1px solid #ddd;
                        ">Branch name:</td>
                        <td style="
                            padding: 12px;
                            border-bottom: 1px solid #ddd;
                        ">${account.branchname}</td>
                    </tr>
                    <tr style="background-color: #fff;">
                        <td style="
                            padding: 12px;
                            font-weight: bold;
                        ">Number of repayments:</td>
                        <td style="
                            padding: 12px;
                        ">
                            <ul>
                                ${(account.numberofrepayments || 'Number of repayments')}
                            </ul>
                        </td>
                    </tr>
                     <tr style="background-color: #f9f9f9;">
                        <td style="
                            padding: 12px;
                            font-weight: bold;
                            border-bottom: 1px solid #ddd;
                        ">Percentage delivery:</td>
                        <td style="
                            padding: 12px;
                            border-bottom: 1px solid #ddd;
                        ">${account.percentagedelivery}</td>
                    </tr>
                     <tr style="background-color: #f9f9f9;">
                        <td style="
                            padding: 12px;
                            font-weight: bold;
                            border-bottom: 1px solid #ddd;
                        ">Date Added:</td>
                        <td style="
                            padding: 12px;
                            border-bottom: 1px solid #ddd;
                        ">${formatDate(account.dateadded)}</td>
                    </tr>
                </tbody>
            </table>

            <!-- Items Table -->
            <div class="table-content" style="margin-bottom: 20px;">
                <h4 style="font-size: 18px; padding: 10px; color: #333333; background-color: #f4f6f9;">Items</h4>
                <table class="table-auto">
                    <thead>
                        <tr>
                            <th style="text-align: center;">s/n</th>
                            <th style="text-align: center;">Item ID</th>
                            <th style="text-align: center;">Item Name</th>
                            <th style="text-align: center;">Quantity</th>
                            <th style="text-align: center;">Delivery Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>
              </div>

                <div class="table-content">
                    <table class="table-auto">
                        <thead>
                            <tr>
                                <th colspan="8" style="position: relative;">
                                    Installments summary
                                </th>
                            </tr>
                            <tr>
                                <th colspan="2" style="padding: 12px; background-color: #e0f7fa; color: #00796b;">Total Owed: ${formatCurrency(account.totalOwed)}</th>
                                <th colspan="2" style="padding: 12px; background-color: #fce4ec; color: #c2185b;">Total Remitted: ${formatCurrency(account.totalRemitted)}</th>
                                <th colspan="2" style="padding: 12px; background-color: #f3e5f5; color: #6a1b9a;">Total Paid: ${formatCurrency(totalPaid)}</th>
                                <th colspan="2" style="padding: 12px; background-color: #fff3e0; color: #e65100;">Total Unpaid: ${formatCurrency(totalUnpaid)}</th>
                            </tr>
                        </thead>
                    </table>
                </div>

            <!-- Installments Table -->
            <div class="table-content">
                <h4 style="font-size: 18px; margin-top: 16px; color: #333333; background-color: #f4f6f9; padding: 10px;">Installments</h4>
                <table class="table-auto">
                    <thead>
                        <tr>
                            <th style="text-align: center;">s/n</th>
                            <th style="text-align: center;">Amount</th>
                            <th style="text-align: center;">Due Date</th>
                            <th style="text-align: center;">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${installmentsHtml}
                    </tbody>
                </table>
            </div>
        </div>`;
}



