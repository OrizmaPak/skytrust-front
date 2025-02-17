let registrationpointid
async function registrationpointActive() {
    registrationpointid = ''
    const form = document.querySelector('#registrationpointform')
    const filterform = document.querySelector('#branchFilterForm')
    if(form.querySelector('#submit')) form.querySelector('#submit').addEventListener('click', registrationpointFormSubmitHandler)
        if(filterform.querySelector('#submit')) filterform.querySelector('#submit').addEventListener('click', e=>{
        e.preventDefault()
        fetchregistrationpoint()
    })
    datasource = []
    await getAllbranch(false, 'branchFilter')
    await getAllbranch(true);
    new TomSelect('#branch', {
        plugins: ['dropdown_input'],
        onInitialize: function() {
            console.log(checkpermission('FILTER BRANCH'))
            if(!checkpermission('FILTER BRANCH')) this.setValue(the_user.branch);
            if(!checkpermission('FILTER BRANCH')) this.setTextboxValue('readonly', true);
        }
    });
    new TomSelect('#branchFilter', {
        plugins: ['dropdown_input'],
        onInitialize: function() {
            console.log(checkpermission('FILTER BRANCH'))
            if(!checkpermission('FILTER BRANCH')) this.setValue(the_user.branch);
            if(!checkpermission('FILTER BRANCH')) this.setTextboxValue('readonly', true);
        }
    });
    await fetchregistrationpoint()
    // await getAllUsers('useridlist', 'id')
}

