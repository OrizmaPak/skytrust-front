let serviceorderid
let editMode = false;
async function serviceorderActive() {
    serviceorderid = ''
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
    const form = document.querySelector('#serviceorderform')
    const form2 = document.querySelector('#viewserviceorderform')
    if(editMode === false && form.querySelector('#submit')) form.querySelector('#submit').addEventListener('click', serviceorderFormSubmitHandler)
    if(form2.querySelector('#querySubmit')) form2.querySelector('#querySubmit').addEventListener('click', serviceorderFormSubmitHandler)
    datasource = []
    await fetchserviceorder()
    // await getAllserviceorder(true)
    // new TomSelect('#serviceorder', {
    //     // plugins: ['remove_button'],
    //     onInitialize: function() {
    //         console.log(checkpermission('FILTER BRANCH'))
    //         if(!checkpermission('FILTER BRANCH')) this.setValue(the_user.serviceorder);
            // if(!checkpermission('FILTER BRANCH')) this.setTextboxValue('readonly', true);
    //     }
    // });
    // await getAllUsers('useridlist', 'id')
}

async function fetchserviceorder(id) {

    // Show loading state using SweetAlert
    const loadingAlert = Swal.fire({
        title: 'Please wait...',
        text: 'Fetching serviceorder data, please wait.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    let form = document.querySelector('#viewserviceorderform');
    let formData = new FormData(form);
    // formData.set('department', '');
    // formData.set('serviceorder', '');
    let queryParams = new URLSearchParams(formData).toString();

    if(!id)document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> Loading... </td>`

    let request = await httpRequest2(`api/v1/purchases/serviceorder?${queryParams ? `${queryParams}` : ''}${id ? `&id=${id}` : ''}`, null, document.querySelector('#viewserviceorderform #submit'), 'json', 'GET');
    swal.close(); // Close the loading alert once the request is complete
    if(!id)document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> No Records Retrieved </td>`
    if(request.status) {
        if(!id){
            if(request.data.length) {
                datasource = request.data
                applyPagination(datasource, "tabledata", 10, onserviceorderTableDataSignal);
            }
        } else {
            document.getElementsByClassName('updater')[0].click();
            serviceorderid = request.data[0].id;
            populateData(request.data[0]);
        }
    } else {
        return notification('No records retrieved');
    }
}

async function showServiceOrderDetails(reference) {
    if(!reference){
        return;
    }
    const order = datasource.find(order => order.reference === reference);
    if (!order) {
        return Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Service Order not found.'
        });
    }

    const generalDetails = `
    <div class="mb-6 rounded bg-gray-50 p-4 shadow-sm">
        <h2 class="mb-4 text-lg font-bold text-gray-800">Service Order Information</h2>
        <table class="min-w-full border-collapse text-sm">
            <tbody>
                <tr class="border-b">
                    <td class="px-4 py-2 font-semibold text-gray-600">Reference</td>
                    <td class="px-4 py-2 text-gray-700">${order.reference}</td>
                </tr>
                <tr class="border-b">
                    <td class="px-4 py-2 font-semibold text-gray-600">Supplier</td>
                    <td class="px-4 py-2 text-gray-700">${order.suppliername}</td>
                </tr>
                <tr class="border-b">
                    <td class="px-4 py-2 font-semibold text-gray-600">Branch</td>
                    <td class="px-4 py-2 text-gray-700">${order.branchname}</td>
                </tr>
                <tr>
                    <td class="px-4 py-2 font-semibold text-gray-600">Date Added</td>
                    <td class="px-4 py-2 text-gray-700">${new Date(order.services[0].dateadded).toLocaleString()}</td>
                </tr>
            </tbody>
        </table>
    </div>`;

    const serviceDetails = `
        <div class="mb-6">
            <h2 class="text-lg font-bold">Services Details</h2>
            <table class="min-w-full border border-gray-200 text-sm">
                <thead class="bg-gray-100">
                    <tr>
                        <th class="border px-4 py-2">Service Type</th>
                        <th class="border px-4 py-2">Description</th>
                        <th class="border px-4 py-2">Amount From</th>
                        <th class="border px-4 py-2">Amount To</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.services.map(service => `
                        <tr>
                            <td class="border px-4 py-2">${service.servicetype}</td>
                            <td class="border px-4 py-2">${service.description}</td>
                            <td class="border px-4 py-2">${service.amountfrom}</td>
                            <td class="border px-4 py-2">${service.amountto}</td>
                        </tr>`).join('')}
                </tbody>
            </table>
        </div>`;

    const modalContent = `
        <div class="p-6">
            ${generalDetails}
            ${serviceDetails}
        </div>`;

    // Use SweetAlert2 to display the modal
    Swal.fire({
        title: `<span class="text-xl font-bold">Service Order: ${order.reference}</span>`,
        html: modalContent,
        width: '900px',
        showCloseButton: true,
        confirmButtonText: 'Close',
        confirmButtonColor: '#3085d6',
        customClass: {
            popup: 'swal2-popup-custom',
            title: 'swal2-title-custom',
        },
    });
}

