let activityid;
async function activityActive() {
    activityid = '';
    const form = document.querySelector('#activityform');
    if (form && form.querySelector('#submit')) {
        form.querySelector('#submit').addEventListener('click', fetchactivity);
    }
    datasource = [];
    // await getAllbranch(true);
    await getAllUsers('userid', 'name');
    // new TomSelect('#branch', {
        //     plugins: ['dropdown_input'],
        //     onInitialize: function() {
            //         console.log(checkpermission('CHANGE department'));
            //         if (!checkpermission('CHANGE department')) this.disable();
            //     }
            // });
            
            new TomSelect('#userid', {
                plugins: ['dropdown_input'],
            });
            // await fetchactivity();
}

async function fetchactivity() {
    // Show loading state using SweetAlert
    const loadingAlert = Swal.fire({
        title: 'Please wait...',
        text: 'Fetching activity data, please wait.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    try {
        let form = document.querySelector('#activityform');
        let formData = new FormData(form);
        let queryParams = new URLSearchParams(formData).toString();

        let request = await httpRequest2(`api/v1/admin/activities?${queryParams ? `&${queryParams}` : ''}`, null, null, 'json', 'GET');
        Swal.close(); // Close the loading alert once the request is complete

        document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> No Records Retrieved </td>`;
        if (request.status) {
                if (request.data.length) {
                    datasource = request.data;
                    resolvePagination(datasource, onactivityTableDataSignal);
                }
        } else {
            notification('No records retrieved');
        }
    } catch (error) {
        Swal.close();
        notification('Error fetching activity data: ' + error.message, 0);
    }
}

async function removeactivity(id) {
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
            try {
                let request = await httpRequest2('api/v1/admin/removeactivity', getparamm(id), null, 'json');
                return request;
            } catch (error) {
                Swal.showValidationMessage('Request failed: ' + error.message);
            }
        },
        allowOutsideClick: () => !Swal.isLoading()
    });

    if (confirmed.isConfirmed) {
        fetchactivity();
        notification(confirmed.value.message);
    }
}

function getparamm(id) {
    let paramstr = new FormData();
    paramstr.append('id', id);
    return paramstr;
}


function showmoredetails(items){
    item = JSON.parse(items.replaceAll('|', '"'))
    Swal.fire({
        title: item.fullname,
        html: `
          <div class="bg-gray-100 p-8 rounded-lg shadow-md max-w-3xl mx-auto">
            <h3 class="text-xl font-bold text-gray-700 mb-4">Activity Details</h3>
            <table class="min-w-full bg-white">
                <tbody>
                    <!-- Activity Section -->
                    <tr class="border-b">
                        <td class="px-4 py-2 font-semibold text-gray-700">Activity:</td>
                        <td class="px-4 py-2 text-gray-600">${item.message}</td>
                    </tr>
                    <!-- Module Section -->
                    <tr class="border-b">
                        <td class="px-4 py-2 font-semibold text-gray-700">Module:</td>
                        <td class="px-4 py-2 text-gray-600">${item.module}</td>
                    </tr>
                    <!-- Date Section -->
                    <tr class="border-b">
                        <td class="px-4 py-2 font-semibold text-gray-700">Date:</td>
                        <td class="px-4 py-2 text-gray-600">${formatDate(item.date)}</td>
                    </tr>
                    <!-- Branch Section -->
                    <tr class="border-b">
                        <td class="px-4 py-2 font-semibold text-gray-700">Branch:</td>
                        <td class="px-4 py-2 text-gray-600">${item.branch}</td>
                    </tr>
                    <!-- Branch Address Section -->
                    <tr class="border-b">
                        <td class="px-4 py-2 font-semibold text-gray-700">Branch Address:</td>
                        <td class="px-4 py-2 text-gray-600">${item.branchaddress}</td>
                    </tr>
                    <!-- Branch Country Section -->
                    <tr class="border-b">
                        <td class="px-4 py-2 font-semibold text-gray-700">Branch Country:</td>
                        <td class="px-4 py-2 text-gray-600">${item.branchcountry}</td>
                    </tr>
                    <!-- Branch LGA Section -->
                    <tr class="border-b">
                        <td class="px-4 py-2 font-semibold text-gray-700">Branch LGA:</td>
                        <td class="px-4 py-2 text-gray-600">${item.branchlga}</td>
                    </tr>
                    <!-- Branch State Section -->
                    <tr class="border-b">
                        <td class="px-4 py-2 font-semibold text-gray-700">Branch State:</td>
                        <td class="px-4 py-2 text-gray-600">${item.branchstate}</td>
                    </tr>
                    <!-- Country Section -->
                    <tr class="border-b">
                        <td class="px-4 py-2 font-semibold text-gray-700">Country:</td>
                        <td class="px-4 py-2 text-gray-600">${item.country}</td>
                    </tr>
                    <!-- Phone Section -->
                    <tr>
                        <td class="px-4 py-2 font-semibold text-gray-700">Phone:</td>
                        <td class="px-4 py-2 text-gray-600">${item.phone}</td>
                    </tr>
                </tbody>
            </table>
          </div>
        `,
        confirmButtonText: 'Close',
        confirmButtonColor: '#3085d6',
    });
}

async function onactivityTableDataSignal() {
    let rows = getSignaledDatasource().map((item, index) => `
    <tr>
        <td>${index + 1}</td>
        <td>${formatDate(item.date)}</td>
        <td>${specialformatDateTime(item.date).split(' ')[3]}</td>
        <td>${item.module}</td>
        <td>${item.fullname}</td>
        <td>${item.message}</td>
    
        <td class="flex items-center gap-3">
            <button title="Edit row entry" onclick="showmoredetails('${JSON.stringify(item).replaceAll('"', '|')}')" class="material-symbols-outlined rounded-full bg-primary-g h-8 w-8 text-white drop-shadow-md text-xs" style="font-size: 18px;">info</button>
        </td>
    </tr>`
    ).join('');
    injectPaginatatedTable(rows);
}


async function activityFormSubmitHandler() {
    if (!validateForm('activityform', getIdFromCls('comp'))) return;

    let payload = getFormData2(document.querySelector('#activityform'), activityid ? [['id', activityid]] : null);

    const confirmed = await Swal.fire({
        title: activityid ? 'Updating...' : 'Submitting...',
        text: 'Please wait while we submit your data.',
        icon: 'info',
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: async () => {
            Swal.showLoading();
            try {
                let request = await httpRequest2('api/v1/admin/activities', payload, document.querySelector('#activityform #submit'), 'json', 'POST');
                Swal.close();

                if (request.status) {
                    notification('Success!', 1);
                    const form = document.querySelector('#activityform');
                    form.reset();
                    if (activityid) form.querySelectorAll('input, select, textarea').forEach(input => input.value = '');
                    activityid = '';
                    document.getElementsByClassName('viewer')[0].click();
                    fetchactivity();
                } else {
                    notification(request.message, 0);
                }
            } catch (error) {
                Swal.close();
                notification('Error submitting data: ' + error.message, 0);
            }
        }
    });
}
