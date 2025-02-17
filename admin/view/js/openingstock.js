let openingstockid
// let initialinventoryload
let thedepartment
let thebranch
async function openingstockActive() {
    thedepartment = '';
    thebranch = '';
    initialinventoryload = ''
    const form = document.querySelector('#openingstockform')
    // const form2 = document.querySelector('#updateinventories')
    if(form.querySelector('#submit')) form.querySelector('#submit').addEventListener('click', e=>fetchopeningstocks())
    if(document.querySelector('#updateinventories')) document.querySelector('#updateinventories').addEventListener('click', e=>openingstockFormEditHandler())
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
    // new TomSelect('#itemidsearch', {
    //     plugins: ['dropdown_input']
    // })
    // await fetchopeningstocks()
}

async function fetchopeningstocks(id) {
    thedepartment = '';
    thebranch = '';
    if(!validateForm('openingstockform', getIdFromCls('comp'))) return

    
    let form = document.querySelector('#openingstockform');
    let formData = new FormData(form);
    let queryParams = new URLSearchParams(formData).toString();

    document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> Loading... </td>`

    let request = await httpRequest2(`api/v1/inventory/getinventory?${queryParams ? `${queryParams}` : ''}${id ? `&id=${id}` : ''}`, null, document.querySelector('#openingstockform #submit'), 'json', 'GET');
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
                    <td>${item.itemname}</td>
                    <td><input type="number" name="beginbalance" id="${item.itemid}" class="form-control comp" placeholder="Enter begin balance" onchange="if(this.value < 0) { this.value = ''; notification('You cannot open stock on deduction. If you wish to do so, contact support for permission', 0); }"></td>
                </tr>`
                )
                .join('');
                thedepartment = document.getElementById('departmentsearch').value;
                thebranch = document.getElementById('branchsearch').value;

                // resolvePagination(datasource, onopeningstockTableDataSignal)
            }
        }else{
             openingstockid = request.data[0].id
            populateData(request.data[0])
        }
    }
    else return notification('No records retrieved')
}

async function removeopeningstock(id) {
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
    fetchopeningstocks()
    return notification(request.message);
    
}


async function onopeningstockTableDataSignal() {
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

async function openingstockFormSubmitHandler(itemid=document.getElementById('itemid').value, itemdata=null) {
    did('imagePreview').innerHTML = '';
    did('imagePreviewtwo').innerHTML = '';
    did('imagePreviewthree').innerHTML = '';
    did('imageone').value = '';
    did('imagetwo').value = ''; 
    did('imagethree').value = '';

    // Show SweetAlert loading
    if(itemid)Swal.fire({
        title: 'Loading',
        text: 'Please wait while we retrieve the inventory data...',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    if(itemid){
        did('modalform').classList.remove('hidden');
    }
    
    let request

    if(!itemdata)request = await httpRequest2(`api/v1/inventory/getinventory?itemid=${itemid}`, null, document.querySelector('#openingstockform #submit'), 'json', 'GET');
    else request = {data:[JSON.parse(itemdata.replaceAll('~~~', '"'))], status: true};
    console.log(request)
    Swal.close();
    
    if(!itemid) {
        document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> No Records Retrieved </td>`;
    }
    
    if(request.status) {
        if(!itemid){
            // if(request.data.length) {
            //     datasource = request.data
            //     resolvePagination(datasource, onopeningstockTableDataSignal)
            //     did('modalform').classList.add('hidden')
            //     return notification(request.message, 1);
            // }
        } else {
            openingstockid = itemid;
            await getinventorydepartment(false);
            await populateData(request.data[0], ['imageone', 'imagetwo', 'imagethree'], [], 'createinventoryform', true);
            // let container = document.querySelector('#departmt');
            // request.data[0].department.split('||').map(data => {
            //     container.querySelector(`${data.id}`)[0].checked = true;
            // });
        }

    } else {
        notification('No records retrieved');
    }

    // Close SweetAlert loading
}


async function openingstockFormEditHandler(id='') {
    // Show SweetAlert processing
    Swal.fire({
        title: 'Processing',
        text: 'Please wait while we add to the stock...',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    const payload = new FormData();
    let itemids = '';
    let beginbalances = '';
    for(let i=0;i<document.getElementsByName('beginbalance').length;i++){
        if(document.getElementsByName('beginbalance')[i].value){
            itemids = itemids+'||'+document.getElementsByName('beginbalance')[i].id;
            beginbalances = beginbalances+'||'+document.getElementsByName('beginbalance')[i].value;
        }
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
    beginbalances = beginbalances.slice(2);
    if (beginbalances.includes('||')) {
        beginbalances = beginbalances.split('||');
    } else if (beginbalances) {
        beginbalances = [beginbalances];
    } else {
        beginbalances = [];
    }
    payload.append('rowsize', itemids.length);

    for (let i = 0; i < itemids.length; i++) {
        payload.append(`itemid${i+1}`, itemids[i]);
        payload.append(`beginbalance${i+1}`, beginbalances[i]);
        payload.append(`branch${i+1}`, thebranch);
        payload.append(`department${i+1}`, thedepartment);
    }
    
    let request = await httpRequest2('api/v1/inventory/updatemultiple', payload, document.querySelector('#openingstockeditform #submit'), 'json', 'POST');
    
    Swal.close(); // Close SweetAlert processing

    if (!id) document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> No Records Retrieved </td>`;
    // openingstockFormSubmitHandler();
    if (request.status) {
        openingstockActive();
        return notification(request.message, 1);
    } else {
        return notification('No records retrieved');
    }
}


// function runAdopeningstockFormValidations() {
//     let form = document.getElementById('openingstockform')
//     let errorElements = form.querySelectorAll('.control-error')
//     let controls = []

//     if(controlHasValue(form, '#owner'))  controls.push([form.querySelector('#owner'), 'Select an owner'])
//     if(controlHasValue(form, '#openingstockname'))  controls.push([form.querySelector('#openingstockname'), 'openingstock name is required'])
//     if(controlHasValue(form, '#statusme'))  controls.push([form.querySelector('#itemname'), 'item name is required'])
//     if(controlHasValue(form, '#urlge'))  controls.push([form.querySelector('#image'), 'image is required'])
//     if(controlHasValue(form, '#urlition'))  controls.push([form.querySelector('#position'), 'position is required'])
//     if(controlHasValue(form, '#url'))  controls.push([form.querySelector('#url'), 'url is required'])
//     parentidurl
//     return mapValidationErrors(errorElements, controls)   

// }