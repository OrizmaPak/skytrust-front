let viewreturneditemsid
let theviewreturneditemsitems    
// let initialinventoryload
async function viewreturneditemsActive() {
    theviewreturneditemsitems = '';
    thedepartment = '';
    thebranch = '';
    initialinventoryload = ''
    // const form = document.querySelector('#viewreturneditemsform')
    // const form2 = document.querySelector('#updateinventories')
    if(document.querySelector('#viewsubmit')) document.querySelector('#viewsubmit').addEventListener('click', e=>fetchviewviewreturneditemsstable())
    // form.querySelector('#submit').click()
    datasource = []

}

async function fetchviewviewreturneditemsstable() {
    thedepartment = '';
    thebranch = '';
    if(!validateForm('viewviewreturneditemsform', getIdFromCls('comp'))) return

    
    let form = document.querySelector('#viewviewreturneditemsform');
    let formData = new FormData(form);
    formData.set('status', 'ACTIVE');
    formData.set('transactiondesc', 'RETURNED ITEMS');
    // formData.set('branch', '');
    let queryParams = new URLSearchParams(formData).toString();

    document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> Loading... </td>`

    let request = await httpRequest2(`api/v1/inventory/issues/log?${queryParams ? `${queryParams}` : ''}`, null, document.querySelector('#viewviewreturneditemsform #viewsubmit'), 'json', 'GET');
    document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> No Records Retrieved </td>`
    if(request.status) {
            if(request.data.length) {
                datasource = request.data
                resolvePagination(datasource, onviewviewreturneditemssTableDataSignal)
            }
    }
    else return notification('No records retrieved')
}

async function onviewviewreturneditemssTableDataSignal() {
    let rows = getSignaledDatasource().map((item, index) => `
    <tr>
        <td>${index + 1 }</td>
        <td>${item.itemname}</td>
        <td>${item.issuetypename??item.issuetype}</td>
        <td>${item.issue}</td>
        <td>${formatNumber(Math.abs(item.qty, 0, 0))}</td>
        <td>${formatCurrency(item.cost)}</td>
        <td>${formatDate(item.transactiondate.split('T')[0])}</td>
        <td>${formatTime(item.transactiondate.split('T')[1].split('+')[0])}</td>
        <td>${item.branchname??item.branch}</td>
        <td>${item.departmentname??item.department}</td>
        <td>${item.status == 'ACTIVE' ? 'STILL IN STOCK' : item.status}</td>
        <td class="flex items-center gap-3">
            <button title="View issue log entry" onclick="viewviewreturneditems('${item.id}')" class="material-symbols-outlined rounded-full bg-green-600 h-8 w-8 text-white drop-shadow-md text-xs" style="font-size: 18px;">visibility</button>
        </td>
        </tr>`
    )
    .join('')
    injectPaginatatedTable(rows)
}

function viewviewreturneditems(id) {
    // Find the issue log entry by ID
    const viewreturneditemsEntry = datasource.filter(item => item.id == id)[0];

    if (!viewreturneditemsEntry) {
        return notification('Issue log entry not found', 0);
    }

    // Create the HTML content for the SweetAlert
    const contentHtml = `
       <div class="bg-white shadow-md rounded-lg p-6 max-w-md mx-auto">
    <table class="min-w-full bg-white">
        <tbody>
            <tr class="border-b">
                <td class="px-4 py-2 font-medium text-gray-700 text-left">Item Name:</td>
                <td class="px-4 py-2 text-gray-700 text-right">${viewreturneditemsEntry.itemname}</td>
            </tr>
            <tr class="border-b">
                <td class="px-4 py-2 font-medium text-gray-700 text-left">Issue Type:</td>
                <td class="px-4 py-2 text-gray-700 text-right">${viewreturneditemsEntry.issuetypename ?? viewreturneditemsEntry.issuetype}</td>
            </tr>
            <tr class="border-b">
                <td class="px-4 py-2 font-medium text-gray-700 text-left">Issue:</td>
                <td class="px-4 py-2 text-gray-700 text-right">${viewreturneditemsEntry.issue}</td>
            </tr>
            <tr class="border-b">
                <td class="px-4 py-2 font-medium text-gray-700 text-left">Quantity:</td>
                <td class="px-4 py-2 text-gray-700 text-right">${Math.abs(viewreturneditemsEntry.qty)}</td>
            </tr>
            <tr class="border-b">
                <td class="px-4 py-2 font-medium text-gray-700 text-left">Cost:</td>
                <td class="px-4 py-2 text-gray-700 text-right">${viewreturneditemsEntry.cost}</td>
            </tr>
            <tr class="border-b">
                <td class="px-4 py-2 font-medium text-gray-700 text-left">Date:</td>
                <td class="px-4 py-2 text-gray-700 text-right">${formatDate(viewreturneditemsEntry.transactiondate.split('T')[0])}</td>
            </tr>
            <tr class="border-b">
                <td class="px-4 py-2 font-medium text-gray-700 text-left">Time:</td>
                <td class="px-4 py-2 text-gray-700 text-right">${formatTime(viewreturneditemsEntry.transactiondate.split('T')[1].split('+')[0])}</td>
            </tr>
            <tr class="border-b">
                <td class="px-4 py-2 font-medium text-gray-700 text-left">Branch:</td>
                <td class="px-4 py-2 text-gray-700 text-right">${viewreturneditemsEntry.branchname ?? viewreturneditemsEntry.branch}</td>
            </tr>
            <tr class="border-b">
                <td class="px-4 py-2 font-medium text-gray-700 text-left">Department:</td>
                <td class="px-4 py-2 text-gray-700 text-right">${viewreturneditemsEntry.departmentname ?? viewreturneditemsEntry.department}</td>
            </tr>
            <tr>
                <td class="px-4 py-2 font-medium text-gray-700 text-left">Status:</td>
                <td class="px-4 py-2 ${viewreturneditemsEntry.status === 'ACTIVE' ? 'text-green-600' : 'text-gray-600'}">
                    ${viewreturneditemsEntry.status === 'ACTIVE' ? 'STILL IN STOCK' : viewreturneditemsEntry.status}
                </td>
            </tr>
        </tbody>
    </table>
</div>

    `;

    // Show the SweetAlert with the details
    Swal.fire({
        title: 'Issue Log Entry',
        html: contentHtml,
        showCancelButton: true,
        showDenyButton: true,
        cancelButtonText: 'Cancel',
        cancelButtonColor: 'red',
        showCloseButton: true,
        closeButtonText: 'Cancel',
    }).then((result) => {
        if (result.isConfirmed) {
        }
    });
}

