let updateinventoryid
// let initialinventoryload
async function updateinventoryActive() {
    thedepartment = '';
    thebranch = '';
    initialinventoryload = ''
    const form = document.querySelector('#updateinventoryform')
    // const form2 = document.querySelector('#updateinventories')
    if(form.querySelector('#submit')) form.querySelector('#submit').addEventListener('click', e=>fetchupdateinventorys())
    if(document.querySelector('#updateinventories')) document.querySelector('#updateinventories').addEventListener('click', e=>updateinventoryFormEditHandler())
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
    if(document.querySelector('#save')) document.querySelector('#save').addEventListener('click', e=>updateinventoryFormEditHandler())
        if(document.querySelector('#selectall')) document.querySelector('#selectall').addEventListener('click', e=>{
            for(let i=0;i<document.getElementsByName('itemer').length;i++){
                document.getElementsByName('itemer')[i].checked = true
            }
        })
        if(document.querySelector('#deselectall')) document.querySelector('#deselectall').addEventListener('click', e=>{
            for(let i=0;i<document.getElementsByName('itemer').length;i++){
                document.getElementsByName('itemer')[i].checked = false
            }
        })
        if(document.querySelector('#delete')) document.querySelector('#delete').addEventListener('click', e=>{
            let j = false
            for(let i=0;i<document.getElementsByName('itemer').length;i++){
                if(document.getElementsByName('itemer')[i].checked == true)j=true
            }
            if(!j)return notification('Please select atleast an item to delete', 0)
                updateinventoryFormDeleteHandler()
        })
    // new TomSelect('#itemidsearch', {
    //     plugins: ['dropdown_input']
    // })
    // await fetchupdateinventorys()
}

async function fetchupdateinventorys(id) {
    thedepartment = '';
    thebranch = '';
    if(!validateForm('updateinventoryform', getIdFromCls('comp'))) return

    
    let form = document.querySelector('#updateinventoryform');
    let formData = new FormData(form);
    let queryParams = new URLSearchParams(formData).toString();

    document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> Loading... </td>`

    let request = await httpRequest2(`api/v1/inventory/getinventory?${queryParams ? `${queryParams}` : ''}${id ? `&id=${id}` : ''}`, null, document.querySelector('#updateinventoryform #submit'), 'json', 'GET');
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
                document.getElementById('tabledata').innerHTML = request.data.map((item, index) => `
                <tr>
                    <td>${index + 1 }</td>
                    <td><input type="checkbox" name="itemer" id="${item.itemid}"></td>
                    <td>${item.itemname}</td>
                    <td><input type="number" name="price" value="${item.price??''}" placeholder="Enter price" class="form-control"></td>
                    <td><input type="number" name="pricetwo" value="${item.pricetwo??''}" placeholder="Enter second price" class="form-control"></td>
                    <td><input type="number" name="minbalance" value="${item.minimumbalance??''}" placeholder="Enter minimum balance" class="form-control"></td>
                    <td>${item.qty}</td>
                </tr>`
                )
                .join('')
                thedepartment = document.getElementById('departmentsearch').value;
                thebranch = document.getElementById('branchsearch').value;
                // resolvePagination(datasource, onupdateinventoryTableDataSignal)
            }
        }else{
             updateinventoryid = request.data[0].id
            populateData(request.data[0])
        }
    }
    else return notification('No records retrieved')
}

async function removeupdateinventory(id) {
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
    fetchupdateinventorys()
    return notification(request.message);
    
}


async function onupdateinventoryTableDataSignal() {
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


async function updateinventoryFormEditHandler(id='') {
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
    // updateinventoryFormSubmitHandler();
    if (request.status) {
        updateinventoryActive();
        return notification(request.message, 1);
    } else {
        return notification('No records retrieved');
    }
}


async function updateinventoryFormDeleteHandler(id='') {
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
    // updateinventoryFormSubmitHandler();
    if (request.status) {
        updateinventoryActive();
        return notification(request.message, 1);
    } else {
        return notification('No records retrieved');
    }
}


// function runAdupdateinventoryFormValidations() {
//     let form = document.getElementById('updateinventoryform')
//     let errorElements = form.querySelectorAll('.control-error')
//     let controls = []

//     if(controlHasValue(form, '#owner'))  controls.push([form.querySelector('#owner'), 'Select an owner'])
//     if(controlHasValue(form, '#updateinventoryname'))  controls.push([form.querySelector('#updateinventoryname'), 'updateinventory name is required'])
//     if(controlHasValue(form, '#statusme'))  controls.push([form.querySelector('#itemname'), 'item name is required'])
//     if(controlHasValue(form, '#urlge'))  controls.push([form.querySelector('#image'), 'image is required'])
//     if(controlHasValue(form, '#urlition'))  controls.push([form.querySelector('#position'), 'position is required'])
//     if(controlHasValue(form, '#url'))  controls.push([form.querySelector('#url'), 'url is required'])
//     parentidurl
//     return mapValidationErrors(errorElements, controls)   

// }