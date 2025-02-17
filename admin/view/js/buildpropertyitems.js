
async function buildpropertyitemsActive() {
    await populateItemToBuildDropdown();
    await populateAddItemDropdown();
    initializeBuildPropertyPage();

    if(document.querySelector('#submit')) document.querySelector('#submit').addEventListener('click', function(event) {
        event.preventDefault();
        submitBuildProperty();
    });
}

async function populateItemToBuildDropdown() {
    const itemToBuildDropdown = document.getElementById('itemToBuild');

    try {
        Swal.fire({
            title: 'Loading Items...',
            text: 'Please wait while we fetch items to build.',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading(),
        });

        const response = await httpRequest2(
            'api/v1/inventory/getinventory?composite=YES&status=ACTIVE',
            null,
            null,
            'json',
            'GET'
        );

        Swal.close();

        if (response.status && response.data.length > 0) {
            itemToBuildDropdown.innerHTML = '<option value="">-- Select Item to Build --</option>';

            response.data.map((item) => {
                const option = document.createElement('option');
                option.value = item.itemid;
                option.textContent = item.itemname;
                option.dataset.pricetwo = item.pricetwo; // Attach price to the option
                itemToBuildDropdown.appendChild(option);
            });
        } else {
            Swal.fire({
                icon: 'info',
                title: 'No Items Found',
                text: 'No active composite items are available.',
            });
        }
    } catch (error) {
        Swal.close();
        console.error('Error fetching items to build:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to load items. Please try again later.',
        });
    }
}

async function populateAddItemDropdown() {
    const addItemDropdown = document.getElementById('addItem');

    try {
        Swal.fire({
            title: 'Loading Items...',
            text: 'Please wait while we fetch items to add.',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading(),
        });

        const response = await httpRequest2(
            'api/v1/inventory/getinventory?composite=NO&status=ACTIVE',
            null,
            null,
            'json',
            'GET'
        );

        Swal.close();

        if (response.status && response.data.length > 0) {
            addItemDropdown.innerHTML = '<option value="">-- Select Item to Add --</option>';

            response.data.map((item) => {
                const option = document.createElement('option');
                option.value = item.itemid;
                option.textContent = item.itemname;
                option.dataset.pricetwo = item.pricetwo; // Attach price to the option
                addItemDropdown.appendChild(option);
            });
        } else {
            Swal.fire({
                icon: 'info',
                title: 'No Items Found',
                text: 'No active items are available.',
            });
        }
    } catch (error) {
        Swal.close();
        console.error('Error fetching items to add:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to load items. Please try again later.',
        });
    }
}

