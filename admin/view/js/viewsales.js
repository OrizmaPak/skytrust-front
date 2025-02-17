let viewsalesid
async function viewsalesActive() {
    viewsalesid = ''
    const form = document.querySelector('#viewsalesform')
    const form2 = document.querySelector('#viewviewsalesform')
    if(form.querySelector('#submit')) form.querySelector('#submit').addEventListener('click', viewsalesFormSubmitHandler)
    if(form2.querySelector('#querySubmit')) form2.querySelector('#querySubmit').addEventListener('click', viewsalesFormSubmitHandler)
    datasource = []
    await fetchviewsales()
    // await getAllviewsales(true)
    new TomSelect('#viewsales', {
        // plugins: ['remove_button', 'dropdown_input'],
        onInitialize: function() {
            console.log(checkpermission('FILTER viewsales'))
            if(!checkpermission('FILTER viewsales')) this.setValue(the_user.viewsales);
            if(!checkpermission('FILTER viewsales')) this.setTextboxValue('readonly', true);
        }
    });
    // await getAllUsers('useridlist', 'id')
}

async function fetchviewsales(id) {

    // Show loading state using SweetAlert
    const loadingAlert = Swal.fire({
        title: 'Please wait...',
        text: 'Fetching viewsales data, please wait.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    let form = document.querySelector('#viewviewsalesform');
    let formData = new FormData(form);
    // formData.set('department', '');
    // formData.set('viewsales', '');
    let queryParams = new URLSearchParams(formData).toString();

    if(!id)document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> Loading... </td>`

    let request = await httpRequest2(`api/v1/inventory/requisition/view?${queryParams ? `${queryParams}` : ''}${id ? `&id=${id}` : ''}`, null, document.querySelector('#viewrequisitionform #submit'), 'json', 'GET');
    swal.close(); // Close the loading alert once the request is complete
    if(!id)document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> No Records Retrieved </td>`
    if(request.status) {
        if(!id){
            if(request.data.length) {
                datasource = request.data
                resolvePagination(datasource, onviewsalesTableDataSignal);
            }
        } else {
            document.getElementsByClassName('updater')[0].click();
            viewsalesid = request.data[0].id;
            populateData(request.data[0]);
        }
    } else {
        return notification('No records retrieved');
    }
}

async function removeviewsales(id) {
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
        fetchviewsales();
        return notification(confirmed.value.message);
    }
}


async function onviewsalesTableDataSignal() {
    let rows = getSignaledDatasource().map((item, index) => `
    <tr>
        <td>${index + 1}</td>
        <td>${item.viewsales}</td>
        <td>${item.useridname??item.userid}</td>
        <td>${item.country}</td>
        <td>${item.state}</td>
        <td>${item.lga}</td>
        <td>${item.address}</td>
        <td class="flex items-center gap-3 ${item.viewsales == default_viewsales ? 'hidden' : ''}">
            <button title="Edit row entry" onclick="fetchviewsales('${item.id}')" class="material-symbols-outlined rounded-full bg-primary-g h-8 w-8 text-white drop-shadow-md text-xs" style="font-size: 18px;">edit</button>
            <button title="Delete row entry" onclick="removeviewsales('${item.id}')" class="hidden material-symbols-outlined rounded-full bg-red-600 h-8 w-8 text-white drop-shadow-md text-xs" style="font-size: 18px;">delete</button>
        </td>
    </tr>`
    )
    .join('')
    injectPaginatatedTable(rows)
}

async function viewsalesFormSubmitHandler() {
    if(!validateForm('viewsalesform', getIdFromCls('comp'))) return notification('Please fill all required fields', 0)
    
    let payload = getFormData2(document.querySelector('#viewsalesform'), viewsalesid ? [['id', viewsalesid]] : null);

    const confirmed = await Swal.fire({
        title: viewsalesid ? 'Updating...' : 'Submitting...',
        text: 'Please wait while we submit your data.',
        icon: 'info',
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: async () => {
            Swal.showLoading();
            let request = await httpRequest2('api/v1/admin/viewsales', payload, document.querySelector('#viewsalesform #submit'), 'json', 'POST');
            Swal.close();

            if (request.status) {
                notification('Success!', 1);
                const form = document.querySelector('#viewsalesform');
                form.reset();
                if(viewsalesid)form.querySelectorAll('input, select, textarea').forEach(input => input.value = '');
                viewsalesid = '';
                document.getElementsByClassName('viewer')[0].click();
                fetchviewsales();
            } else {    
                notification(request.message, 0);
            }
        }
    });
}
