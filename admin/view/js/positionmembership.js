let positionmembershipid
async function positionmembershipActive() {
    positionmembershipid = ''
    const form = document.querySelector('#positionmembershipform')
    if(form.querySelector('#submit')) form.querySelector('#submit').addEventListener('click', positionmembershipFormSubmitHandler)
    datasource = []
    await fetchpositionmembership()
    await getAllbranch(false)
    await getAllmembership()
    await getAllUsers('userid', 'name')
    new TomSelect('#member', {
        plugins: ['dropdown_input'],
    });
    // await getAllUsers('useridlist', 'id')

    new TomSelect('#branch', {
        plugins: ['dropdown_input'],
        
        onInitialize: function() {
            console.log(checkpermission('FILTER BRANCH'))
            if(!checkpermission('FILTER BRANCH')) this.setValue(the_user.branch);
            if(!checkpermission('FILTER BRANCH')) this.setTextboxValue('readonly', true);
        }
    }); 

    new TomSelect('#userid', {
        plugins: ['dropdown_input'], 
        
        
    });
}

async function fetchpositionmembership(id) {
    // scrollToTop('scrolldiv')
    function getparamm() {
        let paramstr = new FormData();
        paramstr.append('id', id);
        return paramstr;
    }

    // Show loading state using SweetAlert
    const loadingAlert = Swal.fire({
        title: 'Please wait...',
        text: 'Fetching positionmembership data, please wait.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    let request = await httpRequest2(`api/v1/admin/positionbymembership${id ? `?id=${id}`: ''}`,  null, null, 'json', 'GET');
    Swal.close(); // Close the loading alert once the request is complete

    if (!id) document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> No Records Retrieved </td>`;
    if (request.status) {
        if (!id) {
            if (request.data.length) {
                datasource = request.data;
                resolvePagination(datasource, onpositionmembershipTableDataSignal);
            }
        } else {
            document.getElementsByClassName('updater')[0].click();
            positionmembershipid = request.data[0].id;
            populateData(request.data[0]);
        }
    } else {
        return notification('No records retrieved');
    }
}

async function removepositionmembership(id) {
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
        fetchpositionmembership();
        return notification(confirmed.value.message);
    }
}


async function onpositionmembershipTableDataSignal() {
    let rows = getSignaledDatasource().map((item, index) => `
    <tr>
        <td>${index + 1}</td>  
        <td>${item.membername??item.member}</td>
        <td>${item.position}</td>
        <td>${item.branchname??item.branch}</td>
        <td>${item.useridname}</td>
        <td class="flex items-center gap-3">
            <button title="Edit row entry" onclick="fetchpositionmembership('${item.id}')" class="material-symbols-outlined rounded-full bg-primary-g h-8 w-8 text-white drop-shadow-md text-xs" style="font-size: 18px;">edit</button>
            <button title="Delete row entry" onclick="removepositionmembership('${item.id}')" class="hidden material-symbols-outlined rounded-full bg-red-600 h-8 w-8 text-white drop-shadow-md text-xs" style="font-size: 18px;">delete</button>
        </td>
    </tr>`
    )
    .join('')
    injectPaginatatedTable(rows)
}

async function positionmembershipFormSubmitHandler() {
    if(!validateForm('positionmembershipform', getIdFromCls('comp'))) return
    
    let payload = getFormData2(document.querySelector('#positionmembershipform'), positionmembershipid ? [['id', positionmembershipid]] : null);

    const confirmed = await Swal.fire({
        title: positionmembershipid ? 'Updating...' : 'Submitting...',
        text: 'Please wait while we submit your data.',
        icon: 'info',
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: async () => {
            Swal.showLoading();
            let request = await httpRequest2('api/v1/admin/positionbymembership', payload, document.querySelector('#positionmembershipform #submit'), 'json', 'POST');
            Swal.close();

            if (request.status) {
                notification('Success!', 1);
                const form = document.querySelector('#positionmembershipform');
                form.reset();
                if(positionmembershipid)form.querySelectorAll('input, select, textarea').forEach(input => input.value = '');
                positionmembershipid = '';
                document.getElementsByClassName('viewer')[0].click();
                fetchpositionmembership();
            } else {    
                notification(request.message, 0);
            }
        }
    });
}