async function onserviceorderTableDataSignal(pageData) {
    let rows = pageData.map((item, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${item.reference}</td>
            <td>${item.services.map(service => `<div>${service.description}</div>`).join('')}</td>
            <td>${item.suppliername}</td>
            <td>${item.branchname}</td>
            <td>${formatDate(new Date(item.services[0].dateadded).toLocaleDateString())}</td>
            <td>
                <button class="material-symbols-outlined h-8 w-8 rounded-full bg-green-600 text-xs text-white drop-shadow-md" style="font-size: 18px;"
                onclick="showServiceOrderDetails('${item.reference}')">visibility</button>
                <button title="Edit row entry" onclick="editserviceorder('${item.reference}')" class="material-symbols-outlined h-8 w-8 rounded-full bg-primary-g text-xs text-white drop-shadow-md" style="font-size: 18px;">edit</button>
                <button class="material-symbols-outlined h-8 w-8 rounded-full bg-red-600 text-xs text-white drop-shadow-md"
                style="font-size: 18px;"
                onclick="removeserviceorder('${item.reference}')">delete</button>
            </td>
        </tr>
    `).join('');

    document.getElementById('tabledata').innerHTML = rows;
}


async function removeserviceorder(reference) {
    try {
        const confirmation = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
            allowOutsideClick: false,
        });

        if (confirmation.isConfirmed) {
            // Show loading state using SweetAlert
            const loadingAlert = Swal.fire({
                title: 'Deleting...',
                text: 'Please wait while the service order is being deleted.',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            // Prepare the payload
            let formData = new FormData();
            formData.append('reference', reference);

            // Send the DELETE request
            const request = await httpRequest2(
                `api/v1/purchases/serviceorder`,
                formData,
                null,
                'json',
                'DELETE'
            );

            swal.close(); // Close the loading alert once the request is complete

            if (request.status) {
                Swal.fire('Deleted!', 'The service order has been deleted.', 'success');
                // Refresh the table data after deletion
                fetchserviceorder();
            } else {
                Swal.fire('Error!', request.message || 'Failed to delete the service order.', 'error');
            }
        }
    } catch (error) {
        Swal.fire('Error!', 'An unexpected error occurred.', 'error');
    }
}

function addrowserviceorder() {
    // Get the table body and current row count
    const tableBody = document.getElementById('tabledata1');
    const rowCount = tableBody.getElementsByTagName('tr').length;
    const newRowIndex = rowCount + 1;

    // Create a new row
    const newRow = document.createElement('tr');
    newRow.id = `row-${newRowIndex - 1}`;

    // Define the HTML structure for the new row with dynamic `name` attributes
    newRow.innerHTML = `
        <td class="s/n text-center opacity-70">${newRowIndex}</td>
        <td class="text-center opacity-70">
            <label class="control-label hidden">Service Type</label>
            <select name="servicetype${newRowIndex}" id="service_type-${newRowIndex - 1}" class="form-control comp">
                <option value="">-- Select Service Type --</option>
                <option value="LOGISTICS">LOGISTICS</option>
                <option value="IT">IT</option>
                <option value="NETWORK">NETWORK</option>
                <option value="OTHER">OTHER</option>
                <option value="MAINTENANCE">MAINTENANCE</option>
            </select>
        </td>
        <td class="text-center opacity-70">
            <label class="control-label hidden">Description</label>
            <input name="description${newRowIndex}" id="description-${newRowIndex - 1}" onchange="calculateserviceorders(this)" class="form-control description comp" placeholder="Enter Description"/>
        </td>
        <td class="text-center opacity-70">
            <label class="control-label hidden">Amount from</label>
            <input name="amountfrom${newRowIndex}" id="amountfrom-${newRowIndex - 1}" onchange="calculateserviceorders(this)" type="number" class="form-control amount comp" placeholder="Enter Amount From"/>
        </td>
        <td class="text-center opacity-70">
            <label class="control-label hidden">Amount to</label>
            <input name="amountto${newRowIndex}" id="amountto-${newRowIndex - 1}" onchange="calculateserviceorders(this)" type="number" class="form-control amount comp" placeholder="Enter Amount To"/>
        </td>
        <td class="text-center opacity-70">
            <button onclick="this.parentElement.parentElement.remove();runCount()" title="Remove item" class="material-symbols-outlined h-8 w-8 rounded-full bg-red-600 text-xs text-white drop-shadow-md" style="font-size: 18px;">remove</button>
        </td>
    `;

    // Append the new row to the table
    tableBody.appendChild(newRow);

    // Update the serial numbers or other dynamic elements if needed
    runCount();
}

async function serviceorderFormSubmitHandler() {
    if(!validateForm('serviceorderform', getIdFromCls('comp'))) return
    
    // Calculate the total number of rows dynamically
    const tableBody = document.getElementById('tabledata1');
    const totalRows = tableBody ? tableBody.getElementsByTagName('tr').length : 0;

    // Get the form data
    let payload = getFormData2(
        document.querySelector('#serviceorderform'), 
        serviceorderid ? [['id', serviceorderid]] : null
    );

    // Add rowsize to the payload
    payload.append('rowsize', totalRows);

    const confirmed = await Swal.fire({
        title: serviceorderid ? 'Updating...' : 'Submitting...',
        text: 'Please wait while we submit your data.',
        icon: 'info',
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: async () => {
            Swal.showLoading();
            let request = await httpRequest2('api/v1/purchases/serviceorder', payload, document.querySelector('#serviceorderform #submit'), 'json', 'POST');
            Swal.close();

            if (request.status) {
                notification('Success!', 1);
                const form = document.querySelector('#serviceorderform');
                form.reset();
                if(serviceorderid)form.querySelectorAll('input, select, textarea').forEach(input => input.value = '');
                serviceorderid = '';
                document.getElementsByClassName('viewer')[0].click();
                fetchserviceorder();
            } else {    
                notification(request.message, 0);
            }
        }
    });
}  

function populateDropdownValues(suppliername, branchname) {
    // Set the supplier dropdown value
    console.log("Supplier name", suppliername)
    document.getElementById('supplier').tomselect.setValue(suppliername);
    
    console.log("Branch name", branchname)
    // Set the branch dropdown value
    document.getElementById('branch').tomselect.setValue(branchname);
}

async function editserviceorder(reference) {
    editMode = true;
    
    if (!reference) {
        return Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No reference provided for editing.',
        });
    }

    // Find the service order data from the datasource
    const order = datasource.find((order) => order.reference == reference);
    console.log("Order object", order)
    if (!order) {
        return Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Service Order not found.',
        });
    }

    populateDropdownValues(order.services[0].supplier, order.services[0].branch);

    // Navigate to the manage service order tab
    document.getElementById('serviceorderformdiv').classList.remove('hidden');
    document.getElementById('viewserviceorder').classList.add('hidden');
    const manageTab = document.querySelector(`li[name="serviceorderformdiv"]`);
    const viewTab = document.querySelector(`li[name="viewserviceorder"]`);
    if (manageTab) manageTab.classList.add('active', '!text-blue-600');
    if (viewTab) viewTab.classList.remove('active', '!text-blue-600');

    // Populate form fields with the order data
    serviceorderid = order.id; // Save the current order ID globally

    // Remove existing event listener
    const form = document.querySelector('#serviceorderform');
    form.querySelector('#submit').removeEventListener('click', serviceorderFormSubmitHandler);

    // Add event listener with updated functionality
    form.querySelector('#submit').addEventListener('click', async function () {
        if (!validateForm('serviceorderform', getIdFromCls('comp'))) return;

        const payload = getFormData2(
            form,
            serviceorderid ? [['id', serviceorderid]] : null
        );

        payload.append('rowsize', order.services.length);

        Swal.fire({
            title: 'Updating...',
            text: 'Please wait while we update the service order.',
            allowOutsideClick: false,
            didOpen: async () => {
                Swal.showLoading();
                const request = await httpRequest2(
                    `api/v1/purchases/serviceorder?reference=${reference}`,
                    payload,
                    null,
                    'json',
                    'POST'
                );
                Swal.close();

                if (request.status) {
                    notification('Service order updated successfully!', 1);
                    editMode = false; // Reset edit mode
                    form.reset();
                    serviceorderid = '';
                    document.getElementsByClassName('viewer')[0].click();
                    fetchserviceorder();
                } else {
                    notification(request.message, 0);
                }
            },
        });
    });

    // Populate the services table
    const tableBody = document.getElementById('tabledata1');
    tableBody.innerHTML = '';

    order.services.forEach((service, index) => {
        const newRow = document.createElement('tr');
        newRow.id = `row-${index}`;

        newRow.innerHTML = `
            <td class="s/n text-center opacity-70">${index + 1}</td>
            <td class="text-center opacity-70">
                <select name="servicetype${index + 1}" id="service_type-${index}" class="form-control comp">
                    <option value="">-- Select Service Type --</option>
                    <option value="LOGISTICS" ${service.servicetype === 'LOGISTICS' ? 'selected' : ''}>LOGISTICS</option>
                    <option value="IT" ${service.servicetype === 'IT' ? 'selected' : ''}>IT</option>
                    <option value="NETWORK" ${service.servicetype === 'NETWORK' ? 'selected' : ''}>NETWORK</option>
                    <option value="OTHER" ${service.servicetype === 'OTHER' ? 'selected' : ''}>OTHER</option>
                    <option value="MAINTENANCE" ${service.servicetype === 'MAINTENANCE' ? 'selected' : ''}>MAINTENANCE</option>
                </select>
            </td>
            <td class="text-center opacity-70">
                <input name="description${index + 1}" id="description-${index}" class="form-control description comp" value="${service.description}" placeholder="Enter Description"/>
            </td>
            <td class="text-center opacity-70">
                <input name="amountfrom${index + 1}" id="amountfrom-${index}" type="number" class="form-control amount comp" value="${service.amountfrom}" placeholder="Enter Amount From"/>
            </td>
            <td class="text-center opacity-70">
                <input name="amountto${index + 1}" id="amountto-${index}" type="number" class="form-control amount comp" value="${service.amountto}" placeholder="Enter Amount To"/>
            </td>
            <td class="text-center opacity-70">
                <button onclick="this.parentElement.parentElement.remove();runCount()" title="Remove item" class="material-symbols-outlined h-8 w-8 rounded-full bg-red-600 text-xs text-white drop-shadow-md" style="font-size: 18px;">remove</button>
            </td>
        `;

        tableBody.appendChild(newRow);
    });
}




