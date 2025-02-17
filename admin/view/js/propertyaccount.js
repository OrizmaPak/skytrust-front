let propertyaccountid
async function propertyaccountActive() {
    propertyaccountid = '';
    const form = document.querySelector('#propertyaccountform');

    let editData = JSON.parse(localStorage.getItem("editPropertyAccountData"));
    window.addEventListener('beforeunload', () => {
        localStorage.removeItem("editPropertyAccountData");
    });
    console.log("Edit data", editData);

    if (editData) {
        Swal.fire({
            title: "Loading...",
            text: "Fetching account details, please wait.",
            allowOutsideClick: false,
            showConfirmButton: false,
            didOpen: () => {
                Swal.showLoading();
            },
        });

        await Promise.all([
            populateProductOptions(),
            getregistrationpoint(),
            populateItemsDropdown(),
            getAllUsers('userid', 'name'),
            getAllUsers('accountofficer', 'name'),
            getallmemberships('membership')
            
        ]);

        populateEditFields(editData); // Populate the form fields
        localStorage.removeItem("editPropertyAccountData"); // Clear the data after populating

        Swal.close(); // Close the loading alert
    }

    await Promise.all([
        populateProductOptions(),
        getregistrationpoint(),
        populateItemsDropdown(),
        getAllUsers('userid', 'name'),
        getAllUsers('accountofficer', 'name'),
        getallmemberships('membership')
        
    ]);

    if (form.querySelector('#submit')) {
        form.querySelector('#submit').addEventListener('click', propertyaccountFormSubmitHandler);
    }
    if (form.querySelector('#additembtn')) {
        document.getElementById('additembtn').addEventListener('click', handleAddButtonClick);
    }
    if (form.querySelector('#registrationdate')) {
        form.querySelector('#registrationdate').value = new Date().toISOString().split('T')[0];
    }
    if (document.querySelector('#productid')) {
        document.getElementById('productid').addEventListener('change', (e) => {
            const selectedProduct = propertyproduct.find(
                (data) => data.id == document.getElementById('productid').value
            );
            const accountOfficer = selectedProduct?.productofficer || '';
            document.getElementById('accountofficer').tomselect.setValue(accountOfficer);
        });
    }

    new TomSelect('#userid', {
        plugins: ['dropdown_input'],
        onChange: function() { 
            handleuserchange(this.getValue());
         }, 
        onInitialize: function () {
            if (!checkpermission('FILTER ALL USERS')) this.setValue(the_user.id);
            if (!checkpermission('FILTER ALL USERS')) this.setTextboxValue('readonly', true);
        }
    });
    new TomSelect('#accountofficer', { 
        plugins: ['dropdown_input'],
        onInitialize: function () {
            if (editData !== null) {
                if (editData.account){
                    this.setValue(editData.account.accountofficer);
                }
            }
        }
    });
    new TomSelect('#productid', { 
        plugins: ['dropdown_input'],
        onInitialize: function () {
            if (editData !== null) {
                if (editData.account) {
                    this.setValue(editData.account.productid);
                }
            }
        }
    });
    new TomSelect("#membership", {
        plugins: ["dropdown_input", "remove_button"],
        onChange: function() {
            handlememberchange(this.getValue())
        },
        onInitialize: function () {
            if (editData !== null) {
                if (editData.account) {
                    did('membershipdropdown').classList.remove('hidden');
                    const memberValues = editData.account.member.split('||');
                    this.setValue(memberValues);
                }
            }
        }
    });
    new TomSelect('#registrationpointsearch', { 
        plugins: ['dropdown_input'],
        onInitialize: function () {
            if (editData !== null) {
                if (editData.account) {
                    this.setValue(editData.account.registrationpoint);
                }
            }
        }
    });
}

function handleuserchange(id) {
    console.log("User list runs", userlistdata);
    const user = userlistdata.data.find(data => data.id == id);

    if (!id) {
        did('membershipdropdown').classList.add('hidden');
        return;
    }

    did('membershipdropdown').classList.remove('hidden');
    const membershipElement = document.getElementById('membership');
    membershipElement.disabled = false;

    if (user) {
        const activeMemberships = user.membership?.filter(data => data.status === 'ACTIVE') || [];
        const membershipSelect = did("membership").tomselect;
        membershipSelect.clearOptions();
        membershipSelect.addOption({ value: "", text: "--SELECT MEMBER--" });
        activeMemberships.forEach(data => {
            membershipSelect.addOption({ value: data.member, text: data.membername });
        });
        membershipSelect.refreshOptions();
    }

    if (propertyaccountid) {
        membershipElement.disabled = true;
    }
}

