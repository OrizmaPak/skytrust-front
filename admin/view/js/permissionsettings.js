let accesscontrolid

const accessctrl_administration = [
    "PROFILE",
    "BRANCH MANAGEMENT",
    "ONLINE USERS",
    "CASHIER LIMIT",
    "TASK MANAGEMENT",
    "REGISTRATION POINT",
    "REJECT TRANSACTION DATE",
    "ACCESS CONTROL",
    "DEPARTMENT",
    "DEFINE MEMBERSHIP",
    "POSITION MEMBERSHIP",
    "ACCOUNT TYPE",
    "ACTIVITY PANEL",
    "ORGANIZATION SETTING",
    "CHANGE LOCATION",
  ];

const accessctrl_inventory = [
    'CREATE INVENTORY',
    'OPENING STOCK',
    'UPDATE INVENTORY',
    'VIEW INVENTORY',
    'REQUISITION',
    'VIEW REQUISITION',
    'APPROVE REQUISITION',
    'ISSUE TYPE LIST',
    'ISSUE LOG',
    'VIEW ISSUE LOG',
    'RETURN ITEM',
    'VIEW RETURNED ITEM',
    'STOCK LEDGER',
    'STOCK VALUATION',
    `APPROVE REQUISITION`,
    `DELETE ISSUE TYPE`, 
    `DELETE INVENTORY`,
    `UPDATE INVENTORY`,
    `DELETE STORAGE/WAREHOUSE`,
    `DELETE CATEGORIES`
];

const accessctrl_account = [
    'MANAGE GL ACCOUNT',
    'MANAGE GL TRANSACTION',
    'TRIAL BALANCE',
    'INCOME STATEMENT',
    'BALANCE SHEET',
    'GENERAL SALES REPORT',
    'NIGHT AUDIT/ END OF DAY REPORT'
];

const accessctrl_filter = [
    "FILTER BRANCH",
    "FILTER ALL REGISTRATION POINTS",
    "FILTER ALL USERS"
];

const accessctrl_view = [
    "VIEW COMPANY BALANCE"
]



const access_array = [
                        ['accessctrl_administration', 'ADMINISTRATION', accessctrl_administration], 
                        ['accessctrl_inventory', 'INVENTORY', accessctrl_inventory], 
                        ['accessctrl_account', 'GL ACCOUNT', accessctrl_account],
                        ['accessctrl_filter', 'FILTERS', accessctrl_filter],
                        ['accessctrl_view', 'VIEW', accessctrl_view]
                    ]

async function permissionsettingsActive() {
    const form = document.querySelector('#accesscontrolsform')
    if(document.querySelector('#role_submit')) document.querySelector('#role_submit').addEventListener('click', submitroleform)
    if(form.querySelector('#submit')) form.querySelector('#submit').addEventListener('click', accesscontrolFormSubmitHandler)
    if(document.getElementById('accesssave'))document.getElementById('accesssave').addEventListener('click', submitaccesssettings)
    await getAllUsers('email')
    new TomSelect('#email', {
        plugins: ['dropdown_input'],
    }); 
    await fetchaccesscontrols()
    new TomSelect('#roleers', {
        plugins: ['dropdown_input'],
    }); 
    datasource = []
}

async function submitroleform() {
    if(!validateForm('roleform', getIdFromCls('comp'))) return
    
    let payload = getFormData2(document.querySelector('#roleform'));

    const confirmed = await Swal.fire({
        title: 'Submitting...',
        text: 'Please wait while we submit your data.',
        icon: 'info',
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: async () => {
            Swal.showLoading();
            let request = await httpRequest2('api/v1/admin/manageroles', payload, document.querySelector('#roleform #role_submit'), 'json', 'POST');
            Swal.close();

            if (request.status) {
                notification('Success!', 1);
                const form = document.querySelector('#roleform');
                form.reset();
                form.querySelectorAll('input, select, textarea').forEach(input => input.value = '');
                document.getElementsByClassName('viewer')[0].click();
                fetchaccesscontrols()
            } else {    
                notification(request.message, 0);
            }
        }
    });
}

async function submitrolesettings(role, description, accessstring) {
    // if(!validateForm('accesscontrolsform', [`email`, 'role'])) return
    function payload() {
        let param = new FormData();
        param.append('role', role);
        param.append('description', description);
        param.append('permissions', accessstring);
        return param;
    }

    const confirmed = await Swal.fire({
        title: 'Submitting...',
        text: 'Please wait while we updating your role.',
        icon: 'info',
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: async () => {
            Swal.showLoading();
            let request = await httpRequest2('api/v1/admin/manageroles', payload(), document.querySelector('#accesscontrolsform #accesssave'), 'json', 'POST');
            Swal.close();

            if (request.status) {
                notification('Success!', 1);
                fetchaccesscontrols();
            } else {
                notification(request.message, 0);
            }
        }
    });
}


