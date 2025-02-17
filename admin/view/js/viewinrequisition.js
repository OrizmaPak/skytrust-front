let viewinrequisitionid
// let initialinventoryload
async function viewinrequisitionActive() {
    thedepartment = '';
    thebranch = '';
    initialinventoryload = ''
    const form = document.querySelector('#viewinrequisitionform')
    // const form2 = document.querySelector('#updateinventories')
    if(form.querySelector('#submit')) form.querySelector('#submit').addEventListener('click', e=>fetchviewinrequisitions())
    if(document.querySelector('#updateinventories')) document.querySelector('#updateinventories').addEventListener('click', e=>viewinrequisitionFormEditHandler())
    datasource = []
    await getAllbranch(!checkpermission('FILTER BRANCH'), 'branch')
    await new TomSelect('#branch', {
        plugins: ['dropdown_input'],
        onInitialize: function() {
            console.log(checkpermission('FILTER BRANCH'))
            if(!checkpermission('FILTER BRANCH')) this.setValue(the_user.branch);
            if(!checkpermission('FILTER BRANCH')) this.setTextboxValue('readonly', true);
            handleBranchChange(this.getValue(), 'departmentsearch');
        },
        onChange: function() {
            handleBranchChange(this.getValue(), 'departmentsearch');
        }
    });
    // new TomSelect('#itemidsearch', {
    //     plugins: ['dropdown_input']
    // })
    // await fetchviewinrequisitions()
}

async function fetchviewinrequisitions(id) {
    thedepartment = '';
    thebranch = '';
    if(!validateForm('viewinrequisitionform', getIdFromCls('comp'))) return

    
    let form = document.querySelector('#viewinrequisitionform');
    let formData = new FormData(form);
    // formData.set('department', '');
    // formData.set('branch', '');
    let queryParams = new URLSearchParams(formData).toString();

    document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> Loading... </td>`

    let request = await httpRequest2(`api/v1/inventory/requisition/inview/approve?${queryParams ? `${queryParams}` : ''}${id ? `&id=${id}` : ''}`, null, document.querySelector('#viewinrequisitionform #submit'), 'json', 'GET');
    if(!id)document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> No Records Retrieved </td>`
    if(request.status) {
        if(!id){
            if(request.data.length) {
                datasource = request.data
                if(!initialinventoryload){
                    initialinventoryload = datasource; 
                    // document.getElementById('itemidsearch').innerHTML = `<option value="">-- SEARCH ITEM --</option>`                   
                    // document.getElementById('itemidsearch').innerHTML += initialinventoryload.map(data=>`<option value="${data.itemid}">${data.itemname}</option>`).join('')
                }
                // document.getElementById('tabledata').innerHTML = request.data.map((item, index) => `
                // <tr>
                //     <td>${index + 1 }</td>
                //     <td><input type="checkbox" name="itemer" id="${item.itemid}"></td>
                //     <td>${item.itemname}</td>
                //     <td><input type="number" name="price" value="${item.price??''}" placeholder="Enter price" class="form-control"></td>
                //     <td><input type="number" name="pricetwo" value="${item.pricetwo??''}" placeholder="Enter second price" class="form-control"></td>
                //     <td><input type="number" name="minbalance" value="${item.minimumbalance??''}" placeholder="Enter minimum balance" class="form-control"></td>
                //     <td>${item.qty}</td>
                // </tr>`
                // )
                // .join('')
                thedepartment = document.getElementById('departmentsearch').value;
                thebranch = document.getElementById('branch').value;
                resolvePagination(datasource, onviewinrequisitionTableDataSignal)
            }
        }else{
             viewinrequisitionid = request.data[0].id
            populateData(request.data[0])
        }
    }
    else return notification('No records retrieved')
}

async function removeviewinrequisition(id) {
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
    fetchviewinrequisitions()
    return notification(request.message);
    
}


