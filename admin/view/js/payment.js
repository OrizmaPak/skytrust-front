let paymentid
async function paymentActive() {
    paymentid = ''
    const form = document.querySelector('#paymentform')
    const form2 = document.querySelector('#viewpaymentform')
    if(form.querySelector('#submit')) form.querySelector('#submit').addEventListener('click', paymentFormSubmitHandler)
    if(form2.querySelector('#querySubmit')) form2.querySelector('#querySubmit').addEventListener('click', paymentFormSubmitHandler)
    datasource = []
    await fetchpayment()
    // await getAllpayment(true)
    // new TomSelect('#payment', {
    //     // plugins: ['remove_button'],
    //     onInitialize: function() {
    //         console.log(checkpermission('FILTER payment'))
    //         if(!checkpermission('FILTER payment')) this.setValue(the_user.payment);
            // if(!checkpermission('FILTER payment')) this.setTextboxValue('readonly', true);
    //     }
    // });
    // await getAllUsers('useridlist', 'id')
}

async function fetchpayment(id) {

    // Show loading state using SweetAlert
    const loadingAlert = Swal.fire({
        title: 'Please wait...',
        text: 'Fetching payment data, please wait.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    let form = document.querySelector('#viewpaymentform');
    let formData = new FormData(form);
    // formData.set('department', '');
    // formData.set('payment', '');
    let queryParams = new URLSearchParams(formData).toString();

    if(!id)document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> Loading... </td>`

    let request = await httpRequest2(`api/v1/inventory/requisition/view?${queryParams ? `${queryParams}` : ''}${id ? `&id=${id}` : ''}`, null, document.querySelector('#viewrequisitionform #submit'), 'json', 'GET');
    swal.close(); // Close the loading alert once the request is complete
    if(!id)document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> No Records Retrieved </td>`
    if(request.status) {
        if(!id){
            if(request.data.length) {
                datasource = request.data
                resolvePagination(datasource, onpaymentTableDataSignal);
            }
        } else {
            document.getElementsByClassName('updater')[0].click();
            paymentid = request.data[0].id;
            populateData(request.data[0]);
        }
    } else {
        return notification('No records retrieved');
    }
}

async function removepayment(id) {
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
        fetchpayment();
        return notification(confirmed.value.message);
    }
}


async function onpaymentTableDataSignal() {
    let rows = getSignaledDatasource().map((item, index) => `
    <tr>
        <td>${index + 1}</td>
        <td>${item.payment}</td>
        <td>${item.useridname??item.userid}</td>
        <td>${item.country}</td>
        <td>${item.state}</td>
        <td>${item.lga}</td>
        <td>${item.address}</td>
        <td class="flex items-center gap-3 ${item.payment == default_payment ? 'hidden' : ''}">
            <button title="Edit row entry" onclick="fetchpayment('${item.id}')" class="material-symbols-outlined h-8 w-8 rounded-full bg-primary-g text-xs text-white drop-shadow-md" style="font-size: 18px;">edit</button>
            <button title="Delete row entry" onclick="removepayment('${item.id}')" class="material-symbols-outlined hidden h-8 w-8 rounded-full bg-red-600 text-xs text-white drop-shadow-md" style="font-size: 18px;">delete</button>
        </td>
    </tr>`
    )
    .join('')
    injectPaginatatedTable(rows)
}

async function paymentFormSubmitHandler() {
  if (!validateForm('paymentform', getIdFromCls('comp'))) return;

  const form = document.querySelector('#paymentform');

  // Manually create payload by extracting values from the form fields
  let formData = new FormData();
  formData.append('accountnumber', form.querySelector('#accountnumber').value);
  formData.append('ttype', form.querySelector('#ttype').value);
  formData.append('transactiondate', new Date().toISOString());
  formData.append('currency', 'NGN'); // Automatically set to NGN
  formData.append('tfrom', 'BANK'); // Automatically set to BANK
  formData.append('tax', false); // Automatically set to false
  formData.append('description', form.querySelector('#transactiondesc')?.value || 'General transaction');
  formData.append('reference', '');
  formData.append('transactiondesc', form.querySelector('#transactiondesc').value || '');

  // Add credit or debit based on transaction type
  const amount = parseFloat(form.querySelector('#amount').value) || 0;
  if (formData.get('ttype') === 'CREDIT') {
    formData.append('credit', amount);
    formData.append('debit', 0);
  } else if (formData.get('ttype') === 'DEBIT') {
    formData.append('debit', amount);
    formData.append('credit', 0);
  }

  try {
    const confirmed = await Swal.fire({
      title: 'Submitting...',
      text: 'Please wait while we submit your data.',
      icon: 'info',
      showConfirmButton: false,
      allowOutsideClick: false,
      didOpen: async () => {
        Swal.showLoading();

        // Send the request with complete payload
        let request = await httpRequest2(
          'api/v1/payment/',
          formData,
          form.querySelector('#submit'),
          'json',
          'POST'
        );

        Swal.close();

        if (request && request.status) {
          notification('Success!', 1);
          form.reset();
          // fetchpayment();
        } else {
          notification(request ? request.message : 'Request failed', 0);

        }
      }
    });
  } catch (error) {
    console.error('Error submitting payment form:', error);
    notification('An error occurred while submitting the form. Please try again.', 0);
  }
}

  
  
  
  