function handlememberchange(id) {
    const productSelect = document.getElementById('productid').tomselect;
    productSelect.clear(); // Clear current selection
    productSelect.clearOptions(); // Clear all options

    console.log('id', id);
    if (!id) {
        did('propertyproddropdown').classList.add('hidden');
        return;
    } else {
        did('propertyproddropdown').classList.remove('hidden');
    }

    console.log('product', propertyproduct);
    let filteredProducts
    if (Array.isArray(id) && id.length > 0) {
         filteredProducts = propertyproduct.filter(data => {
            console.log("Data member", data.member && data.member.split('||').map(Number));
            return data.member && data.member.split('||').map(Number).filter(memberId => id.includes(memberId));
        });
        console.log('filteredProducts', filteredProducts);
        productSelect.addOption({ value: '', text: '--SELECT PROPERTY PRODUCT--' });
        filteredProducts.forEach(data => {
            productSelect.addOption({ value: data.id, text: data.product });
        });
        productSelect.refreshOptions(); // Refresh options to update the dropdown
    }
}

async function populateEditFields(accountData) {
    const form = document.querySelector("#propertyaccountform");
    const account = accountData.account;
    const items = accountData.items || [];

    form.querySelector("#accountnumber").value = account.accountnumber || "";
    form.querySelector("#registrationcharge").value = account.registrationcharge || "";
    form.querySelector("#registrationdate").value = formatDate(account.registrationdate.split("T")[0]) || "";
    form.querySelector("#repaymentfrequency").value = account.repaymentfrequency || "";
    form.querySelector("#numberofrepayments").value = account.numberofrepayments || "";
    form.querySelector("#percentagedelivery").value = account.percentagedelivery || "";

    const productSelect = did("productid").tomselect;
    if (productSelect) productSelect.setValue(account.productid || "");

    const userSelect = did("userid").tomselect;
    if (userSelect) userSelect.setValue(account.userid || "");

    const registrationPointSelect = did("registrationpointsearch").tomselect;
    if (registrationPointSelect) registrationPointSelect.setValue(account.registrationpoint || "");

    const accountOfficerSelect = did("accountofficer").tomselect;
    if (accountOfficerSelect) accountOfficerSelect.setValue(account.accountofficer || "");

    // Populate items table
    const tableBody = document.getElementById("tabledata");
    tableBody.innerHTML = items.length
        ? items
              .map(
                  (item, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${item.itemid}</td>
                <td>${item.itemname}</td>
                <td>${item.qty}</td>
                <td>₦${item.price.toFixed(2)}</td>
                <td>
                    <button 
                        title="View Composite item Details" 
                        class="${item.composite == "YES" ? "" : "hidden"} material-symbols-outlined h-8 w-8 rounded-full bg-green-600 text-xs text-white drop-shadow-md" 
                        style="font-size: 18px;"
                        onclick="handleViewDetailsClick('${item.itemid}')">
                        visibility
                    </button>
                    <button class="delete-item-btn material-symbols-outlined h-8 w-8 rounded-full bg-red-600 text-xs text-white drop-shadow-md" 
                        style="font-size: 18px;" 
                        title="Delete Item" 
                        onclick="removeTableRow(this)">delete</button>
                </td>
            </tr>`
              )
              .join("")
        : `<tr><td colspan="100%" class="text-center opacity-70">Table is empty</td></tr>`;
}

async function propertyaccountFormSubmitHandler() {
    const form = document.querySelector('#propertyaccountform');
    const tableBody = document.getElementById('tabledata');
    const rows = Array.from(tableBody.children);

    // Check if the table has any items
    if (rows.length === 0 || (rows.length === 1 && rows[0].children.length === 1)) {
        return Swal.fire({
            icon: 'error',
            title: 'No Items Added',
            text: 'Please add at least one item before submitting.',
        });
    }

    // Create a FormData object
    const formData = new FormData();

    // Append form inputs manually
    const accountNumber = form.querySelector('#accountnumber').value.trim();
    if (accountNumber) {
        formData.append('accountnumber', accountNumber);
    }
    formData.append('productid', form.querySelector('#productid').value.trim() || '');
    formData.append('userid', form.querySelector('#userid').value.trim() || '');
    formData.append('registrationcharge', form.querySelector('#registrationcharge').value.trim() || '');
    formData.append('registrationdate', form.querySelector('#registrationdate').value.trim() || '');
    formData.append('registrationpoint', form.querySelector('#registrationpointsearch').value.trim() || '');
    formData.append('accountofficer', form.querySelector('#accountofficer').value.trim() || '');
    formData.append('repaymentfrequency', form.querySelector('#repaymentfrequency').value.trim() || '');
    formData.append('numberofrepayments', form.querySelector('#numberofrepayments')?.value.trim() || 0); // Optional
    formData.append('percentagedelivery', form.querySelector('#percentagedelivery')?.value.trim() || 0); // Optional
    formData.append('rowsize', rows.length);

    // Append items from the table to the FormData
    rows.forEach((row, index) => {
        const itemId = row.children[1]?.textContent.trim();
        const quantity = row.children[3]?.textContent.trim();
        const price = parseFloat(row.children[4]?.textContent.trim());

        if (itemId && quantity && price) {
            formData.append(`itemid${index + 1}`, itemId);
            formData.append(`qty${index + 1}`, quantity);
            formData.append(`price${index + 1}`, price);
        }
    });

    // Submit the FormData payload
    const confirmed = await Swal.fire({
        title: propertyaccountid ? 'Updating...' : 'Submitting...',
        text: 'Please wait while we process your request.',
        icon: 'info',
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: async () => {
            Swal.showLoading();
            const response = await httpRequest2(
                'api/v1/property/account',
                formData, // Pass the FormData object
                form.querySelector('#submit'),
                'json', // Indicate the content type
                'POST'
            );
            Swal.close();

            if (response.status) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Property account submitted successfully!',
                });
                form.reset();
                tableBody.innerHTML = `<tr><td colspan="100%" class="text-center opacity-70">Table is empty</td></tr>`;
                propertyaccountid = '';
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: response.message || 'Failed to submit the property account.',
                });
            }
        },
    });
}

let propertyproduct
async function populateProductOptions() {
    // Make the API request
    const request = await httpRequest2('api/v1/property/product', null, null, 'json', 'GET');
    
    // Check if the response is successful and has data
    if (request.status && request.data) {
        const productSelect = document.getElementById('productid'); // Get the select element
        
        // Clear existing options
        productSelect.innerHTML = '<option value="">--Select Property Product--</option>';
        propertyproduct = request.data
        // Populate the select element with options
        request.data.map(product => {
            const option = document.createElement('option');
            option.value = product.id; // Set the value as the product ID
            option.textContent = product.product; // Set the visible text as the product name
            productSelect.appendChild(option);
        });
    } else {
        console.error('Failed to fetch property products:', request.message);
    }
}

async  function getregistrationpoint() {
    let request = await httpRequest2(`api/v1/admin/registrationpoints`, null, null, 'json', 'GET');
    if(request.status) {
            document.getElementById('registrationpointsearch').innerHTML = `<option value="0">--SELECT REGISTRATION POINT--</option>`
            document.getElementById('registrationpointsearch').innerHTML += request.data.map(data => `<option value="${data.id}">${data.registrationpoint}</option>`).join('')
        } else {
            document.getElementById('registrationpointsearch').innerHTML = `<option value="">No registration points found</option>`
        return notification('No registration points retrieved')
    }
}

async function populateItemsDropdown() {
    const request = await httpRequest2('api/v1/inventory/getinventory?status=ACTIVE', null, null, 'json', 'GET');
    
    if (request.status && request.data) {
        const itemSelect = document.getElementById('addItem');
        
        // Clear existing options
        itemSelect.innerHTML = '<option value="">--Select item to add--</option>';
        
        // Populate the dropdown with items
        request.data.forEach(item => {
            const option = document.createElement('option');
            option.value = item.itemid; // Set the value as the item ID
            option.textContent = item.itemname; // Set the visible text as the item name
            option.dataset.price = item.pricetwo; // Store the item price as a dataset
            option.dataset.composite = item.composite; // Store the item composite as a dataset
            itemSelect.appendChild(option);
        });
    } else {
        console.error('Failed to fetch inventory items:', request.message);
    }
}

function removeTableRow(button) {
    const row = button.closest('tr');
    row.remove();

    // Recalculate row numbers
    const tableBody = document.getElementById('tabledata');
    Array.from(tableBody.children).forEach((row, index) => {
        row.children[0].textContent = index + 1;
    });

    // If no rows are left, add a placeholder row
    if (tableBody.children.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="100%" class="text-center opacity-70">Table is empty</td></tr>`;
    }
}

async function handleViewDetailsClick(itemId) {
    // Show loading SweetAlert while fetching data
    Swal.fire({
        title: "Loading...",
        text: "Fetching composite item details, please wait.",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
            Swal.showLoading();
        },
    });

    try {
        // Make a GET request to the API
        const request = await httpRequest2(
            "api/v1/property/buildproperty",
            null,
            null,
            "json",
            "GET"
        );

        if (request.status && request.data) {
            // Filter the response to find the matching composite ID
            const compositeData = request.data.find(
                (composite) => composite.compositeid == itemId
            );

            // Check if the composite data exists
            if (compositeData) {
                // Generate HTML content for the composite item's details
                const htmlContent = generateCompositeDetailsHtml(compositeData);

                // Show the details in a SweetAlert
                Swal.fire({
                    title: `Composite Item: ${compositeData.compositename}`,
                    html: htmlContent,
                    showCloseButton: true,
                    confirmButtonText: "Close",
                    confirmButtonColor: "#3085d6",
                    width: "600px",
                    background: "#f4f6f9",
                    customClass: {
                        popup: "modern-swal-popup",
                    },
                });
            } else {
                // If no matching composite data is found
                Swal.fire({
                    icon: "info",
                    title: "No Items Found",
                    text: "This composite item has no associated items.",
                });
            }
        } else {
            // Handle cases where the API response is unsuccessful
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Failed to fetch composite item details. Please try again.",
            });
        }
    } catch (error) {
        // Handle any unexpected errors
        Swal.fire({
            icon: "error",
            title: "Unexpected Error",
            text: "An error occurred while fetching composite item details.",
        });
        console.error(error);
    }
}

