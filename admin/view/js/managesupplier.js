let managesupplierid
async function managesupplierActive() {
    managesupplierid = ''
    const form = document.querySelector('#managesupplierform')
    const form2 = document.querySelector('#viewmanagesupplierform')
    if(form.querySelector('#submit')) form.querySelector('#submit').addEventListener('click', managesupplierFormSubmitHandler)
    if(form2.querySelector('#querySubmit')) form2.querySelector('#querySubmit').addEventListener('click', e=>fetchmanagesupplier())
    datasource = []
    new TomSelect('#nationality', {
        plugins: ['dropdown_input']
    })
    await fetchmanagesupplier()
    // await getAllmanagesupplier(true)
    // new TomSelect('#managesupplier', {
    //     // plugins: ['remove_button'],
    //     onInitialize: function() {
    //         console.log(checkpermission('FILTER managesupplier'))
    //         if(!checkpermission('FILTER managesupplier')) this.setValue(the_user.managesupplier);
            // if(!checkpermission('FILTER managesupplier')) this.setTextboxValue('readonly', true);
    //     }
    // });
    // await getAllUsers('useridlist', 'id')
}

async function fetchmanagesupplier(id) {

    // Show loading state using SweetAlert
    const loadingAlert = Swal.fire({
        title: 'Please wait...',
        text: 'Fetching managesupplier data, please wait.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    let form = document.querySelector('#viewmanagesupplierform');
    let formData = new FormData(form);
    // formData.set('department', '');
    // formData.set('managesupplier', '');
    let queryParams = new URLSearchParams(formData).toString();

    if(!id)document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> Loading... </td>`

    let request = await httpRequest2(`api/v1/purchases/supplier?${queryParams ? `${queryParams}` : ''}${id ? `&id=${id}` : ''}`, null, document.querySelector('#viewrequisitionform #submit'), 'json', 'GET');
    swal.close(); // Close the loading alert once the request is complete
    if(!id)document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> No Records Retrieved </td>`
    if(request.status) {
        if(!id){
            if(request.data.length) {
                datasource = request.data
                resolvePagination(datasource, onmanagesupplierTableDataSignal);
            }
        } else {
            document.getElementsByClassName('updater')[0].click();
            managesupplierid = request.data[0].id;
            populateData(request.data[0]);
        }
    } else {
        return notification('No records retrieved');
    }
}

async function removemanagesupplier(id) {
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
        fetchmanagesupplier();
        return notification(confirmed.value.message);
    }
}


async function onmanagesupplierTableDataSignal() {
    let rows = getSignaledDatasource().map((item, index) => `
    <tr>
        <td>${index + 1}</td>
        <td>${item.supplier}</td>
        <td>${item.contactperson}</td>
        <td>${item.nationality}</td>
        <td>${item.currency ?? 'NGN'}</td>
        <td class="flex items-center gap-3 ">
            <button title="View Supplier" onclick="viewmanagesupplier('${item.id}')" class="material-symbols-outlined rounded-full bg-green-600 h-8 w-8 text-white drop-shadow-md text-xs" style="font-size: 18px;">visibility</button>
            <button title="Edit row entry" onclick="fetchmanagesupplier('${item.id}')" class="material-symbols-outlined rounded-full bg-primary-g h-8 w-8 text-white drop-shadow-md text-xs" style="font-size: 18px;">edit</button>
            <button title="Delete row entry" onclick="removemanagesupplier('${item.id}')" class="hidden material-symbols-outlined rounded-full bg-red-600 h-8 w-8 text-white drop-shadow-md text-xs" style="font-size: 18px;">delete</button>
        </td>
    </tr>`
    )
    .join('')
    injectPaginatatedTable(rows)
}


function viewmanagesupplier(id) {
    // Find the supplier data by id
    const thedata = datasource.find(item => item.id == id);
    
    if (!thedata) {
        Swal.fire({
            icon: 'error',
            title: 'Supplier Not Found',
            text: `No supplier found with ID ${id}.`,
        });
        return;
    }

    // Format the date to a readable format
    const formattedDate = new Date(thedata.dateadded).toLocaleString();

    // Create HTML content for the modal with table formatting
    const content = `
        <div class="text-left">
            <table class="min-w-full divide-y divide-gray-200">
                <tbody>
                    <tr>
                        <td class="px-4 py-2 font-semibold">Supplier</td>
                        <td class="px-4 py-2">${thedata.supplier}</td>
                    </tr>
                    <tr>
                        <td class="px-4 py-2 font-semibold">Contact Person</td>
                        <td class="px-4 py-2">${thedata.contactperson}</td>
                    </tr>
                    <tr>
                        <td class="px-4 py-2 font-semibold">Contact Phone</td>
                        <td class="px-4 py-2">${thedata.contactpersonphone}</td>
                    </tr>
                    <tr>
                        <td class="px-4 py-2 font-semibold">Office Address</td>
                        <td class="px-4 py-2">${thedata.officeaddress}</td>
                    </tr>
                    <tr>
                        <td class="px-4 py-2 font-semibold">Nationality</td>
                        <td class="px-4 py-2">${thedata.nationality}</td>
                    </tr>
                    <tr>
                        <td class="px-4 py-2 font-semibold">State</td>
                        <td class="px-4 py-2">${thedata.state}</td>
                    </tr>
                    <tr>
                        <td class="px-4 py-2 font-semibold">Currency</td>
                        <td class="px-4 py-2">${thedata.currency}</td>
                    </tr>
                    <tr>
                        <td class="px-4 py-2 font-semibold">Status</td>
                        <td class="px-4 py-2">${thedata.status}</td>
                    </tr>
                    <tr>
                        <td class="px-4 py-2 font-semibold">Date Added</td>
                        <td class="px-4 py-2">${formattedDate}</td>
                    </tr>
                    <tr>
                        <td class="px-4 py-2 font-semibold">Created By</td>
                        <td class="px-4 py-2">User ID ${thedata.createdby}</td>
                    </tr>
                </tbody>
            </table>
            
            <h3 class="mt-6 mb-2 font-semibold">Bank Details</h3>
            <table class="min-w-full divide-y divide-gray-200">
                <tbody>
                    <tr>
                        <td class="px-4 py-2 font-semibold">Bank 1</td>
                        <td class="px-4 py-2">${thedata.bank1}</td>
                    </tr>
                    <tr>
                        <td class="px-4 py-2 font-semibold">Account Number 1</td>
                        <td class="px-4 py-2">${thedata.accountnumber1}</td>
                    </tr>
                    <tr>
                        <td class="px-4 py-2 font-semibold">Bank 2</td>
                        <td class="px-4 py-2">${thedata.bank2}</td>
                    </tr>
                    <tr>
                        <td class="px-4 py-2 font-semibold">Account Number 2</td>
                        <td class="px-4 py-2">${thedata.accountnumber2}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;

    // Display the modal using SweetAlert2
    Swal.fire({
        title: 'Supplier Details',
        html: content,
        width: '600px',
        showCloseButton: true,
        focusConfirm: false,
        showCancelButton: true,
        cancelButtonText: 'Cancel',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Edit',
        confirmButtonColor: '#0000FF',
        customClass: {
            popup: 'swal2-popup-custom'
        }
    }).then((result) => {
        if (result.isConfirmed) {
            fetchmanagesupplier(id);
        }
    });
}


async function managesupplierFormSubmitHandler() {
    if(!validateForm('managesupplierform', getIdFromCls('comp'))) return
    
    let payload = getFormData2(document.querySelector('#managesupplierform'), managesupplierid ? [['id', managesupplierid]] : null);

    const confirmed = await Swal.fire({
        title: managesupplierid ? 'Updating...' : 'Submitting...',
        text: 'Please wait while we submit your data.',
        icon: 'info',
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: async () => {
            Swal.showLoading();
            let request = await httpRequest2('api/v1/purchases/supplier', payload, document.querySelector('#managesupplierform #submit'), 'json', 'POST');
            Swal.close();

            if (request.status) {
                notification('Success!', 1);
                const form = document.querySelector('#managesupplierform');
                form.reset();
                if(managesupplierid)form.querySelectorAll('input, select, textarea').forEach(input => input.value = '');
                managesupplierid = '';
                document.getElementsByClassName('viewer')[0].click();
                fetchmanagesupplier();
            } else {    
                notification(request.message, 0);
            }
        }
    });
}
