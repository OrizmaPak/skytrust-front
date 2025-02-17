let viewmakesalesid
let theviewmakesalesitems
// let rptotalorder
// let viewsaledaysource
// let initialinventoryload
async function viewmakesalesActive() {
    // document.getElementById('transactiondate').value = new Date().toISOString().split('T')[0];
    theviewmakesalesitems = '';
    thedepartment = '';
    thebranch = '';
    initialinventoryload = ''
    // const form = document.querySelector('#viewmakesalesform')
    // const form2 = document.querySelector('#updateinventories')
    // if(document.querySelector('#salessubmit')) document.querySelector('#salessubmit').addEventListener('click', e=>viewmakesalesFormEditHandler())
    if(document.querySelector('#viewmakesalesdaySubmit')) document.querySelector('#viewmakesalesdaySubmit').addEventListener('click', e=>fetchviewmakesalesday())
    if(document.querySelector('#viewmakesalesmonthSubmit')) document.querySelector('#viewmakesalesmonthSubmit').addEventListener('click', e=>fetchviewmakesalesmonth())
    if(document.querySelector('#viewmakesalesyearSubmit')) document.querySelector('#viewmakesalesyearSubmit').addEventListener('click', e=>fetchviewmakesalesyear())
    // form.querySelector('#submit').click()
    datasource = []
    await getAllbranch(!checkpermission('FILTER BRANCH'), 'branchfilterday');
    await getAllbranch(!checkpermission('FILTER BRANCH'), 'branchfiltermonth');
    await getAllbranch(!checkpermission('FILTER BRANCH'), 'branchfilteryear');
    await getAllUsers('userfilterday', 'name')
    await getAllUsers('userfiltermonth', 'name')
    await getAllUsers('userfilteryear', 'name')
    // await getAllbranch(false, 'branchto');
    await new TomSelect('#branchfilterday', {
        plugins: ['dropdown_input'],
        onInitialize: function() {
            console.log(checkpermission('FILTER BRANCH'))
            if(!checkpermission('FILTER BRANCH')) this.setValue(the_user.branch);
            if(!checkpermission('FILTER BRANCH')) this.setTextboxValue('readonly', true);
        }
    });
    await new TomSelect('#branchfiltermonth', {
        plugins: ['dropdown_input'],
        onInitialize: function() {
            console.log(checkpermission('FILTER BRANCH'))
            if(!checkpermission('FILTER BRANCH')) this.setValue(the_user.branch);
            if(!checkpermission('FILTER BRANCH')) this.setTextboxValue('readonly', true);
        }
    });
    await new TomSelect('#branchfilteryear', {
        plugins: ['dropdown_input'],
        onInitialize: function() {
            console.log(checkpermission('FILTER BRANCH'))
            if(!checkpermission('FILTER BRANCH')) this.setValue(the_user.branch);
            if(!checkpermission('FILTER BRANCH')) this.setTextboxValue('readonly', true);
        }
    });
    new TomSelect('#userfilterday', {
        plugins: ['dropdown_input'],
        onInitialize: function() {
            console.log(checkpermission('FILTER ALL USERS'))
            if(!checkpermission('FILTER ALL USERS')) this.setValue(the_user.id);
            if(!checkpermission('FILTER ALL USERS')) this.setTextboxValue('readonly', true);
        }
    });
    new TomSelect('#userfiltermonth', {
        plugins: ['dropdown_input'],
        onInitialize: function() {
            console.log(checkpermission('FILTER ALL USERS'))
            if(!checkpermission('FILTER ALL USERS')) this.setValue(the_user.id);
            if(!checkpermission('FILTER ALL USERS')) this.setTextboxValue('readonly', true);
        }
    });
    new TomSelect('#userfilteryear', {
        plugins: ['dropdown_input'],
        onInitialize: function() {
            console.log(checkpermission('FILTER ALL USERS'))
            if(!checkpermission('FILTER ALL USERS')) this.setValue(the_user.id);
            if(!checkpermission('FILTER ALL USERS')) this.setTextboxValue('readonly', true);
        }
    });
    // await new TomSelect('#branchto', {
    //     plugins: ['dropdown_input'],
    //     onInitialize: function() {
    //         console.log(checkpermission('FILTER BRANCH'))
    //         // if(!checkpermission('FILTER BRANCH')) this.setValue(the_user.branch);
    //         // if(!checkpermission('FILTER BRANCH')) this.setTextboxValue('readonly', true);
    //         handleBranchChange(this.getValue(), 'departmentto');
    //     },
    //     onChange: function() {
    //         handleBranchChange(this.getValue(), 'departmentto');
    //     }
    // });
    // if(document.getElementById('departmentfrom')) document.getElementById('departmentfrom').addEventListener('change', e=>checksourcedetails())
 

}

