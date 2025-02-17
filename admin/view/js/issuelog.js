let issuelogid
let theissuelogitems    
let issuetypedata
// let initialinventoryload
async function issuelogActive() {
    theissuelogitems = '';
    thedepartment = '';
    thebranch = '';
    initialinventoryload = ''
    // const form = document.querySelector('#issuelogform')
    // const form2 = document.querySelector('#updateinventories')
    if(document.querySelector('#viewsubmit')) document.querySelector('#viewsubmit').addEventListener('click', e=>fetchviewissuelogstable())
    if(document.querySelector('#reqsubmit')) document.querySelector('#reqsubmit').addEventListener('click', e=>issuelogFormEditHandler())
    // form.querySelector('#submit').click()
    datasource = []
    await getAllbranch(!checkpermission('FILTER BRANCH'), 'branchfrom');
    await getAllbranch(!checkpermission('FILTER BRANCH'), 'branchsearch');
    await new TomSelect('#branchfrom', {
        plugins: ['dropdown_input'],
        onInitialize: function() {
            console.log(checkpermission('FILTER BRANCH'))
            if(!checkpermission('FILTER BRANCH')) this.setValue(the_user.branch);
            if(!checkpermission('FILTER BRANCH')) this.setTextboxValue('readonly', true);
            handleBranchChange(this.getValue(), 'departmentfrom');
        },
        onChange: function() {
            handleBranchChange(this.getValue(), 'departmentfrom');
            issuechecksourcedetails()
        }
    });
    await new TomSelect('#branchsearch', {
        plugins: ['dropdown_input'],
        onInitialize: function() {
            console.log(checkpermission('FILTER BRANCH'))
            if(!checkpermission('FILTER BRANCH')) this.setValue(the_user.branch);
            if(!checkpermission('FILTER BRANCH')) this.setTextboxValue('readonly', true);
            handleBranchChange(this.getValue(), 'departmentsearch');
        },
        // onChange: function() {
        //     handleBranchChange(this.getValue(), 'departmentsearch');
        //     issuechecksourcedetails()
        // }
    });
    if(document.getElementById('departmentfrom')) document.getElementById('departmentfrom').addEventListener('change', e=>issuechecksourcedetails())
    await gettheissuetypes();
    // if(document.querySelector('#save')) document.querySelector('#save').addEventListener('click', e=>issuelogFormEditHandler())
       
    // new TomSelect('#itemidsearch', {
    //     plugins: ['dropdown_input']
    // })
    // await fetchissuelogs()

    // if(localStorage.getItem('editrequistion')){
    //     // alert()
    //     let editdata =  localStorage.getItem('editrequistion')
    //     let data = JSON.parse(editdata.replaceAll("|||",'"'));
    //     document.getElementById('branchfrom').value = data.branchfrom;
    //     document.querySelector('#branchfrom').tomselect.setValue(data.branchfrom);
    //     document.querySelector('#branchfrom').tomselect.disable();

    //     document.getElementById('departmentfrom').value = data.departmentfrom;
    //     document.querySelector('#departmentfrom').tomselect.setValue(data.departmentfrom);
    //     document.querySelector('#departmentfrom').tomselect.disable();

    //     document.getElementById('branchto').value = data.branchto;
    //     document.querySelector('#branchto').tomselect.setValue(data.branchto);
    //     document.querySelector('#branchto').tomselect.disable();

    //     document.getElementById('departmentto').value = data.departmentto;
    //     document.querySelector('#departmentto').tomselect.setValue(data.departmentto);
    //     document.querySelector('#departmentto').tomselect.disable();
        

    // }

}

async function fetchviewissuelogstable() {
    thedepartment = '';
    thebranch = '';
    if(!validateForm('viewissuelogform', getIdFromCls('comp'))) return

    
    let form = document.querySelector('#viewissuelogform');
    let formData = new FormData(form);
    // formData.set('department', '');
    // formData.set('branch', '');
    let queryParams = new URLSearchParams(formData).toString();

    document.getElementById('tabledata2').innerHTML = `<td colspan="100%" class="text-center opacity-70"> Loading... </td>`

    let request = await httpRequest2(`api/v1/inventory/issues/log?${queryParams ? `${queryParams}` : ''}`, null, document.querySelector('#viewissuelogform #viewsubmit'), 'json', 'GET');
    document.getElementById('tabledata2').innerHTML = `<td colspan="100%" class="text-center opacity-70"> No Records Retrieved </td>`
    if(request.status) {
            if(request.data.length) {
                datasource = request.data
                thedepartment = document.getElementById('departmentsearch').value;
                thebranch = document.getElementById('branchsearch').value;
                resolvePagination(datasource, onviewissuelogsTableDataSignal)
            }
    }
    else return notification('No records retrieved')
}

