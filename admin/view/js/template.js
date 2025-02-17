let branchid
async function branchActive() {
    branchid = ''
    const form = document.querySelector('#branchform')
    const form2 = document.querySelector('#viewbranchform')
    if(form.querySelector('#submit')) form.querySelector('#submit').addEventListener('click', branchFormSubmitHandler)
    if(form2.querySelector('#querySubmit')) form2.querySelector('#querySubmit').addEventListener('click', branchFormSubmitHandler)
    datasource = []
    await fetchbranch()
    // await getAllbranch(true)
    new TomSelect('#branch', {
        // plugins: ['remove_button', 'dropdown_input'],
        onInitialize: function() {
            console.log(checkpermission('FILTER BRANCH'))
            if(!checkpermission('FILTER BRANCH')) this.setValue(the_user.branch);
            if(!checkpermission('FILTER BRANCH')) this.setTextboxValue('readonly', true);
        }
    });
    // await getAllUsers('useridlist', 'id')
}

async function fetchbranch(id) {

    // Show loading state using SweetAlert
    const loadingAlert = Swal.fire({
        title: 'Please wait...',
        text: 'Fetching branch data, please wait.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    let form = document.querySelector('#viewbranchform');
    let formData = new FormData(form);
    // formData.set('department', '');
    // formData.set('branch', '');
    let queryParams = new URLSearchParams(formData).toString();

    if(!id)document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> Loading... </td>`

    let request = await httpRequest2(`api/v1/inventory/requisition/view?${queryParams ? `${queryParams}` : ''}${id ? `&id=${id}` : ''}`, null, document.querySelector('#viewrequisitionform #submit'), 'json', 'GET');
    swal.close(); // Close the loading alert once the request is complete
    if(!id)document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> No Records Retrieved </td>`
    if(request.status) {
        if(!id){
            if(request.data.length) {
                datasource = request.data
                resolvePagination(datasource, onbranchTableDataSignal);
            }
        } else {
            document.getElementsByClassName('updater')[0].click();
            branchid = request.data[0].id;
            populateData(request.data[0]);
        }
    } else {
        return notification('No records retrieved');
    }
}

async function removebranch(id) {
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

            let request = await httpRequest2('../controllers/removevisacountries', id ? getparamm() : null, null, 'json', "DELETE");
            return request;
        },
        allowOutsideClick: () => !Swal.isLoading()
    });

    // Show notification based on the result
    if (confirmed.isConfirmed) {
        fetchbranch();
        return notification(confirmed.value.message);
    }
}


async function onbranchTableDataSignal() {
    let rows = getSignaledDatasource().map((item, index) => `
    <tr>
        <td>${index + 1}</td>
        <td>${item.branch}</td>
        <td>${item.useridname??item.userid}</td>
        <td>${item.country}</td>
        <td>${item.state}</td>
        <td>${item.lga}</td>
        <td>${item.address}</td>
        <td class="flex items-center gap-3 ${item.branch == default_branch ? 'hidden' : ''}">
            <button title="Edit row entry" onclick="fetchbranch('${item.id}')" class="material-symbols-outlined h-8 w-8 rounded-full bg-primary-g text-xs text-white drop-shadow-md" style="font-size: 18px;">edit</button>
            <button title="Delete row entry" onclick="removebranch('${item.id}')" class="material-symbols-outlined hidden h-8 w-8 rounded-full bg-red-600 text-xs text-white drop-shadow-md" style="font-size: 18px;">delete</button>
        </td>
    </tr>`
    )
    .join('')
    injectPaginatatedTable(rows)
}

async function branchFormSubmitHandler() {
    if(!validateForm('branchform', getIdFromCls('comp'))) return notification('Please fill all required fields', 0)
    
    let payload = getFormData2(document.querySelector('#branchform'), branchid ? [['id', branchid]] : null);

    const confirmed = await Swal.fire({
        title: branchid ? 'Updating...' : 'Submitting...',
        text: 'Please wait while we submit your data.',
        icon: 'info',
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: async () => {
            Swal.showLoading();
            let request = await httpRequest2('api/v1/admin/branch', payload, document.querySelector('#branchform #submit'), 'json', 'POST');
            Swal.close();

            if (request.status) {
                notification('Success!', 1);
                const form = document.querySelector('#branchform');
                form.reset();
                if(branchid)form.querySelectorAll('input, select, textarea').forEach(input => input.value = '');
                branchid = '';
                document.getElementsByClassName('viewer')[0].click();
                fetchbranch();
            } else {    
                notification(request.message, 0);
            }
        }
    });
}