async function submitaccesssettings() {
    if (!validateForm('accesscontrolsform', ['email', 'role'])) return;

    function payload() {
        let param = new FormData();
        param.append('email', document.getElementById('email').value);
        param.append('role', document.getElementById('roleers').value);
        let accessstring = '';
        for (let i = 0; i < document.getElementsByClassName('accesscontroller').length; i++) {
            if (document.getElementsByClassName('accesscontroller')[i].checked) {
                accessstring += `${document.getElementsByClassName('accesscontroller')[i].name}|`;
            }
        }
        param.append('userpermissions', accessstring);
        return param;
    }

    const userConfirmed = await Swal.fire({
        title: 'Override Role Permissions',
        text: 'Applying user-specific permissions will overwrite the corresponding role permissions for this user. Only the permissions you set will be updated. All other role permission not set here will be inherited from the role. Do you want to continue?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, proceed',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#3085d6', // Blue color for the confirm button
        cancelButtonColor: '#FF5242'   // Red color for the cancel button
    });

    if (!userConfirmed.isConfirmed) {
        return;
    }

    const confirmed = await Swal.fire({
        title: 'Submitting...',
        text: 'Please wait while we update your access settings.',
        icon: 'info',
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: async () => {
            Swal.showLoading();
            let request = await httpRequest2('api/v1/auth/updateprofile', payload(), document.querySelector('#accesscontrolsform #accesssave'), 'json', 'POST');
            Swal.close();

            if (request.status) {
                notification('Permission updated successfully!', 1);
                did('email').value = '';
                did('roleers').tomselect.setValue('');
                did('accesssave').classList.add('hidden');
                did('accessctrl_container').innerHTML = '';
                refreshprofile()
                fetchaccesscontrols();
            } else {
                document.getElementById('permissionsettings').click()
                fetchaccesscontrols();
                notification(request.message, 0);
            }
        }
    });
}
 
function accessboard(element){
        if(!element.value){
            did('role').value = ''
            did('department').value = ''
            did('accesssave').classList.add('hidden')
        }
        did('accessctrl_container').innerHTML = ' '
        for(let i=0;i<document.getElementsByClassName('others').length;i++){
            document.getElementsByClassName('others')[i].classList.add('hidden')
            document.getElementsByClassName('thesubmit')[0].classList.remove('hidden')
        }
    }

function accessappendboard(res){
    for(let i=0;i<access_array.length;i++){
        let element = document.createElement('div')
        element.setAttribute('id', access_array[i][0])
        element.classList.add('flex', 'flex-col', 'border-r', 'mr-3', 'pr-3', 'border-b', 'mb-3', 'pb-3', 'W-[200px]')
        if(document.getElementById('permissions-container')){did('permissions-container').appendChild(element);did('accessctrl_container').innerHTML = ''}
        // else did('accessctrl_container').appendChild(element)
        document.getElementById(`${access_array[i][0]}`).innerHTML = `<p class="page-title">
                                <span>${access_array[i][1]}</span>
                            </p>`;
        document.getElementById(`${access_array[i][0]}`).innerHTML += access_array[i][2].map(data=>`<label class="bg-[#1d68e305] p-2 pl-1 mb-[1px] relative inline-flex items-center cursor-pointer">
                                          <input type="checkbox" name="${data}" ${res.permissions && (res.permissions.includes('|') ? res.permissions.split('|').includes(data) : res.permissions.includes(data)) ? 'checked' : ''} class="sr-only peer accesscontroller">
                                          <div class="scale-[0.8] w-11 h-6 bg-gray-400 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                          <span class="ms-2 text-xs font-medium text-blue-900">${data}</span>
                                        </label>`).join('')
    }
    
}

function accessappenduserboard(res){
    for(let i=0;i<access_array.length;i++){
        let element = document.createElement('div')
        element.setAttribute('id', access_array[i][0])
        element.classList.add('flex', 'flex-col', 'border-r', 'mr-3', 'pr-3', 'border-b', 'mb-3', 'pb-3', 'W-[200px]')
        // if(document.getElementById('permissions-container')){did('permissions-container').appendChild(element);did('accessctrl_container').innerHTML = ''}
        did('accessctrl_container').appendChild(element)
        document.getElementById(`${access_array[i][0]}`).innerHTML = `<p class="page-title">
                                <span>${access_array[i][1]}</span>
                            </p>`;
        document.getElementById(`${access_array[i][0]}`).innerHTML += access_array[i][2].map(data => {
                // Start of Selection
                const isChecked = res.userpermissions?.split('|').includes(data);
                const isChecked2 = res.userpermissions?.split('|').includes('__' + data);
            return `
            <div class="border grid border-gray-300 shadow-lg rounded-md p-2 mb-2">
                <label class="bg-[#1d68e305] p-2 pl-1 mb-[1px] relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="${data}" ${isChecked ? 'checked' : ''} class="sr-only peer accesscontroller" onchange="toggleCheckbox(this, '__${data}')">
                  <div class="scale-[0.8] w-11 h-6 bg-gray-400 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span class="ms-2 text-xs font-medium text-blue-900">${data}</span>
                </label>
                <label class="bg-[#1d68e305] p-2 pl-1 mb-[1px] relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="__${data}" ${isChecked2 ? 'checked' : ''} class="sr-only peer accesscontroller" onchange="toggleCheckbox(this, '${data}')">
                  <div class="scale-[0.8] w-11 h-6 bg-gray-400 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span class="ms-2 text-xs font-medium text-red-900">CANNOT ${data}</span>
                </label>
            </div>`;
        }).join('');

    }
    
}

