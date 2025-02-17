let rejectedserviceid;

async function rejectedserviceActive() {
    await fetchrejectedservice()
    rejectedserviceid = ''
    did('serviceformrs').classList.add('hidden');
    const form = document.querySelector('#managerejectedservice')
    if(form.querySelector('#submit')) form.querySelector('#submit').addEventListener('click', function(event) {
        event.preventDefault();
        rejectedserviceFormSubmitHandler();
    });
    did('reference').addEventListener('keyup', e=>{
        if(did('reference').value)did('pullitemsbtn').innerHTML = 'Pull Purchase Order'
        else did('pullitemsbtn').innerHTML = 'New Received Service';
        did('serviceformrs').classList.add('hidden');
    })
    if(did('pullitemsbtn'))did('pullitemsbtn').addEventListener('click', e=>{
        if(did('reference').value){
            fetchserviceorderdetail(did('reference').value)
            did('serviceformrs').classList.remove('hidden')
        }else{
            notification('This option should be utilized exclusively for receiving services that do not have an associated service order.', 2, 20000)
        };
    })
    // datasource = [];
    dynamiccomma(true);
    await getAllSuppliers('supplier');
    await getAllbranch(true, 'branch');
    new TomSelect('#supplier', {
        plugins: ['dropdown_input']
    });
    new TomSelect('#branch', {
        plugins: ['dropdown_input'],
        onInitialize: function() {
            console.log(checkpermission('FILTER BRANCH'))
            if(!checkpermission('FILTER BRANCH')) this.setValue(the_user.branch);
            if(!checkpermission('FILTER BRANCH')) this.setTextboxValue('readonly', true);
            handleBranchChange(this.getValue(), 'departmentfrom');
        },
        onChange: function() {
            handleBranchChange(this.getValue(), 'departmentfrom');
        }
    });
}

async function fetchrejectedservice(id) {

    // Show loading state using SweetAlert
    const loadingAlert = Swal.fire({
        title: 'Please wait...',
        text: 'Fetching rejectedservices data, please wait.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    if(!id)document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> Loading... </td>`

    let request = await httpRequest2(`api/v1/purchases/rejectedservicereceived`, null, document.querySelector('#viewrequisitionform #submit'), 'json', 'GET');
    swal.close(); // Close the loading alert once the request is complete
    if(!id)document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> No Records Retrieved </td>`
    if(request.status) {
        if(!id){
            if(request.data.length) {
                datasource = request.data;
                console.log('datasource10', datasource)
                resolvePagination(datasource, onrejectedserviceTableDataSignal);
            }
        } else {
            if(!request.data.length) {
                return notification(`Service order with the reference ${id} cannot be found`, 0, 20000)
            }
            document.getElementsByClassName('updater')[0].click();
            rejectedservicesid = request.data[0].id;
            did('serviceformrs').classList.remove('hidden');
            did('supplier').tomselect.setValue(request.data[0].items[0].supplier);
            // did('branch').value = request.data[0].items[0].branch;
            did('departmentfrom').value = request.data[0].items[0].department;
            did('branch').tomselect.setValue(request.data[0].items[0].branch);
            populateData(request.data[0]);
            populateData(request.data[0].items[0]);
            did('tabledata2').innerHTML = '';
            for(let i=0;i<request.data[0].items.length;i++){
                const genid = genID();
                await addrowrejectedservices(genid);
                did(`supplyitem_${genid}`).tomselect.setValue(request.data[0].items[i].itemid);
                did(`qty_${genid}`).value = request.data[0].items[i].qty;
                did(`cost_${genid}`).value = request.data[0].items[i].cost;
                rejectedservicesreqcal(did(`cost_${genid}`));
            }
            setTimeout(() => {
                did('departmentfrom').value = request.data[0].items[0].department;
            }, 1000);
        }
    } else {
        return notification('No records retrieved');
    }
}

async function onrejectedserviceTableDataSignal() {
    let rows = getSignaledDatasource().map((data, index) => `
        <tr data-open="false" class="source-row-item">
                                <td> ${index+1} </td>
                                <td> ${data.reference} </td>
                                <td> 
                                    <table>
                                        ${data.services.map((dat, index)=>{
                                            return ( index<3 ?
                                                `
                                            <tr>
                                                <td>${dat.servicetype}</td>
                                                <td style="width: 20px">${formatCurrency(dat.amount)}</td>
                                                <td style="width: 20px">${dat.description}</td>
                                            </tr>
                                            `
                                            :
                                               index==3?`
                                               <tr>
                                                    <td onclick="rejectedserviceview(${data.reference})" style="color:green;cursor:pointer">click to view the remaining items ${data.items.length-3} ....</td>
                                                </tr>
                                                `:``
                                            )
                                        }).join('')}
                                    </table> 
                                </td>
                                <td> ${data.suppliername} </td>
                                <td> ${data.branchname} </td>
                                <td> ${formatDate(data.services[0].dateadded.split('T')[0])} </td>
    </tr>`
    )
    .join('')
    injectPaginatatedTable(rows)
}