async function onviewinrequisitionTableDataSignal() {
    let rows = getSignaledDatasource().map((item, index) => `
    <tr>
        <td>${index + 1 }</td>
        <td>${item.items.length}</td>
        <td>
                                <div class="table-content overflow-auto flex">
                                     <table>
                                        <thead>
                                            <tr class="!bg-[#64748b] text-white">
                                                <th>Item Name</th>
                                                <th>Cost</th>
                                                <th>Selling Price</th>
                                                <th>Quantity</th>
                                                <th>status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${item.items.map((dat, index)=>{
                                                return ( index<3 ?
                                                    `
                                                <tr>
                                                    <td>${dat.itemname}</td>
                                                    <td style="width: 20px">${formatCurrency(dat.cost)}</td>
                                                    <td style="width: 20px">${formatCurrency(dat.sellingprice)}</td>
                                                    <td style="width: 20px">${dat.qty}</td>
                                                    <td style="width: 70px">${dat.status === 'ACTIVE' ? '<span class="text-green-600 text-xs">APPROVED</span>' : 
                     dat.status === 'DECLINED' ? '<span class="text-red-600 text-xs">DECLINED</span>' : 
                     dat.status === 'DELETED' ? '<span class="text-red-600 text-xs">DELETED</span>' : 
                     dat.status === 'PENDING REQUISITION' ? '<span class="text-orange-600 text-xs">EXPECTED REQUISITION</span>' : 
                     `<span class="text-orange-600 text-xs">${dat.status}</span>`}</td>
                                                </tr>
                                                `
                                                :
                                                   index==3?`
                                                   <tr>
                                                        <td onclick="intakemodalviewinrequisition(${item.reference})" style="color:green;cursor:pointer">click to view the remaining items ${data.items.length-3} ....</td>
                                                    </tr>
                                                    `:``
                                                )
                                            }).join('')}
                                        </tbody>
                                    </table>
                                </div>
         </td>
        <td> ${item.items.reduce((accumulator, currentItem) => {return accumulator + Number(currentItem.qty)}, 0)}</td>
        <td> ${formatCurrency(item.items.reduce((accumulator, currentItem) => {return accumulator + (Number(currentItem.cost) * Number(currentItem.qty))}, 0))} </td>
        <td> ${formatCurrency(item.items.reduce((accumulator, currentItem) => {return accumulator + (Number(currentItem.sellingprice) * Number(currentItem.qty))}, 0))} </td>
        <td> ${formatDate(item.transactiondate.split('T')[0])} </td>
        <td> ${formatTime(item.transactiondate.split('T')[1].split('+')[0])} </td>
        <td> ${item.branchfromname} </td>
        <td> ${item.departmentfromname} </td>
        <td> ${(() => {
            const statusCounts = item.items.reduce((acc, currentItem) => {
                acc[currentItem.status] = (acc[currentItem.status] || 0) + 1;
                return acc;
            }, {});
            return Object.entries(statusCounts)
                .map(([status, count]) => {
                    const colorClass = status === 'ACTIVE' ? 'text-green-600' :
                                       status === 'DECLINED' || status === 'DELETED' ? 'text-red-600' :
                                       status === 'PENDING REQUISITION' ? 'text-orange-600' :
                                       'text-orange-600';
                    const displayStatus = status === 'PENDING REQUISITION' ? 'EXPECTED REQUISITION' : status;
                    return `<span class="${colorClass} text-xs">${count} ${displayStatus}</span>`;
                })
                .join(', ');
        })()} </td>
        <td>
            <div class="flex items-center h-full gap-2">
                <button title="Edit row entry" onclick="viewinrequisitionview('${item.reference}', '${JSON.stringify(item).replaceAll('"', '|||').replaceAll("'", '')}')" class="material-symbols-outlined rounded-full bg-green-600 h-8 w-8 text-white drop-shadow-md text-xs" style="font-size: 18px;">visibility</button>
                    <button title="Delete row entry" onclick="Swal.fire({
                        title: 'Warning',
                        text: 'Only items expected requisition can be editted. Do you want to continue?',
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonText: 'Continue',
                        cancelButtonText: 'Go Back',
                        confirmButtonColor: '#0000FF', // Blue color for continue
                        cancelButtonColor: '#FF0000' // Red color for cancel
                    }).then((result) => {
                        if (result.isConfirmed) {
                            // Run the function if the user clicks continue
                            runEditFunction('${item.reference}', '${JSON.stringify(item).replaceAll('"', '|||').replaceAll("'", '')}');
                        } else {
                            // Return to this modal if the user clicks cancel
                            //return viewinrequisitionview('${item.reference}', '${JSON.stringify(item).replaceAll('"', '|||').replaceAll("'", '')}');
                        }
                    });" class="material-symbols-outlined rounded-full bg-primary-g h-8 w-8 text-white drop-shadow-md text-xs" style="font-size: 18px;">edit</button>
            </div>
        </td>
    </tr>`
    )
    .join('')
    injectPaginatatedTable(rows)
}

 // Start of Selection
 function viewinrequisitionview(reference, theitems) {
    let item = JSON.parse(theitems.replaceAll('|||', '"'));
    let tableRows = item.items.map((item, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${item.itemid}</td>
            <td>${item.itemname}</td>
            <td>${item.qty}</td>
            <td>${formatCurrency(item.cost)}</td>
            <td>${formatCurrency(item.sellingprice)}</td>
            <td>${formatCurrency(parseInt(item.qty) * parseInt(item.sellingprice))}</td>
            <td>
            ${item.status === 'ACTIVE' ? '<span class="text-green-600 text-xs">APPROVED</span>' : 
                item.status === 'DECLINED' ? '<span class="text-red-600 text-xs">DECLINED</span>' : 
                item.status === 'DELETED' ? '<span class="text-red-600 text-xs">DELETED</span>' : 
                item.status === 'PENDING REQUISITION' ? '<span class="text-orange-600 text-xs">EXPECTED REQUISITION</span>' :
                `<span class="text-orange-600 text-xs">${item.status}</span>`}
            </td>
        </tr>
    `).join('');

    // Calculate totals
    const totalQty = item.items.reduce((acc, curr) => acc + Number(curr.qty), 0);
    const totalCost = item.items.reduce((acc, curr) => acc + (Number(curr.cost) * Number(curr.qty)), 0);
    const totalPrice = item.items.reduce((acc, curr) => acc + (Number(curr.sellingprice) * Number(curr.qty)), 0);
    const totalQtyPrice = item.items.reduce((acc, curr) => acc + (Number(curr.qty) * Number(curr.sellingprice)), 0);

    // Add total row
    tableRows += `
        <tr>
            <td colspan="3"><strong>Total</strong></td>
            <td>${totalQty}</td>
            <td>${formatCurrency(totalCost)}</td>
            <td>${formatCurrency(totalPrice)}</td>
            <td>${formatCurrency(totalQtyPrice)}</td>
        </tr>
    `;

    Swal.fire({
        title: 'View Items Demanded',
        html: `
            <div class="p-6 bg-white rounded-lg shadow-md">
                <div class="flex flex-col md:flex-row justify-between">
                    <div class="w-full md:pr-2">
                        <table class="min-w-full divide-y divide-gray-200">
                            <tbody class="divide-y divide-gray-200">
                                <tr>
                                    <th class="px-4 py-2 text-left text-sm font-semibold text-gray-700">Invoice Number</th>
                                    <td class="px-4 py-2 text-sm text-gray-900 text-right">${reference}</td>
                                </tr>
                                <tr>
                                    <th class="px-4 py-2 text-left text-sm font-semibold text-gray-700">Transaction Date</th>
                                    <td class="px-4 py-2 text-sm text-gray-900 text-right">${formatDate(item.transactiondate.split('T')[0])}</td>
                                </tr>
                                <tr>
                                    <th class="px-4 py-2 text-left text-sm font-semibold text-gray-700">Transaction Time</th>
                                    <td class="px-4 py-2 text-sm text-gray-900 text-right">${formatTime(item.transactiondate.split('T')[1].split('+')[0])}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="flex flex-col md:flex-row justify-between mb-4">
                    <div class="w-full md:w-1/2 md:pr-2">
                        <h3 class="text-sm font-semibold text-gray-700 mb-2">From</h3>
                        <table class="min-w-full divide-y divide-gray-200">
                            <tbody class="divide-y divide-gray-200">
                                <tr>
                                    <th class="px-4 py-2 text-left text-sm font-semibold text-gray-700">Branch</th>
                                    <td class="px-4 py-2 text-sm text-gray-900">${item.branchfromname}</td>
                                </tr>
                                <tr>
                                    <th class="px-4 py-2 text-left text-sm font-semibold text-gray-700">Department</th>
                                    <td class="px-4 py-2 text-sm text-gray-900">${item.departmentfromname}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="w-full md:w-1/2 md:pl-2 mt-4 md:mt-0">
                        <h3 class="text-sm font-semibold text-gray-700 mb-2">To</h3>
                        <table class="min-w-full divide-y divide-gray-200">
                            <tbody class="divide-y divide-gray-200">
                                <tr>
                                    <th class="px-4 py-2 text-left text-sm font-semibold text-gray-700">Branch</th>
                                    <td class="px-4 py-2 text-sm text-gray-900">${item.branchtoname}</td>
                                </tr>
                                <tr>
                                    <th class="px-4 py-2 text-left text-sm font-semibold text-gray-700">Department</th>
                                    <td class="px-4 py-2 text-sm text-gray-900">${item.departmenttoname}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div class="table-content my-4">
                <table>
                    <thead>
                        <tr>
                            <th style="text-align: center">s/n</th>
                            <th style="text-align: center">Item ID</th>
                            <th style="text-align: center">Item Name</th>
                            <th style="text-align: center">cost</th>
                            <th style="text-align: center">Quantity</th>
                            <th style="text-align: center">price</th>
                            <th style="text-align: center">total</th>
                            <th style="text-align: center">status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
            </div>
        `,
        width: '80%',
        showCloseButton: true,
        focusConfirm: false,
        confirmButtonText: 'Edit this Requisition',
        showCancelButton: true,
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#0000FF', // Blue color for the edit button
        cancelButtonColor: '#FF0000', // Red color for the cancel button
        preConfirm: () => {
            return Swal.fire({
                title: 'Warning',
                text: 'Only items expected requisition can be editted. Do you want to continue?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Continue',
                cancelButtonText: 'Go Back',
                confirmButtonColor: '#0000FF', // Blue color for continue
                cancelButtonColor: '#FF0000' // Red color for cancel
            }).then((result) => {
                if (result.isConfirmed) {
                    // Run the function if the user clicks continue
                    runEditFunction(reference, theitems);
                } else {
                    // Return to this modal if the user clicks cancel
                    return viewinrequisitionview(`${reference}`, `${theitems}`)
                }
            });
        }
    });
 }


 function runEditFunction(reference, theitems) {
     const item = JSON.parse(theitems.replaceAll('|||', '"'));
     let tableRows = item.items.map((item, index) => `
         <tr id="row-${index}">
             <td>${index + 1}</td>
             <td class="hidden">${item.itemid}</td>
             <td>${item.itemname}</td>
             <td>
                 <input type="number" class="form-control cost-input" readonly value="${item.cost}" ${item.status !== 'PENDING REQUISITION' ? 'readonly' : ''}>
             </td>
             <td>
                 <input type="number" class="form-control qty-input" value="${item.qty}" max="${item.qty}" ${item.status !== 'PENDING REQUISITION' ? 'readonly' : ''}>
             </td>
             <td>
                 <input type="number" class="form-control price-input" value="${item.sellingprice}" ${item.status !== 'PENDING REQUISITION' ? 'readonly' : ''}>
             </td>
             <td class="total-cell">${formatCurrency(parseInt(item.qty) * parseFloat(item.sellingprice))}</td>
             <td>
                 ${item.status === 'ACTIVE' ? '<span class="text-green-600 text-xs">APPROVED</span>' : 
                     item.status === 'DECLINED' ? '<span class="text-red-600 text-xs">DECLINED</span>' : 
                     item.status === 'DELETED' ? '<span class="text-red-600 text-xs">DELETED</span>' : 
                     item.status === 'PENDING REQUISITION' ? '<span class="text-orange-600 text-xs">EXPECTED REQUISITION</span>' :
                     `<span class="text-orange-600 text-xs">${item.status}</span>`}
             </td>
             <td class="flex items-center gap-3">
                 <button title="Delete row entry" onclick="markItemAsDeleted(${index})" class="material-symbols-outlined rounded-full bg-red-600 h-8 w-8 text-white drop-shadow-md text-xs" ${item.status !== 'PENDING REQUISITION' ? 'disabled' : ''} style="font-size: 18px;">delete</button>
                 <button title="Save row entry" onclick="saveInventoryItem('${item.itemid}', '${JSON.stringify(item).replaceAll("'", '').replaceAll('"', '~~~')}')" class=" hidden material-symbols-outlined rounded-full bg-green-400 h-8 w-8 text-white drop-shadow-md text-xs" ${item.status !== 'PENDING REQUISITION' ? 'disabled' : ''} style="font-size: 18px;">save</button>
             </td>
         </tr>
     `).join('');
 
     // Calculate initial totals
     let totalQty = 0, totalCost = 0, totalPrice = 0, totalValue = 0;
     item.items.forEach((item) => {
         totalQty += Number(item.qty);
         totalCost += Number(item.cost);
         totalPrice += Number(item.sellingprice) * Number(item.qty);
         totalValue += Number(item.qty) * Number(item.sellingprice);
     });
 
     // Add total row
     tableRows += `
         <tr>
             <td colspan="2"><strong>Total</strong></td>
             <td id="total-cost">${formatCurrency(totalCost)}</td>
             <td id="total-qty">${totalQty}</td>
             <td id="total-price">${formatCurrency(totalPrice)}</td>
             <td id="total-value">${formatCurrency(totalValue)}</td>
             <td></td>
             <td></td>
         </tr>
     `;
 
     // Function to mark an item as deleted
     window.markItemAsDeleted = function(index) {
         if (item.items[index].status === 'PENDING REQUISITION') {
             item.items[index].status = 'DELETED';
             document.getElementById(`row-${index}`).style.display = 'none';
             runEditFunction(reference, JSON.stringify(item).replaceAll('"', '|||'));
         }
     };
 
     // Add event listeners for real-time updates
     document.addEventListener('input', function(event) {
         if (event.target.classList.contains('qty-input') || event.target.classList.contains('price-input')) {
             const row = event.target.closest('tr');
             const qtyInput = row.querySelector('.qty-input');
             const priceInput = row.querySelector('.price-input');
             const costInput = row.querySelector('.cost-input');
             const totalCell = row.querySelector('.total-cell');
 
             if (Number(qtyInput.value) > Number(qtyInput.max)) {
                 notification('Quantity exceeds requisited stock. Please create a new requisition for more items.', 0);
                 qtyInput.value = qtyInput.max;
             }
 
             const newTotal = parseFloat(qtyInput.value) * parseFloat(priceInput.value);
             totalCell.textContent = formatCurrency(newTotal);
 
             // Update totals
             let totalQty = 0, totalCost = 0, totalPrice = 0, totalValue = 0;
             // Select all item rows except the last row (total row)
             const tableBody = row.closest('tbody');
             const itemRows = tableBody.querySelectorAll('tr:not(:last-child)');
 
             itemRows.forEach((itemRow) => {
                 const qty = Number(itemRow.querySelector('.qty-input').value) || 0;
                 const cost = Number(itemRow.querySelector('.cost-input').value) || 0;
                 const price = Number(itemRow.querySelector('.price-input').value) || 0;
 
                 totalQty += qty;
                 totalCost += cost * qty;
                 totalPrice += price * qty;
                 totalValue += qty * price;
             });
 
             document.getElementById('total-qty').textContent = totalQty;
            //  document.getElementById('total-cost').textContent = formatCurrency(totalCost);
             document.getElementById('total-price').textContent = formatCurrency(totalPrice);
             document.getElementById('total-value').textContent = formatCurrency(totalValue);
         }
     });
 
     Swal.fire({
         title: 'Edit Items for Requisition',
         html: `
             <div class="p-6 bg-white rounded-lg shadow-md">
                 <div class="table-content my-4">
                     <table>
                         <thead>
                             <tr>
                                 <th style="text-align: center">s/n</th>
                                 <th style="text-align: center" class="hidden">Item ID</th>
                                 <th style="text-align: center">Item Name</th>
                                 <th style="text-align: center">Cost</th>
                                 <th style="text-align: center">Quantity</th>
                                 <th style="text-align: center">Price</th>
                                 <th style="text-align: center">Total</th>
                                 <th style="text-align: center">Status</th>
                                 <th style="text-align: center">Action</th>
                             </tr>
                         </thead>
                         <tbody>
                             ${tableRows}
                         </tbody>
                     </table>
                 </div>
             </div>
         `,
         width: '80%',
         showCloseButton: true,
         focusConfirm: false,
         confirmButtonText: 'Save Changes',
         showCancelButton: true,
         cancelButtonText: 'Cancel',
         confirmButtonColor: 'green', // Green color for the save button
         cancelButtonColor: '#FF0000', // Red color for the cancel button
         preConfirm: () => {
             // Collect the updated values and handle the save logic here
             const updatedItems = [];
             const tableBody = Swal.getHtmlContainer().querySelector('tbody');
             const itemRows = tableBody.querySelectorAll('tr:not(:last-child)');
 
             itemRows.forEach((row, index) => {
                 const itemid = row.querySelector('td:nth-child(2)').textContent;
                 const itemname = row.querySelector('td:nth-child(3)').textContent;
                 const cost = row.querySelector('.cost-input').value;
                 const qty = row.querySelector('.qty-input').value;
                 const sellingprice = row.querySelector('.price-input').value;
                 const statusText = row.querySelector('td:nth-child(8)').textContent;
                 const status = statusText.trim();
 
                 updatedItems.push({
                     itemid: itemid,
                     itemname: itemname,
                     qty: qty,
                     cost: cost,
                     sellingprice: sellingprice,
                     status: status
                 });
             });
 
             // Call a function to save the updated items
             saveUpdatedItems(reference, updatedItems);
         }
     });
 
     async function saveUpdatedItems(reference, updatedItems) {
         const payload = new FormData();
         payload.append('rowsize', updatedItems.length);
 
         updatedItems.forEach((item, index) => {
             payload.append(`itemid${index + 1}`, item.itemid);
             payload.append(`reference${index + 1}`, reference);
             payload.append(`qty${index + 1}`, item.qty);
             payload.append(`sellingprice${index + 1}`, item.sellingprice);
             payload.append(`status${index + 1}`, item.status);
         });
 
         // Show SweetAlert processing
         Swal.fire({
             title: 'Processing',
             text: 'Please wait while we update the requisition...',
             allowOutsideClick: false,
             didOpen: () => {
                 Swal.showLoading();
             }
         });
 
         try {
             const response = await httpRequest2('api/v1/inventory/requisition/edit', payload, null, 'json', 'POST');
             Swal.close(); // Close SweetAlert processing
             if (response.status) {
                 notification('Requisition updated successfully');
             } else {
                 notification('Failed to update requisition');
             }
         } catch (error) {
             Swal.close(); // Close SweetAlert processing
             console.error('Unexpected Error:', error);
             notification('An unexpected error occurred');
         }
     }
 }



async function viewinrequisitionFormEditHandler(id='') {
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
    let prices = '';
    let pricetwos = '';
    let minbalances = '';
    for(let i=0;i<document.getElementsByName('itemer').length;i++){
        // if(document.getElementsByName('beginbalance')[i].value){
            itemids = itemids+'||'+document.getElementsByName('itemer')[i].id;
            prices = prices+'||'+document.getElementsByName('price')[i].value;
            pricetwos = pricetwos+'||'+document.getElementsByName('pricetwo')[i].value;
            minbalances = minbalances+'||'+document.getElementsByName('minbalance')[i].value;
        // }
    }
    itemids = itemids.slice(2);
    if (itemids.includes('||')) {
        itemids = itemids.split('||');
    } else if (itemids) {
        itemids = [itemids];
    } else {
        itemids = [];
    }
    if (itemids.length === 0) {
        Swal.fire({
            title: 'No Input',
            text: 'No item to update.',
            icon: 'warning',
            confirmButtonText: 'OK'
        });
        return;
    }
    prices = prices.slice(2);
    if (prices.includes('||')) {
        prices = prices.split('||');
    } else if (prices) {
        prices = [prices];
    } else {
        prices = [];
    }

    pricetwos = pricetwos.slice(2);
    if (pricetwos.includes('||')) {
        pricetwos = pricetwos.split('||');
    } else if (pricetwos) {
        pricetwos = [pricetwos];
    } else {
        pricetwos = [];
    }

    minbalances = minbalances.slice(2);
    if (minbalances.includes('||')) {
        minbalances = minbalances.split('||');
    } else if (minbalances) {
        minbalances = [minbalances];
    } else {
        minbalances = [];
    }   
    
    payload.append('rowsize', itemids.length);

    for (let i = 0; i < itemids.length; i++) {
        payload.append(`itemid${i+1}`, itemids[i]);
        payload.append(`price${i+1}`, prices[i]);
        payload.append(`pricetwo${i+1}`, pricetwos[i]);
        payload.append(`minimumbalance${i+1}`, minbalances[i]);
        payload.append(`branch${i+1}`, thebranch);
        payload.append(`department${i+1}`, thedepartment);
    }
    
    let request = await httpRequest2('api/v1/inventory/updatemultiple', payload, document.querySelector('#save'), 'json', 'POST');
    
    Swal.close(); // Close SweetAlert processing

    if (!id) document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> No Records Retrieved </td>`;
    // viewinrequisitionFormSubmitHandler();
    if (request.status) {
        viewinrequisitionActive();
        return notification(request.message, 1);
    } else {
        return notification('No records retrieved');
    }
}


async function viewinrequisitionFormDeleteHandler(id='') {
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
    // viewinrequisitionFormSubmitHandler();
    if (request.status) {
        viewinrequisitionActive();
        return notification(request.message, 1);
    } else {
        return notification('No records retrieved');
    }
}


// function runAdviewinrequisitionFormValidations() {
//     let form = document.getElementById('viewinrequisitionform')
//     let errorElements = form.querySelectorAll('.control-error')
//     let controls = []

//     if(controlHasValue(form, '#owner'))  controls.push([form.querySelector('#owner'), 'Select an owner'])
//     if(controlHasValue(form, '#viewinrequisitionname'))  controls.push([form.querySelector('#viewinrequisitionname'), 'viewinrequisition name is required'])
//     if(controlHasValue(form, '#statusme'))  controls.push([form.querySelector('#itemname'), 'item name is required'])
//     if(controlHasValue(form, '#urlge'))  controls.push([form.querySelector('#image'), 'image is required'])
//     if(controlHasValue(form, '#urlition'))  controls.push([form.querySelector('#position'), 'position is required'])
//     if(controlHasValue(form, '#url'))  controls.push([form.querySelector('#url'), 'url is required'])
//     parentidurl
//     return mapValidationErrors(errorElements, controls)   

// }