async function onviewissuelogsTableDataSignal() {
    let rows = getSignaledDatasource().map((item, index) => `
    <tr>
        <td>${index + 1 }</td>
        <td>${item.itemname}</td>
        <td>${item.issuetypename??item.issuetype}</td>
        <td>${item.issue}</td>
        <td>${formatNumber(Math.abs(item.qty, 0, 0))}</td>
        <td>${formatCurrency(item.cost)}</td>
        <td>${formatDate(item.transactiondate.split('T')[0])}</td>
        <td>${formatTime(item.transactiondate.split('T')[1].split('+')[0])}</td>
        <td>${item.branchname??item.branch}</td>
        <td>${item.departmentname??item.department}</td>
        <td>${item.status == 'ACTIVE' ? 'STILL IN STOCK' : item.status}</td>
        <td class="flex items-center gap-3">
            <button title="View issue log entry" onclick="viewIssueLog('${item.id}', '${item.qty}', '${item.cost}', '${item.issue}')" class="material-symbols-outlined rounded-full bg-green-600 h-8 w-8 text-white drop-shadow-md text-xs" style="font-size: 18px;">visibility</button>
            <button title="Edit issue log entry" onclick="editIssueLog('${item.id}', '${item.qty}', '${item.cost}', '${item.issue}')" class="material-symbols-outlined rounded-full bg-primary-g h-8 w-8 text-white drop-shadow-md text-xs" style="font-size: 18px;">edit</button>
            <button title="Return to issue log list" onclick="returnToIssueLogList('${item.id}', '${item.qty}', '${item.cost}', '${item.issue}', '${item.itemname}')" class="material-symbols-outlined rounded-full bg-red-600 h-8 w-8 text-white drop-shadow-md text-xs" style="font-size: 18px;">arrow_back</button>
            <button title="Delete issue log entry" onclick="deleteIssueLog('${item.id}')" class="material-symbols-outlined rounded-full bg-red-700 h-8 w-8 text-white drop-shadow-md text-xs" style="font-size: 18px;">delete</button>
        </td>
        </tr>`
    )
    .join('')
    injectPaginatatedTable(rows, '#tabledata2')
}

