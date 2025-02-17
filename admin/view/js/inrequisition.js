let inrequisitionid
let theinrequisitionitems
// let initialinventoryload
async function inrequisitionActive() {
    document.getElementById('transactiondate').value = new Date().toISOString().split('T')[0];
    theinrequisitionitems = '';
    thedepartment = '';
    thebranch = '';
    initialinventoryload = ''
    // const form = document.querySelector('#inrequisitionform')
    // const form2 = document.querySelector('#updateinventories')
    // if(document.querySelector('#reqsubmit')) document.querySelector('#reqsubmit').addEventListener('click', e=>fetchinrequisitions())
    if(document.querySelector('#reqsubmit')) document.querySelector('#reqsubmit').addEventListener('click', e=>inrequisitionFormEditHandler())
    // form.querySelector('#submit').click()
    datasource = []
    let x= 
    await getAllbranch(false, 'branchfrom');
    await getAllbranch(!checkpermission('FILTER BRANCH'), 'branchto');
    await new TomSelect('#branchfrom', {
        plugins: ['dropdown_input'],
        onInitialize: function() {
            // if(!checkpermission('FILTER BRANCH')) this.setValue(the_user.branch);
            // if(!checkpermission('FILTER BRANCH')) this.setTextboxValue('readonly', true);
            handleBranchChange(this.getValue(), 'departmentfrom');
        },
        onChange: function() {
            handleBranchChange(this.getValue(), 'departmentfrom');
            inchecksourcedetails()
        }
    });
    await new TomSelect('#branchto', {
        plugins: ['dropdown_input'],
        onInitialize: function() {
            if(!checkpermission('FILTER BRANCH')) this.setValue(the_user.branch);
            if(!checkpermission('FILTER BRANCH')) this.setTextboxValue('readonly', true);
            handleBranchChange(this.getValue(), 'departmentto');
        },
        onChange: function() {
            handleBranchChange(this.getValue(), 'departmentto');
        }
    });
    if(document.getElementById('departmentfrom')) document.getElementById('departmentfrom').addEventListener('change', e=>inchecksourcedetails())
    // if(document.querySelector('#save')) document.querySelector('#save').addEventListener('click', e=>inrequisitionFormEditHandler())
       
    // new TomSelect('#itemidsearch', {
    //     plugins: ['dropdown_input']
    // })
    // await fetchinrequisitions()

    // if(localStorage.getItem('editrequistion')){
    //     // alert()
    //     let editdata =  localStorage.getItem('editrequistion')
    //     let data = JSON.parse(editdata.replaceAll("|||",'"'));
    //     document.getElementById('branchfrom').value = data.branchfrom;
    //     document.querySelector('#branchfrom').tomselect.setValue(data.branchfrom);
    //     document.querySelector('#branchfrom').tomselect.disable();

    //     document.getElementById('departmentfrom').value = data.departmentfrom;
    //     document.querySelector('#departmentfrom').tomselect.setValue(data.departmentfrom);
    //     document.querySelector('#departmentfrom').tomselect.disable();

    //     document.getElementById('branchto').value = data.branchto;
    //     document.querySelector('#branchto').tomselect.setValue(data.branchto);
    //     document.querySelector('#branchto').tomselect.disable();

    //     document.getElementById('departmentto').value = data.departmentto;
    //     document.querySelector('#departmentto').tomselect.setValue(data.departmentto);
    //     document.querySelector('#departmentto').tomselect.disable();
        

    // }

}

function inchecksourcedetails(){
    theinrequisitionitems = ''
    document.getElementById('tabledata').innerHTML = `<tr><td colspan="100%" class="text-center opacity-70">Checking if source branch and department is set...</td></tr>`;
    if(document.getElementById('branchfrom').value && document.getElementById('departmentfrom').value){
        document.getElementById('tabledata').innerHTML = `<tr><td colspan="100%" class="text-center opacity-70">Loading requisitable items...</td></tr>`;
        fetchinrequisitions()
    }else{
        document.getElementById('tabledata').innerHTML = `<tr><td colspan="100%" class="text-center opacity-70">Awaiting for source branch and department to be set...</td></tr>`;
    }
}