async function fetchviewmakesalesday() {

    if(!validateForm('viewmakesalesdayform', getIdFromCls('comp'))) return
    
    thedepartment = '';
    thebranch = '';
    // if(!validateForm('viewmakesalesform', getIdFromCls('comp'))) return

    theviewmakesalesitems = '';

    
    let formData = new FormData(document.getElementById('viewmakesalesdayform'));
    let queryParams = new URLSearchParams(formData).toString();

    document.getElementById('tabledataday').innerHTML = `<td colspan="100%" class="text-center opacity-70"> Table is Empty </td>`
    did('totalsalescount').innerHTML = '0';
    did('totalsalesamount').innerHTML = '0.00';
    let request = await httpRequest2(`api/v1/sales/viewsalesday?${queryParams ? `${queryParams}` : ''}`, null, document.querySelector('#viewmakesalesdaySubmit'), 'json', 'GET');
    if(request.status) {
            if(request.data) {
                viewsaledaysource = request.data;
                    // Start of Selection 
                    let totalSales = 0;
                    let totalSalesCount = 0;
                    did('tabledataday').innerHTML = Object.values(request.data).map((group, index) => {
                        totalSales += group.transaction.amountpaid;
                        totalSalesCount = totalSalesCount + 1;
                        return `
                            <tr>
                                <td>${index + 1}</td>
                                <td>${group.transaction.transactionref}</td>
                                <td>${group.transaction.description}</td>
                                <td>${formatDate(group.transaction.transactiondate)}</td>
                                <td>${group.transaction.branchname}</td>
                                <td>${formatCurrency(group.transaction.amountpaid)}</td>
                                <td>${group.transaction.cashier}</td>
                                <td class="flex items-center gap-3 justify-center">
                                    <button title="View Transaction" onclick="viewmakesalesTransaction('${group.transaction.transactionref}')" 
                                    class="material-symbols-outlined rounded-full bg-blue-500 h-8 w-8 text-white drop-shadow-md text-lg hover:bg-blue-600">
                                    visibility
                                    </button>
                                    <button title="Print Receipt" onclick="viewmakesalesprintReceipt('${group.transaction.transactionref}')" 
                                    class="material-symbols-outlined rounded-full bg-orange-500 h-8 w-8 text-white drop-shadow-md text-lg hover:bg-orange-600 ml-2">
                                    print
                                    </button>
                                    <button title="Download Receipt" onclick="viewmakesalesdownloadReceipt('${group.transaction.transactionref}')" 
                                    class="material-symbols-outlined rounded-full bg-green-500 h-8 w-8 text-white drop-shadow-md text-lg hover:bg-green-600 ml-2">
                                    download
                                    </button>
                                </td>
                            </tr>
                        `;
                    }).join('') + `
                        <tr>
                            <td colspan="5" class="text-right font-bold">Total Sales:</td>
                            <td>${formatCurrency(totalSales)}</td>
                            <td colspan="2"></td>
                        </tr>
                    `;
                    did('totalsalescount').innerHTML = formatNumber(totalSalesCount);
                    did('totalsalesamount').innerHTML = formatCurrency(totalSales)
            }else return notification('No records retrieved')
}
}

async function fetchviewmakesalesmonth() {

    if(!validateForm('viewmakesalesmonthform', getIdFromCls('comp'))) return
    
    thedepartment = '';
    thebranch = '';
    // if(!validateForm('viewmakesalesform', getIdFromCls('comp'))) return

    did('totalsalesamountmonth').innerHTML = '';
    did('totalsalescountmonth').innerHTML = '';

    theviewmakesalesitems = '';

    
    let formData = new FormData(document.getElementById('viewmakesalesmonthform'));
    formData.append('userid', the_user.id);
    let queryParams = new URLSearchParams(formData).toString();

    document.getElementById('tabledatamonth').innerHTML = `<td colspan="100%" class="text-center opacity-70"> Table is Empty </td>`
    did('totalsalesamountmonth').innerHTML = '0.00';
    let request = await httpRequest2(`api/v1/sales/viewsalesmonth?${queryParams ? `${queryParams}` : ''}`, null, document.querySelector('#viewmakesalesmonthSubmit'), 'json', 'GET');
    if(request.status) {
            if(request.data) {
                viewsalemonthsource = request.data;
                    // Start of Selection
                    let totalAmount = 0;
                        let totalTransactions = 0;

                        did('tabledatamonth').innerHTML = request.data.days.map((day, index) => {
                            totalAmount += day.totalAmount;
                            totalTransactions += day.transactionCount;
                            
                            return `
                            <tr>
                                <td>${formatDate(day.date)}</td>
                                <td>${day.transactionCount} sale${day.transactionCount !== 1 ? 's' : ''}</td>
                                    <td class="${day.totalAmount > 0 ? 'text-green-500' : day.totalAmount < 0 ? 'text-red-500' : 'text-black'}">${formatCurrency(day.totalAmount)}</td>
                            </tr>
                            `;
                        }).join('') + `
                        <tr class="bg-gray-50 font-bold">
                            <td class="p-3">Monthly Total:</td>
                            <td class="p-3">${viewsalemonthsource.monthlySummary.totalTransactions} transactions</td>
                                <td class="p-3"><span class="${viewsalemonthsource.monthlySummary.totalAmount === 0 ? 'text-black' : viewsalemonthsource.monthlySummary.totalAmount > 0 ? 'text-green-500' : 'text-red-500'}">${formatCurrency(viewsalemonthsource.monthlySummary.totalAmount)}</span></td>
                        </tr>`;
                        did('totalsalescountmonth').innerHTML = formatNumber(viewsalemonthsource.monthlySummary.totalTransactions)
                        did('totalsalesamountmonth').innerHTML = formatCurrency(viewsalemonthsource.monthlySummary.totalAmount)
            }else return notification('No records retrieved')
}
}