function viewIssueLog(id, qty, cost, issue) {
    // Find the issue log entry by ID
    const viewreturneditemsEntry = datasource.filter(item => item.id == id)[0];

    if (!viewreturneditemsEntry) {
        return notification('Issue log entry not found', 0);
    }

    // Create the HTML content for the SweetAlert
    const contentHtml = `
       <div class="bg-white shadow-md rounded-lg p-6 max-w-md mx-auto">
    <table class="min-w-full bg-white">
        <tbody>
            <tr class="border-b">
                <td class="px-4 py-2 font-medium text-gray-700 text-left">Item Name:</td>
                <td class="px-4 py-2 text-gray-700 text-right">${viewreturneditemsEntry.itemname}</td>
            </tr>
            <tr class="border-b">
                <td class="px-4 py-2 font-medium text-gray-700 text-left">Issue Type:</td>
                <td class="px-4 py-2 text-gray-700 text-right">${viewreturneditemsEntry.issuetypename ?? viewreturneditemsEntry.issuetype}</td>
            </tr>
            <tr class="border-b">
                <td class="px-4 py-2 font-medium text-gray-700 text-left">Issue:</td>
                <td class="px-4 py-2 text-gray-700 text-right">${viewreturneditemsEntry.issue}</td>
            </tr>
            <tr class="border-b">
                <td class="px-4 py-2 font-medium text-gray-700 text-left">Quantity:</td>
                <td class="px-4 py-2 text-gray-700 text-right">${Math.abs(viewreturneditemsEntry.qty)}</td>
            </tr>
            <tr class="border-b">
                <td class="px-4 py-2 font-medium text-gray-700 text-left">Cost:</td>
                <td class="px-4 py-2 text-gray-700 text-right">${viewreturneditemsEntry.cost}</td>
            </tr>
            <tr class="border-b">
                <td class="px-4 py-2 font-medium text-gray-700 text-left">Date:</td>
                <td class="px-4 py-2 text-gray-700 text-right">${formatDate(viewreturneditemsEntry.transactiondate.split('T')[0])}</td>
            </tr>
            <tr class="border-b">
                <td class="px-4 py-2 font-medium text-gray-700 text-left">Time:</td>
                <td class="px-4 py-2 text-gray-700 text-right">${formatTime(viewreturneditemsEntry.transactiondate.split('T')[1].split('+')[0])}</td>
            </tr>
            <tr class="border-b">
                <td class="px-4 py-2 font-medium text-gray-700 text-left">Branch:</td>
                <td class="px-4 py-2 text-gray-700 text-right">${viewreturneditemsEntry.branchname ?? viewreturneditemsEntry.branch}</td>
            </tr>
            <tr class="border-b">
                <td class="px-4 py-2 font-medium text-gray-700 text-left">Department:</td>
                <td class="px-4 py-2 text-gray-700 text-right">${viewreturneditemsEntry.departmentname ?? viewreturneditemsEntry.department}</td>
            </tr>
            <tr>
                <td class="px-4 py-2 font-medium text-gray-700 text-left">Status:</td>
                <td class="px-4 py-2 ${viewreturneditemsEntry.status === 'ACTIVE' ? 'text-green-600' : 'text-gray-600'}">
                    ${viewreturneditemsEntry.status === 'ACTIVE' ? 'STILL IN STOCK' : viewreturneditemsEntry.status}
                </td>
            </tr>
        </tbody>
    </table>
</div>

    `;

    // Show the SweetAlert with the details
    Swal.fire({
        title: 'Issue Log Entry',
        html: contentHtml,
        showCancelButton: true,
        showDenyButton: true,
        confirmButtonText: 'Edit',
        confirmButtonColor: '#3085d6',
        denyButtonText: 'Delete',
        denyButtonColor: '#d33',
        cancelButtonText: 'Return',
        cancelButtonColor: 'orange',
        showCloseButton: true,
        closeButtonText: 'Cancel',
        preConfirm: () => {
            editIssueLog(id, qty, cost, issue);
        },
        preDeny: () => {
            deleteIssueLog(id);
        }
    }).then((result) => {
        if (result.isConfirmed) {
            editIssueLog(id, qty, cost, issue);
        } else if (result.isDenied) {
            deleteIssueLog(id, qty, cost, issue);
        } else if (result.dismiss === Swal.DismissReason.cancel) {
            // Listener for Cancel button
            returnToIssueLogList(id, qty, cost, issue, itemname);
            } else if (result.dismiss === Swal.DismissReason.close) {
            // Listener for Return button
        }
    });
}