async function handleAddButtonClick() {
    const itemSelect = document.getElementById("addItem");
    const quantityInput = document.getElementById("quantity");
    const tableBody = document.getElementById("tabledata");

    const selectedOption = itemSelect.options[itemSelect.selectedIndex];
    const itemId = selectedOption ? selectedOption.value : null;
    const itemName = selectedOption ? selectedOption.textContent : "";
    const itemPrice = selectedOption ? parseFloat(selectedOption.dataset.price) : 0;
    const itemComposite = selectedOption ? selectedOption.dataset.composite : "";
    const quantity = parseInt(quantityInput.value, 10);

    // Validation: Ensure all inputs are valid
    if (!itemId) {
        return Swal.fire({
            icon: "error",
            title: "No Item Selected",
            text: "Please select an item to add.",
        });
    }
    if (!quantity || quantity <= 0) {
        return Swal.fire({
            icon: "error",
            title: "Invalid Quantity",
            text: "Please enter a valid quantity.",
        });
    }

    const totalAmount = (itemPrice * quantity).toFixed(2);

    // Remove the placeholder row if it exists
    const placeholderRow = tableBody.querySelector('tr td[colspan="100%"]');
    if (placeholderRow) {
        placeholderRow.parentElement.remove();
    }

    // Check if the item already exists in the table
    const existingRow = Array.from(tableBody.children).find(
        (row) => row.children[1] && row.children[1].textContent === itemId
    );

    if (existingRow) {
        // Update the existing row if the item already exists
        const existingQuantityCell = existingRow.children[3];
        const existingAmountCell = existingRow.children[4];

        const updatedQuantity =
            parseInt(existingQuantityCell.textContent, 10) + quantity;

        existingQuantityCell.textContent = updatedQuantity;
        existingAmountCell.textContent = (updatedQuantity * itemPrice).toFixed(2);
    } else {
        // Add a new row to the table if the item doesn't already exist
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${tableBody.children.length + 1}</td>
            <td>${itemId}</td>
            <td>${itemName}</td>
            <td>${quantity}</td>
            <td>
                 <button 
                 type="button"
                    title="View Composite item Details" 
                    class="${
                        itemComposite == "YES" ? "" : "hidden"
                    } material-symbols-outlined h-8 w-8 rounded-full bg-green-600 text-xs text-white drop-shadow-md" 
                    style="font-size: 18px;" 
                    onclick="handleViewDetailsClick('${itemId}')">
                    visibility
                </button>
                <button class="delete-item-btn material-symbols-outlined h-8 w-8 rounded-full bg-red-600 text-xs text-white drop-shadow-md" 
                    style="font-size: 18px;" 
                    title="Delete Item" 
                    onclick="removeTableRow(this)">delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    }

    // Reset input fields
    itemSelect.value = "";
    quantityInput.value = "";
}