async function fetchregistrationpoint(id) {
    // scrollToTop('scrolldiv')
    function getparamm() {
        let paramstr = new FormData();
        paramstr.append('id', id);
        return paramstr;
    }

    // Show loading state using SweetAlert
    const loadingAlert = Swal.fire({
        title: 'Please wait...',
        text: 'Fetching registrationpoint data, please wait.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    let form = document.querySelector('#branchFilterForm');
    let formData = new FormData(form);
    let queryParams = new URLSearchParams(formData).toString();

    let request = await httpRequest2(`api/v1/admin/registrationpoints?${queryParams ? `&${queryParams}` : ''}${id ? `&id=${id}`: ''}`,  null, null, 'json', 'GET');
    Swal.close(); // Close the loading alert once the request is complete

    if (!id) document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> No Records Retrieved </td>`;
    if (request.status) {
        if (!id) {
            if (request.data.length) {
                datasource = request.data;
                resolvePagination(datasource, onregistrationpointTableDataSignal);
            }
        } else {
            document.getElementsByClassName('updater')[0].click();
            registrationpointid = request.data[0].id;
            populateData(request.data[0]);
        }
    } else {
        return notification('No records retrieved');
    }
}

async function removeregistrationpoint(id) {
    const thedata = datasource.find(item => item.id == id);
    if (!thedata) {
        return notification('Registration point not found.');
    }

    try {
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
                const paramstr = new FormData();
                for (const key in thedata) {
                    if (thedata.hasOwnProperty(key)) {
                        paramstr.append(key, thedata[key]);
                    }
                }
                paramstr.set('id', id);
                paramstr.set('status', 'DELETED');
                const request = await httpRequest2('api/v1/admin/registrationpoints', paramstr, null, 'json');
                return request;
            },
            allowOutsideClick: () => !Swal.isLoading()
        });

        if (confirmed.isConfirmed) {
            if (confirmed.value && confirmed.value.status) {
                fetchregistrationpoint();
                return notification(confirmed.value.message);
            } else {
                return notification(confirmed.value ? confirmed.value.message : 'Failed to delete registration point', 0);
            }
        }
    } catch (error) {
        return notification('An error occurred while deleting the registration point.');
    }
}


async function onregistrationpointTableDataSignal() {
    let rows = getSignaledDatasource().map((item, index) => `
    <tr>
        <td>${index + 1}</td>
        <td>${item.registrationpoint}</td>
        <td>${item.branchname??item.branch}</td>
        <td>${item.description??''}</td>
        <td class="flex items-center gap-3">
            <button title="Edit row entry" onclick="fetchregistrationpoint('${item.id}')" class="material-symbols-outlined rounded-full bg-primary-g h-8 w-8 text-white drop-shadow-md text-xs" style="font-size: 18px;">edit</button>
            <button title="Manage Staffs" onclick="fetchregistrationpointstaffs('${item.id}')" class="material-symbols-outlined rounded-full bg-orange-600 h-8 w-8 text-white drop-shadow-md text-xs" style="font-size: 18px;">engineering</button>
            <button title="Delete row entry" onclick="removeregistrationpoint('${item.id}')" class="material-symbols-outlined rounded-full bg-red-600 h-8 w-8 text-white drop-shadow-md text-xs" style="font-size: 18px;">delete</button>
        </td>
    </tr>`
    )
    .join('')
    injectPaginatatedTable(rows)
}

async function fetchregistrationpointstaffs(id) {
    try {
        // Show loading modal
        const modal = await Swal.fire({
            title: 'Loading Staffs...',
            text: 'Please wait while we fetch the staff data.',
            icon: 'info',
            showConfirmButton: true, // Enable confirm button to act as a cancel button
            confirmButtonText: 'Cancel', // Label the button as 'Cancel'
            confirmButtonColor: '#3085d6',
            allowOutsideClick: false,
            didOpen: async() => {
                Swal.showLoading();
                const response = await httpRequest2(`api/v1/members/finduser?role=STAFF&branch=${did('branch').value}`, null, null, 'json', 'GET');
        
                if (response.status) {
                    // Close loading modal
                    Swal.close();

                    
        
                    // Create a table with fetched staff data
                    const staffRows = response.data.filter(data => data.registrationpoint == id).map((staff, index) => `
                        <tr>
                            <td>${index + 1}</td>
                            <td>${staff.firstname} ${staff.lastname} ${staff.othernames}</td>
                            <td>${staff.branchname??staff.branch}</td>
                            <td>${staff.role}</td>
                            <td>
                                <button title="Delete Staff" onclick="removeStaff('${id}', '${staff.id}')" class="material-symbols-outlined rounded-full bg-red-600 h-8 w-8 text-white drop-shadow-md text-xs" style="font-size: 18px;">delete</button>
                            </td>
                        </tr>
                    `).join('') || '<tr><td colspan="5" class="text-center opacity-70">No staff allocated to this registration point</td></tr>';
        
                    // Show modal with form and table
                    await Swal.fire({
                        title: 'Manage Staffs',
                        html: `
                            <form id="staffForm" class="grid grid-cols-3 gap-2">
                                <select id="newStaffName" class="form-controls col-span-2" placeholder="Enter Staff Name" required>
                                    <option value="">--SELECT STAFF--</option>
                                    ${response.data.filter(data => data.registrationpoint == 0).map(data => `<option value="${data.id}">${data.firstname} ${data.lastname} ${data.othernames}</option>`).join('')}
                                </select>
                                <button type="button" onclick="addStaff('${id}', document.getElementById('newStaffName').value)" class="bg-blue-400 text-white py-2 px-5 rounded hover:bg-blue-700 font-semibold">Add Staff</button>
                            </form>
                            <div class="table-content">
                            <table class="w-full mt-4">
                                <thead>
                                    <tr>
                                        <th style="width:10px">#</th>
                                        <th>Name</th>
                                        <th>Branch</th>
                                        <th>Role</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${staffRows}
                                </tbody>
                            </table>
                            </div>
                        `,
                        showConfirmButton: false,
                        showCancelButton: true,
                        cancelButtonText: 'Close',
                        cancelButtonColor: '#3085d6',
                        didOpen: () => {
                            new TomSelect('#newStaffName', {
                                plugins: ['dropdown_input']
                            });
                        }
                    });
                } else {
                    Swal.fire('Error', 'Failed to fetch staff data.', 'error');
                }
            }
        });

        // Fetch staff data from the user registration endpoint
    } catch (error) {
        Swal.fire('Error', 'An error occurred while fetching staff data.', 'error');
    }
}

function addStaff(registrationPointId, staffId) {
    if (!staffId) {
        Swal.fire('Error', 'Please select a staff to add.', 'error').then(() => {
            fetchregistrationpointstaffs(registrationPointId);
        });
        return;
    }

    Swal.fire({
        title: 'Adding Staff...',
        text: 'Please wait while we add the staff member.',
        icon: 'info',
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    const payload = new FormData();
    payload.append('registrationpoint', registrationPointId);
    payload.append('id', staffId);

    httpRequest2('api/v1/admin/addStaffToRegistrationPoint', payload, null, 'json', 'POST')
        .then(response => {
            Swal.close();
            if (response.status) {
                Swal.fire({
                    title: 'Success',
                    text: 'Staff added successfully!',
                    icon: 'success',
                    confirmButtonText: 'Okay',
                    confirmButtonColor: '#3085d6',
                }).then(() => {
                    fetchregistrationpointstaffs(registrationPointId);
                });
            } else {
                Swal.fire('Error', response.message || 'Failed to add staff.', 'error').then(() => {
                    fetchregistrationpointstaffs(registrationPointId);
                });
            }
        })
        .catch(error => {
            Swal.close();
            Swal.fire('Error', 'An error occurred while adding staff.', 'error').then(() => {
                fetchregistrationpointstaffs(registrationPointId);
            });
        });
}


async function removeStaff(registrationPointId, staffId) {
    if (!staffId) {
        Swal.fire('Error', 'Please select a staff to remove.', 'error').then(() => {
            fetchregistrationpointstaffs(registrationPointId);
        });
        return;
    }

    const confirmation = await Swal.fire({
        title: 'Are you sure?',
        text: 'Do you really want to remove this staff member?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, remove it!',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6'
    });

    if (!confirmation.isConfirmed) {
        fetchregistrationpointstaffs(registrationPointId);
        return;
    }

    Swal.fire({
        title: 'Removing...',
        text: 'Please wait while we remove the staff member.',
        icon: 'info',
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    const payload = new FormData();
    payload.append('registrationpoint', 0);
    payload.append('id', staffId);

    try {
        const response = await httpRequest2('api/v1/admin/addStaffToRegistrationPoint', payload, null, 'json', 'POST');
        Swal.close();

        if (response.status) {
            Swal.fire({
                title: 'Success',
                text: 'Staff removed successfully!',
                icon: 'success',
                confirmButtonText: 'Okay',
                confirmButtonColor: '#3085d6',
            }).then(() => {
                fetchregistrationpointstaffs(registrationPointId);
            });
        } else {
            Swal.fire('Error', response.message || 'Failed to remove staff.', 'error').then(() => {
                fetchregistrationpointstaffs(registrationPointId);
            });
        }
    } catch (error) {
        Swal.close();
        Swal.fire('Error', 'An error occurred while removing staff.', 'error').then(() => {
            fetchregistrationpointstaffs(registrationPointId);
        });
    }
}


async function registrationpointFormSubmitHandler() {
    if(!validateForm('registrationpointform', getIdFromCls('comp'))) return
    
    let payload = getFormData2(document.querySelector('#registrationpointform'), registrationpointid ? [['id', registrationpointid]] : null);

    const confirmed = await Swal.fire({
        title: registrationpointid ? 'Updating...' : 'Submitting...',
        text: 'Please wait while we submit your data.',
        icon: 'info',
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: async () => {
            Swal.showLoading();
            let request = await httpRequest2('api/v1/admin/registrationpoints', payload, document.querySelector('#registrationpointform #submit'), 'json', 'POST');
            Swal.close();

            if (request.status) {
                notification('Success!', 1);
                const form = document.querySelector('#registrationpointform');
                form.reset();
                if(registrationpointid)form.querySelectorAll('input, select, textarea').forEach(input => input.value = '');
                registrationpointid = '';
                document.getElementsByClassName('viewer')[0].click();
                fetchregistrationpoint();
            } else {    
                notification(request.message, 0);
            }
        }
    });
}