function editIssueLog(id, qty, cost, issue) {
    // Start Generation Here
    // Find the issue log entry by ID
    const issueLogEntry = datasource.filter(item => item.id == id)[0];

    if (!issueLogEntry) {
        return notification('Issue log entry not found', 0);
    }

    // Create the HTML content for the SweetAlert form
    const formHtml = `
        <div class="bg-white shadow-md rounded-lg p-6 max-w-md mx-auto">
            <div class="space-y-2">
                <p class="flex justify-between text-gray-700">
                    <span class="font-medium">Item Name:</span> 
                    <span>${issueLogEntry.itemname}</span>
                </p>
                <p class="flex justify-between text-gray-700">
                    <span class="font-medium">Issue Type:</span> 
                    <span>${issueLogEntry.issuetypename ?? issueLogEntry.issuetype}</span>
                </p>
                <p class="flex justify-between text-gray-700">
                    <span class="font-medium">Issue:</span> 
                    <span>${issueLogEntry.issue}</span>
                </p>
                <p class="flex justify-between text-gray-700">
                    <span class="font-medium">Quantity:</span> 
                    <input type="number" id="editQty" class="form-control w-[100px] border-[orange]" value="${Math.abs(issueLogEntry.qty)}" min="0" max="${Math.abs(issueLogEntry.qty)}" onchange="if(this.value > ${Math.abs(issueLogEntry.qty)}) { this.value = ${Math.abs(issueLogEntry.qty)}; notification('If you want to add item, you would have to log new issue', 0); }">
                </p>
                <p class="flex justify-between text-gray-700">
                    <span class="font-medium">Cost:</span> 
                    <span>${formatCurrency(issueLogEntry.cost)}</span>
                </p>
                <p class="flex justify-between text-gray-700">
                    <span class="font-medium">Date:</span> 
                    <span>${formatDate(issueLogEntry.transactiondate.split('T')[0])}</span>
                </p>
                <p class="flex justify-between text-gray-700">
                    <span class="font-medium">Time:</span> 
                    <span>${formatTime(issueLogEntry.transactiondate.split('T')[1].split('+')[0])}</span>
                </p>
            </div>
        </div>
    `;

    // Show the SweetAlert with the form
    Swal.fire({
        title: 'Edit Issue Log Entry',
        html: formHtml,
        showCancelButton: true,
        confirmButtonText: 'Save',
        confirmButtonColor: '#3085d6',
        cancelButtonText: 'Cancel',
        cancelButtonColor: 'orange',
        preConfirm: async () => {
            const newQty = document.getElementById('editQty').value;
            if (newQty > Math.abs(issueLogEntry.qty)) {
                Swal.showValidationMessage(`Quantity cannot exceed ${Math.abs(issueLogEntry.qty)}`);
                return false;
            }
            if (newQty && newQty != Math.abs(issueLogEntry.qty)) {
                try {
                    Swal.showLoading(); // Show loading indicator
                    let formData = new FormData();
                    formData.append('id', issueLogEntry.id);
                    formData.append('qty', newQty);
                    let response = await httpRequest2('api/v1/inventory/issues/log/qty/update', formData, null, 'json', 'POST');
                    Swal.close(); // Close loading indicator
                    if (!response.status) {
                        Swal.showValidationMessage('Failed to update quantity');
                        return false;
                    }
                } catch (error) {
                    Swal.close(); // Close loading indicator
                    Swal.showValidationMessage('An error occurred while updating quantity');
                    return false;
                }
            }
            return true;
        }
    }).then((result) => {
        if (result.isConfirmed) {
            notification('Issue log entry updated successfully!', 1);
            did('viewsubmit').click()
        }
    });
}