function generateCompositeDetailsHtml(compositeData) {
    const items = compositeData.items || [];

    // Generate table rows for the items
    const itemsHtml = items.length
        ? items
              .map(
                  (item, idx) => `
            <tr style="background-color: ${idx % 2 === 0 ? "#f9f9f9" : "#fff"};">
                <td style="padding: 10px; text-align: center;">${idx + 1}</td>
                <td style="padding: 10px; text-align: center;">${item.itemid}</td>
                <td style="padding: 10px;">${item.itemidname}</td>
                <td style="padding: 10px; text-align: center;">${item.qty}</td>
                <td style="padding: 10px; text-align: center;">${
                    item.status
                }</td>
            </tr>`
              )
              .join("")
        : `<tr><td colspan="6" style="padding: 10px; text-align: center;">No items found</td></tr>`;

    // Return the full HTML content
    return `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; line-height: 1.6;">
             <div class="table-content" style="margin-bottom: 20px;">
                <table class="table-auto">
                    <thead>
                        <tr>
                            <th style="padding: 10px;">S/N</th>
                            <th style="padding: 10px;">Item ID</th>
                            <th style="padding: 10px;">Item Name</th>
                            <th style="padding: 10px;">Price</th>
                            <th style="padding: 10px;">Quantity</th>
                            <th style="padding: 10px;">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>
              </div>
        </div>`;
}








