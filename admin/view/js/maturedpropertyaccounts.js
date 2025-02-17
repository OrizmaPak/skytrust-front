let maturedpropertyaccountsid;

async function maturedpropertyaccountsActive() {
    maturedpropertyaccountsid = '';
    datasource = [];

    await fetchmaturedpropertyaccounts();
}

// Fetch matured property accounts
async function fetchmaturedpropertyaccounts(id) {
    const loadingAlert = Swal.fire({
        title: 'Please wait...',
        text: 'Fetching matured property accounts data, please wait.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    if (!id) document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> Loading... </td>`;

    let request = await httpRequest2(`api/v1/property/maturedaccount`, null, document.querySelector('#viewrequisitionform #submit'), 'json', 'GET');

    swal.close(); // Close loading alert

    if (!id) document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> No Records Retrieved </td>`;

    if (request.status) {
        if (!id) {
            if (request.data.accounts.length > 0) {
                datasource = request.data.accounts;
                resolvePagination(datasource, onmaturedpropertyaccountsTableDataSignal);
            }
        } else {
            maturedpropertyaccountsid = request.data.accounts[0].account.id;
            populateData(request.data.accounts[0].account);
        }
    } else {
        return notification('No records retrieved');
    }
}

// Populate Table
async function onmaturedpropertyaccountsTableDataSignal() {
    let rows = getSignaledDatasource().map((item, index) => {
        const account = item.account;
        const items = item.items;

        return items.map((item, itemIndex) => `
            <tr>
                <td>${index + 1}.${itemIndex + 1}</td>
                <td>${item.itemid}</td>
                <td>${account.accountnumber}</td>
                <td>${account.fullname}</td>
                <td>${formatDate(account.registrationdate.split("T")[0])}</td>
                <td>${account.totalRemitted.toFixed(2)}</td>
                <td>${item.deliverystatus}</td>
                <td>
                    <button onclick="showUpdateModal(
                        ${item.id}, 
                        '${item.deliverystatus}', 
                        '${item.delivered === 'YES' ? 'YES' : 'NO'}', 
                        '${item.deliveryrequested === 'YES' ? 'YES' : 'NO'}', 
                        '${item.readyfordelivery === 'YES' ? 'YES' : 'NO'}', 
                        '${item.deliveryacknowledged === 'YES' ? 'YES' : 'NO'}'
                    )" 
                    class="transform rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 px-3 py-2 text-white shadow-md transition duration-300 ease-in-out hover:scale-105 hover:from-blue-600 hover:to-blue-800">
                        <i class="fas fa-edit mr-2"></i>Update Status
                    </button>
                </td>
            </tr>
        `).join('');
    }).join('');

    injectPaginatatedTable(rows);
}

async function showUpdateModal(itemId, currentStatus, delivered, deliveryrequested, readyfordelivery, deliveryacknowledged) {
    const { value: formValues } = await Swal.fire({
        title: "Update Item Status",
        html: `
            <div style="display: grid; grid-template-columns: 1fr; gap: 15px; text-align: left;">
                <!-- Delivery Requested -->
                <label class="block font-bold text-gray-700">Delivery Requested:</label>
                <select id="deliveryrequested" class="swal2-input">
                    <option value="YES" ${deliveryrequested === 'YES' ? 'selected' : ''}>Yes</option>
                    <option value="NO" ${deliveryrequested === 'NO' ? 'selected' : ''}>No</option>
                </select>
                <button id="update-deliveryrequested" class="swal2-confirm swal2-styled">Update</button>
                
                <!-- Hidden dropdowns if delivery requested is NO -->
                <div id="extraFields" style="${deliveryrequested === 'NO' ? 'display: none;' : ''}">
                    <label class="block font-bold text-gray-700">Delivery Status:</label>
                    <div class="flex w-full items-center">
                        <select id="deliverystatus" class="swal2-input w-full">
                            ${generateDeliveryOptions(currentStatus)}
                        </select>
                        <button id="update-deliverystatus" class="swal2-confirm swal2-styled text-nowrap">Update</button>
                    </div>

                    <label class="block font-bold text-gray-700">Delivered:</label>
                    <div class="flex w-full items-center">
                        <select id="delivered" class="swal2-input w-full">
                            <option value="YES" ${delivered === 'YES' ? 'selected' : ''}>Yes</option>
                            <option value="NO" ${delivered === 'NO' ? 'selected' : ''}>No</option>
                        </select>
                        <button id="update-delivered" class="swal2-confirm swal2-styled text-nowrap">Update</button>
                    </div>

                    <label class="block font-bold text-gray-700">Ready for Delivery:</label>
                    <div class="flex w-full items-center">
                        <select id="readyfordelivery" class="swal2-input w-full">
                            <option value="YES" ${readyfordelivery === 'YES' ? 'selected' : ''}>Yes</option>
                            <option value="NO" ${readyfordelivery === 'NO' ? 'selected' : ''}>No</option>
                        </select>
                        <button id="update-readyfordelivery" class="swal2-confirm swal2-styled text-nowrap">Update</button>
                    </div>

                    <label class="block font-bold text-gray-700">Delivery Acknowledged:</label>
                    <div class="flex w-full items-center">
                        <select id="deliveryacknowledged" class="swal2-input w-full">
                            <option value="YES" ${deliveryacknowledged === 'YES' ? 'selected' : ''}>Yes</option>
                            <option value="NO" ${deliveryacknowledged === 'NO' ? 'selected' : ''}>No</option>
                        </select>
                        <button id="update-deliveryacknowledged" class="swal2-confirm swal2-styled text-nowrap">Update</button>
                    </div>
                </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        cancelButtonText: "Close",
        cancelButtonColor: "#d33",
        didOpen: () => {
            const deliveryRequested = document.querySelector('#deliveryrequested');
            deliveryRequested.disabled = true;
            document.getElementById("deliveryrequested").addEventListener("change", function () {
                document.getElementById("extraFields").style.display = "none";
            });

            if (!checkpermission('PROPERTY UPDATE')) {
                deliveryRequested.disabled = true;
            }

            const dropdownIds = ['#delivered', '#readyfordelivery', '#deliveryacknowledged', '#deliverystatus'];
            dropdownIds.forEach(id => {
                const element = document.querySelector(id);
                if (element) {
                    const permissionType = id === '#deliverystatus' ? 'CUSTOMER PROPERTY UPDATE' : 'PROPERTY UPDATE';
                    if (!checkpermission(permissionType)) {
                        element.disabled = true;
                    }
                }
            });

            document.getElementById("update-deliveryrequested").addEventListener("click", () => {
                const deliveryRequestedValue = document.getElementById("deliveryrequested").value;
                updateField(itemId, 'deliveryrequested', deliveryRequestedValue).then(() => {
                    if (deliveryRequestedValue === 'YES') {
                        document.getElementById("extraFields").style.display = "block";
                    }
                });
            });

            document.getElementById("update-deliverystatus").addEventListener("click", () => {
                updateField(itemId, 'deliverystatus', document.getElementById("deliverystatus").value);
            });

            document.getElementById("update-delivered").addEventListener("click", () => {
                updateField(itemId, 'delivered', document.getElementById("delivered").value);
            });

            document.getElementById("update-readyfordelivery").addEventListener("click", () => {
                updateField(itemId, 'readyfordelivery', document.getElementById("readyfordelivery").value);
            });

            document.getElementById("update-deliveryacknowledged").addEventListener("click", () => {
                updateField(itemId, 'deliveryacknowledged', document.getElementById("deliveryacknowledged").value);
            });
        }
    });
}

async function updateField(itemId, key, value) {
    let formData = new FormData();
    formData.append('id', itemId);
    formData.append('key', key);
    formData.append('value', value);

    let response = await httpRequest2("api/v1/property/updateitemstatus", formData, null, 'json', "POST");

    if (response.status) {
        Swal.fire({ title: "Success!", text: `${key} updated successfully!`, icon: "success", confirmButtonColor: "#3085d6" });
        await fetchmaturedpropertyaccounts();
    } else {
        Swal.fire({ title: "Error", text: `Failed to update ${key}.`, icon: "error", confirmButtonColor: "#d33" });
    }
}

function generateDeliveryOptions(selectedStatus) {
    const deliveryStatuses = [
        "NOT STARTED",
        "PROCESSING",
        "PROCESSED",
        "NOT IN STOCK",
        "READY FOR DELIVERY",
        "DELIVERED"
    ];
    return deliveryStatuses.map(status => 
        `<option value="${status}" ${status === selectedStatus ? "selected" : ""}>${status}</option>`
    ).join('');
}