// let viewcompositeitemsid
async function viewcompositeitemsActive() {
    viewcompositeitemsid = ''
    datasource = []
    await fetchviewcompositeitems()
}

async function fetchviewcompositeitems(id) {
    // Show loading state using SweetAlert
    const loadingAlert = Swal.fire({
        title: 'Please wait...',
        text: 'Fetching viewcompositeitems data, please wait.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    if(!id)document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> Loading... </td>`

    let request = await httpRequest2(`api/v1/inventory/getinventory?composite=YES&status=ACTIVE`, null, document.querySelector('#viewrequisitionform #submit'), 'json', 'GET');
    swal.close(); // Close the loading alert once the request is complete
    if(!id)document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> No Records Retrieved </td>`
    if(request.status) {
        if(!id){
            if(request.data.length) {
                datasource = request.data
                resolvePagination(datasource, onviewcompositeitemsTableDataSignal);
            }
        } else {
            document.getElementsByClassName('updater')[0].click();
            viewcompositeitemsid = request.data[0].id;
            populateData(request.data[0]);
        }
    } else {
        return notification('No records retrieved');
    }
}

async function onviewcompositeitemsTableDataSignal() {
    let rows = getSignaledDatasource().map((item, index) => `
    <tr>
        <td>${index + 1}</td>
        <td>${item.itemid}</td>
        <td>${item.itemname}</td>
        <td>${item.qty}</td>
        <td>${formatCurrency(item.pricetwo)}</td>
      
        <td class="flex gap-3 items-center">
            <button title="View composite items" onclick="viewCompositeItemDetails('${item.itemid}')" class="w-8 h-8 text-xs text-white bg-green-600 rounded-full drop-shadow-md material-symbols-outlined" style="font-size: 18px;">visibility</button>
        </td>
    </tr>`
    )
    .join('')
    injectPaginatatedTable(rows)
}

async function viewCompositeItemDetails(itemid) {
    try {
        const loadingAlert = Swal.fire({
            title: 'Please wait...',
            text: 'Fetching composite item details, please wait.',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        let response = await httpRequest2(`api/v1/property/buildproperty?compositeid=${itemid}`, null, null, 'json', 'GET');
        swal.close(); // Close the loading alert once the request is complete

        if (response.status) {
            if (response.data.length === 0 || response.data[0].items.length === 0) {
                Swal.fire({
                    title: 'Composite Item Details',
                    html: '<p>No composite item details available.</p>',
                    icon: 'info'
                });
            } else {
                const items = response.data[0].items;
                let tableRows = items.map(item => `
                    <tr>
                        <td>${item.itemid}</td>
                        <td>${item.itemidname}</td>
                        <td>${item.qty}</td>
                    </tr>
                `).join('');

                Swal.fire({
                    title: 'Composite Item Details',
                    html: `
                        <div class="table-content">
                            <table class="table-auto">
                                <thead>
                                    <tr>
                                        <th>Item ID</th>
                                        <th>Item Name</th>
                                        <th>Quantity</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${tableRows}
                                </tbody>
                            </table>
                        </div>
                    `,
                });
            }
        } else {
            Swal.fire({
                title: 'Error',
                text: 'Failed to retrieve composite item details.',
                icon: 'error'
            });
        }
    } catch (error) {
        Swal.fire({
            title: 'Error',
            text: 'An error occurred while fetching composite item details.',
            icon: 'error'
        });
    }
}
