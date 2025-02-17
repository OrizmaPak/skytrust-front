let viewreversalsid
async function viewreversalsActive() {
    viewreversalsid = ''
    const form = document.querySelector('#viewreversalsform')
    if(document.querySelector('#submitviewreversals')) document.querySelector('#submitviewreversals').addEventListener('click', fetchviewreversals)
    // if(form2.querySelector('#querySubmit')) form2.querySelector('#querySubmit').addEventListener('click', viewreversalsFormSubmitHandler)
    datasource = []
    // await fetchviewreversals()
}

async function fetchviewreversals() {
    // Show loading state using SweetAlert
    const loadingAlert = Swal.fire({
        title: 'Please wait...',
        text: 'Fetching view reversals data, please wait.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    let form = document.querySelector('#viewreversalsform');
    let formData = new FormData(form);
    // formData.set('department', '');
    // formData.set('viewreversals', '');
    let queryParams = new URLSearchParams(formData).toString();

    document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> Loading... </td>`

    let request = await httpRequest2(`api/v1/transactions?status=REVERSED&${queryParams ? `${queryParams}` : ''}`, null, document.querySelector('#viewrequisitionform #submit'), 'json', 'GET');
    swal.close(); // Close the loading alert once the request is complete
    document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> No Records Retrieved </td>`
    if(request.status) {
            if(request.data.length) {
                datasource = request.data
                resolvePagination(datasource, onviewreversalsTableDataSignal);
            }
    } else {
        return notification('No records retrieved');
    }
}

async function onviewreversalsTableDataSignal() {
    let rows = getSignaledDatasource().map((item, index) => `
    <tr>
        <td>${index + 1}</td>
        <td>${item.accountnumber}</td>
        <td>${item.ttype}</td>
        <td>${item.description}</td>
        <td>${item.reference}</td>
        <td>${formatDate(item.dateadded)}</td>
        <td style="color: red;">${item.debit}</td>
        <td style="color: green;">${item.credit}</td>
    </tr>`
    )
    .join('')
    injectPaginatatedTable(rows)
}
