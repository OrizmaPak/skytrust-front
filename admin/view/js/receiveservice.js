let receiveserviceid;
let allrsitems;

async function receiveserviceActive() {
    await fetchreceiveservice()
    receiveserviceid = ''
    did('serviceformrs').classList.add('hidden');
    const form = document.querySelector('#managereceiveservice')
    if(form.querySelector('#submit')) form.querySelector('#submit').addEventListener('click', function(event) {
        event.preventDefault();
        receiveserviceFormSubmitHandler();
    });
    did('reference').addEventListener('keyup', e=>{
        if(did('reference').value)did('pullitemsbtn').innerHTML = 'Pull Purchase Order'
        else did('pullitemsbtn').innerHTML = 'New Received Service';
        did('serviceformrs').classList.add('hidden');
    })
    if(did('pullitemsbtn'))did('pullitemsbtn').addEventListener('click', e=>{
        if(did('reference').value){
            fetchserviceorderdetail(did('reference').value)
            did('serviceformrs').classList.remove('hidden')
        }else{
            notification('This option should be utilized exclusively for receiving services that do not have an associated service order.', 2, 20000)
        };
    })
    // datasource = [];
    dynamiccomma(true);
    await getAllSuppliers('supplier');
    await getAllbranch(true, 'branch');
    new TomSelect('#supplier', {
        plugins: ['dropdown_input']
    });
    new TomSelect('#branch', {
        plugins: ['dropdown_input'],
        onInitialize: function() {
            console.log(checkpermission('FILTER BRANCH'))
            if(!checkpermission('FILTER BRANCH')) this.setValue(the_user.branch);
            if(!checkpermission('FILTER BRANCH')) this.setTextboxValue('readonly', true);
            handleBranchChange(this.getValue(), 'departmentfrom');
        },
        onChange: function() {
            handleBranchChange(this.getValue(), 'departmentfrom');
        }
    });
}