function returnToIssueLogList(id, qty, cost, issue, itemname) {
    Swal.fire({
        title: 'Who is paying for this item?',
        text: "Please select the payer for this issue log entry.",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Supplier',
        cancelButtonText: 'Staff/Member'
    }).then(async(result) => {
        if (result.isConfirmed) {
            // Supplier is paying
            try {
                Swal.showLoading(); // Show loading indicator
                let supplierResponse = await httpRequest2('api/v1/purchases/supplier', null, null, 'json', 'GET');
                Swal.close(); // Close loading indicator

                if (!supplierResponse.status) {
                    Swal.showValidationMessage('Failed to fetch suppliers');
                    return;
                }

                let supplierOptions = supplierResponse.data.map(supplier => `<option value="${supplier.id}">${supplier.supplier}</option>`).join('');

                Swal.fire({
                    title: 'Select Supplier',
                    html: `
                    <div class="grid grid-cols-1 gap-6" style="height: 300px;">
                        <div class="form-group">
                            <select id="supplierSelect" class="form-controls">
                                <option value="">Select Supplier</option>
                                ${supplierOptions}
                            </select>
                        </div>
                    </div>
                    `,
                    didOpen: () => {
                        setTimeout(() => {
                            new TomSelect('#supplierSelect', {
                                plugins: ['dropdown_input']
                            });
                        }, 1000);
                    },
                    showCancelButton: true,
                    confirmButtonText: 'Submit',
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    preConfirm: async () => {
                        const supplierId = document.getElementById('supplierSelect').value;
                        
                        if (!supplierId) {
                            Swal.showValidationMessage('Please select a supplier');
                            return false;
                        }

                        try {
                            Swal.showLoading(); // Show loading indicator
                            let formData = new FormData();
                            formData.append('id', id);
                            formData.append('status', 'RETURNED ITEMS');
                            formData.append('supplier', supplierId);
                            // formData.append('staff', 0);
                            formData.append('qty', qty);
                            formData.append('cost', cost);
                            formData.append('issue', issue);
                            formData.append('itemname', itemname);
                            let response = await httpRequest2('api/v1/inventory/issues/log/return', formData, null, 'json', 'POST');
                            Swal.close(); // Close loading indicator
                            if (!response.status) {
                                Swal.showValidationMessage('Failed to update issue log entry');
                                return false;
                            }
                        } catch (error) {
                            Swal.close(); // Close loading indicator
                            Swal.showValidationMessage('An error occurred while updating issue log entry');
                            return false;
                        }
                        return true;
                    }
                }).then((result) => {
                    if (result.isConfirmed) {
                        notification('Issue log entry returned successfully!', 1);
                        did('viewsubmit').click();
                    }
                });
            } catch (error) {
                Swal.close(); // Close loading indicator
                Swal.showValidationMessage('An error occurred while fetching suppliers');
            }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
            // Staff/Member is paying
            try {
                Swal.showLoading(); // Show loading indicator
                let userResponse = await httpRequest2('api/v1/members/userregistration', null, null, 'json', 'GET');
                Swal.close(); // Close loading indicator

                if (!userResponse.status) {
                    Swal.showValidationMessage('Failed to fetch users');
                    return;
                }

                let userOptions = userResponse.data.map(user => `<option value="${user.id}">${user.firstname} ${user.lastname} ${user.othernames ? user.othernames : ''}</option>`).join('');

                Swal.fire({
                    title: 'Select Staff/Member',
                    html: `
                    <div class="grid grid-cols-1 gap-6" style="height: 300px;">
                        <div class="form-group">
                            <select id="userSelect" class="form-controls">
                                <option value="">Select Staff/Member</option>
                                ${userOptions}
                            </select>
                        </div>
                    </div>
                    `,
                    didOpen: () => {
                            new TomSelect('#userSelect', {
                                plugins: ['dropdown_input']
                            });
                    },
                    showCancelButton: true,
                    confirmButtonText: 'Submit',
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    preConfirm: async () => {
                        const userId = document.getElementById('userSelect').value;
                        
                        if (!userId) {
                            Swal.showValidationMessage('Please select a staff/member');
                            return false;
                        }

                        try {
                            Swal.showLoading(); // Show loading indicator
                            let formData = new FormData();
                            formData.append('id', id);
                            formData.append('status', 'RETURNED ITEMS');
                            // formData.append('supplier', 0);
                            formData.append('staff', userId);
                            formData.append('qty', qty);
                            formData.append('cost', cost);
                            formData.append('issue', issue);
                            formData.append('itemname', itemname);
                            let response = await httpRequest2('api/v1/inventory/issues/log/return', formData, null, 'json', 'POST');
                            Swal.close(); // Close loading indicator
                            if (!response.status) {
                                Swal.showValidationMessage('Failed to update issue log entry');
                                return false;
                            }
                        } catch (error) {
                            Swal.close(); // Close loading indicator
                            Swal.showValidationMessage('An error occurred while updating issue log entry');
                            return false;
                        }
                        return true;
                    }
                }).then((result) => {
                    if (result.isConfirmed) {
                        notification('Issue log entry returned successfully!', 1);
                        did('viewsubmit').click();
                    }
                });
            } catch (error) {
                Swal.close(); // Close loading indicator
                Swal.showValidationMessage('An error occurred while fetching users');
            }
        }
    });
}

function deleteIssueLog(id) {
    Swal.fire({
        title: 'Are you sure?',
        text: "Do you really want to delete this issue log entry?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel',
        preConfirm: async () => {
            try {
                Swal.showLoading(); // Show loading indicator
                let formData = new FormData();
                formData.append('id', id);
                formData.append('status', 'DELETED');
                let response = await httpRequest2('api/v1/inventory/issues/log/qty/update', formData, null, 'json', 'POST');
                Swal.close(); // Close loading indicator
                if (!response.status) {
                    Swal.showValidationMessage('Failed to delete issue log entry');
                    return false;
                }
            } catch (error) {
                Swal.close(); // Close loading indicator
                Swal.showValidationMessage('An error occurred while deleting issue log entry');
                return false;
            }
            return true;
        }
    }).then((result) => {
        if (result.isConfirmed) {
            notification('Issue log entry deleted successfully!', 1);
            did('viewsubmit').click()   
            // Optionally refresh the issue log list or perform other actions
        }
    });
}

