let rejecttransactiondateid
async function rejecttransactiondateActive() {
    rejecttransactiondateid = ''
    const form = document.querySelector('#rejecttransactiondateform')
    if(form.querySelector('#submit')) form.querySelector('#submit').addEventListener('click', rejecttransactiondateFormSubmitHandler)
    datasource = []
    await fetchrejecttransactiondate()
    // await getAllbranch(true)
    // new TomSelect('#branch', {
    //     // plugins: ['remove_button'],
    //     onInitialize: function() {
    //         console.log(checkpermission('FILTER BRANCH'))
    //         if(!checkpermission('FILTER BRANCH')) this.setValue(the_user.branch);
            if(!checkpermission('FILTER BRANCH')) this.setTextboxValue('readonly', true);
    //     }
    // });
    // await getAllUsers('useridlist', 'id')
}

async function fetchrejecttransactiondate(id) {
    // scrollToTop('scrolldiv')
    function getparamm() {
        let paramstr = new FormData();
        paramstr.append('id', id);
        return paramstr;
    }

    // Show loading state using SweetAlert
    const loadingAlert = Swal.fire({
        title: 'Please wait...',
        text: 'Fetching rejecttransactiondate data, please wait.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    let request = await httpRequest2(`api/v1/admin/rejecttransactiondate${id ? `?id=${id}`: ''}`,  null, null, 'json', 'GET');
    Swal.close(); // Close the loading alert once the request is complete

    if (!id) document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> No Records Retrieved </td>`;
    if (request.status) {
        if (!id) {
            if (request.data.length) {
                datasource = request.data;
                resolvePagination(datasource, onrejecttransactiondateTableDataSignal);
            }
        } else {
            document.getElementsByClassName('updater')[0].click();
            rejecttransactiondateid = request.data[0].id;
            populateData(request.data[0]);
        }
    } else {
        return notification('No records retrieved');
    }
}

async function removerejecttransactiondate(id) {
    const thedata = datasource.find(item => item.id == id);
    if (!thedata) {
        return notification('Transaction date not found.');
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
                const request = await httpRequest2('api/v1/admin/rejecttransactiondate', paramstr, null, 'json');
                return request;
            },
            allowOutsideClick: () => !Swal.isLoading()
        });

        if (confirmed.isConfirmed) {
            if (confirmed.value && confirmed.value.status) {
                fetchrejecttransactiondate();
                return notification(confirmed.value.message, 1);
            } else {
                return notification(confirmed.value ? confirmed.value.message : 'Failed to delete transaction date', 0);
            }
        }
    } catch (error) {
        return notification('An error occurred while deleting the transaction date.');
    }
}


async function onrejecttransactiondateTableDataSignal() {
    let rows = getSignaledDatasource().map((item, index) => `
    <tr>
        <td>${index + 1}</td>
        <td>${formatDate(item.rejectiondate)}</td>
        <td>${item.reason}</td>
        <td class="flex items-center gap-3">
            <button title="Edit row entry" onclick="fetchrejecttransactiondate('${item.id}')" class="material-symbols-outlined rounded-full bg-primary-g h-8 w-8 text-white drop-shadow-md text-xs" style="font-size: 18px;">edit</button>
            <button title="Delete row entry" onclick="removerejecttransactiondate('${item.id}')" class="material-symbols-outlined rounded-full bg-red-600 h-8 w-8 text-white drop-shadow-md text-xs" style="font-size: 18px;">delete</button>
        </td>
    </tr>`
    )
    .join('')
    injectPaginatatedTable(rows)
}

async function rejecttransactiondateFormSubmitHandler() {
    if(!validateForm('rejecttransactiondateform', getIdFromCls('comp'))) return
    
    let payload = getFormData2(document.querySelector('#rejecttransactiondateform'), rejecttransactiondateid ? [['id', rejecttransactiondateid]] : null);

    const confirmed = await Swal.fire({
        title: rejecttransactiondateid ? 'Updating...' : 'Submitting...',
        text: 'Please wait while we submit your data.',
        icon: 'info',
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: async () => {
            Swal.showLoading();
            let request = await httpRequest2('api/v1/admin/rejecttransactiondate', payload, document.querySelector('#rejecttransactiondateform #submit'), 'json', 'POST');
            Swal.close();

            if (request.status) {
                notification('Success!', 1);
                const form = document.querySelector('#rejecttransactiondateform');
                form.reset();
                if(rejecttransactiondateid)form.querySelectorAll('input, select, textarea').forEach(input => input.value = '');
                rejecttransactiondateid = '';
                document.getElementsByClassName('viewer')[0].click();
                fetchrejecttransactiondate();
            } else {    
                notification(request.message, 0);
            }
        }
    });
}
