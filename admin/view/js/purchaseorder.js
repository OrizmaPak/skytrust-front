let purchaseorderid
let allpoitems
async function purchaseorderActive() {
    await fetchpurchaseorder()
    purchaseorderid = ''
    const form = document.querySelector('#purchaseorderform')
    const form2 = document.querySelector('#viewpurchaseorderform')
    if(form.querySelector('#submit')) form.querySelector('#submit').addEventListener('click', function(event) {
        event.preventDefault();
        purchaseorderFormSubmitHandler();
    });
    if(form2.querySelector('#querySubmit')) form2.querySelector('#querySubmit').addEventListener('click', purchaseorderFormSubmitHandler)
    document.getElementById('transactiondate').value = new Date().toISOString().split('T')[0];
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
    allpoitems = await getallitemsforpurchaseorder();
    // await addrowpurchaseorder();
    await purchaseorderappendallitems();


    // await getAllpurchaseorder(true)
    // new TomSelect('#purchaseorder', {
    //     // plugins: ['remove_button'],
    //     onInitialize: function() {
    //         console.log(checkpermission('FILTER purchaseorder'))
    //         if(!checkpermission('FILTER purchaseorder')) this.setValue(the_user.purchaseorder);
            // if(!checkpermission('FILTER purchaseorder')) this.setTextboxValue('readonly', true);
    //     }
    // });
    // await getAllUsers('useridlist', 'id')
}