async function fetchreceiveservice(id) {

    // Show loading state using SweetAlert
    const loadingAlert = Swal.fire({
        title: 'Please wait...',
        text: 'Fetching receiveservices data, please wait.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    if(!id)document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> Loading... </td>`

    let request = await httpRequest2(`api/v1/purchases/service?${id ? `reference=${id}` : ''}`, null, document.querySelector('#viewrequisitionform #submit'), 'json', 'GET');
    swal.close(); // Close the loading alert once the request is complete
    if(!id)document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> No Records Retrieved </td>`
    if(request.status) {
        if(!id){
            if(request.data.length) {
                datasource = request.data;
                console.log('datasource10', datasource)
                resolvePagination(datasource, onreceiveserviceTableDataSignal);
            }
        } else {
            if(!request.data.length) {
                return notification(`Service order with the reference ${id} cannot be found`, 0, 20000)
            }
            document.getElementsByClassName('updater')[0].click();
            receiveservicesid = request.data[0].id;
            did('serviceformrs').classList.remove('hidden');
            did('supplier').tomselect.setValue(request.data[0].items[0].supplier);
            // did('branch').value = request.data[0].items[0].branch;
            did('departmentfrom').value = request.data[0].items[0].department;
            did('branch').tomselect.setValue(request.data[0].items[0].branch);
            populateData(request.data[0]);
            populateData(request.data[0].items[0]);
            did('tabledata2').innerHTML = '';
            for(let i=0;i<request.data[0].items.length;i++){
                const genid = genID();
                await addrowreceiveservices(genid);
                did(`supplyitem_${genid}`).tomselect.setValue(request.data[0].items[i].itemid);
                did(`qty_${genid}`).value = request.data[0].items[i].qty;
                did(`cost_${genid}`).value = request.data[0].items[i].cost;
                receiveservicesreqcal(did(`cost_${genid}`));
            }
            setTimeout(() => {
                did('departmentfrom').value = request.data[0].items[0].department;
            }, 1000);
        }
    } else {
        return notification('No records retrieved');
    }
}

async function onreceiveserviceTableDataSignal() {
    let rows = getSignaledDatasource().map((data, index) => `
        <tr data-open="false" class="source-row-item">
                                <td> ${index+1} </td>
                                <td> ${data.reference} </td>
                                <td> 
                                    <table>
                                        ${data.services.map((dat, index)=>{
                                            return ( index<3 ?
                                                `
                                            <tr>
                                                <td>${dat.servicetype}</td>
                                                <td style="width: 20px">${formatCurrency(dat.amount)}</td>
                                                <td style="width: 20px">${dat.description}</td>
                                            </tr>
                                            `
                                            :
                                               index==3?`
                                               <tr>
                                                    <td onclick="receiveserviceview(${data.reference})" style="color:green;cursor:pointer">click to view the remaining items ${data.items.length-3} ....</td>
                                                </tr>
                                                `:``
                                            )
                                        }).join('')}
                                    </table> 
                                </td>
                                <td> ${data.suppliername} </td>
                                <td> ${data.branchname} </td>
                                <td> ${formatDate(data.services[0].dateadded.split('T')[0])} </td>

                                <td>
                                    <div class="flex h-full flex-col items-center gap-6">
                                        ${data.services.map((dat, index) =>
                                            `<button title="Reject received service" onclick="rejectReceivedService('${data.reference}', ${dat.id})" 
                                                    class="material-symbols-outlined h-8 w-8 rounded-full bg-red-600 text-xs text-white drop-shadow-md" 
                                                    style="font-size: 18px;">block</button>`
                                        ).join("")}
                                    </div>
                                </td>

    </tr>`
    )
    .join('')
    injectPaginatatedTable(rows)
}

let fetchedOrder = null; // Store the fetched order globally

async function fetchserviceorderdetail(id) {
  if (!id) return;

  Swal.fire({
    title: 'Fetching Service Order',
    text: 'Please wait...',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });

  try {
    const request = await httpRequest2(`api/v1/purchases/serviceorder?reference=${id}`, null, null, 'json', 'GET');
    Swal.close();

    if (!request.status || !request.data.length) {
      return Swal.fire({
        icon: 'error',
        title: 'Not Found',
        text: `No service order found with the reference "${id}".`,
      });
    }

    fetchedOrder = request.data[0]; // Save the fetched order data

    // Populate supplier and branch fields
    document.getElementById('suppliername').value = fetchedOrder.suppliername;
    document.getElementById('branchname').value = fetchedOrder.branchname;

    // Populate the table with services
    const tableBody = document.getElementById('tabledata1');
    tableBody.innerHTML = '';

    fetchedOrder.services.forEach((service, index) => {
      const newRow = document.createElement('tr');
      newRow.dataset.service = JSON.stringify(service); // Store service data in the row

      newRow.innerHTML = `
        <td>${index + 1}</td>
        <td>${service.servicetype}</td>
        <td>${service.description}</td>
        <td><input type="text" class="form-control" value="${service.amountfrom}" readonly></td>
        <td><input type="text" class="form-control" value="${service.amountto}" readonly></td>
        <td><input type="number" id="amount-${index}" class="form-control" placeholder="Enter Amount" value="${service.amount || ''}"></td>
        <td><input type="text" id="otherdetails-${index}" class="form-control" placeholder="Enter Other Details" value="${service.otherdetails || ''}"></td>
      `;
      tableBody.appendChild(newRow);
    });
  } catch (error) {
    Swal.close();
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Failed to fetch service order data. Please try again.',
    });
    console.error('Error fetching service order:', error);
  }
}

async function receiveserviceFormSubmitHandler() {
    if (!fetchedOrder) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No service order data found. Please fetch the service order again.',
      });
      return;
    }
  
    const rows = document.querySelectorAll('#tabledata1 tr');
    const formData = new FormData();
  
    formData.append('reference', fetchedOrder.reference);
    formData.append('supplier', fetchedOrder.services[0].supplier); // Use the supplier ID from the fetched data
    formData.append('branch', fetchedOrder.services[0].branch); // Use the branch ID from the fetched data
    formData.append('rowsize', rows.length);
  
    // Loop through each service and append data
    rows.forEach((row, index) => {
      const service = fetchedOrder.services[index]; // Use the exact service from fetchedOrder
      const amountInput = row.querySelector(`#amount-${index}`);
      const otherDetailsInput = row.querySelector(`#otherdetails-${index}`);
  
      formData.append(`servicetype${index + 1}`, service.servicetype);
      formData.append(`description${index + 1}`, service.description);
      formData.append(`servicestartdate${index + 1}`, service.servicestartdate);
      formData.append(`serviceenddate${index + 1}`, service.serviceenddate);
      formData.append(`amount${index + 1}`, amountInput.value || '');
      formData.append(`amountfrom${index + 1}`, service.amountfrom);
      formData.append(`amountto${index + 1}`, service.amountto);
      formData.append(`otherdetails${index + 1}`, otherDetailsInput.value || '');
      formData.append('tfrom', document.getElementById('paymentMethod').value);
      const voucherFile = document.getElementById('voucher').files[0];
      if (voucherFile) {
        formData.append('voucher', voucherFile);
    }
    });

  // Generate Modal Content
  const modalContent = `
  <div class="rounded-lg bg-white p-5 text-sm text-gray-700 shadow-lg">
    <!-- Title -->
    <h2 class="mb-3 border-b pb-2 text-lg font-semibold text-gray-800">
      Confirm Purchase Order Details
    </h2>

    <!-- Service Details -->
    <div class="grid grid-cols-1 gap-x-4 gap-y-2 bg-blue-100">
      ${fetchedOrder.services
        .map((service, index) => {
          const amount = formData.get(`amount${index + 1}`) || 'N/A';
          const otherDetails = formData.get(`otherdetails${index + 1}`) || 'N/A';
          return `
            <div class="border-b pb-2">
              <h3 class="font-semibold text-gray-800">Service ${index + 1}</h3>
              <dl class="text-sm">
                <div>
                  <dt class="text-gray-500">Service Type</dt>
                  <dd class="font-medium text-gray-800">${service.servicetype || 'N/A'}</dd>
                </div>
                <div>
                  <dt class="text-gray-500">Description</dt>
                  <dd class="font-medium text-gray-800">${service.description || 'N/A'}</dd>
                </div>
                <div>
                  <dt class="text-gray-500">Start Date</dt>
                  <dd class="font-medium text-gray-800">${formatDate(service.servicestartdate.split('T')[0]) || 'N/A'}</dd>
                  </div>
                  <div>
                  <dt class="text-gray-500">End Date</dt>
                  <dd class="font-medium text-gray-800">${formatDate(service.serviceenddate.split('T')[0]) || 'N/A'}</dd>
                </div>
                <div>
                  <dt class="text-gray-500">Amount Entered</dt>
                  <dd class="font-medium text-gray-800">${Number(amount).toLocaleString()}</dd>
                </div>
                <div>
                  <dt class="text-gray-500">Other Details</dt>
                  <dd class="font-medium text-gray-800">${otherDetails}</dd>
                </div>
              </dl>
            </div>
          `;
        })
        .join('')}
    </div>

    <!-- Payment Method -->
    <div class="mt-4">
      <dt class="text-gray-500">Payment Method</dt>
      <dd class="font-medium text-gray-800">${formData.get('tfrom') || 'N/A'}</dd>
    </div>

    <!-- Voucher -->
    <div class="mt-4">
      <dt class="text-gray-500">Voucher Uploaded</dt>
      <dd class="font-medium text-gray-800">${formData.get('voucher') ? 'Yes' : 'No'}</dd>
    </div>

    <!-- Warning Text -->
    <p class="mt-4 text-xs font-semibold text-red-600">
      Please confirm the details.
    </p>
  </div>
  `;

    const userConfirmed = await Swal.fire({
      title: 'Confirm Details',
      html: modalContent,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      width: '80%' // <-- Key for 80% screen width
    });
  
    // Check if payment method is CASH and voucher is not uploaded
    if (document.getElementById('paymentMethod').value === 'CASH' && !document.getElementById('voucher').files.length) {
      await Swal.fire({
        title: 'Voucher Required',
        text: 'Please upload a voucher for cash payments.',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#3085d6'
      });
      return dynamiccomma(true);
    }
    
    if (!userConfirmed.isConfirmed) {
      return dynamiccomma(true);
    }
  
    // Show a second confirmation modal
    const legalConfirmation = await Swal.fire({
      title: 'Legal Confirmation',
      text: 'By confirming, you acknowledge that you will be legally held responsible for any incorrect data and confirm that all details are entered correctly.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'I Agree',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      // width: '80%'
    });
  
    if (!legalConfirmation.isConfirmed) {
      return dynamiccomma(true);
    }

    const pinStatus = await getAndVerifyPin();
    if(!pinStatus) return;
  
    try {
      Swal.fire({
        title: 'Submitting...',
        text: 'Please wait while we process your request.',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });
  
      const response = await httpRequest2('api/v1/purchases/service', formData, null, 'json', 'POST');
      Swal.close();
  
      if (response.status) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Service received successfully.',
        });
        fetchreceiveservice(); // Refresh the view table
        receiveserviceActive();
        document.getElementsByClassName('viewer')[0].click();
        did('reference').setValue = '';
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: response.message || 'Failed to receive the service.',
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An unexpected error occurred. Please try again.',
      });
      console.error('Error submitting service:', error);
    }
  }

  async function rejectReceivedService(reference, serviceId) {
    // Step 1: Confirm rejection
    const confirmReject = await Swal.fire({
      title: 'Are you sure?',
      text: `You are about to reject the service with reference "${reference}".`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, reject it!',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
    });
  
    if (!confirmReject.isConfirmed) return;
  
    // Step 2: Ask for responsibility
    const responsibility = await Swal.fire({
      title: 'Who is responsible for this rejection?',
      text: 'Select the responsible party:',
      icon: 'question',
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: 'Supplier',
      denyButtonText: 'Staff/Member',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#3085d6',
      denyButtonColor: '#6c757d',
      cancelButtonColor: '#d33',
    });
  
    if (responsibility.dismiss === Swal.DismissReason.cancel) return;
  
    const isSupplier = responsibility.isConfirmed; // If true, supplier is selected
    let responsibleId = null;
  
    // Step 3: Dropdown for responsible party
    const options = isSupplier
      ? await getAllSuppliersOptions()
      : await getAllStaffOptions();
    const responsibleParty = await Swal.fire({
      title: `Select ${isSupplier ? 'Supplier' : 'Staff/Member'}`,
      input: 'select',
      inputOptions: options,
      inputPlaceholder: `Select a ${isSupplier ? 'supplier' : 'staff/member'}`,
      showCancelButton: true,
      confirmButtonText: 'Next',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      inputValidator: (value) => {
        if (!value) return `You need to select a ${isSupplier ? 'supplier' : 'staff/member'}!`;
      },
    });
  
    if (!responsibleParty.isConfirmed) return;
  
    responsibleId = responsibleParty.value; // Selected responsible party ID
  
    // Step 4: Collect amount and issue description
    const details = await Swal.fire({
      title: 'Provide Additional Details',
      html: `
        <label for="amountInput">Amount:</label>
        <input type="number" id="amountInput" class="swal2-input" placeholder="Enter amount" required>
        <label for="issueInput">Description:</label>
        <textarea id="issueInput" class="swal2-textarea" placeholder="Describe the issue" required></textarea>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Submit',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      preConfirm: () => {
        const amount = Swal.getPopup().querySelector('#amountInput').value;
        const issue = Swal.getPopup().querySelector('#issueInput').value;
        if (!amount || !issue) {
          Swal.showValidationMessage(`Both amount and issue description are required.`);
        }
        return { amount, issue };
      },
    });
  
    if (!details.isConfirmed) return;
  
    const { amount, issue } = details.value;
  
    // Step 5: Submit the data
    try {
      const payload = new FormData();
      payload.append('id', serviceId); // Service ID
      payload.append(isSupplier ? 'supplier' : 'staff', responsibleId); // Responsible ID
      payload.append('amount', amount); // Amount
      payload.append('issue', issue); // Issue description
  
      Swal.fire({
        title: 'Submitting...',
        text: 'Please wait while we process your request.',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });
    
      const response = await httpRequest2('api/v1/expense/rejectservice', payload, null, 'json', 'POST');
      Swal.close();
  
      if (response.status) {
        Swal.fire('Rejected!', 'The service has been rejected successfully.', 'success');
        fetchreceiveservice(); // Refresh table after rejection
      } else {
        Swal.fire('Error!', response.message || 'Failed to reject the service.', 'error');
      }
    } catch (error) {
      Swal.fire('Error!', 'An unexpected error occurred while rejecting the service.', 'error');
      console.error('Error rejecting service:', error);
    }
  }
  
  // Helper to fetch supplier options
  async function getAllSuppliersOptions() {
    const request = await httpRequest2('api/v1/purchases/supplier', null, null, 'json', 'GET');
    if (request.status && request.data) {
      return request.data.reduce((options, supplier) => {
        options[supplier.id] = supplier.supplier; // Map ID to Supplier Name
        return options;
      }, {});
    }
    return {};
  }
  
  async function getAllStaffOptions() {
    try {
      const request = await httpRequest2('api/v1/members/userregistration', null, null, 'json', 'GET');
      if (request.status && request.data) {
        return request.data.reduce((options, staff) => {
          options[staff.id] = `${staff.firstname} ${staff.lastname}`; // Map ID to Full Name
          return options;
        }, {});
      }
      return {};
    } catch (error) {
      console.error('Error fetching staff/members:', error);
      Swal.fire('Error!', 'Failed to fetch staff/members. Please try again later.', 'error');
      return {};
    }
  }