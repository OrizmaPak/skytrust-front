let approveinrequisitionid
// let initialinventoryload
async function approveinrequisitionActive() {
    thedepartment = '';
    thebranch = '';
    initialinventoryload = ''
    const form = document.querySelector('#approveinrequisitionform')
    // const form2 = document.querySelector('#updateinventories')
    if(form.querySelector('#submit')) form.querySelector('#submit').addEventListener('click', e=>fetchapproveinrequisitions())
    // if(document.querySelector('#updateinventories')) document.querySelector('#updateinventories').addEventListener('click', e=>approveinrequisitionFormEditHandler())
    // form.querySelector('#submit').click()
    datasource = []
    let x= 
    await getAllbranch(!checkpermission('FILTER BRANCH'), 'branchsearch')
    await new TomSelect('#branchsearch', {
        plugins: ['dropdown_input'],
        onInitialize: function() {
            console.log(checkpermission('FILTER BRANCH'))
            if(!checkpermission('FILTER BRANCH')) this.setValue(the_user.branch);
            if(!checkpermission('FILTER BRANCH')) this.setTextboxValue('readonly', true);
            handleBranchChange(this.getValue());
        },
        onChange: function() {
            handleBranchChange(this.getValue());
        }
    });

    if(document.getElementById('requisitionapprovebtn')){    
        document.getElementById('requisitionapprovebtn').addEventListener('click', function(e) {
            e.preventDefault();
            let checkboxes = document.getElementsByClassName('allapprovebox');
            let isChecked = false;
            for (let i = 0; i < checkboxes.length; i++) {
                if (checkboxes[i].checked) {
                    isChecked = true;
                    break;
                }
            }
            if (!isChecked) {
                return notification('No items selected for approval.', 0);
            }
            approvedeclineinrequisition('ACTIVE');
        });
    }
    if(document.getElementById('requisitiondeclinebtn')){    
        document.getElementById('requisitiondeclinebtn').addEventListener('click', function(e) {
            e.preventDefault();
            let checkboxes = document.getElementsByClassName('allapprovebox');
            let isChecked = false;
            for (let i = 0; i < checkboxes.length; i++) {
                if (checkboxes[i].checked) {
                    isChecked = true;
                    break;
                }
            }
            if (!isChecked) {
                return notification('No items selected for decline.', 0);
            }
            approvedeclineinrequisition('DECLINED');
        });
    }
    
}

async function fetchapproveinrequisitions(id) {
    thedepartment = '';
    thebranch = '';
    if(!validateForm('approveinrequisitionform', getIdFromCls('comp'))) return

    
    let form = document.querySelector('#approveinrequisitionform');
    let formData = new FormData(form);
    let queryParams = new URLSearchParams(formData).toString();

    document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> Loading... </td>`

    let request = await httpRequest2(`api/v1/inventory/requisition/viewto?${queryParams ? `${queryParams}` : ''}${id ? `&id=${id}` : ''}`, null, document.querySelector('#approveinrequisitionform #submit'), 'json', 'GET');
    if(!id)document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> No Records Retrieved </td>`
    if(request.status) {
        if(!id){
            if(request.data.length) {
                datasource = request.data
                if(!initialinventoryload){
                    initialinventoryload = datasource; 
                    // document.getElementById('itemidsearch').innerHTML = `<option value="">-- SEARCH ITEM --</option>`                   
                    // document.getElementById('itemidsearch').innerHTML += initialinventoryload.map(data=>`<option value="${data.itemid}">${data.itemname}</option>`).join('')
                }
                document.getElementById('tabledata').innerHTML = request.data.map(data=>data.items.filter(dat=>dat.status == 'PENDING REQUISITION').map((item, index) => `
                <tr>
                    <td style="width:10px">${index + 1}</td>
                    <td><input type="checkbox" name="${data.reference}" class="allapprovebox" id="${item.itemid}" /></td>
                    <td>${formatNumber(item.qty, 0, 0)}</td>
                    <td>${item.itemname}</td>
                    <td>${data.branchfromname}</td>
                    <td>${data.departmentfromname}</td>
                    <td>${data.branchtoname}</td>
                    <td>${data.departmenttoname}</td>
                    <td>${formatCurrency(item.cost)}</td>
                    <td>${data.reference}</td>
                    <td>${formatTime(data.transactiondate.split('T')[1].split('+')[0])}</td>
                    <td>${formatDate(data.transactiondate.split('T')[0])}</td>
                </tr>`
                )
                .join('')).join('')
                thedepartment = document.getElementById('departmentsearch').value;
                thebranch = document.getElementById('branchsearch').value;
                // resolvePagination(datasource, onapproveinrequisitionTableDataSignal)
            }
        }else{
             approveinrequisitionid = request.data[0].id
            populateData(request.data[0])
        }
    }
    else return notification('No records retrieved')
}

