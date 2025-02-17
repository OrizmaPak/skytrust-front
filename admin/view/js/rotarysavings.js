let rotarysavingsid
let rotarysavingsproducts
async function rotarysavingsActive() {
    rotarysavingsid = ''
    const form = document.querySelector('#rotarysavingsform')
    const form2 = document.querySelector('#viewrotarysavingsForm')
    if(form.querySelector('#submit')) form.querySelector('#submit').addEventListener('click', rotarysavingsFormSubmitHandler)
    if(form2.querySelector('#querySubmit')) form2.querySelector('#querySubmit').addEventListener('click', e=>fetchrotarysavings())
    datasource = []
    await fetchrotarysavings()
    await getAllUsers('userid', 'name')
    await getAllbranch()
    await getAllmembership()
    await fetchrotarysavingsproduct()

    document.getElementById('registrationdate').value = new Date().toISOString().slice(0, 16);

    new TomSelect('#branch', {
        // plugins: ['remove_button', 'dropdown_input'],
        // onInitialize: function() {
        //     console.log(checkpermission('FILTER BRANCH'))
        //     if(!checkpermission('FILTER BRANCH')) this.setValue(the_user.branch);
        //     if(!checkpermission('FILTER BRANCH')) this.setTextboxValue('readonly', true);
        // }
    });
    new TomSelect('#userid', {
        // plugins: ['remove_button', 'dropdown_input'],
        onInitialize: function() {
            console.log(checkpermission('FILTER USERS'))
            if(!checkpermission('FILTER USERS')) this.setValue(the_user.id);
            if(!checkpermission('FILTER USERS')) this.setTextboxValue('readonly', true);
            handlerotarysavingspersonelchange(this.getValue());
        },
        onChange: function() { 
            handlerotarysavingspersonelchange(this.getValue());
         },     
    });
    // new TomSelect('#member', {
    //     plugins: ['dropdown_input'],
    //     onChange: function() { 
    //         handlerotarysavingsmemberchange(this.getValue());
    //      },
    // }); 

    // new TomSelect('#productid', {
    //     plugins: ['dropdown_input']
    // });

    document.getElementById('member').addEventListener('change', handlerotarysavingsmemberchange, true)
}