async function gettheissuetypes(){
    let request = await httpRequest2('api/v1/inventory/issues/type', null, null, 'json', 'GET')
    if(request.status){
        issuetypedata = request.data
    }else return notification('No records on issue type retrieved')
}

function issuechecksourcedetails(){
    theissuelogitems = ''
    document.getElementById('tabledata').innerHTML = `<tr><td colspan="100%" class="text-center opacity-70">Checking if source branch and department is set...</td></tr>`;
    if(document.getElementById('branchfrom').value && document.getElementById('departmentfrom').value){
        document.getElementById('tabledata').innerHTML = `<tr><td colspan="100%" class="text-center opacity-70">Loading items for logging...</td></tr>`;
        fetchissuelogs()
    }else{
        document.getElementById('tabledata').innerHTML = `<tr><td colspan="100%" class="text-center opacity-70">Awaiting for source branch and department to be set...</td></tr>`;
    }
}


async function fetchissuelogs() {
    thedepartment = '';
    thebranch = '';
    // if(!validateForm('issuelogform', getIdFromCls('comp'))) return

    theissuelogitems = '';

    
    let formData = new FormData();
    formData.append('branch', document.getElementById('branchfrom').value);
    formData.append('department', document.getElementById('departmentfrom').value);
    let queryParams = new URLSearchParams(formData).toString();

    // document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> Loading... </td>`

    let request = await httpRequest2(`api/v1/inventory/getinventory?${queryParams ? `${queryParams}` : ''}`, null, null, 'json', 'GET');
    if(request.status) {
            if(request.data.length) {
                // datasource = request.data;
                theissuelogitems = request.data;
                console.log('theissuelogitems', theissuelogitems)

                document.getElementById('tabledata').innerHTML = `
                <tr id="readyholder">
                    <td colspan="100%" class="text-center opacity-70"> Ready to log issues... </td>
                </tr>`
                
                thedepartment = document.getElementById('departmentfrom').value;
                thebranch = document.getElementById('branchfrom').value;
                // resolvePagination(datasource, onissuelogTableDataSignal)
            }
        }
    else return notification('No records retrieved')
}



async function removeissuelog(id) {
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
    fetchissuelogs()
    return notification(request.message);
    
}

