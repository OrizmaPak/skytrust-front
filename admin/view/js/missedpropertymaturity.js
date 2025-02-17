let missedpropertymaturityid;
async function missedpropertymaturityActive() {
    missedpropertymaturityid = '';
    datasource = [];
    await fetchmissedpropertymaturity();
}

async function fetchmissedpropertymaturity(id) {
    // Show loading state using SweetAlert
    const loadingAlert = Swal.fire({
        title: 'Please wait...',
        text: 'Fetching missedpropertymaturity data, please wait.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    if (!id) document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> Loading... </td>`;

    let request = await httpRequest2(`api/v1/property/missedmaturity`, null, document.querySelector('#viewrequisitionform #submit'), 'json', 'GET');
    swal.close(); // Close the loading alert once the request is complete
    if (!id) document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> No Records Retrieved </td>`;
    if (request.status) {
        if (!id) {
            if (request.data.accounts.length) {
                datasource = request.data.accounts;
                resolvePagination(datasource, onmissedpropertymaturityTableDataSignal);
            }
        } else {
            missedpropertymaturityid = request.data.accounts[0].missedInstallments[0].item.itemid;
            populateData(request.data.accounts);
        }
    } else {
        return notification('No records retrieved');
    }
}

async function onmissedpropertymaturityTableDataSignal() {
    let rows = getSignaledDatasource().map((account, index) => {
        const installment = account.missedInstallments[0].installment;
        const item = account.missedInstallments[0].item;
        return `
        <tr>
            <td>${index + 1}</td>
            <td>${item.itemname}</td>
            <td>${account.accountnumber}</td>
            <td>${formatDate(installment.duedate.split("T")[0])}</td>
            <td>${formatCurrency(installment.amountowed)}</td>
            <td>${formatCurrency(installment.amountpaid)}</td>
            <td class="flex items-center gap-3">
                <button title="Notify user" class="material-symbols-outlined h-8 w-8 rounded-full bg-primary-g text-xs text-white drop-shadow-md" style="font-size: 18px;" onclick="notifyCustomer(${item.itemid}, '${item.itemname}', '${installment.duedate}', ${installment.amountowed}, ${item.remaining})">notifications</button>
            </td>
        </tr>`;
    }).join('');
    injectPaginatatedTable(rows);
}

async function notifyCustomer(itemid, itemname, duedate, amountowed, remaining) {
    const formData = new FormData();
    formData.append('itemid', itemid);
    formData.append('itemname', itemname);
    formData.append('duedate', duedate);
    formData.append('amount', amountowed);
    formData.append('remaining', remaining);
    formData.append('userid', the_user.id);

    const notifyAlert = await Swal.fire({
        title: 'Notifying...',
        text: 'Sending notification to the customer, please wait.',
        icon: 'info',
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    let response = await httpRequest2('api/v1/property/notifycustomer', formData, null, 'json', 'POST');
    Swal.close();

    if (response.status) {
        Swal.fire({ title: "Success!", text: "Notification sent successfully!", icon: "success", confirmButtonColor: "#3085d6" });
    } else {
        Swal.fire({ title: "Error", text: "Failed to send notification.", icon: "error", confirmButtonColor: "#d33" });
    }
}