async function fetchviewmakesalesyear() {
    if(!validateForm('viewmakesalesyearform', getIdFromCls('comp'))) return
    // Initialize variables and reset elements
    document.getElementById('totalsalesamountyear').innerHTML = '0.00';
    document.getElementById('totalsalescountyear').innerHTML = '0';
    document.getElementById('tabledatayear').innerHTML = `<tr><td colspan="100%" class="text-center opacity-70">Table is Empty</td></tr>`;

    let formData = new FormData(document.getElementById('viewmakesalesyearform'));
    let queryParams = new URLSearchParams(formData).toString();

    // Fetch data from the API
    let request = await httpRequest2(`api/v1/sales/viewsalesyear?${queryParams ? `${queryParams}` : ''}`, null, document.querySelector('#viewmakesalesyearSubmit'), 'json', 'GET');
    if (request.status) {
        if (request.data) {
            let salesData = request.data;

            // Update yearly total details
            document.getElementById('totalsalesamountyear').innerHTML = formatCurrency(salesData.yearlySummary.totalAmount);
            document.getElementById('totalsalescountyear').innerHTML = formatNumber(salesData.yearlySummary.totalTransactions);

            // Build table rows for each month
            let tableRows = salesData.months.map(month => {
                let monthName = new Date(2025, month.month - 1).toLocaleString('default', { month: 'long' });
                let monthlySummary = month.monthlySummary;

                // Build row for the monthly summary
                let monthlyRow = `
                    <tr class="bg-gray-50 font-bold">
                        <td>${monthName}</td>
                        <td>${formatNumber(monthlySummary.totalTransactions)} sale${monthlySummary.totalTransactions !== 1 ? 's' : ''}</td>
                        <td class="${monthlySummary.totalAmount > 0 ? 'text-green-500' : 'text-red-500'}">${formatCurrency(monthlySummary.totalAmount)}</td>
                    </tr>
                `;

                // Build rows for daily transactions
                // let dailyRows = month.days.map(day => {
                //     if (day.transactionCount > 0 || day.totalAmount !== 0) {
                //         return `
                //             <tr>
                //                 <td>${formatDate(day.date)}</td>
                //                 <td>${formatNumber(day.transactionCount)} sale${day.transactionCount !== 1 ? 's' : ''}</td>
                //                 <td class="${day.totalAmount > 0 ? 'text-green-500' : 'text-red-500'}">${formatCurrency(day.totalAmount)}</td>
                //             </tr>
                //         `;
                //     }
                //     return '';
                // }).join('');

                return monthlyRow;
            }).join('');

            document.getElementById('tabledatayear').innerHTML = tableRows;
        } else {
            notification('No records retrieved');
        }
    } else {
        notification('Failed to fetch data. Please try again.');
    }
}


