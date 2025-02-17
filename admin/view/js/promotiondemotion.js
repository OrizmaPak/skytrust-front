let terminationresignationid
async function terminationresignationActive() {
    terminationresignationid = ''
    const form = document.querySelector('#terminationresignationform')
    // const form2 = document.querySelector('#viewterminationresignationform')
    if(form.querySelector('#submit')) form.querySelector('#submit').addEventListener('click', terminationresignationFormSubmitHandler)
    // if(form2.querySelector('#querySubmit')) form2.querySelector('#querySubmit').addEventListener('click', terminationresignationFormSubmitHandler)
    datasource = []
    await fetchterminationresignation()
   
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

async function fetchterminationresignation(id) {

    // Show loading state using SweetAlert
    const loadingAlert = Swal.fire({
        title: 'Please wait...',
        text: 'Fetching terminationresignation data, please wait.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    // let form = document.querySelector('#viewterminationresignationform');
    // let formData = new FormData(form);
    // // formData.set('department', '');
    // // formData.set('terminationresignation', '');
    // let queryParams = new URLSearchParams(formData).toString();

    if(!id)document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> Loading... </td>`

    // let request = await httpRequest2(`api/v1/personnel/terminationresignation?${queryParams ? `${queryParams}` : ''}${id ? `&id=${id}` : ''}`, null, document.querySelector('#viewrequisitionform #submit'), 'json', 'GET');
    let request = await httpRequest2(`api/v1/personnel/terminationresignation`, null, document.querySelector('#viewrequisitionform #submit'), 'json', 'GET');
    swal.close(); // Close the loading alert once the request is complete
    if(!id)document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> No Records Retrieved </td>`
    if(request.status) {
        if(!id){
            if(request.data.length) {
                datasource = request.data
                resolvePagination(datasource, onterminationresignationTableDataSignal);
            }
        } else {
            document.getElementsByClassName('updater')[0].click();
            terminationresignationid = id;
            populateData(request.data.find((item) => item.id == id));
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

async function onterminationresignationTableDataSignal() {
    let rows = getSignaledDatasource().map((item, index) => `
    <tr>
        <td>${index + 1}</td>
        <td>${item.personnelname}</td>
        <td>${item.title}</td>
        <td>${item.level}</td>
        <td>${item.type}</td>
        <td>${formatDate(item.dateadded.split("T")[0])}</td>
        <td class="flex items-center gap-3">
            <button title="Edit row entry" onclick="fetchterminationresignation('${item.id}')" class="material-symbols-outlined h-8 w-8 rounded-full bg-primary-g text-xs text-white drop-shadow-md" style="font-size: 18px;">edit</button>
        </td>
    </tr>`
    )
    .join('')
    injectPaginatatedTable(rows)
}

async function terminationresignationFormSubmitHandler() {
    if(!validateForm('terminationresignationform', getIdFromCls('comp'))) return notification('Please fill all required fields', 0)
    
    let payload = getFormData2(document.querySelector('#terminationresignationform'), terminationresignationid ? [['id', terminationresignationid]] : null);

    const confirmed = await Swal.fire({
        title: terminationresignationid ? 'Updating...' : 'Submitting...',
        text: 'Please wait while we submit your data.',
        icon: 'info',
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: async () => {
            Swal.showLoading();
            let request = await httpRequest2('api/v1/personnel/terminationresignation', payload, document.querySelector('#terminationresignationform #submit'), 'json', 'POST');
            Swal.close();

            if (request.status) {
                notification('Success!', 1);
                const form = document.querySelector('#terminationresignationform');
                form.reset();
                if(terminationresignationid)form.querySelectorAll('input, select, textarea').forEach(input => input.value = '');
                terminationresignationid = '';
                document.getElementsByClassName('viewer')[0].click();
                fetchterminationresignation();
            } else {    
                notification(request.message, 0);
            }
        }
    });
}