async function fetchrotarysavings(id) {

    // Show loading state using SweetAlert
    const loadingAlert = Swal.fire({
        title: 'Please wait...',
        text: 'Fetching rotary savings data, please wait.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    let form = document.querySelector('#viewrotarysavingsForm');
    let formData = new FormData(form);
    // formData.set('department', '');
    // formData.set('branch', '');
    let queryParams = new URLSearchParams(formData).toString();

    if(!id)document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> Loading... </td>`

    let request = await httpRequest2(`api/v1/rotary/account?${queryParams ? `${queryParams}` : ''}${id ? `&id=${id}` : ''}`, null, document.querySelector('#viewrequisitionform #submit'), 'json', 'GET');
    swal.close(); // Close the loading alert once the request is complete
    if(!id)document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> No Records Retrieved </td>`
    if(request.status) {
        if(!id){
            if(request.data.length) {
                datasource = request.data
                resolvePagination(datasource, onrotarysavingsTableDataSignal);
            }
        } else {
            document.getElementsByClassName('updater')[0].click();
            branchid = request.data[0].id;
            populateData(request.data[0]);
            did('member').value = request.data[0].member;
            did('rotarysavingsproductcontainer').classList.remove('hidden');
        }
    } else {
        return notification('No records retrieved');
    }
}

async function fetchrotarysavingsproduct() {
    let request = await httpRequest2(`api/v1/rotary/product`, null, null, 'json', 'GET');
    rotarysavingsproducts = request.data;
    console.log('rotarysavingsproducts', rotarysavingsproducts)
    if(rotarysavingsproducts.length) {
        // did('rotarysavingsproductcontainer').classList.remove('hidden')
        did('productid').innerHTML = `<option value="">SELECT PRODUCT</option>`
        did('productid').innerHTML += rotarysavingsproducts.map(data=>`<option value="${data.id}">${data.product}</option>`).join('')
        new TomSelect('#productid', {
            plugins: ['dropdown_input'],
            onChange: function() {
                getrotarysavingscharges(this.getValue());
            }
        });
    }
}

function handlerotarysavingspersonelchange(id) {
    const user = userlistdata.data.find(data => data.id == id);
    const element = document.getElementById('member');
    element.innerHTML = `<option value="">--SELECT MEMBER--</option>`;
    if (user) {
        const branch = user.branch;
        const branchElement = document.getElementById('branch').tomselect;
        branchElement.setValue(branch);
        branchElement.setTextboxValue('readonly', true);
    }
    if(!id)return did('membership').classList.add('hidden');
    else did('membership').classList.remove('hidden');
    if (id) {
        did('member').removeAttribute('disabled');
        let list = userlistdata.data.filter(data => data.id == id)[0].membership.filter(data => data.status == 'ACTIVE');
        element.innerHTML = `<option value="">--SELECT MEMBER--</option>`;
        element.innerHTML += list.map(data => `<option value="${data.member}">${data.membername}</option>`).join('');
        if(rotarysavingsid)did('member').setAttribute('disabled', true);
    }
}

function handlerotarysavingsmemberchange() {
    const element = document.getElementById('productid').tomselect;
    did('rotarysavingsproductcontainer').classList.add('hidden');
    // element.setValue('');
    element.clearOptions();
    if(!did('member').value)return notification('Please select a member', 0);
    const id = document.getElementById('member').value;
    if(!id)return did('rotarysavingsproductcontainer').classList.add('hidden');
    else did('rotarysavingsproductcontainer').classList.remove('hidden');
    console.log('product', rotarysavingsproducts)
    if (id) {
        let list = rotarysavingsproducts.filter(data => data.status == 'ACTIVE' && data.member.includes('||') ? data.member.split('||').includes(id) : data.member == id);
        console.log('list', list);
        // element.addOption({value: '', text: '--SELECT PRODUCT--'});
        list.forEach(data => element.addOption({value: data.id, text: data.product}));
        element.refreshOptions();
        getrotarysavingscharges(did('productid').tomselect.getValue());
        did('rotarysavingsproductcontainer').classList.remove('hidden');
    }
}

function getrotarysavingscharges(id) {
    console.log('id', id)
    const rotarysavingscharges = rotarysavingsproducts.filter(item => item.id == id);
    console.log('rotarysavingscharges', rotarysavingscharges)
        did('registrationcharge').value = rotarysavingscharges[0].registrationcharge;
        if(rotarysavingscharges[0].rotaryschedule == 'PRODUCT'){
            did('frequencycontainer').classList.add('hidden');
            did('frequencynumbercontainer').classList.add('hidden');
        }else{
            did('frequencycontainer').classList.remove('hidden');    
            did('frequencynumbercontainer').classList.remove('hidden');
        }

}


async function fetchUSERS(id) {

    // Show loading state using SweetAlert
    const loadingAlert = Swal.fire({
        title: 'Please wait...',
        text: 'Fetching rotarysavings data, please wait.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    let form = document.querySelector('#viewrotarysavingsform');
    let formData = new FormData(form);
    // formData.set('department', '');
    // formData.set('rotarysavings', '');
    let queryParams = new URLSearchParams(formData).toString();

    if(!id)document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> Loading... </td>`

    let request = await httpRequest2(`api/v1/inventory/requisition/view?${queryParams ? `${queryParams}` : ''}${id ? `&id=${id}` : ''}`, null, document.querySelector('#viewrequisitionform #submit'), 'json', 'GET');
    swal.close(); // Close the loading alert once the request is complete
    if(!id)document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> No Records Retrieved </td>`
    if(request.status) {
        if(!id){
            if(request.data.length) {
                datasource = request.data
                resolvePagination(datasource, onrotarysavingsTableDataSignal);
            }
        } else {
            document.getElementsByClassName('updater')[0].click();
            rotarysavingsid = request.data[0].id;
            populateData(request.data[0]);
        }
    } else {
        return notification('No records retrieved');
    }
}

async function removerotarysavings(id) {
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
        fetchrotarysavings();
        return notification(confirmed.value.message);
    }
}


async function onrotarysavingsTableDataSignal() {
    let rows = getSignaledDatasource().map((item, index) => `
    <tr>
        <td>${index + 1}</td>
        <td>${formatDate(item.registrationdate)}</td>
        <td>${item.accountnumber}</td>
        <td>${item.accountname}</td>
        <td>${item.membername}</td>
        <td>${item.productname}</td>
        <td>${formatCurrency(item.amount)}</td>
        <td>${item.nextduedate ? formatDate(item.nextduedate) : ''}</td>
        <td>${item.status}</td>
        <td class="flex items-center gap-3 ">
            <button title="View row entry" onclick="viewrotarysavings('${item.id}')" class="material-symbols-outlined rounded-full bg-green-600 h-8 w-8 text-white drop-shadow-md text-xs" style="font-size: 18px;">visibility</button>
            <button title="Edit row entry" onclick="fetchrotarysavings('${item.id}')" class="material-symbols-outlined rounded-full bg-primary-g h-8 w-8 text-white drop-shadow-md text-xs" style="font-size: 18px;">edit</button>
            <button title="Delete row entry" onclick="removerotarysavings('${item.id}')" class="hidden material-symbols-outlined rounded-full bg-red-600 h-8 w-8 text-white drop-shadow-md text-xs" style="font-size: 18px;">delete</button>
        </td>
    </tr>`
    )
    .join('')
    injectPaginatatedTable(rows)
}

async function viewrotarysavings(id) {
    // Filter the datasource to find the product with the given id
    const thedata = datasource.find(item => item.id == id);

    if (!thedata) {
        return Swal.fire({
            icon: 'error',
            title: 'Rotary Savings Not Found',
            text: `No rotary savings found with ID ${id}.`,
        });
    }

    try {
        // Format the date to a readable format
        const formattedRegistrationDate = new Date(thedata.registrationdate).toLocaleString();
        const formattedNextDueDate = new Date(thedata.nextduedate).toLocaleString();

        // Construct the HTML content for the SweetAlert modal
        const content = `
            <div class="p-6 min-h-screen bg-gray-50">
                <!-- General Information Section -->
                <section class="p-5 mb-12 rounded-sm shadow-sm section bg-white/90 xl:p-10">
                    <h2 class="mb-4 text-lg font-semibold">General Information</h2>
                    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <div class="form-group">
                            <label class="control-label">Registration Date</label>
                            <div class="text-sm text-gray-700">${formattedRegistrationDate}</div>
                        </div>
                        <div class="form-group">
                            <label class="control-label">Account Number</label>
                            <div class="text-sm text-gray-700">${thedata.accountnumber}</div>
                        </div>
                        <div class="form-group">
                            <label class="control-label">Account Name</label>
                            <div class="text-sm text-gray-700">${thedata.accountname}</div>
                        </div>
                        <div class="form-group">
                            <label class="control-label">Member</label>
                            <div class="text-sm text-gray-700">${thedata.membername}</div>
                        </div>
                        <div class="form-group">
                            <label class="control-label">Product</label>
                            <div class="text-sm text-gray-700">${thedata.productname}</div>
                        </div>
                        <div class="form-group">
                            <label class="control-label">Amount</label>
                            <div class="text-sm text-gray-700">${formatCurrency(thedata.amount)}</div>
                        </div>
                        <div class="form-group">
                            <label class="control-label">Next Due Date</label>
                            <div class="text-sm text-gray-700">${formattedNextDueDate}</div>
                        </div>
                        <div class="form-group">
                            <label class="control-label">Status</label>
                            <div class="text-sm text-gray-700">${thedata.status}</div>
                        </div>
                    </div>
                </section>

                <!-- Schedules Section -->
                <section class="p-5 mb-12 rounded-sm shadow-sm section bg-white/90 xl:p-10">
                    <h2 class="mb-4 text-lg font-semibold">Schedules</h2>
                    <div class="table-content">
                    <table class="table-auto">
                        <thead>
                            <tr style="text-align: center;">    
                                <th style="text-align: center;">Due Date</th>
                                <th style="text-align: center;">Amount</th>
                                <th style="text-align: center;">Amount Paid</th>
                                <th style="text-align: center;">Payment Status</th>
                                <th style="text-align: center;">Schedule Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${thedata.schedules && thedata.schedules.map((schedule, index) => `
                                <tr>
                                    <td>${formatDate(schedule.duedate)}</td>
                                    <td>${formatCurrency(schedule.amount)}</td>
                                    <td>${formatCurrency(schedule.amountPaid)}</td>
                                    <td style="color: ${schedule.paymentStatus === 'PAID' ? 'green' : schedule.paymentStatus === 'PARTLY PAID' ? 'orange' : 'red'};">${schedule.paymentStatus}</td>
                                    <td style="color: ${schedule.payout === 'YES' ? 'blue' : ''};"><i>${schedule.scheduleStatus}</i></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    </div>
                </section>
            </div>
        `;

        // Show the SweetAlert modal with the rotary savings details
        Swal.fire({
            title: 'Rotary Savings Details',
            html: content,
            width: '80%',
            showCloseButton: true,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Close',
            confirmButtonColor: '#3085d6',
            customClass: {
                container: 'rotarysavings-details-modal'
            }
        });
    } catch (error) {
        console.error("Error loading rotary savings:", error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'An error occurred while loading the rotary savings details.',
        });
    }
}

async function rotarysavingsFormSubmitHandler() {
    if(!validateForm('rotarysavingsform', getIdFromCls('comp'))) return notification('Please fill all required fields', 0)
    
    let payload = getFormData2(document.querySelector('#rotarysavingsform'), rotarysavingsid ? [['id', rotarysavingsid]] : null);

    const confirmed = await Swal.fire({
        title: did('accountnumber').value ? 'Updating...' : 'Submitting...',
        text: 'Please wait while we submit your data.',
        icon: 'info',
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: async () => {
            Swal.showLoading();
            let request = await httpRequest2('api/v1/rotary/account', payload, document.querySelector('#rotarysavingsform #submit'), 'json', 'POST');
            Swal.close();

            if (request.status) {
                notification(request.message, 1);
                const form = document.querySelector('#rotarysavingsform');
                form.reset();
                if(rotarysavingsid)form.querySelectorAll('input, select, textarea').forEach(input => input.value = '');
                rotarysavingsid = '';
                document.getElementsByClassName('viewer')[0].click();
                fetchrotarysavings();
            } else {    
                notification(request.message, 0);
            }
        }
    });
}