async function fetchpurchaseorder(id) {

    // Show loading state using SweetAlert
    const loadingAlert = Swal.fire({
        title: 'Please wait...',
        text: 'Fetching purchaseorder data, please wait.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    let form = document.querySelector('#viewpurchaseorderform');
    let formData = new FormData(form);
    // formData.set('department', '');
    // formData.set('purchaseorder', '');
    let queryParams = new URLSearchParams(formData).toString();

    if(!id)document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> Loading... </td>`

    let request = await httpRequest2(`api/v1/purchases/order?${id ? `transactionref=${id}` : queryParams ? `${queryParams}` : ''}`, null, document.querySelector('#viewrequisitionform #submit'), 'json', 'GET');
    swal.close(); // Close the loading alert once the request is complete
    if(!id)document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> No Records Retrieved </td>`
    if(request.status) {
        if(!id){
            if(request.data.length) {
                datasource = request.data;
                console.log('datasource10', datasource)
                resolvePagination(datasource, onpurchaseorderTableDataSignal);
            }
        } else {
            document.getElementsByClassName('updater')[0].click();
            purchaseorderid = request.data[0].id;
            did('supplier').tomselect.setValue(request.data[0].items[0].supplier);
            did('departmentfrom').value = request.data[0].items[0].department;
            populateData(request.data[0]);
            did('tabledata2').innerHTML = '';
            for(let i=0;i<request.data[0].items.length;i++){
                const genid = genID();
                await addrowpurchaseorder(genid);
                did(`supplyitem_${genid}`).tomselect.setValue(request.data[0].items[i].itemid);
                did(`qty_${genid}`).value = request.data[0].items[i].qty;
                did(`cost_${genid}`).value = request.data[0].items[i].cost;
                purchaseorderreqcal(did(`cost_${genid}`));
            }
        }
    } else {
        return notification('No records retrieved');
    }
}

async function addrowpurchaseorder(id) {
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
            <input onchange="purchaseorderreqcal(this)" type="number" name="cost" id="cost_${genid}" class="form-control comp comma" placeholder="Enter Expected Cost">
        </td>
        <td>
            <label class="hidden">Quantity</label>
            <input onchange="purchaseorderreqcal(this)" type="number" name="qty" id="qty_${genid}" class="form-control comp comma" placeholder="Enter Quantity">
        </td>
        <td>
            <label class="hidden">Value</label>
            <input readonly type="text" name="value[]" id="val_${genid}" class="form-control comp comma" placeholder="">
        </td>
        <td>
            <div class="flex h-full w-fit items-center gap-4 py-3">
                <button onclick="addrowpurchaseorder()" title="Add row entry" class="material-symbols-outlined h-8 w-8 rounded-full bg-primary-g text-xs text-white drop-shadow-md" style="font-size: 18px;">add</button>
                <button onclick="this.closest('tr').remove()" title="Delete row entry" class="material-symbols-outlined h-8 w-8 rounded-full bg-red-600 text-xs text-white drop-shadow-md" style="font-size: 18px;">delete</button>
            </div>
        </td>
    `;
    tabledata.appendChild(newRow);
    await purchaseorderappendallitems()
}

function purchaseorderreqcal(element){
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

async function purchaseorderappendallitems() {
    const supplyitem = document.getElementsByName('supplyitem');
    if (supplyitem.length) {
        for (let i = 0; i < supplyitem.length; i++) {
            if (supplyitem[i].children.length == 0) {
                supplyitem[i].innerHTML = `<option value=''>-- Select item --</option>`;
                supplyitem[i].innerHTML += allpoitems.map(data => `<option value='${data.itemid}'>${data.itemname}</option>`).join('');
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

async function getallitemsforpurchaseorder() {
    let request = await httpRequest2('api/v1/inventory/getallitems', null, null, 'json', 'GET');
    return request.data;
}

async function removepurchaseorder(id) {
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
            fetchpurchaseorder();
        }
    } catch (error) {
        notification(`Error: ${error.message}`, 0);
    }
}


async function onpurchaseorderTableDataSignal() {
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
                                                    <td onclick="purchaseorderview(${data.transactionref})" style="color:green;cursor:pointer">click to view the remaining items ${data.items.length-3} ....</td>
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
                                    <div class="flex h-full items-center gap-2">
                                        <button title="View details row entry" onclick="purchaseorderviewer('${data.transactionref}')" class="material-symbols-outlined h-8 w-8 rounded-full bg-green-600 text-xs text-white drop-shadow-md" style="font-size: 18px;">visibility</button>
                                        <button title="Edit row entry" onclick="fetchpurchaseorder('${data.itemname}')" class="material-symbols-outlined !hidden h-8 w-8 rounded-full bg-primary-g text-xs text-white drop-shadow-md" style="font-size: 18px;">edit</button>
                                        <button title="Delete row entry"s onclick="removepurchaseorder('${data.itemname}')" class="material-symbols-outlined !hidden h-8 w-8 rounded-full bg-red-600 text-xs text-white drop-shadow-md" style="font-size: 18px;">delete</button>
                                    </div>
                                </td>
    </tr>`
    )
    .join('')
    injectPaginatatedTable(rows)
}


function purchaseorderviewer(id) {
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
                <h2 class="mb-3 text-xl font-semibold">Purchase Order Information</h2>
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
                <h2 class="mb-3 text-xl font-semibold">Items Details</h2>
                <div class="overflow-x-auto">
                    <table class="min-w-full border border-gray-200">
                        <thead class="bg-gray-100">
                            <tr>
                                <th class="border px-4 py-2">Item ID</th>
                                <th class="border px-4 py-2">Item Name</th>
                                <th class="border px-4 py-2">Units</th>
                                <th class="border px-4 py-2">Expected Cost (₦)</th>
                                <th class="border px-4 py-2">Quantity</th>
                                <th class="border px-4 py-2">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${thedata.items.map(item => `
                                <tr>
                                    <td class="border px-4 py-2">${item.itemid}</td>
                                    <td class="border px-4 py-2">${item.itemname}</td>
                                    <td class="border px-4 py-2">${item.units}</td>
                                    <td class="border px-4 py-2">${item.cost.toLocaleString()}</td>
                                    <td class="border px-4 py-2">${item.qty}</td>
                                    <td class="border px-4 py-2">${(Number(item.cost) * Number(item.qty)).toLocaleString()}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                        <tfoot class="bg-gray-100">
                            <tr>
                                <td colspan="3" class="px-4 py-2 font-semibold">Total</td>
                                <td class="border px-4 py-2 font-semibold">${tCost.toLocaleString()}</td>
                                <td class="border px-4 py-2 font-semibold">${totalQuantity.toLocaleString()}</td>
                                <td class="border px-4 py-2 font-semibold">${totalCost.toLocaleString()}</td>
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



async function purchaseorderFormSubmitHandler() {
    dynamiccomma(false)
    if(!validateForm('purchaseorderform', getIdFromCls('comp'))) return dynamiccomma(true)

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
    for (let i = 0; i < document.getElementsByName('supplyitem').length; i++) {
        if(document.getElementsByName('qty')[i].value < 1){
            Swal.close()
            dynamiccomma(true)
            return notification('Please check the quantity. It cannot be less than 1.', 0)}
        payload.append(`itemid${i+1}`, document.getElementsByName('supplyitem')[i].value);
        payload.append(`qty${i+1}`, document.getElementsByName('qty')[i].value);
        payload.append(`cost${i+1}`, document.getElementsByName('cost')[i].value);
    }
    

    const confirmed = await Swal.fire({
        title: purchaseorderid ? 'Updating...' : 'Submitting...',
        text: 'Please wait while we submit your data.',
        icon: 'info',
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: async () => {
            Swal.showLoading();
            let request = await httpRequest2('api/v1/purchases/order', payload, document.querySelector('#purchaseorderform #submit'), 'json', 'POST');
            Swal.close();

            if (request.status) {
                notification('Success!', 1);
                const form = document.querySelector('#purchaseorderform');
                form.reset();
                did('tabledata2').innerHTML = '';
                if(purchaseorderid)form.querySelectorAll('input, select, textarea').forEach(input => input.value = '');
                purchaseorderid = '';
                const supplierSelect = document.querySelector('#supplier');
                if (supplierSelect.tomselect) {
                    supplierSelect.tomselect.clear();
                }
                document.getElementsByClassName('viewer')[0].click();
                did('totalorder').innerHTML = 'Nill';
                fetchpurchaseorder();
                return dynamiccomma(true)
            } else {    
                notification(request.message, 0);
                return dynamiccomma(true)
            }
        }
    });
}