function reqaddrowissuelog(event){
    event.preventDefault(); 
    console.log('theissuelogitems', theissuelogitems)
    if (!theissuelogitems.length) return notification('issuelog Source is incomplete. Wait for the table to indicate readiness.', 0);
    let el = document.createElement('tr');
    el.classList.add('temprow');
    let elid;

    if (theissuelogitems.length) {
        elid = genID();
        el.id = `reqrow_${elid}`;
        let x = `
            <td class="text-center opacity-70 w-[140px]"> 
                <label class="hidden">Item</label>
                <select onchange="issuegetitemdetails(this)" name="supplyfrom" id="supplyfrom_${elid}" class="form-controls comp w-[220px]">
                    <option value=''>-- Select item --</option>
                    ${theissuelogitems.map(data => `<option value='${data.itemid}'>${data.itemname}</option>`).join('')}
                </select>
            </td>
            <td>
                <p class="!w-[125px]">Type: <span id="type_${elid}"></span></p>
                <p>Cost: <span id="cost_${elid}"></span></p>
                <p>Price: <span id="price_${elid}"></span></p>
                <p>Stock Balance: <span id="stock_${elid}"></span></p>
            </td>
            <td>
                <label class="hidden">Quantity</label>
                <input onchange="issuelogcal2(this)" type="number" id="qty_${elid}" name="qty" class="comma form-control comp px-1" placeholder="Qty">
            </td>
            <td>
                <label class="hidden">issue type</label>
                <select name="issuetype" id="issuetype_${elid}" class="form-control comp">
                    <option value=''>-- Select issue type --</option>
                    ${issuetypedata.map(data => `<option value='${data.id}'>${data.issuetype}</option>`).join('')}
                </select>
            </td>
            <td>
                <label class="hidden">Issue</label>
                <textarea name="issue" placeholder="Please Enter Details of what happened to the items" id="issue_${elid}" class="comma form-control comp" ></textarea>
            </td>
            <td>
                <div class="flex gap-4 items-center h-full w-fit py-3">
                    <button onclick="reqaddrowissuelog()" title="Add row" class="hidden material-symbols-outlined rounded-full bg-primary-g h-8 w-8 text-white drop-shadow-md text-xs" style="font-size: 18px;">add</button>
                    <button onclick="this.closest('tr').remove()" title="Delete row" class="material-symbols-outlined rounded-full bg-[red] h-8 w-8 text-white drop-shadow-md text-xs" style="font-size: 18px;">delete</button>
                </div>
            </td>`;
        
        el.innerHTML = x;
        
        if (did('readyholder')) {
            did('readyholder').remove();
        }
        
        did('tabledata').appendChild(el);
        
        // Initialize TomSelect
        const tomSelectInstance = new TomSelect(`#supplyfrom_${elid}`, {
            plugins: ['dropdown_input'],
            onInitialize: function() {
                // issuegetitemdetails(this);
            },
            onChange: function() {
                // issuegetitemdetails(this);
            }
        });
        
        
        // Move dropdown to body
        const dropdown = tomSelectInstance.dropdown;
        if (dropdown && dropdown.parentNode !== document.body) {
            document.body.appendChild(dropdown);
        }

        // Update dropdown position on scroll and resize
        const updateDropdownPosition = () => {
            const control = tomSelectInstance.control;
            const rect = control.getBoundingClientRect();
            const dropdownHeight = dropdown.offsetHeight;
            const dropdownWidth = rect.width;
            const windowHeight = window.innerHeight;
            const windowWidth = window.innerWidth;

            dropdown.style.top = `${(windowHeight - dropdownHeight) / 2}px`;
            dropdown.style.left = `${(windowWidth - dropdownWidth) / 2}px`;
            dropdown.style.width = `${dropdownWidth}px`;
        };

        // Initial positioning
        updateDropdownPosition();

        // Update on events
        window.addEventListener('scroll', updateDropdownPosition);
        window.addEventListener('resize', updateDropdownPosition);
    }
}

function issuelogcal2(element){
    // return
    dynamiccomma(false)
    let el = element.id.split('_')[1]
    if(!did(`supplyfrom_${el}`).value){
        notification(`No Item Selected`, 0)
        // did(`val_${el}`).value = '';
        did(`cost_${el}`).innerHTML = '';
        did(`qty_${el}`).value = '';
        did(`price_${el}`).innerHTML = '';
        return dynamiccomma(true)
    }
    if(Number(did(`stock_${el}`).textContent)<Number(did(`qty_${el}`).value)){
        notification(`Quantity cannot exceed the stock balance`, 0)
        did(`qty_${el}`).value = did(`stock_${el}`).textContent
        // return
    }
    // if(did(`price_${el}`).value && did(`qty_${el}`).value){
    //     did(`val_${el}`).value = Number(did(`price_${el}`).value) * Number(did(`qty_${el}`).value)
    // }else{
    //     did(`val_${el}`).value = '';
    // }
    
    // issuelogtotalcount()
    
}

function issuelogtotalcount(){
    let totalcost = 0
    
    for(let i=0;i<document.getElementsByName('qty').length;i++){
        let qty = Number(document.getElementsByName('qty')[i].value);
        let price = Number(document.getElementsByName('price')[i].value);
        if(qty && price) {
            totalcost += qty * price;
        }
    }
    console.log('totalcost:', totalcost)
    document.getElementById('rptotalorder').textContent = formatCurrency(totalcost)
    dynamiccomma(true)
}



