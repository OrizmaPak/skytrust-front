let promotiondemotionid
async function promotiondemotionActive() {
    promotiondemotionid = ''
    const form = document.querySelector('#promotiondemotionform')
    // const form2 = document.querySelector('#viewpromotiondemotionform')
    if(form.querySelector('#submit')) form.querySelector('#submit').addEventListener('click', promotiondemotionFormSubmitHandler)
    // if(form2.querySelector('#querySubmit')) form2.querySelector('#querySubmit').addEventListener('click', promotiondemotionFormSubmitHandler)
    datasource = []
    await fetchpromotiondemotion()
   
    await getAllUsers('userid', 'name'),

    new TomSelect('#userid', {
        plugins: ['dropdown_input'],
        onInitialize: function () {
            if (!checkpermission('FILTER ALL USERS')) this.setValue(the_user.id);
            if (!checkpermission('FILTER ALL USERS')) this.setTextboxValue('readonly', true);
        }
    });
}

async function fetchpromotiondemotion(id) {

    // Show loading state using SweetAlert
    const loadingAlert = Swal.fire({
        title: 'Please wait...',
        text: 'Fetching promotiondemotion data, please wait.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    // let form = document.querySelector('#viewpromotiondemotionform');
    // let formData = new FormData(form);
    // // formData.set('department', '');
    // // formData.set('promotiondemotion', '');
    // let queryParams = new URLSearchParams(formData).toString();

    if(!id)document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> Loading... </td>`

    // let request = await httpRequest2(`api/v1/personnel/promotiondemotion?${queryParams ? `${queryParams}` : ''}${id ? `&id=${id}` : ''}`, null, document.querySelector('#viewrequisitionform #submit'), 'json', 'GET');
    let request = await httpRequest2(`api/v1/personnel/promotiondemotion`, null, document.querySelector('#viewrequisitionform #submit'), 'json', 'GET');
    swal.close(); // Close the loading alert once the request is complete
    if(!id)document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> No Records Retrieved </td>`
    if(request.status) {
        if(!id){
            if(request.data.length) {
                datasource = request.data
                resolvePagination(datasource, onpromotiondemotionTableDataSignal);
            }
        } else {
            document.getElementsByClassName('updater')[0].click();
            promotiondemotionid = id;
            const promotiondemotionItem = request.data.find((item) => item.id == id)
            populateData(promotiondemotionItem);
            if (promotiondemotionItem && promotiondemotionItem.image) {
                document.getElementById('imageFrame').src = promotiondemotionItem.image;
            }
        }
    } else {
        return notification('No records retrieved');
    }
}

async function onpromotiondemotionTableDataSignal() {
    let rows = getSignaledDatasource().map((item, index) => `
    <tr>
        <td>${index + 1}</td>
        <td>${item.personnelname}</td>
        <td>${item.title}</td>
        <td>${item.image ? `<img src="${item.image}" alt="Image" style="width: 100px; height: 100px;" />` : 'No Image'}</td>
        <td>${item.type}</td>
        <td>${formatDate(item.dateadded.split("T")[0])}</td>
        <td class="flex items-center gap-3">
            <button title="Edit row entry" onclick="fetchpromotiondemotion('${item.id}')" class="material-symbols-outlined h-8 w-8 rounded-full bg-primary-g text-xs text-white drop-shadow-md" style="font-size: 18px;">edit</button>
        </td>
    </tr>`
    )
    .join('')
    injectPaginatatedTable(rows)
}

async function promotiondemotionFormSubmitHandler() {
    if(!validateForm('promotiondemotionform', getIdFromCls('comp'))) return notification('Please fill all required fields', 0)
    
    let payload = getFormData2(document.querySelector('#promotiondemotionform'), promotiondemotionid ? [['id', promotiondemotionid]] : null);

    const confirmed = await Swal.fire({
        title: promotiondemotionid ? 'Updating...' : 'Submitting...',
        text: 'Please wait while we submit your data.',
        icon: 'info',
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: async () => {
            Swal.showLoading();
            let request = await httpRequest2('api/v1/personnel/promotiondemotion', payload, document.querySelector('#promotiondemotionform #submit'), 'json', 'POST');
            Swal.close();

            if (request.status) {
                notification('Success!', 1);
                const form = document.querySelector('#promotiondemotionform');
                form.reset();
                if(promotiondemotionid)form.querySelectorAll('input, select, textarea').forEach(input => input.value = '');
                promotiondemotionid = '';
                document.getElementsByClassName('viewer')[0].click();
                fetchpromotiondemotion();
            } else {    
                notification(request.message, 0);
            }
        }
    });
}