async function approvedeclineinrequisition(status) {
    let checkboxes = document.getElementsByClassName('allapprovebox');
    let payload = new FormData();
    let hasChecked = false;
    let rowSize = 0;

    for (let i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].checked) {
            hasChecked = true;
            rowSize++;
            payload.append(`itemid${rowSize}`, checkboxes[i].id);
            payload.append(`reference${rowSize}`, checkboxes[i].name);
            payload.append(`status${rowSize}`, status);
        }
    }

    if (!hasChecked) {
        return notification('No items selected for approval.', 0);
    }

    payload.append('rowsize', rowSize);

    const confirmed = await Swal.fire({
        title: 'Are you sure?',
        text: "Do you want to proceed with the selected items?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: 'blue',
        cancelButtonColor: 'red',
        confirmButtonText: 'Yes, proceed!',
        cancelButtonText: 'No, cancel!',
    });

    if (confirmed.isConfirmed) {
        let request = await httpRequest2('api/v1/inventory/requisition/inapprovedecline', payload, did('requisitionapprovebtn'), 'json', 'POST');
        if (request.status) {
            notification(`Items ${status === 'ACTIVE' ? 'approved' : 'declined'} successfully.`, 1);
            fetchapproveinrequisitions();
        } else {
            notification('Failed to approve items.', 0);
        }
    }
}

function approvechecker(state) {
    if(state == "CHECK"){
        for(let i=0;i<document.getElementsByClassName('allapprovebox').length;i++){
            document.getElementsByClassName('allapprovebox')[i].checked = true
            document.getElementsByClassName('allapprovebox')[i].setAttribute('checked', true)
        }
    }else{
        for(let i=0;i<document.getElementsByClassName('allapprovebox').length;i++){
            document.getElementsByClassName('allapprovebox')[i].checked = false
            document.getElementsByClassName('allapprovebox')[i].setAttribute('checked', false)
        }
    }
}

async function removeapproveinrequisition(id) {
    // Ask for confirmation
    const confirmed = window.confirm("Are you sure you want to remove this item?");

    // If not confirmed, do nothing
    if (!confirmed) {
        return;
    }

    function getparamm() {
        let paramstr = new FormData();
        paramstr.append('itemid', id);
        return paramstr;
    }

    let request = await httpRequest2('../controllers/removeitem', id ? getparamm() : null, null, 'json');
    
    // Show notification based on the result
    fetchapproveinrequisitions()
    return notification(request.message);
    
}


async function onapproveinrequisitionTableDataSignal() {
    let rows = getSignaledDatasource().map((item, index) => `
    <tr>
        <td>${item.index + 1 }</td>
        <td>${item.itemname}</td>
        <td><input type="number" name="beginbalance" id="${item.itemid}" class="form-control comp" placeholder="Enter begin balance" onchange="if(this.value < 0) { this.value = ''; notification('You cannot open stock on deduction. If you wish to do so, contact support for permission', 0); }"></td>
    </tr>`
    )
    .join('')
    injectPaginatatedTable(rows)
}