function viewmakesalesTransaction(reference) {
    const group = viewsaledaysource[reference];
    const items = group.items.map(item => ({
        ...item,
        quantity: Math.abs(item.qty),
        value: Math.abs(item.qty) * item.sellingprice
    }));

    Swal.fire({
            // Start of Selection
            title: `<div class="flex flex-col justify-center items-center"><p class="text-md font-semibold text-gray-900">Transaction Details</p><p class="text-sm text-gray-500">#${reference}</p></div>`,
        html: `
        <div class="space-y-0">
            <div class="bg-gray-50 p-4 rounded-lg">
                <div class="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p class="text-gray-500">Transaction Date</p>
                        <p class="font-medium text-gray-900">${new Date(group.transaction.transactiondate).toLocaleString()}</p>
                    </div>
                    <div>
                        <p class="text-gray-500">Sales Person</p>
                        <p class="font-medium text-gray-900">${group.transaction.cashier}</p>
                    </div>
                    <div>
                        <p class="text-gray-500">Payment Method</p>
                        <p class="font-medium text-gray-900">${group.transaction.tfrom}</p>
                    </div>
                    <div>
                        <p class="text-gray-500">Branch</p>
                        <p class="font-medium text-gray-900">Branch ${group.transaction.branchname}</p>
                    </div>
                </div>
            </div>

            <div class="table-content border rounded-xl overflow-hidden">
                <table class="table-auto w-full">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Item</th>
                            <th class="px-4 py-3 text-center text-sm font-medium text-gray-700">Qty</th>
                            <th class="px-4 py-3 text-right text-sm font-medium text-gray-700">Price</th>
                            <th class="px-4 py-3 text-right text-sm font-medium text-gray-700">Total</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200">
                        ${items.map(item => `
                            <tr>
                                <td class="px-4 py-3 text-sm text-gray-900">${item.itemname}</td>
                                <td class="px-4 py-3 text-sm text-gray-500 text-center">${item.quantity}</td>
                                <td class="px-4 py-3 text-sm text-gray-500 text-right">${formatCurrency(item.sellingprice)}</td>
                                <td class="px-4 py-3 text-sm text-gray-900 text-right font-medium">${formatCurrency(item.value)}</td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>

            <div class="bg-gray-50 p-4 rounded-lg">
                <div class="flex justify-between items-center">
                    <span class="text-sm font-medium text-gray-700">Total Amount</span>
                    <span class="text-xl font-bold text-gray-900">${formatCurrency(group.transaction.amountpaid)}</span>
                </div>
            </div>
        </div>
        `,
        showConfirmButton: false,
        showCancelButton: false,
        customClass: {
            popup: 'rounded-2xl',
            container: 'custom-swal-container',
            htmlContainer: 'overflow-visible'
        },
        footer: `
        <div class="flex gap-3 w-full">
            <button onclick="Swal.close()" class="swal-cancel-btn flex-1 px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors">
                Close
            </button>
            <button onclick="viewmakesalesprintReceipt('${reference}')" class="swal-confirm-btn flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                Print Receipt
            </button>
        </div>
        `
    });
}

function viewmakesalesprintReceipt(reference) {
    const group = viewsaledaysource[reference];
    const receiptContent = document.createElement('div');
    
    receiptContent.innerHTML = `
      <div style="font-family: 'Courier New', monospace; font-size: 14px; max-width: 400px; margin: auto;">
        <div style="text-align: center; margin-bottom: 10px;">
          <h3 style="margin: 0; text-transform: uppercase;">${organisationSettings.company_name}</h3>
          <p style="margin: 0;">${organisationSettings.address}</p>
          <p style="margin: 0;">${organisationSettings.phone}</p>
          <hr style="margin: 10px 0;">
        </div>
  
        <div style="margin-bottom: 10px;">
          <p>Date: ${new Date(group.transaction.transactiondate).toLocaleString()}</p>
          <p>Ref: ${reference}</p>
          <p>Cashier: ${group.transaction.cashier.split(' ')[0]}</p>
        </div>
  
        <table style="width: 100%; margin-bottom: 10px;">
          <thead>
            <tr>
              <th style="text-align: left;">Item</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Price</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${group.items.map(item => `
              <tr>
                <td>${item.itemname}</td>
                <td style="text-align: center;">${Math.abs(item.qty)}</td>
                <td style="text-align: right;">${formatCurrency(item.sellingprice)}</td>
                <td style="text-align: right;">${formatCurrency(Math.abs(item.qty) * item.sellingprice)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
  
        <div style="border-top: 1px dashed #000; padding-top: 10px;">
          <p style="text-align: right;">Total: ${formatCurrency(group.transaction.amountpaid)}</p>
          <p style="text-align: right;">Payment Method: ${group.transaction.tfrom}</p>
        </div>
  
        <div style="text-align: center; margin-top: 20px;">
          <hr style="margin: 10px 0;">
          <p>Thank you for your patronage!</p>
          <p>Powered by OIM Software</p>
        </div>
      </div>
    `;
  
    const win = window.open('', '_blank');
    win.document.write(receiptContent.innerHTML);
    win.document.close();
    win.print();
  }

  async function viewmakesalesdownloadReceipt(reference) {
    const group = viewsaledaysource[reference];
    const { jsPDF } = window.jspdf;

    // Create temporary receipt element with better print styling
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.width = '400px'; // Fixed width for consistent scaling
    tempDiv.innerHTML = `
      <div style="
        font-family: Arial, sans-serif;
        font-size: 16px;
        width: 400px;
        padding: 20px;
        background: white;
        line-height: 1.5;
      ">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="margin: 0 0 10px 0; font-size: 24px;">${organisationSettings.company_name}</h2>
          <p style="margin: 0;">${organisationSettings.address}</p>
          <p style="margin: 0;">Tel: ${organisationSettings.phone}</p>
          <hr style="border: 1px solid #000; margin: 15px 0;">
        </div>

        <!-- Transaction Info -->
        <div style="margin-bottom: 20px;">
          <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(group.transaction.transactiondate).toLocaleString()}</p>
          <p style="margin: 5px 0;"><strong>Receipt No:</strong> ${reference}</p>
          <p style="margin: 5px 0;"><strong>Cashier:</strong> ${group.transaction.cashier.split(' ')[0]}</p>
        </div>

        <!-- Items Table -->
        <table style="width: 100%; margin-bottom: 20px; border-collapse: collapse;">
          <thead>
            <tr>
              <th style="text-align: left; border-bottom: 1px solid #000; padding: 8px 0;">Item</th>
              <th style="text-align: center; border-bottom: 1px solid #000; padding: 8px 0;">Qty</th>
              <th style="text-align: right; border-bottom: 1px solid #000; padding: 8px 0;">Price</th>
              <th style="text-align: right; border-bottom: 1px solid #000; padding: 8px 0;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${group.items.map(item => `
              <tr>
                <td style="padding: 8px 0;">${item.itemname}</td>
                <td style="text-align: center; padding: 8px 0;">${Math.abs(item.qty)}</td>
                <td style="text-align: right; padding: 8px 0;">${formatCurrency(item.sellingprice)}</td>
                <td style="text-align: right; padding: 8px 0;">${formatCurrency(Math.abs(item.qty) * item.sellingprice)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <!-- Totals -->
        <div style="border-top: 1px solid #000; padding-top: 15px;">
          <div style="display: flex; justify-content: space-between; margin: 10px 0;">
            <strong>Total:</strong>
            <span>${formatCurrency(group.transaction.amountpaid)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin: 10px 0;">
            <strong>Payment Method:</strong>
            <span>${group.transaction.tfrom}</span>
          </div>
        </div>

        <!-- Footer -->
        <div style="text-align: center; margin-top: 30px; color: #666;">
          <hr style="border: none; border-top: 1px solid #666; margin: 15px 0;">
          <p style="margin: 10px 0;">Thank you for your business!</p>
          <p style="margin: 10px 0; font-size: 14px;">Powered by OIM Software</p>
        </div>
      </div>
    `;

    document.body.appendChild(tempDiv);

    try {
        // Convert to PDF with better quality settings
        const canvas = await html2canvas(tempDiv, {
            scale: 2, // Double resolution for better quality
            logging: true,
            useCORS: true,
            allowTaint: true
        });

        // Define receipt size (e.g., 80mm x 200mm)
        const receiptWidth = 80 * 2.83465; // Convert mm to points (1 mm = 2.83465 points)
        const receiptHeight = 200 * 2.83465; // Convert mm to points

        const pdf = new jsPDF('p', 'pt', [receiptWidth, receiptHeight]);
        const imgData = canvas.toDataURL('image/png', 1.0);
        
        pdf.addImage(imgData, 'PNG', 0, 0, receiptWidth, receiptHeight);
        pdf.save(`receipt-${reference}.pdf`);
    } catch (error) {
        console.error('Download failed:', error);
        alert('Failed to generate receipt');
    } finally {
        document.body.removeChild(tempDiv);
    }
}
  
  // Usage example: 
  // viewmakesalesdownloadReceipt('1738010399196', yourSalesDataObject)

// async function entryreqaddrow(){
//     // Start Generation Here
//     const selectedValue = document.querySelector('#supplyfrom_entry').tomselect.getValue();
//     const qtyvalue = document.querySelector('#qty_entry').value || 1;
//     if(!selectedValue)return notification('Please select an Item', 0);
//     let id = await reqaddrowviewmakesales();
//     document.querySelector(`#supplyfrom_${id}`).tomselect.setValue(selectedValue);
//     did(`qty_${id}`).value = qtyvalue??1;
//     viewmakesalescal2(did(`qty_${id}`))
//     document.querySelector('#supplyfrom_entry').tomselect.setValue('');
// }

async function removeviewmakesales(id) {
    // Ask for confirmation
    const confirmed = window.confirm("Are you sure you want to remove this item?");

    // If not confirmed, do nothing
    if (!confirmed) {
        return;
    }

    function getparamm() {
        let paramstr = new FormData();
        paramstr.append('itemid', id);
        return paramstr;
    }

    let request = await httpRequest2('../controllers/removeitem', id ? getparamm() : null, null, 'json');
    
    // Show notification based on the result
    fetchviewmakesaless()
    return notification(request.message);
    
}

// async function reqaddrowviewmakesales(){
//     console.log('theviewmakesalesitems', theviewmakesalesitems)
//     if (!theviewmakesalesitems) return notification('viewmakesales Source is incomplete. Wait for the table to indicate readiness.', 0);
//     let el = document.createElement('tr');
//     el.classList.add('temprow');
//     let elid;

//     if (theviewmakesalesitems) {
//         elid = genID();
//         el.id = `reqrow_${elid}`;
//         let x = `
//             <td class="text-center opacity-70 w-[200px]"> 
//                 <label class="hidden">Item</label>
//                 <select onchange="viewmakesalesgetitemdetails(this)" name="supplyfrom" id="supplyfrom_${elid}" class="form-controls comp w-[220px]">
//                     <option value=''>-- Select item --</option>
//                     ${theviewmakesalesitems.map(data => `<option value='${data.itemid}'>${data.itemname}</option>`).join('')}
//                 </select>
//             </td>
//             <td>
//                 <p class="!w-[125px]">Type: <span id="type_${elid}"></span></p>
//                 <p>Group: <span id="group_${elid}"></span></p>
//                 <p>Stock Balance: <span id="stock_${elid}"></span></p>
//             </td>
//             <td>
//                 <label class="hidden">Cost</label>
//                 <input onchange="viewmakesalescal2(this)" type="number" id="cost_${elid}" name="cost" class="comma form-control comp w-[95px]" readonly placeholder="Cost">
//             </td>
//             <td>
//                 <label class="hidden">Price</label>
//                 <input onchange="viewmakesalescal2(this)" type="number" readonly id="price_${elid}" name="price" class="comma form-control comp w-[95px]" placeholder="Enter Price">
//             </td>
//             <td>
//                 <label class="hidden">Quantity</label>
//                 <input onchange="viewmakesalescal2(this)" type="number" id="qty_${elid}" name="qty" class="comma form-control comp w-[70px]" placeholder="Qty">
//             </td>
//             <td>
//                 <label class="hidden">Value</label>
//                 <input readonly type="text" id="val_${elid}" name="value[]" class="comma form-control comp w-[130px]" placeholder="">
//             </td>
//             <td>
//                 <div class="flex gap-4 items-center h-full w-fit py-3">
//                     <button onclick="reqaddrowviewmakesales()" title="Add row" class="hidden material-symbols-outlined rounded-full bg-primary-g h-8 w-8 text-white drop-shadow-md text-xs" style="font-size: 18px;">add</button>
//                     <button onclick="this.closest('tr').remove()" title="Delete row" class="material-symbols-outlined rounded-full bg-[red] h-8 w-8 text-white drop-shadow-md text-xs" style="font-size: 18px;">delete</button>
//                 </div>
//             </td>`;
        
//         el.innerHTML = x;
        
//         if (did('readyholder')) {
//             did('readyholder').remove();
//         }
        
//         did('tabledata').appendChild(el);
        
//         // Initialize TomSelect
//         const tomSelectInstance = new TomSelect(`#supplyfrom_${elid}`, {
//             plugins: ['dropdown_input'],
//             onInitialize: function() {
//                 // viewmakesalesgetitemdetails(this);
//             },
//             onChange: function() {
//                 // viewmakesalesgetitemdetails(this);
//             }
//         });
        
        
//         // Move dropdown to body
//         const dropdown = tomSelectInstance.dropdown;
//         if (dropdown && dropdown.parentNode !== document.body) {
//             document.body.appendChild(dropdown);
//         }

//         // Update dropdown position on scroll and resize
//         const updateDropdownPosition = () => {
//             const control = tomSelectInstance.control;
//             const rect = control.getBoundingClientRect();
//             const dropdownHeight = dropdown.offsetHeight;
//             const dropdownWidth = rect.width;
//             const windowHeight = window.innerHeight;
//             const windowWidth = window.innerWidth;

//             dropdown.style.top = `${(windowHeight - dropdownHeight) / 2}px`;
//             dropdown.style.left = `${(windowWidth - dropdownWidth) / 2}px`;
//             dropdown.style.width = `${dropdownWidth}px`;
//         };

//         // Initial positioning
//         updateDropdownPosition();

//         // Update on events
//         window.addEventListener('scroll', updateDropdownPosition);
//         window.addEventListener('resize', updateDropdownPosition);
//     }
//     return elid
// }

// function viewmakesalescal2(element){
//     dynamiccomma(false)
//     let el = element.id.split('_')[1]
//     if(!did(`supplyfrom_${el}`).value){
//         notification(`No Item Selected`, 0)
//         did(`val_${el}`).value = '';
//         did(`cost_${el}`).value = '';
//         did(`qty_${el}`).value = '';
//         did(`price_${el}`).value = '';
//         return dynamiccomma(true)
//     }
//     if(Number(did(`stock_${el}`).textContent)<Number(did(`qty_${el}`).value)){
//         notification(`Quantity cannot exceed the stock balance`, 0)
//         did(`qty_${el}`).value = did(`stock_${el}`).textContent
//         // return
//     }
//     if(did(`price_${el}`).value && did(`qty_${el}`).value){
//         did(`val_${el}`).value = Number(did(`price_${el}`).value) * Number(did(`qty_${el}`).value)
//     }else{
//         did(`val_${el}`).value = '';
//     }
    
//     viewmakesalestotalcount()
    
// }

// function viewmakesalestotalcount(){
//     let totalcost = 0
    
//     for(let i=0;i<document.getElementsByName('qty').length;i++){
//         let qty = Number(document.getElementsByName('qty')[i].value);
//         let price = Number(document.getElementsByName('price')[i].value);
//         if(qty && price) {
//             totalcost += qty * price;
//         }
//     }
//     console.log('totalcost:', totalcost)
//     document.getElementById('rptotalorder').textContent = formatCurrency(totalcost)
//     rptotalorder = totalcost
//     dynamiccomma(true)
// }



async function viewmakesalesgetitemdetails(el){
    console.log('viewmakesalesgetitemdetails', el, el.value, el.id)  
    if(!el.value)return notification('Please select an item to view details', 0)
    const existingInputs = document.getElementsByName('supplyfrom');
    let duplicateCount = 0;
    for (let i = 0; i < existingInputs.length; i++) {
        const input = existingInputs[i];
        console.log(input.value, el.value);
        if (input.value == el.value) {
            duplicateCount++;
            if (duplicateCount >= 2) {
                el.value = '';
                el.tomselect.setValue('');
                return notification('This item is already selected in another row', 0);
            }
        }
    }
    let id = el.id.split('_')[1]
    let req = theviewmakesalesitems.filter(data=>data.itemid == el.value)[0]
    console.log('saved item', req)
    did('type_'+id).innerHTML = req.itemclass??''
    did('group_'+id).innerHTML = req.group??''
    did('stock_'+id).innerHTML = formatNumber(req.qty??0, 1, 0)
    did('cost_'+id).value = Number(req.cost)
    did('price_'+id).value = Number(req.price)

    dynamiccomma(true)
     
    let formData = new FormData();
    formData.append('branch', document.getElementById('branchfrom').value);
    formData.append('department', document.getElementById('departmentfrom').value);
    let queryParams = new URLSearchParams(formData).toString();

    // document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> Loading... </td>`

    let request = await httpRequest2(`api/v1/inventory/getinventory?${queryParams ? `${queryParams}` : ''}&applyto=FOR SALES`, null, null, 'json', 'GET');
    if(request.status) {
            if(request.data.length) {
                // datasource = request.data;
                theviewmakesalesitems = request.data;
                let req2 = theviewmakesalesitems.filter(data=>data.itemid == el.value)[0]
                console.log('saved item2', req2)
                did('type_'+id).innerHTML = req2.itemclass??''
                did('group_'+id).innerHTML = req2.group??''
                did('stock_'+id).innerHTML = formatNumber(req2.qty??0, 1, 0)
                did('cost_'+id).value = Number(req2.cost)
                did('price_'+id).value = Number(req2.price)
                dynamiccomma(true)
                
                // resolvePagination(datasource, onviewmakesalesTableDataSignal)
            }
        }
    else return notification('No records retrieved')
}


async function onviewmakesalesTableDataSignal() {
    let rows = getSignaledDatasource().map((item, index) => `
    <tr>
        <td>${item.index + 1 }</td>
        <td>${item.itemname}</td>
        <td><input type="number" name="beginbalance" id="${item.itemid}" class="form-control comp" placeholder="Enter begin balance" onchange="if(this.value < 0) { this.value = ''; notification('You cannot open stock on deduction. If you wish to do so, contact support for permission', 0); }"></td>
    </tr>`
    )
    .join('')
    injectPaginatatedTable(rows)
}


async function viewmakesalesFormEditHandler(id='') {
    dynamiccomma(false);
    if (!validateForm('viewmakesalesform', getIdFromCls('comp'))) return;

    
    if(did('paymentMethod').value == 'BANK' && !did('reference').value){
        notification('Please enter the reference of the transaction for the system to verify the payment', 0);
    }   

    const amountPaid = parseFloat(document.getElementById('amountpaid').value);

    if (amountPaid < rptotalorder) {
        Swal.close(); // Close SweetAlert processing
        return notification('The amount paid must be equal to the total order.', 0);
    }

    // Gather details of items to be sold
    let items = [];
    for (let i = 0; i < document.getElementsByName('supplyfrom').length; i++) {
        const itemName = document.getElementsByName('supplyfrom')[i].options[document.getElementsByName('supplyfrom')[i].selectedIndex].text;
        const quantity = document.getElementsByName('qty')[i].value;
        const price = document.getElementsByName('price')[i].value;
        const total = Number(quantity) * Number(price);
        items.push({ itemName, quantity, price, total });
    }

    // Calculate total order value
    let totalOrderValue = items.reduce((acc, item) => acc + item.total, 0);

    // Show confirmation modal
const confirm = await Swal.fire({
    title: 'Sales Confirmation',
    html: `
        <div style="font-family: 'Courier New', Courier, monospace; padding: 20px; max-width: 500px; margin: 0 auto; text-align: center;">
            <h2 style="margin-bottom: 20px;">${organisationSettings.company_name}</h2>
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px; margin: 0 auto;">
                <thead>
                    <tr>
                        <th style="border: 1px solid #ddd; padding: 8px;">Item</th>
                        <th style="border: 1px solid #ddd; padding: 8px;">Unit Price</th>
                        <th style="border: 1px solid #ddd; padding: 8px;">Quantity</th>
                        <th style="border: 1px solid #ddd; padding: 8px;">Value</th>
                    </tr>
                </thead>
                <tbody>
                    ${items.map(item => `
                        <tr>
                            <td style="border: 1px solid #ddd; padding: 8px;">${item.itemName}</td>
                            <td style="border: 1px solid #ddd; padding: 8px;">${formatCurrency(item.price)}</td>
                            <td style="border: 1px solid #ddd; padding: 8px;">${formatNumber(item.quantity)}</td>
                            <td style="border: 1px solid #ddd; padding: 8px;">${formatCurrency(item.total)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <hr style="margin: 20px 0;">
            <p style="text-align: right;"><strong>Total:</strong> ${formatCurrency(totalOrderValue)}</p>
            ${did('paymentMethod').value === 'CASH' ? 
                '<p style="margin-top: 20px;color: red">Ensure You Collect the Cash from the Customer</p>' : 
                `<p style="margin-top: 20px;color: red">Confirm the reference number: ${did('reference').value} as the transaction will be verified by the system</p>`}
        </div>
    `,
    width: '65%',
    // icon: 'success',
    showCancelButton: true,
    confirmButtonText: 'Confirm',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    focusCancel: true
});
    
    if (!confirm.isConfirmed) {
        return; // Exit if the user cancels
    }


    if(did('paymentMethod').value == 'CASH'){
        const change = amountPaid - totalOrderValue;
        if (change > 0) {
            await Swal.fire({
                title: 'Change Confirmation',
                text: `Please confirm that you have collected the complete payment and refunded ${formatCurrency(change)} to the customer.`,
                icon: 'info',
                showCancelButton: true,
                confirmButtonText: 'Change Refunded',
                cancelButtonText: 'Cancel',
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                focusCancel: true
            });
        } else {
            await Swal.fire({
                title: 'Payment Confirmation',
                text: 'Please confirm that you have collected the complete payment. No change is required.',
                icon: 'success',
                confirmButtonText: 'OK',
                confirmButtonColor: '#3085d6'
            });
        }
    }

    
    // Show SweetAlert processing
    Swal.fire({
        title: 'Processing',
        text: 'Please wait while the sales is verified...',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    const payload = new FormData();
    payload.append('rowsize', document.getElementsByName('supplyfrom').length);
    payload.append('branchfrom', document.getElementById('branchfrom').value);
    payload.append('departmentfrom', document.getElementById('departmentfrom').value);
    payload.append('transactiondate', document.getElementById('transactiondate').value);
    payload.append('description', document.getElementById('description').value);
    payload.append('reference', document.getElementById('reference').value);
    payload.append('tfrom', document.getElementById('paymentMethod').value);
    payload.append('amountpaid', document.getElementById('amountpaid').value);

    for (let i = 0; i < document.getElementsByName('supplyfrom').length; i++) {
        if (document.getElementsByName('qty')[i].value < 1) {
            Swal.close();
            return notification('Please check the quantity. It cannot be less than 1.', 0);
        }
        payload.append(`itemid${i + 1}`, document.getElementsByName('supplyfrom')[i].value);
        payload.append(`qty${i + 1}`, document.getElementsByName('qty')[i].value);
        payload.append(`cost${i + 1}`, document.getElementsByName('cost')[i].value);
        payload.append(`price${i + 1}`, document.getElementsByName('price')[i].value);
    }

    let request = await httpRequest2('api/v1/sales/viewmakesales', payload, document.querySelector('#save'), 'json', 'POST');
    Swal.close(); // Close SweetAlert processing
    
    if (request.status) {
        viewmakesalesActive();
        document.getElementById('viewmakesales').click();
        async function showReceipt(data) {
            const { branch, department, reference, transactionDate, totalPrice, amountPaid, paymentMethod, items } = data;
        
            // Format the receipt content
            const receiptContent = `
                <div id="receipt" style="
                font-family: 'Courier New', monospace; 
                font-size: 14px; 
                padding: 20px; 
                    max-width: 400px; 
                    margin: auto; 
                    border: 1px dashed #888; 
                    background-color: #fefefe;
                ">
                    <div style="text-align: center; margin-bottom: 10px;">
                        <h3 style="margin: 0; text-transform: uppercase; color: #333;">${organisationSettings.company_name} Receipt</h3>
                        <p style="margin: 0; font-size: 12px;">${organisationSettings.address}</p>
                        <p style="margin: 0; font-size: 12px;">${organisationSettings.phone} | Email: ${organisationSettings.email}</p>
                        <p style="margin: 0; font-size: 12px;">We appreciate your business!</p>
                        <hr style="border: none; border-top: 1px dashed #333; margin: 10px 0;">
                    </div>
        
                    <div style="margin-bottom: 10px;">
                        <p><strong>Date:</strong> ${new Date(transactionDate).toLocaleString()}</p>
                        <p><strong>Reference:</strong> ${reference}</p>
                        <p><strong>Branch:</strong> ${branch}</p>
                    </div>
        
                    <table style="
                        width: 100%; 
                        border-collapse: collapse; 
                        margin-bottom: 10px; 
                        font-size: 14px;
                        ">
                        <thead style="border-bottom: 1px dashed #888; text-align: left;">
                            <tr>
                                <th style="padding: 5px;">Item</th>
                                <th style="padding: 5px; text-align: center;">Qty</th>
                                <th style="padding: 5px; text-align: right;">Price</th>
                                <th style="padding: 5px; text-align: right;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${items
                                .map(
                                    (item) => `
                                    <tr>
                                        <td style="padding: 5px;">${item.itemname}</td>
                                        <td style="padding: 5px; text-align: center;">${item.quantity}</td>
                                        <td style="padding: 5px; text-align: right;">${formatCurrency(item.price)}</td>
                                        <td style="padding: 5px; text-align: right;">${formatCurrency(item.value)}</td>
                                    </tr>
                                `
                                )
                                .join("")}
                        </tbody>
                    </table>
        
                    <div style="
                        font-size: 14px; 
                        margin-top: 10px; 
                        border-top: 1px dashed #888; 
                        padding-top: 10px;
                    ">
                    <p style="margin: 5px 0;"><strong>Total Price:</strong> ${formatCurrency(totalPrice)}</p>
                    <p style="margin: 5px 0;"><strong>Amount Paid:</strong> ${formatCurrency(amountPaid)}</p>
                    <p style="margin: 5px 0;"><strong>VAT:</strong> 0.00</p>
                    <p style="margin: 5px 0;"><strong>Payment Method:</strong> ${paymentMethod}</p>
                    </div>
                    
                    <div style="text-align: center; margin-top: 20px;">
                        <hr style="border: none; border-top: 1px dashed #333; margin: 10px 0;">
                        <p style="margin: 0; font-size: 12px; color: #333;">Thank you for shopping with us!</p>
                        <p style="margin: 0; font-size: 12px; color: #333;">Please keep this receipt for your records.</p>
                        <p style="margin: 0; font-size: 12px; color: #333;">Powered by OIM Software Limited</p>
                    </div>
                </div>
            `;
        
            // Show the SweetAlert modal
            const { isConfirmed } = await Swal.fire({
                title: "Receipt",
                html: receiptContent,
                showCancelButton: true,
                confirmButtonText: "Print Receipt",
                cancelButtonText: "Close",
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',  
                focusConfirm: true,
                didOpen: () => {
                    const downloadButton = document.createElement("button");
                    downloadButton.innerHTML = "Download Receipt";
                    downloadButton.style.cssText = `
                    margin-top: 10px;
                        background-color: #007bff;
                        color: white;
                        padding: 10px 20px;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 14px;
                        `;
                        downloadButton.onclick = () => viewmakesalesdownloadReceipt(receiptContent);
                        Swal.getHtmlContainer().appendChild(downloadButton);
                    }
            });
        
            if (isConfirmed) {
                viewmakesalesprintReceipt("receipt");
            }
        }
        
        // Helper function to print the receipt
        function viewmakesalesprintReceipt(receiptId) {
            const receipt = document.getElementById(receiptId).outerHTML;
            const newWindow = window.open("", "_blank", "width=600,height=800");
            newWindow.document.write(`
                <html>
                <head>
                <title>Receipt</title>
                </head>
                <body onload="window.print()">
                ${receipt}
                </body>
                </html>
                `);
                newWindow.document.close();
            }
        
        // Helper function to download the receipt as an HTML file
        function viewmakesalesdownloadReceipt(content) {
            const blob = new Blob([content], { type: "text/html" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "receipt.html";
            link.click();
        }
        
    
        
        showReceipt(request.data);
        
        
        dynamiccomma(true);
        return notification(request.message, 1);
    } else {
        dynamiccomma(true);
        return notification('Failed to perform the required viewmakesales', 0);
    }
}



async function viewmakesalesFormDeleteHandler(id='') {
    // Show SweetAlert processing
    Swal.fire({
        title: 'Processing',
        text: 'Please wait while we update the stock(s)...',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    const payload = new FormData();
    let itemids = '';
    for(let i=0;i<document.getElementsByName('itemer').length;i++){
        if(document.getElementsByName('itemer')[i].checked){
            itemids = itemids+'||'+document.getElementsByName('itemer')[i].id;
        }
    }
    itemids = itemids.slice(2);
    payload.append(`itemid`, itemids);
    payload.append(`branch`, thebranch);
    payload.append(`department`, thedepartment);
    
    let request = await httpRequest2('api/v1/inventory/delete', payload, document.querySelector('#save'), 'json', 'POST');
    
    Swal.close(); // Close SweetAlert processing

    if (!id) document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> No Records Retrieved </td>`;
    // viewmakesalesFormSubmitHandler();
    if (request.status) {
        viewmakesalesActive();
        return notification(request.message, 1);
    } else {
        return notification('No records retrieved');
    }
}


// function runAdviewmakesalesFormValidations() {
//     let form = document.getElementById('viewmakesalesform')
//     let errorElements = form.querySelectorAll('.control-error')
//     let controls = []

//     if(controlHasValue(form, '#owner'))  controls.push([form.querySelector('#owner'), 'Select an owner'])
//     if(controlHasValue(form, '#viewmakesalesname'))  controls.push([form.querySelector('#viewmakesalesname'), 'viewmakesales name is required'])
//     if(controlHasValue(form, '#statusme'))  controls.push([form.querySelector('#itemname'), 'item name is required'])
//     if(controlHasValue(form, '#urlge'))  controls.push([form.querySelector('#image'), 'image is required'])
//     if(controlHasValue(form, '#urlition'))  controls.push([form.querySelector('#position'), 'position is required'])
//     if(controlHasValue(form, '#url'))  controls.push([form.querySelector('#url'), 'url is required'])
//     parentidurl
//     return mapValidationErrors(errorElements, controls)   

// }