async function fetchinrequisitions() {
    thedepartment = '';
    thebranch = '';
    // if(!validateForm('inrequisitionform', getIdFromCls('comp'))) return

    theinrequisitionitems = '';

    
    let formData = new FormData();
    formData.append('branch', document.getElementById('branchfrom').value);
    formData.append('department', document.getElementById('departmentfrom').value);
    let queryParams = new URLSearchParams(formData).toString();

    // document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> Loading... </td>`

    let request = await httpRequest2(`api/v1/inventory/getinventory?${queryParams ? `${queryParams}` : ''}`, null, null, 'json', 'GET');
    if(request.status) {
            if(request.data.length) {
                // datasource = request.data;
                theinrequisitionitems = request.data;

                document.getElementById('tabledata').innerHTML = `
                <tr id="readyholder">
                    <td colspan="100%" class="text-center opacity-70"> Ready to requisit items... </td>
                </tr>`
                
                thedepartment = document.getElementById('departmentfrom').value;
                thebranch = document.getElementById('branchfrom').value;
                // resolvePagination(datasource, oninrequisitionTableDataSignal)
            }
        }
    else return notification('No records retrieved')
}

async function removeinrequisition(id) {
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
    fetchinrequisitions()
    return notification(request.message);
    
}

function reqaddrowinrequisition(){
    if (!theinrequisitionitems.length) return notification('inrequisition Source is incomplete. Wait for the table to indicate readiness.', 0);
    let el = document.createElement('tr');
    el.classList.add('temprow');
    let elid;

    if (theinrequisitionitems.length) {
        elid = genID();
        el.id = `reqrow_${elid}`;
        let x = `
            <td class="text-center opacity-70 w-[200px]"> 
                <label class="hidden">Item</label>
                <select onchange="ingetitemdetails(this)" name="supplyfrom" id="supplyfrom_${elid}" class="form-controls comp w-[220px]">
                    <option value=''>-- Select item --</option>
                    ${theinrequisitionitems.map(data => `<option value='${data.itemid}'>${data.itemname}</option>`).join('')}
                </select>
            </td>
            <td>
                <p class="!w-[125px]">Type: <span id="type_${elid}"></span></p>
                <p>Group: <span id="group_${elid}"></span></p>
                <p>Stock Balance: <span id="stock_${elid}"></span></p>
            </td>
            <td>
                <label class="hidden">Cost</label>
                <input onchange="inrequisitioncal2(this)" type="number" id="cost_${elid}" name="cost" class="comma form-control comp w-[95px]" readonly placeholder="Cost">
            </td>
            <td>
                <label class="hidden">Price</label>
                <input onchange="inrequisitioncal2(this)" type="number" id="price_${elid}" name="price" class="comma form-control comp w-[95px]" placeholder="Enter Price">
            </td>
            <td>
                <label class="hidden">Quantity</label>
                <input onchange="inrequisitioncal2(this)" type="number" id="qty_${elid}" name="qty" class="comma form-control comp w-[70px]" placeholder="Qty">
            </td>
            <td>
                <label class="hidden">Value</label>
                <input readonly type="text" id="val_${elid}" name="value[]" class="comma form-control comp w-[130px]" placeholder="">
            </td>
            <td>
                <div class="flex gap-4 items-center h-full w-fit py-3">
                    <button onclick="reqaddrowinrequisition()" title="Add row" class="hidden material-symbols-outlined rounded-full bg-primary-g h-8 w-8 text-white drop-shadow-md text-xs" style="font-size: 18px;">add</button>
                    <button onclick="this.closest('tr').remove()" title="Delete row" class="material-symbols-outlined rounded-full bg-[red] h-8 w-8 text-white drop-shadow-md text-xs" style="font-size: 18px;">delete</button>
                </div>
            </td>`;
        
        el.innerHTML = x;
        
        if (did('readyholder')) {
            did('readyholder').remove();
        }
        
        did('tabledata').appendChild(el);
        
        // Initialize TomSelect
        const tomSelectInstance = new TomSelect(`#supplyfrom_${elid}`, {
            plugins: ['dropdown_input'],
            onInitialize: function() {
                // ingetitemdetails(this);
            },
            onChange: function() {
                // ingetitemdetails(this);
            }
        });
        
        
        // Move dropdown to body
        const dropdown = tomSelectInstance.dropdown;
        if (dropdown && dropdown.parentNode !== document.body) {
            document.body.appendChild(dropdown);
        }

        // Update dropdown position on scroll and resize
        const updateDropdownPosition = () => {
            const control = tomSelectInstance.control;
            const rect = control.getBoundingClientRect();
            const dropdownHeight = dropdown.offsetHeight;
            const dropdownWidth = rect.width;
            const windowHeight = window.innerHeight;
            const windowWidth = window.innerWidth;

            dropdown.style.top = `${(windowHeight - dropdownHeight) / 2}px`;
            dropdown.style.left = `${(windowWidth - dropdownWidth) / 2}px`;
            dropdown.style.width = `${dropdownWidth}px`;
        };

        // Initial positioning
        updateDropdownPosition();

        // Update on events
        window.addEventListener('scroll', updateDropdownPosition);
        window.addEventListener('resize', updateDropdownPosition);
    }
}

