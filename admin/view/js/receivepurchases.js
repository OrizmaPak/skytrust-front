let receivepurchasesid
let allrpitems
async function receivepurchasesActive() {
    await fetchreceivepurchases()
    receivepurchasesid = ''
    const form = document.querySelector('#receivepurchasesform')
    const form2 = document.querySelector('#viewreceivepurchasesform')
    if(form.querySelector('#submit')) form.querySelector('#submit').addEventListener('click', function(event) {
        event.preventDefault();
        receivepurchasesFormSubmitHandler();
    });
    if(form2.querySelector('#querySubmit')) form2.querySelector('#querySubmit').addEventListener('click', fetchreceivepurchases)
    document.getElementById('transactiondate').value = new Date().toISOString().split('T')[0];
    did('transactionref').addEventListener('keyup', e=>{
        if(did('transactionref').value)did('pullitemsbtn').innerHTML = 'Pull Purchase Order'
        else did('pullitemsbtn').innerHTML = 'New Received Purchases';
        did('purchaseformrp').classList.add('hidden');
    })
    if(did('pullitemsbtn'))did('pullitemsbtn').addEventListener('click', e=>{
        if(did('transactionref').value){
            fetchreceivepurchases(did('transactionref').value, "order?")
        }else{
            did('purchaseformrp').classList.remove('hidden')
            notification('This option should be utilized exclusively for receiving purchases that do not have an associated purchase order.', 2, 20000)
        };
    })
    // datasource = [];
    dynamiccomma(true);
    await getAllSuppliers('supplier');
    await getAllbranch(true, 'branch');
    new TomSelect('#supplier', {
        plugins: ['dropdown_input']
    });
    new TomSelect('#branch', {
        plugins: ['dropdown_input'],
        onInitialize: function() {
            console.log(checkpermission('FILTER BRANCH'))
            if(!checkpermission('FILTER BRANCH')) this.setValue(the_user.branch);
            if(!checkpermission('FILTER BRANCH')) this.setTextboxValue('readonly', true);
            handleBranchChange(this.getValue(), 'departmentfrom');
        },
        onChange: function() {
            handleBranchChange(this.getValue(), 'departmentfrom');
        }
    });
    allrpitems = await getallitemsforreceivepurchases();
    // await addrowreceivepurchases();
    await receivepurchasesappendallitems();


    // await getAllreceivepurchases(true)
    // new TomSelect('#receivepurchases', {
    //     // plugins: ['remove_button'],
    //     onInitialize: function() {
    //         console.log(checkpermission('FILTER receivepurchases'))
    //         if(!checkpermission('FILTER receivepurchases')) this.setValue(the_user.receivepurchases);
            // if(!checkpermission('FILTER receivepurchases')) this.setTextboxValue('readonly', true);
    //     }
    // });
    // await getAllUsers('useridlist', 'id')
}