function toggleCheckbox(currentCheckbox, otherCheckboxName) {
    if (currentCheckbox.checked) {
        document.querySelector(`input[name="${otherCheckboxName}"]`).checked = false;
    }else{
        // document.querySelector(`input[name="${otherCheckboxName}"]`).checked = true;
    }
}

function populateaccesscontrolboard(result){
    accessappenduserboard(result);
    console.log('result', result.role)
    document.querySelector('#roleers').tomselect.setValue(result.role);
    document.getElementById('department').value = `${result.department??''}`
    document.getElementById('accesssave').classList.remove('hidden')    
}

async function fetchaccesscontrols(id) {
    // scrollToTop('scrolldiv')
    function getparamm() {
        let paramstr = new FormData();
        paramstr.append('id', id);
        return paramstr;
    }

    // Show loading state using SweetAlert
    const loadingAlert = Swal.fire({
        title: 'Please wait...',
        text: 'Fetching Roles, please wait.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    let request = await httpRequest2(`api/v1/admin/manageroles${id ? `?role=${id}`: ''}`,  null, null, 'json', 'GET');
    Swal.close(); // Close the loading alert once the request is complete

    if (!id) document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> No Records Retrieved </td>`;
    if (request.status) {
        if (!id) {
            if (request.data.length) {
                datasource = request.data;
                const form = document.querySelector('#accesscontrolsform')
                form.querySelector('#roleers').innerHTML = `<option value="">--SELECT ROLE--</option>`
                form.querySelector('#roleers').innerHTML += `<option disabled id="sadmin">SUPERADMIN</option>`
                form.querySelector('#roleers').innerHTML += `<option disabled>CUSTOM</option>`
                form.querySelector('#roleers').innerHTML += request.data.map(data=>`<option>${data.role}</option>`)
                resolvePagination(datasource, onaccesscontrolTableDataSignal);
            }
        } else {
            // document.getElementsByClassName('updater')[0].click();
            branchid = request.data[0].id;
            // populateData(request.data[0], [], [], 'roleform');
        // Show a SweetAlert modal with the role and description fields
        Swal.fire({
            title: `${request.data[0].role}`,
            html: `
                        <div class="form-group hidden">
                            <label for="role" class="control-label">Role</label>
                            <input type="text" id="rolemodal" class="form-control" value="${request.data[0].role}" readonly>
                        </div>
                        <div class="form-group">
                            <label for="description" class="control-label">Description</label>
                            <textarea id="descriptionmodal" class="form-control" >${request.data[0].description}</textarea>
                        </div>
                        <div id="permissions-container" class="table-content bg-white p-4 flex flex-wrap justify-center">
                            <!-- Permission buttons will be added here -->
                        </div>
            `,
            showCancelButton: true,
            showCloseButton: true,
            confirmButtonText: 'Send',
            cancelButtonText: 'Cancel',
            focusConfirm: false,
            customClass: {
                popup: 'swal-wide',
                confirmButton: 'swal-confirm-button',
                cancelButton: 'swal-cancel-button'
            },
            didOpen: () => {
                accessappendboard(request.data[0]);
            },
            preConfirm: () => {
                let role = document.getElementById('rolemodal').value;
                let description = document.getElementById('descriptionmodal').value;
                let accessstring = '';
                for(let i=0;i<document.getElementsByClassName('accesscontroller').length;i++){
                    if(document.getElementsByClassName('accesscontroller')[i].checked)accessstring += `${document.getElementsByClassName('accesscontroller')[i].name}|` 
                }
                submitrolesettings(role, description, accessstring);
            }
        });

        // Add custom CSS for the buttons
        const style = document.createElement('style');
        style.innerHTML = `
            .swal-wide {
                width: 80% !important;
            }
            .swal-confirm-button {
                background-color: #0972e3 !important;
                color: white !important;
            }
            .swal-cancel-button {
                background-color: #FF5242 !important;
                color: white !important;
            }
        `;
        document.head.appendChild(style);
        }
    } else {
        return notification('No records retrieved');
    }
}

async function removeaccesscontrol(id) {
    // Ask for confirmation
    const confirmed = window.confirm("Are you sure you want to remove this accesscontrol?");

    // If not confirmed, do nothing
    if (!confirmed) {
        return;
    }

    function getparamm() {
        let paramstr = new FormData();
        paramstr.append('id', id);
        return paramstr;
    }

    let request = await httpRequest2('../controllers/removevisacountries', id ? getparamm() : null, null, 'json');
    
    // Show notification based on the result
    fetchaccesscontrols()
    return notification(request.message);
    
}


async function onaccesscontrolTableDataSignal() {
    let rows = getSignaledDatasource().map((item, index) => `
    <tr>
        <td>${index + 1 }</td>
        <td>${item.role}</td>
        <td>
            ${item.permissions ? item.permissions.split('|').map(permission => `<span class="inline-block bg-blue-100 text-blue-800 text-xxs font-semibold mr-2 px-2 py-0.5 rounded">${permission}</span>`).join(' ') : ''}
        </td>
        <td>${item.description}</td>
        <td class="flex items-center gap-3">
        <button title="Set permission" onclick="fetchaccesscontrols('${item.role}')" class="material-symbols-outlined rounded-full bg-orange-600 h-8 w-8 text-white drop-shadow-md text-xs" style="font-size: 18px;">key</button>
        <button title="Edit row entry" onclick="fetchaccesscontrols('${item.role}')" class="hidden material-symbols-outlined rounded-full bg-primary-g h-8 w-8 text-white drop-shadow-md text-xs" style="font-size: 18px;">edit</button>
        </td>
    </tr>`
    )
    .join('')
    injectPaginatatedTable(rows)
}

async function accesscontrolFormSubmitHandler() {
    if(!validateForm('accesscontrolsform', [`email`])) return

    for(let i=0;i<document.getElementsByClassName('others').length;i++){
        if(!document.getElementsByClassName('others')[i].classList.contains('hidden'))document.getElementsByClassName('others')[i].classList.add('hidden')
        document.getElementsByClassName('thesubmit')[0].classList.remove('hidden')
}

    if(!document.getElementById('email').value)return notification('Please select a user', 0)
    
    let request = await httpRequest2(`api/v1/members/userregistration?email=${document.getElementById('email').value}`, null, document.querySelector('#accesscontrolsform #submit'), 'json', 'GET')
    if(request.status) {
        populateaccesscontrolboard(request.data[0])
        for(let i=0;i<document.getElementsByClassName('others').length;i++){
            if(document.getElementsByClassName('others')[i].classList.contains('hidden'))document.getElementsByClassName('others')[i].classList.remove('hidden')
                document.getElementsByClassName('thesubmit')[0].classList.add('hidden')
        }
        return
    }
    document.querySelector('#accesscontrolsform').reset();
    // fetchaccesscontrols();
    return notification(request.message, 0);
}

// async function accesscontrolFormSubmitHandler() {
    // if(!validateForm('accesscontrolsform', [`productname`, `productdescription`])) return
    
    // let payload

    // payload = getFormData2(document.querySelector('#accesscontrolsform'), accesscontrolid ? [['id', accesscontrolid]] : null)
    // let request = await httpRequest2('../controllers/fetchuserprofile', payload, document.querySelector('#accesscontrolsform #submit'))
    // if(request.status) {
    //     notification('Success!', 1);
    //     document.querySelector('#accesscontrolsform').reset();
    //     fetchaccesscontrols();
    //     return
    // }
    // document.querySelector('#accesscontrolform').reset();
    // fetchaccesscontrols();
    // return notification(request.message, 0);
// }


// function runAdaccesscontrolFormValidations() {
//     let form = document.getElementById('accesscontrolsform')
//     let errorElements = form.querySelectorAll('.control-error')
//     let controls = []

//     if(controlHasValue(form, '#owner'))  controls.push([form.querySelector('#owner'), 'Select an owner'])
//     if(controlHasValue(form, '#accesscontrolname'))  controls.push([form.querySelector('#accesscontrolname'), 'accesscontrol name is required'])
//     if(controlHasValue(form, '#statusme'))  controls.push([form.querySelector('#itemname'), 'item name is required'])
//     if(controlHasValue(form, '#urlge'))  controls.push([form.querySelector('#image'), 'image is required'])
//     if(controlHasValue(form, '#urlition'))  controls.push([form.querySelector('#position'), 'position is required'])
//     if(controlHasValue(form, '#url'))  controls.push([form.querySelector('#url'), 'url is required'])
//     parentidurl
//     return mapValidationErrors(errorElements, controls)   

// }