function inrequisitioncal2(element){
    dynamiccomma(false)
    let el = element.id.split('_')[1]
    if(!did(`supplyfrom_${el}`).value){
        notification(`No Item Selected`, 0)
        did(`val_${el}`).value = '';
        did(`cost_${el}`).value = '';
        did(`qty_${el}`).value = '';
        did(`price_${el}`).value = '';
        return dynamiccomma(true)
    }
    if(Number(did(`stock_${el}`).textContent)<Number(did(`qty_${el}`).value)){
        notification(`Quantity cannot exceed the stock balance`, 0)
        did(`qty_${el}`).value = did(`stock_${el}`).textContent
        // return
    }
    if(did(`price_${el}`).value && did(`qty_${el}`).value){
        did(`val_${el}`).value = Number(did(`price_${el}`).value) * Number(did(`qty_${el}`).value)
    }else{
        did(`val_${el}`).value = '';
    }
    
    inrequisitiontotalcount()
    
}

function inrequisitiontotalcount(){
    let totalcost = 0
    
    for(let i=0;i<document.getElementsByName('qty').length;i++){
        let qty = Number(document.getElementsByName('qty')[i].value);
        let price = Number(document.getElementsByName('price')[i].value);
        if(qty && price) {
            totalcost += qty * price;
        }
    }
    console.log('totalcost:', totalcost)
    document.getElementById('rptotalorder').textContent = formatCurrency(totalcost)
    dynamiccomma(true)
}



async function ingetitemdetails(el){
    console.log('ingetitemdetails', el, el.value, el.id)  
    if(!el.value)return notification('Please select an item to view details', 0)
    const existingInputs = document.getElementsByName('supplyfrom');
    let duplicateCount = 0;
    for (let i = 0; i < existingInputs.length; i++) {
        const input = existingInputs[i];
        console.log(input.value, el.value);
        if (input.value == el.value) {
            duplicateCount++;
            if (duplicateCount >= 2) {
                el.value = '';
                el.tomselect.setValue('');
                return notification('This item is already selected in another row', 0);
            }
        }
    }
    let id = el.id.split('_')[1]
    let req = theinrequisitionitems.filter(data=>data.itemid == el.value)[0]
    console.log('saved item', req)
    did('type_'+id).innerHTML = req.itemclass??''
    did('group_'+id).innerHTML = req.group??''
    did('stock_'+id).innerHTML = formatNumber(req.qty??0, 1, 0)
    did('cost_'+id).value = Number(req.cost)
    did('price_'+id).value = Number(req.price)

    dynamiccomma(true)
     
    let formData = new FormData();
    formData.append('branch', document.getElementById('branchfrom').value);
    formData.append('department', document.getElementById('departmentfrom').value);
    let queryParams = new URLSearchParams(formData).toString();

    // document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> Loading... </td>`

    let request = await httpRequest2(`api/v1/inventory/getinventory?${queryParams ? `${queryParams}` : ''}`, null, null, 'json', 'GET');
    if(request.status) {
            if(request.data.length) {
                // datasource = request.data;
                theinrequisitionitems = request.data;
                let req2 = theinrequisitionitems.filter(data=>data.itemid == el.value)[0]
                console.log('saved item2', req2)
                did('type_'+id).innerHTML = req2.itemclass??''
                did('group_'+id).innerHTML = req2.group??''
                did('stock_'+id).innerHTML = formatNumber(req2.qty??0, 1, 0)
                did('cost_'+id).value = Number(req2.cost)
                did('price_'+id).value = Number(req2.price)
                dynamiccomma(true)
                
                // resolvePagination(datasource, oninrequisitionTableDataSignal)
            }
        }
    else return notification('No records retrieved')
}