async function issuegetitemdetails(el){
    console.log('issuegetitemdetails', el, el.value, el.id)  
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
    let req = theissuelogitems.filter(data=>data.itemid == el.value)[0]
    console.log('saved item', req)
    did('type_'+id).innerHTML = req.itemclass??''
    // did('group_'+id).innerHTML = req.group??''
    did('stock_'+id).innerHTML = formatNumber(req.qty??0, 1, 0)
    did('cost_'+id).innerHTML = formatNumber(req.cost??0, 1, 0)
    did('price_'+id).innerHTML = formatNumber(req.price??0, 1, 0)

    dynamiccomma(true)
     
    let formData = new FormData();
    formData.append('branch', document.getElementById('branchfrom').value);
    formData.append('department', document.getElementById('departmentfrom').value);
    let queryParams = new URLSearchParams(formData).toString();

    // document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> Loading... </td>`

    let request = await httpRequest2(`api/v1/inventory/getinventory?${queryParams ? `${queryParams}` : ''}`, null, null, 'json', 'GET');
    if(request.status) {
            if(request.data.length) {
                // datasource = request.data;
                theissuelogitems = request.data;
                let req2 = theissuelogitems.filter(data=>data.itemid == el.value)[0]
                console.log('saved item2', req2)
                did('type_'+id).innerHTML = req2.itemclass??''
                did('group_'+id).innerHTML = req2.group??''
                did('stock_'+id).innerHTML = formatNumber(req2.qty??0, 1, 0)
                did('cost_'+id).value = Number(req2.cost)
                did('price_'+id).value = Number(req2.price)
                dynamiccomma(true)
                
                // resolvePagination(datasource, onissuelogTableDataSignal)
            }
        }
    else return notification('No records retrieved')
}


async function onissuelogTableDataSignal() {
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


async function issuelogFormEditHandler(id='') {
    dynamiccomma(false)
    if(!validateForm('issuelogform', getIdFromCls('comp'))) return
    // Show SweetAlert processing
    Swal.fire({
        title: 'Processing',
        text: 'Please wait while we process the faulty stock(s)...',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });



    const payload = new FormData();
    payload.append('rowsize', document.getElementsByName('supplyfrom').length);
    payload.append('branch', document.getElementById('branchfrom').value);
    payload.append('department', document.getElementById('departmentfrom').value);
    for (let i = 0; i < document.getElementsByName('supplyfrom').length; i++) {
        if(document.getElementsByName('qty')[i].value < 1){
            Swal.close()
            return notification('Please check the quantity. It cannot be less than 1.', 0)}
        payload.append(`itemid${i+1}`, document.getElementsByName('supplyfrom')[i].value);
        payload.append(`qty${i+1}`, document.getElementsByName('qty')[i].value);
        payload.append(`issuetype${i+1}`, document.getElementsByName('issuetype')[i].value);
        payload.append(`issue${i+1}`, document.getElementsByName('issue')[i].value);
    }
    
    let request = await httpRequest2('api/v1/inventory/issues/log', payload, document.querySelector('#reqsubmit'), 'json', 'POST');
    dynamiccomma(true)
    Swal.close(); // Close SweetAlert processing

    // issuelogFormSubmitHandler();
    if (request.status) {
        issuelogActive();
        document.getElementById('issuelog').click()
        return notification(request.message, 1);
    } else {
        return notification('Failed to perform the required issuelog', 0);
    }
}


async function issuelogFormDeleteHandler(id='') {
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
    // issuelogFormSubmitHandler();
    if (request.status) {
        issuelogActive();
        return notification(request.message, 1);
    } else {
        return notification('No records retrieved');
    }
}


// function runAdissuelogFormValidations() {
//     let form = document.getElementById('issuelogform')
//     let errorElements = form.querySelectorAll('.control-error')
//     let controls = []

//     if(controlHasValue(form, '#owner'))  controls.push([form.querySelector('#owner'), 'Select an owner'])
//     if(controlHasValue(form, '#issuelogname'))  controls.push([form.querySelector('#issuelogname'), 'issuelog name is required'])
//     if(controlHasValue(form, '#statusme'))  controls.push([form.querySelector('#itemname'), 'item name is required'])
//     if(controlHasValue(form, '#urlge'))  controls.push([form.querySelector('#image'), 'image is required'])
//     if(controlHasValue(form, '#urlition'))  controls.push([form.querySelector('#position'), 'position is required'])
//     if(controlHasValue(form, '#url'))  controls.push([form.querySelector('#url'), 'url is required'])
//     parentidurl
//     return mapValidationErrors(errorElements, controls)   

// }