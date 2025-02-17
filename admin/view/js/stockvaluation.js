let stockvaluationid
async function stockvaluationActive() {
    stockvaluationid = ''
    const form = document.querySelector('#stockvaluationform')
    if(form.querySelector('#submit')) form.querySelector('#submit').addEventListener('click', fetchstockvaluation)
    datasource = []
    await getAllbranch(true)
    new TomSelect('#branch', {
        plugins: ['dropdown_input'],
            onInitialize: function() {
                console.log(checkpermission('FILTER BRANCH'))
                if(!checkpermission('FILTER BRANCH')) this.setValue(the_user.branch);
                if(!checkpermission('FILTER BRANCH')) this.setTextboxValue('readonly', true);
                handleBranchChange(this.getValue(), 'departmentsearch');
            },
            onChange: function() {
                handleBranchChange(this.getValue(), 'departmentsearch');
            }
        });
document.getElementById('date').valueAsDate = new Date();
}

async function fetchstockvaluation(id) {
    if(!validateForm('stockvaluationform', getIdFromCls('comp'))) return

    
    let form = document.querySelector('#stockvaluationform');
    let formData = new FormData(form);
    // formData.set('status', 'RETURNED ITEMS');
    // formData.set('branch', '');
    let queryParams = new URLSearchParams(formData).toString();

    document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> Loading... </td>`

    let request = await httpRequest2(`api/v1/inventory/report/stockvaluation?${queryParams ? `${queryParams}` : ''}`, null, document.querySelector('#stockvaluationform #submit'), 'json', 'GET');
    document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> No Records Retrieved </td>`
    if(request.status) {
                datasource = request.data.items;
                did('asatdate').value = request.data.date;
                did('asat').innerHTML = formatCurrency(request.data.totalBalance);
                did('tqty').innerHTML = formatNumber(request.data.totalQty, 1, 0);
                did('tcost').innerHTML = formatCurrency(request.data.totalCost);
                resolvePagination(datasource, onstockvaluationTableDataSignal);
    } else {
        return notification(`${result.message}`, 0);
    }
}

async function onstockvaluationTableDataSignal() {
    let rows = getSignaledDatasource().map((item, index) => `
    <tr>
        <td>${index + 1}</td>
        <td>${item.itemname}</td>
        <td>${formatNumber(item.cost)}</td>
        <td>${item.qty}</td>
        <td>${formatNumber(item.balance)}</td>
    </tr>`
    )
    .join('')
    injectPaginatatedTable(rows)
}
