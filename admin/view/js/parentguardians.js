let parentguardiansid
async function parentguardiansActive() {
    parentguardiansid = ''
    const form = document.querySelector('#parentguardiansform')
    // const form2 = document.querySelector('#viewparentguardiansform')
    if(form.querySelector('#submit')) form.querySelector('#submit').addEventListener('click', parentguardiansFormSubmitHandler)
    // if(form2.querySelector('#querySubmit')) form2.querySelector('#querySubmit').addEventListener('click', parentguardiansFormSubmitHandler)
    datasource = []
    await fetchparentguardians()
   
    await getAllUsers('userid', 'name'),

    new TomSelect('#userid', {
        plugins: ['dropdown_input'],
        onChange: function() { 
            handleuserchange(this.getValue());
         }, 
        onInitialize: function () {
            if (!checkpermission('FILTER ALL USERS')) this.setValue(the_user.id);
            if (!checkpermission('FILTER ALL USERS')) this.setTextboxValue('readonly', true);
        }
    });
}

async function fetchparentguardians(id) {

    // Show loading state using SweetAlert
    const loadingAlert = Swal.fire({
        title: 'Please wait...',
        text: 'Fetching parentguardians data, please wait.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    // let form = document.querySelector('#viewparentguardiansform');
    // let formData = new FormData(form);
    // // formData.set('department', '');
    // // formData.set('parentguardians', '');
    // let queryParams = new URLSearchParams(formData).toString();

    if(!id)document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> Loading... </td>`

    // let request = await httpRequest2(`api/v1/personnel/parentguardians?${queryParams ? `${queryParams}` : ''}${id ? `&id=${id}` : ''}`, null, document.querySelector('#viewrequisitionform #submit'), 'json', 'GET');
    let request = await httpRequest2(`api/v1/personnel/parentguardians`, null, document.querySelector('#viewrequisitionform #submit'), 'json', 'GET');
    swal.close(); // Close the loading alert once the request is complete
    if(!id)document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> No Records Retrieved </td>`
    if(request.status) {
        if(!id){
            if(request.data.length) {
                datasource = request.data
                resolvePagination(datasource, onparentguardiansTableDataSignal);
            }
        } else {
            document.getElementsByClassName('updater')[0].click();
            parentguardiansid = id;
            const parentGuardian = request.data.find((item) => item.id == id);
            populateData(parentGuardian);
        if (parentGuardian && parentGuardian.parentoneimage) {
            document.getElementById('parentOneImagePreview').src = parentGuardian.parentoneimage;
        }
        if (parentGuardian && parentGuardian.parenttwoimage) {
            document.getElementById('parentTwoImagePreview').src = parentGuardian.parenttwoimage;
        }
            
        }
    } else {
        return notification('No records retrieved');
    }
}

function handleuserchange(id) {
    console.log("User list runs", userlistdata);
    const user = userlistdata.data.find(data => data.id == id);

    if (!id) {
        did('membershipdropdown').classList.add('hidden');
        return;
    }

    did('membershipdropdown').classList.remove('hidden');
    const membershipElement = document.getElementById('membership');
    membershipElement.disabled = false;

    if (user) {
        const activeMemberships = user.membership?.filter(data => data.status === 'ACTIVE') || [];
        const membershipSelect = did("membership").tomselect;
        membershipSelect.clearOptions();
        membershipSelect.addOption({ value: "", text: "--SELECT MEMBER--" });
        activeMemberships.forEach(data => {
            membershipSelect.addOption({ value: data.member, text: data.membername });
        });
        membershipSelect.refreshOptions();
    }

    if (propertyaccountid) {
        membershipElement.disabled = true;
    }
}

async function removeparentguardians(id) {
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

            let request = await httpRequest2('api/v1/personnel/parentguardians', id ? getparamm() : null, null, 'json', "DELETE");
            return request;
        },
        allowOutsideClick: () => !Swal.isLoading()
    });

    // Show notification based on the result
    if (confirmed.isConfirmed) {
        fetchparentguardians();
        return notification(confirmed.value.message);
    }
}


