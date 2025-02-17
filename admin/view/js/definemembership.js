let definemembershipid
async function definemembershipActive() {
    definemembershipid = ''
    const form = document.querySelector('#definemembershipform')
    if(form.querySelector('#submit')) form.querySelector('#submit').addEventListener('click', definemembershipFormSubmitHandler)
    datasource = []
    await fetchdefinemembership()
    await getAlldefinemembership(true)
    await getAllUsers('userid', 'id')
    new TomSelect('#definemembership', {
        plugins: [''],
        onInitialize: function() {
            console.log(checkpermission('CHANGE definemembership'))
            if(!checkpermission('CHANGE definemembership'))this.disable();
        }
    });
}

async function fetchdefinemembership(id) {
    // scrollToTop('scrolldiv')
    function getparamm() {
        let paramstr = new FormData();
        paramstr.append('id', id);
        return paramstr;
    }

    // Show loading state using SweetAlert
    const loadingAlert = Swal.fire({
        title: 'Please wait...',
        text: 'Fetching definemembership data, please wait.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    let request = await httpRequest2(`api/v1/admin/organizationmembership${id ? `?id=${id}`: ''}`,  null, null, 'json', 'GET');
    Swal.close(); // Close the loading alert once the request is complete

    if (!id) document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> No Records Retrieved </td>`;
    if (request.status) {
        if (!id) {
            if (request.data.length) {
                datasource = request.data;
                resolvePagination(datasource, ondefinemembershipTableDataSignal);
            }
        } else {
            document.getElementsByClassName('updater')[0].click();
            definemembershipid = request.data[0].id;
            populateData(request.data[0]);
        }
    } else {
        return notification('No records retrieved');
    }
}

async function removedefinemembership(id) {
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
        fetchdefinemembership();
        return notification(confirmed.value.message);
    }
}


async function ondefinemembershipTableDataSignal() {
    let rows = getSignaledDatasource().map((item, index) => `
    <tr>
        <td>${index + 1}</td>  
        <td>${item.member}</td>
        <td>${item.addmember}</td>
        <td style="color: ${item.status === 'ACTIVE' ? 'green' : 'red'};">${item.status}</td>
        <td class="flex items-center gap-3">
            <button title="Edit row entry" onclick="fetchdefinemembership('${item.id}')" class="material-symbols-outlined rounded-full bg-primary-g h-8 w-8 text-white drop-shadow-md text-xs" style="font-size: 18px;">edit</button>
            <button title="Delete row entry" onclick="settingsdefinemembership('${item.id}')" class="material-symbols-outlined rounded-full bg-orange-600 h-8 w-8 text-white drop-shadow-md text-xs" style="font-size: 18px;">settings</button>
        </td>
    </tr>` 
    )
    .join('')
    injectPaginatatedTable(rows)
}

function settingsdefinemembership(id) { 
    const member = datasource.find(item => item.id == id);
    
    if (!member) {
        return notification('Member not found', 0);
    }

    Swal.fire({
        title: 'Member Settings',
        html: `
            <form id="membership-settings-form" class="flex flex-col space-y-6">
                <!-- Status Selection -->
                <div class="flex flex-col">
                    <label for="status" class="mb-2 text-sm font-semibold text-gray-700">Status:</label>
                    <select id="status" name="status" class="block w-full px-4 py-3 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option value="ACTIVE" ${member.status === 'ACTIVE' ? 'selected' : ''}>ACTIVE</option>
                        <option value="SUSPENDED" ${member.status === 'SUSPENDED' ? 'selected' : ''}>SUSPENDED</option>
                    </select>
                </div>

                <!-- Auto Add Members on Creation Selection -->
                <div class="flex flex-col">
                    <label for="autoAdd" class="mb-2 text-sm font-semibold text-gray-700">Auto Add Members on Creation:</label>
                    <select id="autoAdd" name="autoAdd" class="block w-full px-4 py-3 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option value="YES" ${member.addmember == 'YES' ? 'selected' : ''}>YES</option>
                        <option value="NO" ${member.addmember == 'NO' ? 'selected' : ''}>NO</option>
                    </select>
                </div>
            </form>
        `,
        icon: 'settings',
        showCancelButton: true,
        confirmButtonText: 'Update Settings',
        cancelButtonText: 'Cancel',
        focusConfirm: false,
        width: '600px',
        padding: '2rem',
        customClass: {
            popup: 'bg-white rounded-xl shadow-2xl',
            title: 'text-3xl font-semibold text-gray-800 mb-4',
            content: 'p-0',
            confirmButton: 'bg-blue-600 text-white font-semibold px-6 py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500',
            cancelButton: 'bg-gray-300 text-gray-800 font-semibold px-6 py-3 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500'
        },
        preConfirm: () => {
            const form = Swal.getPopup().querySelector('#membership-settings-form');
            const status = form.querySelector('#status').value;
            const autoAddValue = form.querySelector('#autoAdd').value;
            const autoAdd = autoAddValue;

            // Basic Validation
            if (!status) {
                Swal.showValidationMessage('Please select a status.');
                return false;
            }

            return { status, autoAdd };
        },
        didOpen: () => {
            // Optional: Add focus to the first input for better UX
            Swal.getPopup().querySelector('#status').focus();
        }
    }).then(async (result) => {
        if (result.isConfirmed) {
            const { status, autoAdd } = result.value;

            // Prepare the payload
            const payload = new FormData();
            payload.append('id', member.id);
            payload.append('status', status);
            payload.append('addmember', autoAdd);

            try {
                // Show a loading indicator
                Swal.fire({
                    title: 'Updating...',
                    text: 'Please wait while we update the settings.',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });

                // Make the API request
                const response = await httpRequest2('api/v1/admin/organizationmembership', payload, null, 'json', 'POST');

                if (response.status) { // Adjust based on your API's response structure
                    Swal.close(); // Close the settings modal
                    notification('Member settings updated successfully!', 1);
                    fetchdefinemembership(); // Refresh the membership list or perform necessary actions
                } else {
                    // Handle API errors
                    Swal.hideLoading();
                    notification(`Update failed: ${response.message || 'Unknown error.'}`);
                    fetchdefinemembership(); // Refresh the membership list or perform necessary actions
                }
            } catch (error) {
                // Handle network or other errors
                Swal.hideLoading();
                Swal.showValidationMessage(`An error occurred: ${error.message}`);
            }
        }
    });
}



async function definemembershipFormSubmitHandler() {
    if(!validateForm('definemembershipform', getIdFromCls('comp'))) return
    
    let payload = getFormData2(document.querySelector('#definemembershipform'), definemembershipid ? [['id', definemembershipid]] : null);

    const confirmed = await Swal.fire({
        title: definemembershipid ? 'Updating...' : 'Submitting...',
        text: 'Please wait while we submit your data.',
        icon: 'info',
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: async () => {
            Swal.showLoading();
            let request = await httpRequest2('api/v1/admin/organizationmembership', payload, document.querySelector('#definemembershipform #submit'), 'json', 'POST');
            Swal.close();

            if (request.status) {
                notification('Success!', 1);
                const form = document.querySelector('#definemembershipform');
                form.reset();
                if(definemembershipid)form.querySelectorAll('input, select, textarea').forEach(input => input.value = '');
                definemembershipid = '';
                document.getElementsByClassName('viewer')[0].click();
                fetchdefinemembership();
            } else {    
                notification(request.message, 0);
            }
        }
    });
}