async function approveinrequisitionFormEditHandler(id='') {
    // Show SweetAlert processing
    Swal.fire({
        title: 'Processing',
        text: 'Please wait while we update the stock(s)...',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    const payload = new FormData();
    let itemids = '';
    let prices = '';
    let pricetwos = '';
    let minbalances = '';
    for(let i=0;i<document.getElementsByName('itemer').length;i++){
        // if(document.getElementsByName('beginbalance')[i].value){
            itemids = itemids+'||'+document.getElementsByName('itemer')[i].id;
            prices = prices+'||'+document.getElementsByName('price')[i].value;
            pricetwos = pricetwos+'||'+document.getElementsByName('pricetwo')[i].value;
            minbalances = minbalances+'||'+document.getElementsByName('minbalance')[i].value;
        // }
    }
    itemids = itemids.slice(2);
    if (itemids.includes('||')) {
        itemids = itemids.split('||');
    } else if (itemids) {
        itemids = [itemids];
    } else {
        itemids = [];
    }
    if (itemids.length === 0) {
        Swal.fire({
            title: 'No Input',
            text: 'No item to update.',
            icon: 'warning',
            confirmButtonText: 'OK'
        });
        return;
    }
    prices = prices.slice(2);
    if (prices.includes('||')) {
        prices = prices.split('||');
    } else if (prices) {
        prices = [prices];
    } else {
        prices = [];
    }

    pricetwos = pricetwos.slice(2);
    if (pricetwos.includes('||')) {
        pricetwos = pricetwos.split('||');
    } else if (pricetwos) {
        pricetwos = [pricetwos];
    } else {
        pricetwos = [];
    }

    minbalances = minbalances.slice(2);
    if (minbalances.includes('||')) {
        minbalances = minbalances.split('||');
    } else if (minbalances) {
        minbalances = [minbalances];
    } else {
        minbalances = [];
    }   
    
    payload.append('rowsize', itemids.length);

    for (let i = 0; i < itemids.length; i++) {
        payload.append(`itemid${i+1}`, itemids[i]);
        payload.append(`price${i+1}`, prices[i]);
        payload.append(`pricetwo${i+1}`, pricetwos[i]);
        payload.append(`minimumbalance${i+1}`, minbalances[i]);
        payload.append(`branch${i+1}`, thebranch);
        payload.append(`department${i+1}`, thedepartment);
    }
    
    let request = await httpRequest2('api/v1/inventory/updatemultiple', payload, document.querySelector('#save'), 'json', 'POST');
    
    Swal.close(); // Close SweetAlert processing

    if (!id) document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> No Records Retrieved </td>`;
    // approveinrequisitionFormSubmitHandler();
    if (request.status) {
        approveinrequisitionActive();
        return notification(request.message, 1);
    } else {
        return notification('No records retrieved');
    }
}


async function approveinrequisitionFormDeleteHandler(id='') {
    // Show SweetAlert processing
    Swal.fire({
        title: 'Processing',
        text: 'Please wait while we update the stock(s)...',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    const payload = new FormData();
    let itemids = '';
    for(let i=0;i<document.getElementsByName('itemer').length;i++){
        if(document.getElementsByName('itemer')[i].checked){
            itemids = itemids+'||'+document.getElementsByName('itemer')[i].id;
        }
    }
    itemids = itemids.slice(2);
    payload.append(`itemid`, itemids);
    payload.append(`branch`, thebranch);
    payload.append(`department`, thedepartment);
    
    let request = await httpRequest2('api/v1/inventory/delete', payload, document.querySelector('#save'), 'json', 'POST');
    
    Swal.close(); // Close SweetAlert processing

    if (!id) document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> No Records Retrieved </td>`;
    // approveinrequisitionFormSubmitHandler();
    if (request.status) {
        approveinrequisitionActive();
        return notification(request.message, 1);
    } else {
        return notification('No records retrieved');
    }
}


// function runAdapproveinrequisitionFormValidations() {
//     let form = document.getElementById('approveinrequisitionform')
//     let errorElements = form.querySelectorAll('.control-error')
//     let controls = []

//     if(controlHasValue(form, '#owner'))  controls.push([form.querySelector('#owner'), 'Select an owner'])
//     if(controlHasValue(form, '#approveinrequisitionname'))  controls.push([form.querySelector('#approveinrequisitionname'), 'approveinrequisition name is required'])
//     if(controlHasValue(form, '#statusme'))  controls.push([form.querySelector('#itemname'), 'item name is required'])
//     if(controlHasValue(form, '#urlge'))  controls.push([form.querySelector('#image'), 'image is required'])
//     if(controlHasValue(form, '#urlition'))  controls.push([form.querySelector('#position'), 'position is required'])
//     if(controlHasValue(form, '#url'))  controls.push([form.querySelector('#url'), 'url is required'])
//     parentidurl
//     return mapValidationErrors(errorElements, controls)   

// }