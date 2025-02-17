let allpayablesid;
async function allpayablesActive() {
    await fetchallpayables();
}

async function fetchallpayables(id) {

    // Show loading state using SweetAlert
    const loadingAlert = Swal.fire({
        title: 'Please wait...',
        text: 'Fetching allpayables data, please wait.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> Loading... </td>`;

    let request = await httpRequest2(`api/v1/expense/allpayables`, null, document.querySelector('#viewrequisitionform #submit'), 'json', 'GET');
    swal.close(); // Close the loading alert once the request is complete
    document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> No Records Retrieved </td>`;
    if(request.status) {
        if(request.data.length) {
            datasource = request.data;
            resolvePagination(datasource, onallpayablesTableDataSignal);
        }
    } else {
        return notification('No records retrieved');
    }
}

async function onallpayablesTableDataSignal() {
    let totalDebit = 0;
    let totalCredit = 0;
    let totalBalance = 0;

    let rows = getSignaledDatasource().map((item, index) => {
        totalDebit += item.debit;
        totalCredit += item.credit;
        totalBalance += item.balance;

        return `
        <tr>
            <td>${index + 1}</td>
            <td>${item.supplier}</td>
            <td style="color: red;">${formatCurrency(item.debit)}</td>
            <td style="color: green;">${formatCurrency(item.credit)}</td>
            <td style="color: ${item.balance >= 0 ? 'green' : 'red'};">${formatCurrency(item.balance)}</td>
        </tr>`;
    }).join('');

    // Add a row for totals
    rows += `
    <tr style="font-weight: bold;" class="!bg-gray-300">
        <td colspan="2" class="text-right">Total:</td>
        <td style="color: red;">${formatCurrency(totalDebit)}</td>
        <td style="color: green;">${formatCurrency(totalCredit)}</td>
        <td style="color: ${totalBalance >= 0 ? 'green' : 'red'};">${formatCurrency(totalBalance)}</td>
    </tr>`;

    injectPaginatatedTable(rows);
}