async function oninrequisitionTableDataSignal() {
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


async function inrequisitionFormEditHandler(id='') {
    dynamiccomma(false)
    if(!validateForm('inrequisitionform', getIdFromCls('comp'))) return
    // Show SweetAlert processing
    Swal.fire({
        title: 'Processing',
        text: 'Please wait while we help you move the stock(s)...',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });



    const payload = new FormData();
    payload.append('rowsize', document.getElementsByName('supplyfrom').length);
    payload.append('branchfrom', document.getElementById('branchfrom').value);
    payload.append('departmentfrom', document.getElementById('departmentfrom').value);
    payload.append('branchto', document.getElementById('branchto').value);
    payload.append('departmentto', document.getElementById('departmentto').value);
    payload.append('transactiondate', document.getElementById('transactiondate').value);
    payload.append('description', document.getElementById('description').value);
    payload.append('reference', document.getElementById('reference').value);
    for (let i = 0; i < document.getElementsByName('supplyfrom').length; i++) {
        if(document.getElementsByName('qty')[i].value < 1){
            Swal.close()
            return notification('Please check the quantity. It cannot be less than 1.', 0)}
        payload.append(`itemid${i+1}`, document.getElementsByName('supplyfrom')[i].value);
        payload.append(`qty${i+1}`, document.getElementsByName('qty')[i].value);
        payload.append(`price${i+1}`, document.getElementsByName('price')[i].value);
    }
    
    let request = await httpRequest2('api/v1/inventory/inrequisition', payload, document.querySelector('#save'), 'json', 'POST');
    dynamiccomma(true)
    Swal.close(); // Close SweetAlert processing

    // inrequisitionFormSubmitHandler();
    if (request.status) {
        inrequisitionActive();
        document.getElementById('inrequisition').click()
        return notification(request.message, 1);
    } else {
        return notification('Failed to perform the required inrequisition', 0);
    }
}


async function inrequisitionFormDeleteHandler(id='') {
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
    // inrequisitionFormSubmitHandler();
    if (request.status) {
        inrequisitionActive();
        return notification(request.message, 1);
    } else {
        return notification('No records retrieved');
    }
}


// function runAdinrequisitionFormValidations() {
//     let form = document.getElementById('inrequisitionform')
//     let errorElements = form.querySelectorAll('.control-error')
//     let controls = []

//     if(controlHasValue(form, '#owner'))  controls.push([form.querySelector('#owner'), 'Select an owner'])
//     if(controlHasValue(form, '#inrequisitionname'))  controls.push([form.querySelector('#inrequisitionname'), 'inrequisition name is required'])
//     if(controlHasValue(form, '#statusme'))  controls.push([form.querySelector('#itemname'), 'item name is required'])
//     if(controlHasValue(form, '#urlge'))  controls.push([form.querySelector('#image'), 'image is required'])
//     if(controlHasValue(form, '#urlition'))  controls.push([form.querySelector('#position'), 'position is required'])
//     if(controlHasValue(form, '#url'))  controls.push([form.querySelector('#url'), 'url is required'])
//     parentidurl
//     return mapValidationErrors(errorElements, controls)   

// }