function initializeBuildPropertyPage() {
    const addItemBtn = document.getElementById('additembtn');
    const itemToBuildDropdown = document.getElementById('itemToBuild');

    if (addItemBtn) {
        addItemBtn.addEventListener('click', () => {
            addItemToTable('addItem', 'quantity', 'itemsTable');
        });
    }

    if (itemToBuildDropdown){
        itemToBuildDropdown.addEventListener('change', async () => {
            const compositeId = itemToBuildDropdown.value;
            const tableBody = document.getElementById('itemsTable');

            // Clear existing table rows
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center opacity-70">No Data Available</td>
                </tr>
            `;
            
            if (compositeId){
                await fetchBuildPropertyDetails(compositeId)
            }
        })
    }
    
}

async function fetchBuildPropertyDetails(compositeId){
    try {
        // Show a loading indicator
        Swal.fire({
            title: 'Fetching Build Details...',
            text: 'Please wait while we load the details for the selected item.',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading(),
        });

        // Send the GET request
        const response = await httpRequest2(
            `api/v1/property/buildproperty?compositeid=${compositeId}`,
            null,
            null,
            'json',
            'GET'
        );
        Swal.close();

        // Check if data is returned
        if (response.status && response.data.length > 0) {
            const data = response.data[0];
            populateTableWithBuildDetails(data.items);
        }
    } catch (error) {
        Swal.close();
        console.error('Error fetching build property details:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to fetch build property details. Please try again later.',
        });
    }
}

function addItemToTable(selectId, quantityId, tableId) {
    const selectElement = document.getElementById(selectId);
    const quantityElement = document.getElementById(quantityId);
    const tableBody = document.getElementById(tableId);

    if (!selectElement || !quantityElement || !tableBody) {
        console.error('Invalid element ID provided.');
        return;
    }

    const selectedOption = selectElement.options[selectElement.selectedIndex];
    const itemId = selectedOption ? selectedOption.value : '';
    const itemName = selectedOption ? selectedOption.textContent : '';
    const price = selectedOption ? selectedOption.dataset.pricetwo : '';
    const quantity = parseInt(quantityElement.value, 10);

    // Validation
    if (!itemId || !itemName || isNaN(quantity) || quantity <= 0 || !price) {
        Swal.fire({
            icon: 'error',
            title: 'Invalid Input',
            text: `Please select an item, provide a valid quantity, and ensure the price is available.`,
        });
        return;
    }

    // Check if the item already exists in the table
    const existingRow = Array.from(tableBody.rows).find(
        (row) => row.dataset.itemId === itemId
    );

    if (existingRow) {
        Swal.fire({
            icon: 'warning',
            title: 'Duplicate Item',
            text: 'This item is already in the table. Please update its quantity if needed.',
            showConfirmButton: true,
            confirmButtonColor: '#3085d6',
        });
        return;
    }

    // Create a new row
    const newRow = document.createElement('tr');
    newRow.dataset.itemId = itemId;
    newRow.innerHTML = `
        <td class="p-2">${itemId}</td>
        <td class="p-2">${itemName}</td>
        <td class="p-2">${price}</td>
        <td class="p-2">${quantity}</td>
        <td class="p-2">
            <button class="delete-item-btn material-symbols-outlined h-8 w-8 rounded-full bg-red-600 text-xs text-white drop-shadow-md"
                style="font-size: 18px;"
                title="Delete Item"
            >delete</button>
        </td>
    `;

    // Remove the placeholder "No Data Available" row if it exists
    const placeholderRow = tableBody.querySelector('tr td[colspan="5"]');
    if (placeholderRow) {
        placeholderRow.parentElement.remove();
    }

    // Add the new row to the table
    tableBody.appendChild(newRow);

    // Attach delete functionality to the delete button
    const deleteBtn = newRow.querySelector('.delete-item-btn');
    deleteBtn.addEventListener('click', () => {
        Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to remove this item?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
        }).then((result) => {
            if (result.isConfirmed) {
                newRow.remove();
                Swal.fire('Deleted!', 'The item has been removed from the table.', 'success');
            }
        });
    });

    // Reset the quantity input field
    quantityElement.value = '';
}

function populateTableWithBuildDetails(items) {
    const tableBody = document.getElementById('itemsTable');

    // Clear existing table rows
    tableBody.innerHTML = '';

    items.forEach((item) => {
        // Create a new row for each item
        const newRow = document.createElement('tr');
        newRow.dataset.itemId = item.itemid;

        newRow.innerHTML = `
            <td class="p-2">${item.itemid}</td>
            <td class="p-2">${item.itemidname}</td>
            <td class="p-2">${item.price}</td>
            <td class="p-2">${item.qty}</td>
            <td class="p-2">
                <button class="delete-item-btn material-symbols-outlined h-8 w-8 rounded-full bg-red-600 text-xs text-white drop-shadow-md"
                    style="font-size: 18px;"
                    title="Delete Item"
                >delete</button>
            </td>
        `;

        // Attach delete functionality to the delete button
        const deleteBtn = newRow.querySelector('.delete-item-btn');
        deleteBtn.addEventListener('click', () => {
            Swal.fire({
                title: 'Are you sure?',
                text: 'Do you want to remove this item?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, delete it!',
                cancelButtonText: 'Cancel',
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
            }).then((result) => {
                if (result.isConfirmed) {
                    newRow.remove();
                    Swal.fire('Deleted!', 'The item has been removed from the table.', 'success');
                }
            });
        });

        // Append the new row to the table
        tableBody.appendChild(newRow);
    });

    // If no items are found, add a placeholder row
    if (items.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center opacity-70">No Data Available</td>
            </tr>
        `;
    }
}


async function submitBuildProperty() {
    if(!validateForm('buildpropertyitemsform', getIdFromCls('comp'))) return

    const compositeId = document.getElementById('itemToBuild').value;
    const tableBody = document.getElementById('itemsTable');
    const rows = Array.from(tableBody.querySelectorAll('tr'));

    // Validation: Check if a composite ID is selected
    if (!compositeId) {
        Swal.fire({
            icon: 'error',
            title: 'No Item Selected',
            text: 'Please select an item to build.',
        });
        return;
    }

    // Validation: Check if the table has any rows
    if (rows.length === 0 || (rows.length === 1 && rows[0].querySelector('td[colspan]'))) {
        Swal.fire({
            icon: 'error',
            title: 'No Items Added',
            text: 'Please add at least one item to the table before submitting.',
        });
        return;
    }

    // Prepare FormData for submission
    const formData = new FormData();
    formData.append('compositeid', compositeId);
    formData.append('rowsize', rows.length);

    // Loop through each table row to extract item details
    rows.map((row, index) => {
        const itemId = row.dataset.itemId; // Assuming itemId is stored in the `data-item-id` attribute
        const quantity = row.querySelector('td:nth-child(4)').textContent.trim(); // Assuming quantity is in the 4th column

        if (itemId && quantity) {
            formData.append(`itemid${index + 1}`, itemId); // itemid1, itemid2, etc.
            formData.append(`qty${index + 1}`, quantity); // qty1, qty2, etc.
        }
    });

    try {
        // Show a loading alert while the request is being processed
        Swal.fire({
            title: 'Submitting...',
            text: 'Please wait while we process your request.',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading(),
        });

        // Send the POST request
        const response = await httpRequest2('api/v1/property/buildproperty', formData, null, 'json', 'POST');

        // Close the loading alert
        Swal.close();

        // Handle the response
        if (response.status) {
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'Build property successfully submitted.',
            });

            // Reset table and dropdown
            document.getElementById('itemsTable').innerHTML = `
                <tr>
                    <td colspan="5" class="text-center opacity-70">No Data Available</td>
                </tr>
            `;
            document.getElementById('itemToBuild').value = '';
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: response.message || 'Failed to submit build property.',
            });
        }
    } catch (error) {
        // Handle any errors during the submission process
        Swal.close();
        console.error('Error submitting build property:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'An unexpected error occurred. Please try again.',
        });
    }
}