async function onparentguardiansTableDataSignal() {
    let rows = getSignaledDatasource().map((item, index) => `
    <tr>
        <td>${index + 1}</td>
        <td>
            <div class="mb-1">${item.parentonename}</div>
            <div class="border-t border-gray-300 mt-1 pt-1">${item.parenttwoname}</div>
        </td>
        <td>
            <div class="mb-1">${item.parentonephone}</div>
            <div class="border-t border-gray-300 mt-1 pt-1">${item.parenttwophone}</div>
        </td>
        <td>
            <div class="mb-1">${item.parentoneoccupation}</div>
            <div class="border-t border-gray-300 mt-1 pt-1">${item.parenttwooccupation}</div>
        </td>
        <td>
            <div class="mb-1">${item.parentonestate}</div>
            <div class="border-t border-gray-300 mt-1 pt-1">${item.parenttwostate}</div>
        </td>
        <td>${item.personnelname}</td>
        <td class="flex items-center gap-3">
            <button title="Edit row entry" onclick="fetchparentguardians('${item.id}')" class="material-symbols-outlined h-8 w-8 rounded-full bg-primary-g text-xs text-white drop-shadow-md" style="font-size: 18px;">edit</button>
            <button title="Delete row entry" onclick="removeparentguardians('${item.id}')" class="material-symbols-outlined h-8 w-8 rounded-full bg-red-600 text-xs text-white drop-shadow-md" style="font-size: 18px;">delete</button>
            <button title="View more info" onclick="viewMoreInfo('${item.id}')" class="material-symbols-outlined h-8 w-8 rounded-full bg-green-500 text-xs text-white drop-shadow-md" style="font-size: 18px;">visibility</button>
        </td>
    </tr>`
    )
    .join('')
    injectPaginatatedTable(rows)
}

async function viewMoreInfo(id) {
    const data = datasource.find(item => item.id == id);
    try {
        if (data) {
            Swal.fire({
                title: '<h2 class="text-xl font-bold text-gray-900">Parent/Guardian Information</h2>',
                html: `
                    <div class="text-left space-y-4">
                        <!-- Parent Information -->
                        <div class="grid grid-cols-2 gap-4 items-center border-b pb-3">
                            <div>
                                <h3 class="text-lg font-semibold text-gray-800">Parent One</h3>
                                <p><strong>Name:</strong> ${data.parentonename}</p>
                                <p><strong>Occupation:</strong> ${data.parentoneoccupation}</p>
                                <p><strong>State:</strong> ${data.parentonestate}</p>
                                <p><strong>Office Address:</strong> ${data.parentoneofficeaddress}</p>
                                <p><strong>Phone:</strong> ${data.parentonephone}</p>
                            </div>
                            <div class="flex justify-center">
                                <img src="${data.parentoneimage}" alt="Parent One Image" class="rounded-sm w-28 h-28 border">
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-2 gap-4 items-center border-b pb-3">
                            <div>
                                <h3 class="text-lg font-semibold text-gray-800">Parent Two</h3>
                                <p><strong>Name:</strong> ${data.parenttwoname}</p>
                                <p><strong>Occupation:</strong> ${data.parenttwooccupation}</p>
                                <p><strong>State:</strong> ${data.parenttwostate}</p>
                                <p><strong>Office Address:</strong> ${data.parenttwoofficeaddress}</p>
                                <p><strong>Phone:</strong> ${data.parenttwophone}</p>
                            </div>
                            <div class="flex justify-center">
                                <img src="${data.parenttwoimage}" alt="Parent Two Image" class="rounded-sm w-28 h-28 border">
                            </div>
                        </div>

                        <!-- Additional Details -->
                        <div class="border-b pb-3">
                            <h3 class="text-lg font-semibold text-gray-800">Additional Information</h3>
                            <p><strong>Home Address:</strong> ${data.homeaddress}</p>
                            <p><strong>Date Added:</strong> ${formatDate(data.dateadded.split("T")[0])}</p>
                            <p><strong>Status:</strong> ${data.status}</p>
                            <p><strong>Personnel Name:</strong> ${data.personnelname}</p>
                        </div>
                    </div>
                `,
                icon: 'info',
                confirmButtonText: 'Close',
                customClass: {
                    popup: 'bg-white shadow-lg rounded-xl p-6 max-w-3xl',
                    confirmButton: 'bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700'
                }
            });
        } else {
            notification('Failed to fetch more information', 0);
        }
    } catch (error) {
        notification('An error occurred while fetching more information', 0);
    }
}

async function parentguardiansFormSubmitHandler() {
    if(!validateForm('parentguardiansform', getIdFromCls('comp'))) return notification('Please fill all required fields', 0)
    
    let payload = getFormData2(document.querySelector('#parentguardiansform'), parentguardiansid ? [['id', parentguardiansid]] : null);

    const confirmed = await Swal.fire({
        title: parentguardiansid ? 'Updating...' : 'Submitting...',
        text: 'Please wait while we submit your data.',
        icon: 'info',
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: async () => {
            Swal.showLoading();
            let request = await httpRequest2('api/v1/personnel/parentguardians', payload, document.querySelector('#parentguardiansform #submit'), 'json', 'POST');
            Swal.close();

            if (request.status) {
                notification('Success!', 1);
                const form = document.querySelector('#parentguardiansform');
                form.reset();
                if(parentguardiansid)form.querySelectorAll('input, select, textarea').forEach(input => input.value = '');
                parentguardiansid = '';
                document.getElementsByClassName('viewer')[0].click();
                fetchparentguardians();
            } else {    
                notification(request.message, 0);
            }
        }
    });
}