async function fetchreceivepurchases(id="", state="purchase?status=ACTIVE&transactiondesc=Received from supplier&") {

    // Show loading state using SweetAlert
    const loadingAlert = Swal.fire({
        title: 'Please wait...',
        text: 'Fetching receivepurchases data, please wait.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    let form = document.querySelector('#viewreceivepurchasesform');
    let formData = new FormData(form);
    // formData.set('department', '');
    // formData.set('receivepurchases', '');
    let queryParams = new URLSearchParams(formData).toString();

    if(!id)document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> Loading... </td>`

    let request = await httpRequest2(`api/v1/purchases/${state}${id ? `transactionref=${id}` : queryParams ? `${queryParams}` : ''}`, null, document.querySelector('#viewrequisitionform #submit'), 'json', 'GET');
    swal.close(); // Close the loading alert once the request is complete
    if(!id)document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> No Records Retrieved </td>`
    if(request.status) {
        if(!id){
            if(request.data.length) {
                datasource = request.data;
                console.log('datasource10', datasource)
                resolvePagination(datasource, onreceivepurchasesTableDataSignal);
            }
        } else {
            if(!request.data.length) {
                return notification(`Purchase order with the reference ${id} cannot be found`, 0, 20000)
            }
            document.getElementsByClassName('updater')[0].click();
            receivepurchasesid = request.data[0].id;
            did('purchaseformrp').classList.remove('hidden');
            did('supplier').tomselect.setValue(request.data[0].items[0].supplier);
            // did('branch').value = request.data[0].items[0].branch;
            did('departmentfrom').value = request.data[0].items[0].department;
            did('branch').tomselect.setValue(request.data[0].items[0].branch);
            populateData(request.data[0]);
            populateData(request.data[0].items[0]);
            did('tabledata2').innerHTML = '';
            for(let i=0;i<request.data[0].items.length;i++){
                const genid = genID();
                await addrowreceivepurchases(genid);
                did(`supplyitem_${genid}`).tomselect.setValue(request.data[0].items[i].itemid);
                did(`qty_${genid}`).value = request.data[0].items[i].qty;
                did(`cost_${genid}`).value = request.data[0].items[i].cost;
                receivepurchasesreqcal(did(`cost_${genid}`));
            }
            setTimeout(() => {
                did('departmentfrom').value = request.data[0].items[0].department;
            }, 1000);
        }
    } else {
        return notification('No records retrieved');
    }
}

async function addrowreceivepurchases(id) {
    const tabledata = document.getElementById('tabledata2');
    const newRow = document.createElement('tr');
    const genid = id? id : genID();
    newRow.id = 'reqrow_'+genid;
    newRow.innerHTML = `
        <td class="text-center opacity-70"> 
            <label class="hidden">Item</label>
            <select name="supplyitem" id="supplyitem_${genid}" class="form-controls comp">
                <!-- Options will be populated dynamically -->
            </select>
        </td>
        <td>
            <label class="hidden">Expected Cost</label>
            <input onchange="receivepurchasesreqcal(this)" type="number" name="cost" id="cost_${genid}" class="form-control comp comma" placeholder="Enter Expected Cost">
        </td>
        <td>
            <label class="hidden">Quantity</label>
            <input onchange="receivepurchasesreqcal(this)" type="number" name="qty" id="qty_${genid}" class="form-control comp comma" placeholder="Enter Quantity">
        </td>
        <td>
            <label class="hidden">Value</label>
            <input readonly type="text" name="value[]" id="val_${genid}" class="form-control comp comma" placeholder="">
        </td>
        <td>
            <div class="flex gap-4 items-center h-full w-fit py-3">
                <button onclick="addrowreceivepurchases()" title="Add row entry" class="material-symbols-outlined rounded-full bg-primary-g h-8 w-8 text-white drop-shadow-md text-xs" style="font-size: 18px;">add</button>
                <button onclick="this.closest('tr').remove()" title="Delete row entry" class="material-symbols-outlined rounded-full bg-red-600 h-8 w-8 text-white drop-shadow-md text-xs" style="font-size: 18px;">delete</button>
            </div>
        </td>
    `;
    tabledata.appendChild(newRow);
    await receivepurchasesappendallitems()
}

function receivepurchasesreqcal(element){
    dynamiccomma(false)
    let el = element.id.split('_')[1]
    if(!did(`supplyitem_${el}`).value){
        did(`val_${el}`).value = '';
        did(`cost_${el}`).value = '';
        did(`qty_${el}`).value = '';
        notification(`No Item Selected`, 0)
        return dynamiccomma(true)
    }
    if(Number(did(`qty_${el}`).value)>0 && Number(did(`qty_${el}`).value)>0){
        did(`val_${el}`).value = Number(did(`cost_${el}`).value) * Number(did(`qty_${el}`).value)
        const valueElements = document.getElementsByName('value[]');
        let totalOrderValue = 0;
        valueElements.forEach(element => {
            const value = parseFloat(element.value) || 0;
            totalOrderValue += value;
        });
        did('totalorder').textContent = totalOrderValue.toFixed(2);
    }
    return dynamiccomma(true)
}

async function receivepurchasesappendallitems() {
    const supplyitem = document.getElementsByName('supplyitem');
    if (supplyitem.length) {
        for (let i = 0; i < supplyitem.length; i++) {
            if (supplyitem[i].children.length == 0) {
                supplyitem[i].innerHTML = `<option value=''>-- Select item --</option>`;
                supplyitem[i].innerHTML += allrpitems.map(data => `<option value='${data.itemid}'>${data.itemname}</option>`).join('');
                console.log(supplyitem[i].id);
                const tomSelectInstance = new TomSelect(`#${supplyitem[i].id}`, {
                    plugins: ['dropdown_input'],
                });

                // Move dropdown to body
                const dropdown = tomSelectInstance.dropdown;
                if (dropdown && dropdown.parentNode !== document.body) {
                    document.body.appendChild(dropdown);
                }

                // Update dropdown position to be centered on the screen
                const updateDropdownPosition = () => {
                    const control = tomSelectInstance.control;
                    const rect = control.getBoundingClientRect();
                    const dropdownHeight = dropdown.offsetHeight;
                    const dropdownWidth = Math.max(rect.width, 200); // Ensure minimum width of 200px
                    const windowHeight = window.innerHeight;
                    const windowWidth = window.innerWidth;

                    dropdown.style.top = `${(windowHeight - dropdownHeight) / 2}px`;
                    dropdown.style.left = `${(windowWidth - dropdownWidth) / 2}px`;
                    dropdown.style.width = `${dropdownWidth}px`;
                };

                // Add event listeners to update position on scroll and resize
                window.addEventListener('scroll', updateDropdownPosition);
                window.addEventListener('resize', updateDropdownPosition);
                updateDropdownPosition();
            }
        }
    }
    return
}

async function getallitemsforreceivepurchases() {
    let request = await httpRequest2('api/v1/inventory/getallitems', null, null, 'json', 'GET');
    return request.data;
}

async function removereceivepurchases(id) {
    try {
        const confirmed = await Swal.fire({
            title: 'Are you sure you want to delete this purchase order?',
            text: "This action cannot be undone.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
            allowOutsideClick: false
        });

        if (confirmed.isConfirmed) {
            // Show loading state using SweetAlert
            const loadingAlert = Swal.fire({
                title: 'Deleting...',
                text: 'Please wait while the purchase order is being deleted.',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            const payload = new FormData();
            payload.append('transactionref', id);

            const request = await httpRequest2('api/v1/purchases/order', payload, null, 'json', 'DELETE');
            Swal.close(); // Close the loading alert once the request is complete

            if (request.status) {
                notification('Purchase order deleted successfully!', 1);
            } else {
                notification('Failed to delete purchase order. Please try again.', 0);
            }
            fetchreceivepurchases();
        }
    } catch (error) {
        notification(`Error: ${error.message}`, 0);
    }
}


async function onreceivepurchasesTableDataSignal() {
    let rows = getSignaledDatasource().map((data, index) => `
        <tr data-open="false" class="source-row-item">
            <td> ${index+1} </td>
            <td> ${formatDate(data.transactiondate.split('T')[0])} </td>
            <td> ${data.transactionref} </td>
            <td> ${data.items.length} </td>
            <td> 
                <table>
                    ${data.items.map((dat, index)=>{
                        return ( index<3 ?
                            `
                        <tr>
                            <td>${dat.itemname}</td>
                            <td style="width: 20px">${formatCurrency(dat.cost)}</td>
                            <td style="width: 20px">${formatNumber(dat.qty)}</td>
                        </tr>
                        `
                        :
                            index==3?`
                            <tr>
                                <td onclick="receivepurchasesview(${data.transactionref})" style="color:green;cursor:pointer">click to view the remaining items ${data.items.length-3} ....</td>
                            </tr>
                            `:``
                        )
                    }).join('')}
                </table> 
            </td>
            <td name="pograndtotal">${formatCurrency(data.items.reduce((accumulator, currentItem) => accumulator + (Number(currentItem.cost) * Number(currentItem.qty)), 0))}</td>
            <td> ${data.suppliername} </td>
            <td> ${data.branchname} </td>
            <td> ${data.departmentname} </td>
            <td>
                <div class="flex items-center h-full gap-2">
                    <button title="Edit row entry" onclick="receivepurchasesviewer('${data.transactionref}')" class="material-symbols-outlined rounded-full bg-green-600 h-8 w-8 text-white drop-shadow-md text-xs" style="font-size: 18px;">visibility</button>
                    <button title="Edit row entry" onclick="fetchreceivepurchases('${data.transactionref}')" class=" hidden material-symbols-outlined rounded-full bg-primary-g h-8 w-8 text-white drop-shadow-md text-xs" style="font-size: 18px;">edit</button>
                    <button title="Delete row entry"s onclick="removereceivepurchases('${data.transactionref}')" class="hidden material-symbols-outlined rounded-full bg-red-600 h-8 w-8 text-white drop-shadow-md text-xs" style="font-size: 18px;">delete</button>
                </div>
            </td>
        </tr>`
    )
    .join('')
    injectPaginatatedTable(rows)
}


function receivepurchasesviewer(id) {
    // Find the purchase order by transactionref
    const thedata = datasource.find(item => item.transactionref == id);
    
    if (!thedata) {
        Swal.fire({
            icon: 'error',
            title: 'Purchase Order Not Found',
            text: `No purchase order found with Reference ${id}.`,
        });
        return;
    }

    // Format the transaction date
    const formattedTransactionDate = new Date(thedata.transactiondate).toLocaleString();
    
    // Calculate total cost and total price for all items
    const totalCost = thedata.items.reduce((acc, item) => acc + item.cost * item.qty, 0);
    const tCost = thedata.items.reduce((acc, item) => acc + item.cost , 0);
    const totalQuantity = thedata.items.reduce((acc, item) => acc + item.qty, 0);

    // Create HTML content for the modal
    const content = `
        <div class="text-left">
            <!-- Purchase Order Information -->
            <div class="mb-6">
                <h2 class="text-xl font-semibold mb-3">Purchase Order Information</h2>
                <table class="min-w-full text-sm">
                    <tbody>
                        <tr>
                            <td class="px-4 py-2 font-semibold">Transaction Reference</td>
                            <td class="px-4 py-2">${thedata.transactionref}</td>
                        </tr>
                        <tr>
                            <td class="px-4 py-2 font-semibold">Transaction Date</td>
                            <td class="px-4 py-2">${formattedTransactionDate}</td>
                        </tr>
                        <tr>
                            <td class="px-4 py-2 font-semibold">Supplier Name</td>
                            <td class="px-4 py-2">${thedata.suppliername}</td>
                        </tr>
                        <tr>
                            <td class="px-4 py-2 font-semibold">Branch Name</td>
                            <td class="px-4 py-2">${thedata.branchname}</td>
                        </tr>
                        <tr>
                            <td class="px-4 py-2 font-semibold">Department Name</td>
                            <td class="px-4 py-2">${thedata.departmentname}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <!-- Items Details -->
            <div class="mb-6">
                <h2 class="text-xl font-semibold mb-3">Items Details</h2>
                <div class="overflow-x-auto">
                    <table class="min-w-full border border-gray-200">
                        <thead class="bg-gray-100">
                            <tr>
                                <th class="px-4 py-2 border">Item ID</th>
                                <th class="px-4 py-2 border">Item Name</th>
                                <th class="px-4 py-2 border">Units</th>
                                <th class="px-4 py-2 border">Expected Cost (₦)</th>
                                <th class="px-4 py-2 border">Quantity</th>
                                <th class="px-4 py-2 border">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${thedata.items.map(item => `
                                <tr>
                                    <td class="px-4 py-2 border">${item.itemid}</td>
                                    <td class="px-4 py-2 border">${item.itemname}</td>
                                    <td class="px-4 py-2 border">${item.units}</td>
                                    <td class="px-4 py-2 border">${item.cost.toLocaleString()}</td>
                                    <td class="px-4 py-2 border">${item.qty}</td>
                                    <td class="px-4 py-2 border">${(Number(item.cost) * Number(item.qty)).toLocaleString()}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                        <tfoot class="bg-gray-100">
                            <tr>
                                <td colspan="3" class="px-4 py-2 font-semibold">Total</td>
                                <td class="px-4 py-2 border font-semibold">${tCost.toLocaleString()}</td>
                                <td class="px-4 py-2 border font-semibold">${totalQuantity.toLocaleString()}</td>
                                <td class="px-4 py-2 border font-semibold">${totalCost.toLocaleString()}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
            
        </div>
    `;

    // Display the modal using SweetAlert2
    Swal.fire({
        title: 'Purchase Order Details',
        html: content,
        width: '900px',
        showCloseButton: true,
        showConfirmButton: true,
        confirmButtonText: 'Close',
        confirmButtonColor: '#3085d6',
        customClass: {
            popup: 'swal2-popup-custom'
        },
        didOpen: () => {
            // Optional: Add any additional JavaScript after modal opens
        }
    });
}



async function receivepurchasesFormSubmitHandler() {
    dynamiccomma(false)
// Prepare the form data as before
const formData = {
    transactionDate: document.getElementById('transactiondate').value,
    description: document.getElementById('description').value,
    transactionRef: document.getElementById('transactionref').value,
    supplier: document.getElementById('paymentref').value,
    amountPaid: document.getElementById('amountpaid').value,
    items: Array.from(document.getElementsByName('supplyitem')).map((item, index) => ({
      itemId: item.value,
      quantity: document.getElementsByName('qty')[index].value,
      cost: document.getElementsByName('cost')[index].value
    }))
  };
  
  // Calculate totals
  const totalQuantity = formData.items.reduce((sum, item) => sum + Number(item.quantity), 0);
  const totalCost = formData.items.reduce(
    (sum, item) => sum + Number(item.cost) * Number(item.quantity),
    0
  );
  const remainingBalance = totalCost - Number(formData.amountPaid);
  
  // Modal Content
  const modalContent = `
    <div class="p-5 bg-white rounded-lg shadow-lg text-sm text-gray-700">
      <!-- Title -->
      <h2 class="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">
        Confirm Purchase Order Details
      </h2>
  
      <!-- Details (using a DL for a more refined look) -->
      <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 bg-blue-100">
        <div>
          <dt class="text-gray-500">Transaction Date</dt>
          <dd class="font-medium text-gray-800">${formData.transactionDate}</dd>
        </div>
        <div>
          <dt class="text-gray-500">Description</dt>
          <dd class="font-medium text-gray-800">${formData.description}</dd>
        </div>
        <div>
          <dt class="text-gray-500">Transaction Reference</dt>
          <dd class="font-medium text-gray-800">${formData.transactionRef}</dd>
        </div>
        <div>
          <dt class="text-gray-500">Payment Reference</dt>
          <dd class="font-medium text-gray-800">${formData.supplier}</dd>
        </div>
        <div>
          <dt class="text-gray-500">Amount Paid</dt>
          <dd class="font-medium text-gray-800">
            ${Number(formData.amountPaid).toLocaleString()}
          </dd>
        </div>
        <div>
          <dt class="text-gray-500">Remaining Balance</dt>
          <dd class="font-medium text-gray-800">
            ${remainingBalance.toLocaleString()}
          </dd>
        </div>
      </dl>
  
      <!-- Table Container -->
      <div class="mt-5 table-content">
        <table class="table-auto w-full">
          <thead class="bg-gray-50 uppercase text-xs tracking-wider text-gray-500 border-b">
            <tr>
              <th style="width:10px;" class="px-2 py-2">Item ID</th>
              <th class="px-2 py-2 text-center" style="text-align: center">Quantity</th>
              <th class="px-2 py-2 text-center" style="text-align: center">Cost</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            ${formData.items
              .map(
                (item, idx) => `
                  <tr class="hover:bg-gray-50">
                    <td class="px-2 py-2 text-gray-700">${item.itemId}</td>
                    <td class="px-2 py-2 text-gray-700">${item.quantity}</td>
                    <td class="px-2 py-2 text-gray-700">
                      ${Number(item.cost).toLocaleString()}
                    </td>
                  </tr>
                `
              )
              .join('')}
          </tbody>
          <tfoot class="bg-gray-50">
            <tr>
              <td class="px-2 py-2 font-semibold text-gray-800 border-t">
                Total
              </td>
              <td class="px-2 py-2 font-semibold text-gray-800 border-t">
                ${totalQuantity}
              </td>
              <td class="px-2 py-2 font-semibold text-gray-800 border-t">
                ${totalCost.toLocaleString()}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
  
      <!-- Warning Text -->
      <p class="mt-4 text-red-600 text-xs font-semibold">
        Please confirm the details. 
      </p>
    </div>
  `;
  
  // Show the SweetAlert modal at 80% screen width
//   const paymentMethod = document.getElementById('paymentMethod').value;
//   if (!paymentMethod) {
//     await Swal.fire({
//       title: 'Payment Method Required',
//       text: 'Please select a payment method11.',
//       icon: 'error',
//       confirmButtonText: 'OK',
//       confirmButtonColor: '#3085d6'
//     });
//     return dynamiccomma(true);
//   }

  const userConfirmed = await Swal.fire({
    title: 'Confirm Details',
    html: modalContent,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Confirm',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    width: '80%' // <-- Key for 80% screen width
  });

  // Check if payment method is CASH and voucher is not uploaded
  if (document.getElementById('paymentMethod').value === 'CASH' && !document.getElementById('voucher').files.length) {
    await Swal.fire({
      title: 'Voucher Required',
      text: 'Please upload a voucher for cash payments.',
      icon: 'error',
      confirmButtonText: 'OK',
      confirmButtonColor: '#3085d6'
    });
    return dynamiccomma(true);
  }
  
  if (!userConfirmed.isConfirmed) {
    return dynamiccomma(true);
  }

  // Show a second confirmation modal
  const legalConfirmation = await Swal.fire({
    title: 'Legal Confirmation',
    text: 'By confirming, you acknowledge that you will be legally held responsible for any incorrect data and confirm that all details are entered correctly.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'I Agree',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    // width: '80%'
  });

  if (!legalConfirmation.isConfirmed) {
    return dynamiccomma(true);
  }
  
  // If confirmed, continue with your logic ...
  
  // Continue with your logic here...
  
  
  // If confirmed, continue with your logic...
  

    if(!validateForm('receivepurchasesform', getIdFromCls('comp'))) return dynamiccomma(true)

    const supplyItems = document.querySelectorAll('select[name="supplyitem"]');
    const selectedValues = new Set();

    for (const select of supplyItems) {
        const value = select.value;
        if (selectedValues.has(value) && value !== '') {
            notification('Duplicate items selected in supply items!', 0);
            return dynamiccomma(true);
        }
        selectedValues.add(value);
    }

    const payload = new FormData();
    payload.append('rowsize', document.getElementsByName('supplyitem').length);
    payload.append('branch', document.getElementById('branch').value);
    payload.append('department', document.getElementById('departmentfrom').value);
    payload.append('transactiondate', document.getElementById('transactiondate').value);
    payload.append('description', document.getElementById('description').value);
    payload.append('transactionref', document.getElementById('transactionref').value);
    payload.append('supplier', document.getElementById('supplier').value);
    payload.append('reference', document.getElementById('reference').value);
    payload.append('amountpaid', document.getElementById('amountpaid').value);
    payload.append('paymentref', document.getElementById('paymentref').value);
    payload.append('tfrom', document.getElementById('paymentMethod').value);
    const voucherFile = document.getElementById('voucher').files[0];
    if (voucherFile) {
        payload.append('voucher', voucherFile);
    }
    for (let i = 0; i < document.getElementsByName('supplyitem').length; i++) {
        if(document.getElementsByName('qty')[i].value < 1){
            Swal.close()
            dynamiccomma(true)
            return notification('Please check the quantity. It cannot be less than 1.', 0)}
        payload.append(`itemid${i+1}`, document.getElementsByName('supplyitem')[i].value);
        payload.append(`qty${i+1}`, document.getElementsByName('qty')[i].value);
        payload.append(`cost${i+1}`, document.getElementsByName('cost')[i].value);
    }
    
    const pinStatus = await getAndVerifyPin();
    if(!pinStatus) return;

    const confirmed = await Swal.fire({
        title: receivepurchasesid ? 'Updating...' : 'Submitting...',
        text: 'Please wait while we submit your data.',
        icon: 'info',
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: async () => {
            Swal.showLoading();
            let request = await httpRequest2('api/v1/purchases/purchase', payload, document.querySelector('#receivepurchasesform #submit'), 'json', 'POST');
            Swal.close();

            if (request.status) {
                notification(request.message, 1);
                const form = document.querySelector('#receivepurchasesform');
                form.reset();
                did('tabledata2').innerHTML = '';
                if(receivepurchasesid)form.querySelectorAll('input, select, textarea').forEach(input => input.value = '');
                receivepurchasesid = '';
                did('transactionref').value='';
                did('purchaseformrp').classList.add('hidden');
                const supplierSelect = document.querySelector('#supplier');
                if (supplierSelect.tomselect) {;
                    supplierSelect.tomselect.clear();
                }
                document.getElementsByClassName('viewer')[0].click();
                did('totalorder').innerHTML = 'Nill';
                fetchreceivepurchases();
                return dynamiccomma(true)
            } else {    
                notification(request.message, 0);
                return dynamiccomma(true)
            }
        }
    });
}
