let queryid
async function queryActive() {
    queryid = ''
    const form = document.querySelector('#queryform')
    // const form2 = document.querySelector('#viewqueryform')
    if(form.querySelector('#submit')) form.querySelector('#submit').addEventListener('click', queryFormSubmitHandler)
    // if(form2.querySelector('#querySubmit')) form2.querySelector('#querySubmit').addEventListener('click', queryFormSubmitHandler)
    datasource = []
    await fetchquery()
   
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

async function fetchquery(id) {

    // Show loading state using SweetAlert
    const loadingAlert = Swal.fire({
        title: 'Please wait...',
        text: 'Fetching query data, please wait.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    // let form = document.querySelector('#viewqueryform');
    // let formData = new FormData(form);
    // // formData.set('department', '');
    // // formData.set('query', '');
    // let queryParams = new URLSearchParams(formData).toString();

    if(!id)document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> Loading... </td>`

    // let request = await httpRequest2(`api/v1/personnel/query?${queryParams ? `${queryParams}` : ''}${id ? `&id=${id}` : ''}`, null, document.querySelector('#viewrequisitionform #submit'), 'json', 'GET');
    let request = await httpRequest2(`api/v1/personnel/query`, null, document.querySelector('#viewrequisitionform #submit'), 'json', 'GET');
    swal.close(); // Close the loading alert once the request is complete
    if(!id)document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> No Records Retrieved </td>`
    if(request.status) {
        if(!id){
            if(request.data.length) {
                datasource = request.data
                resolvePagination(datasource, onqueryTableDataSignal);
            }
        } else {
            document.getElementsByClassName('updater')[0].click();
            queryid = id;
            queryitem = request.data.find((item) => item.id == id)
            populateData(queryitem);
            if (queryitem && queryitem.imageone) {
                document.getElementById('imageOnePreview').src = queryitem.imageone;
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

async function removequery(id) {
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

            let request = await httpRequest2('api/v1/personnel/query', id ? getparamm() : null, null, 'json', "DELETE");
            return request;
        },
        allowOutsideClick: () => !Swal.isLoading()
    });

    // Show notification based on the result
    if (confirmed.isConfirmed) {
        fetchquery();
        return notification(confirmed.value.message);
    }
}


async function onqueryTableDataSignal() {
    let rows = getSignaledDatasource().map((item, index) => `
    <tr>
        <td>${index + 1}</td>
        <td>${item.personnelname}</td>
        <td>${item.query}</td>
        <td>
            ${item.imageone ? `<img src="${item.imageone}" alt="Image One" class="h-32 w-32">` : 'No Image Available'}
        </td>
       <td>
         <div class="flex items-center gap-3 ">
            <button title="Edit row entry" onclick="fetchquery('${item.id}')" class="material-symbols-outlined h-8 w-8 rounded-full bg-primary-g text-xs text-white drop-shadow-md" style="font-size: 18px;">edit</button>
            <button title="Delete row entry" onclick="removequery('${item.id}')" class="material-symbols-outlined h-8 w-8 rounded-full bg-red-600 text-xs text-white drop-shadow-md" style="font-size: 18px;">delete</button>
        </div>
       </td>
    </tr>`
    )
    .join('')
    injectPaginatatedTable(rows)
}

async function queryFormSubmitHandler() {
    if(!validateForm('queryform', getIdFromCls('comp'))) return notification('Please fill all required fields', 0)
    
    let payload = getFormData2(document.querySelector('#queryform'), queryid ? [['id', queryid]] : null);

    const confirmed = await Swal.fire({
        title: queryid ? 'Updating...' : 'Submitting...',
        text: 'Please wait while we submit your data.',
        icon: 'info',
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: async () => {
            Swal.showLoading();
            let request = await httpRequest2('api/v1/personnel/query', payload, document.querySelector('#queryform #submit'), 'json', 'POST');
            Swal.close();

            if (request.status) {
                notification('Success!', 1);
                const form = document.querySelector('#queryform');
                form.reset();
                if(queryid)form.querySelectorAll('input, select, textarea').forEach(input => input.value = '');
                queryid = '';
                document.getElementsByClassName('viewer')[0].click();
                fetchquery();
            } else {    
                notification(request.message, 0);
            }
        }
    });
}
