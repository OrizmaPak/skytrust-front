let stockhistoryid
async function stockhistoryActive() {
    stockhistoryid = ''
    const form = document.querySelector('#stockhistoryform')
    if(form.querySelector('#submit')) form.querySelector('#submit').addEventListener('click', fetchstockhistory)
    datasource = []
await fetchallitems()
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
new TomSelect('#itemid', {
        plugins: ['dropdown_input'],
    });

const startDateInput = document.querySelector('#startdate');
const endDateInput = document.querySelector('#enddate');

const today = new Date();
const oneMonthAgo = new Date();
oneMonthAgo.setMonth(today.getMonth() - 1);

endDateInput.value = today.toISOString().split('T')[0];
startDateInput.value = oneMonthAgo.toISOString().split('T')[0];
}

let balanceBroughtIn
let balanceBroughtOut
let balanceBroughtForward

async function fetchstockhistory() {
    thedepartment = '';
    thebranch = '';
    if(!validateForm('stockhistoryform', getIdFromCls('comp'))) return

    
    let form = document.querySelector('#stockhistoryform');
    let formData = new FormData(form);
    // formData.set('status', 'RETURNED ITEMS');
    // formData.set('branch', '');
    let queryParams = new URLSearchParams(formData).toString();

    document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> Loading... </td>`

    let request = await httpRequest2(`api/v1/inventory/report/stockledger?${queryParams ? `${queryParams}` : ''}`, null, document.querySelector('#stockhistoryform #submit'), 'json', 'GET');
    document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> No Records Retrieved </td>`
    if(request.status) {
                datasource = request.data.items;
                let data = request.data;
                 balanceBroughtIn = parseInt(data.balanceBroughtIn);
                 balanceBroughtOut = parseInt(data.balanceBroughtOut);
                balanceBroughtForward = parseInt(data.balanceBroughtForward);
                 let balanceBroughtForwardCost = parseInt(data.balanceBroughtForwardCost);

                // Update the balance elements
                document.getElementById('balanceBroughtIn').innerText = formatNumber(balanceBroughtIn, 1, 0);
                document.getElementById('balanceBroughtOut').innerText = formatNumber(balanceBroughtOut, 1, 0);
                document.getElementById('balanceBroughtForward').innerText = formatNumber(balanceBroughtForward, 1, 0);
                document.getElementById('balanceBroughtForwardCost').innerText = formatNumber(balanceBroughtForwardCost, 1, 0);
                resolvePagination(datasource, onstockhistoryTableDataSignal);
    } else {
        return notification(`${result.message}`, 0);
    }
}


async function fetchallitems(id) {
    let request = await httpRequest2(`api/v1/inventory/getallitems`, null, null, 'json', 'GET');
    document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> No Records Retrieved </td>`
    if(request.status) {
        did('itemid').innerHTML = `<option value="">-- Select Item --</option>` 
        did('itemid').innerHTML += request.data.map(data=>`<option value="${data.itemid}">${data.itemname}</option>`).join('')
    } else {
        return notification('No records retrieved');
    }
}

async function removestockhistory(id) {
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
        fetchstockhistory();
        return notification(confirmed.value.message);
    }
}


async function onstockhistoryTableDataSignal() {
    let data = getSignaledDatasource();
    let balance = parseInt(balanceBroughtForward);
    console.log('balance', balance)
    let rows = data.map((item, index) => {
        let previousBalance = balance;
        balance += parseInt(item.qty);
        console.log('balance', balance)

        let balanceColor = 'black'; // Default color for the starting balance
        if (index > 0) { // Change color only after the first entry
            if (balance > previousBalance) {
                balanceColor = 'green';
            } else if (balance < previousBalance) {
                balanceColor = 'red';
            }
        }

        if(index == 0) return `<tr>
        <td colspan="5"> BALANCE BROUGHT FORWARD: </td>
        <td> ${formatNumber(balanceBroughtIn, 1, 0)} </td>
        <td> ${formatNumber(balanceBroughtOut, 1, 0)} </td>
        <td colspan="2">  </td>
        <td style="color: ${balanceColor};"> ${formatNumber(balanceBroughtForward, 1, 0)} </td>
    </tr>
    <tr>
        <td>${index + 1}</td>
        <td>${formatDate(item.transactiondate.split('T')[0])}</td>
        <td>${item.itemname}</td>
        <td>${item.branchname ?? item.branch}</td>
        <td>${item.departmentname ?? item.department}</td>
        <td style="color: green;">${item.qty > 0 ? `${formatNumber(item.qty)}` : '0'}</td>
        <td style="color: red;">${item.qty < 0 ? `${formatNumber(item.qty)}` : '0'}</td>
        <td>${item.transactiondesc}</td>
        <td>${item.reference}</td>
        <td style="color: ${balanceColor};">${formatNumber(balance, 0, 0)}</td>
    </tr>`
        return `
            <tr>
                <td>${index + 1}</td>
                <td>${formatDate(item.transactiondate.split('T')[0])}</td>
                <td>${item.itemname}</td>
                <td>${item.branchname ?? item.branch}</td>
                <td>${item.departmentname ?? item.department}</td>
                <td style="color: green;">${item.qty > 0 ? `${formatNumber(item.qty)}` : '0'}</td>
                <td style="color: red;">${item.qty < 0 ? `${formatNumber(item.qty)}` : '0'}</td>
                <td>${item.transactiondesc}</td>
                <td>${item.reference}</td>
                <td style="color: ${balanceColor};">${formatNumber(balance, 0, 0)}</td>
            </tr>`;
    }).join('');
    injectPaginatatedTable(rows);
}