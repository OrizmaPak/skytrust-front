let issuetypeid
async function issuetypeActive() {
    issuetypeid = ''
    const form = document.querySelector('#issuetypeform')
    if(form.querySelector('#submit')) form.querySelector('#submit').addEventListener('click', issuetypeFormSubmitHandler)
    datasource = []
    await fetchissuetype()
    // await getAllissuetype(true)
    // new TomSelect('#issuetype', {
    //     // plugins: ['remove_button'],
    //     onInitialize: function() {
    //         console.log(checkpermission('FILTER issuetype'))
    //         if(!checkpermission('FILTER issuetype')) this.setValue(the_user.issuetype);
            if(!checkpermission('FILTER issuetype')) this.setTextboxValue('readonly', true);
    //     }
    // });
    // await getAllUsers('useridlist', 'id')
}

async function fetchissuetype(id) {
    // scrollToTop('scrolldiv')
    function getparamm() {
        let paramstr = new FormData();
        paramstr.append('id', id);
        return paramstr;
    }

    // Show loading state using SweetAlert
    const loadingAlert = Swal.fire({
        title: 'Please wait...',
        text: 'Fetching issuetype data, please wait.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    let request = await httpRequest2(`api/v1/inventory/issues/type${id ? `?id=${id}`: ''}`,  null, null, 'json', 'GET');
    Swal.close(); // Close the loading alert once the request is complete

    if (!id) document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> No Records Retrieved </td>`;
    if (request.status) {
        if (!id) {
            if (request.data.length) {
                datasource = request.data;
                resolvePagination(datasource, onissuetypeTableDataSignal);
            }
        } else {
            // document.getElementsByClassName('updater')[0].click();
            issuetypeid = request.data[0].id;
            populateData(request.data[0]);
        }
    } else {
        return notification('No records retrieved');
    }
}

async function removeissuetype(id) {
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
                paramstr.append('status', 'DELETED');
                return paramstr;
            }

            let request = await httpRequest2('api/v1/inventory/issues/type', id ? getparamm() : null, null, 'json', 'POST');
            if(request.status)return notification(request.message, 1);
            else return notification('Failed to delete issue type', 0);
        },
        allowOutsideClick: () => !Swal.isLoading()
    });

    // Show notification based on the result
    if (confirmed.isConfirmed) {
        fetchissuetype();
        return notification(confirmed.value.message);
    }
}


async function onissuetypeTableDataSignal() {
    let rows = getSignaledDatasource().map((item, index) => `
    <tr>
        <td>${index + 1}</td>
        <td>${item.issuetype}</td>
        <td class="flex items-center gap-3">
            <button title="Edit row entry" onclick="fetchissuetype('${item.id}')" class="material-symbols-outlined rounded-full bg-primary-g h-8 w-8 text-white drop-shadow-md text-xs" style="font-size: 18px;">edit</button>
            <button title="Delete row entry" onclick="removeissuetype('${item.id}')" class="material-symbols-outlined rounded-full bg-red-600 h-8 w-8 text-white drop-shadow-md text-xs" style="font-size: 18px;">delete</button>
        </td>
    </tr>`
    )
    .join('')
    injectPaginatatedTable(rows)
}

async function issuetypeFormSubmitHandler() {
    if(!validateForm('issuetypeform', getIdFromCls('comp'))) return
    
    let payload = getFormData2(document.querySelector('#issuetypeform'), issuetypeid ? [['id', issuetypeid]] : null);

    const confirmed = await Swal.fire({
        title: issuetypeid ? 'Updating...' : 'Submitting...',
        text: 'Please wait while we submit your data.',
        icon: 'info',
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: async () => {
            Swal.showLoading();
            let request = await httpRequest2('api/v1/inventory/issues/type', payload, document.querySelector('#issuetypeform #submit'), 'json', 'POST');
            Swal.close();

            if (request.status) {
                notification('Success!', 1);
                const form = document.querySelector('#issuetypeform');
                form.reset();
                if(issuetypeid)form.querySelectorAll('input, select, textarea').forEach(input => input.value = '');
                issuetypeid = '';
                // document.getElementsByClassName('viewer')[0].click();
                fetchissuetype();
            } else {    
                notification(request.message, 0);
            }
        }
    });
}
