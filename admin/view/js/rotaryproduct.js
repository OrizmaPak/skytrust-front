let rotaryproductid
async function rotaryproductActive() {
    rotaryproductid = ''
    const form = document.querySelector('#rotaryproductform')
    if(form.querySelector('#submit')) form.querySelector('#submit').addEventListener('click', rotaryproductFormSubmitHandler)
    if(did('rotaryschedule'))did('rotaryschedule').addEventListener('change', e=>{
        if(did('rotaryschedule').value == 'PRODUCT'){
            did('scheduler').classList.remove('hidden');
        }else{
            did('scheduler').classList.add('hidden');
        }
    })
    datasource = []
    await fetchrotaryproduct()
    Promise.all([
        getallmemberships("membership"),
        getAllUsers("productofficer", "name"),
      ])
    .then(() => {
        // All promises resolved
        new TomSelect("#membership", {
        plugins: ["dropdown_input", "remove_button"],
        });
        new TomSelect("#productofficer", {
        plugins: ["dropdown_input"],
        });
    })
    .catch((error) => {
        console.error("Error in fetching data:", error);
    });
  
}

async function fetchrotaryproduct(id) {

    // Show loading state using SweetAlert
    const loadingAlert = Swal.fire({
        title: 'Please wait...',
        text: 'Fetching rotaryproduct data, please wait.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    
    if(!id)document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> Loading... </td>`

    let request = await httpRequest2(`api/v1/rotary/product?${id ? `id=${id}` : ''}`, null, document.querySelector('#viewrequisitionform #submit'), 'json', 'GET');
    swal.close(); // Close the loading alert once the request is complete
    if(!id)document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> No Records Retrieved </td>`
    if(request.status) {
        if(!id){
            if(request.data.length) {
                datasource = request.data
                resolvePagination(datasource, onrotaryproductTableDataSignal);
            }
        } else {
            document.getElementsByClassName('updater')[0].click();
            rotaryproductid = request.data[0].id;
            populateData(request.data[0]);
            if (request.data[0].member.includes("||")) {
                did("membership").tomselect.setValue(request.data[0].member.split("||"));
              } else {
                did("membership").tomselect.setValue(request.data[0].member);
              }
              if(request.data[0].rotaryschedule == 'PRODUCT') {
                did('scheduler').classList.remove('hidden');
              }else{
                did('scheduler').classList.add('hidden');
              }
        }
    } else {
        return notification('No records retrieved');
    }
}

async function removerotaryproduct(id) {
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
        fetchrotaryproduct();
        return notification(confirmed.value.message);
    }
}


async function onrotaryproductTableDataSignal() {
    let rows = getSignaledDatasource().map((item, index) => `
    <tr>
        <td>${index + 1}</td>
        <td>${item.product}</td>
        <td>${item.description}</td>
        <td>
        <ul>
        ${item.membername&&item.membername.split(',').map(name => `<li>${name.trim()}</li>`).join('')}
        </ul>
        </td>
        <td>${item.status}</td>
        <td>${formatDate(item.dateadded.split("T")[0])}</td>
        <td>${item.productofficername}</td>
        <td class="flex gap-3 items-center">
            <button title="Edit row entry" onclick="viewrotaryproduct('${item.id}')" class="w-8 h-8 text-xs text-white rounded-full drop-shadow-md material-symbols-outlined bg-green-600" style="font-size: 18px;">visibility</button>
            <button title="Edit row entry" onclick="fetchrotaryproduct('${item.id}')" class="w-8 h-8 text-xs text-white rounded-full drop-shadow-md material-symbols-outlined bg-primary-g" style="font-size: 18px;">edit</button>
            <button title="Delete row entry" onclick="removerotaryproduct('${item.id}')" class="hidden w-8 h-8 text-xs text-white bg-red-600 rounded-full drop-shadow-md material-symbols-outlined" style="font-size: 18px;">delete</button>
        </td>
    </tr>`
    )
    .join('')
    injectPaginatatedTable(rows)
}

async function viewrotaryproduct(id) {
    // Filter the datasource to find the product with the given id
    const thedata = datasource.find(item => item.id == id);

    if (!thedata) {
        return Swal.fire({
            icon: 'error',
            title: 'Rotary Product Not Found',
            text: `No rotary product found with ID ${id}.`,
        });
    }

    try {
        // Format the date to a readable format
        const formattedDate = new Date(thedata.dateadded).toLocaleString();

        // Construct the HTML content for the SweetAlert modal
        const content = `
            <div class="p-6 min-h-screen bg-gray-50">
                <!-- General Information Section -->
                <section class="p-5 mb-12 rounded-sm shadow-sm section bg-white/90 xl:p-10">
                    <h2 class="mb-4 text-lg font-semibold">General Information</h2>
                    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <div class="form-group">
                            <label class="control-label">Product</label>
                            <div class="text-sm text-gray-700">${thedata.product}</div>
                        </div>
                        <div class="form-group">
                            <label class="control-label">Description</label>
                            <div class="text-sm text-gray-700">${thedata.description ?? "N/A"}</div>
                        </div>
                        <div class="form-group">
                            <label class="control-label">Registration Charge</label>
                            <div class="text-sm text-gray-700">${thedata.registrationcharge ?? "N/A"}</div>
                        </div>
                        <div class="form-group">
                            <label class="control-label">Currency</label>
                            <div class="text-sm text-gray-700">${thedata.currency ?? "N/A"}</div>
                        </div>
                        <div class="form-group">
                            <label class="control-label">Status</label>
                            <div class="text-sm text-gray-700">${thedata.status}</div>
                        </div>
                        <div class="form-group">
                            <label class="control-label">Date Added</label>
                            <div class="text-sm text-gray-700">${formattedDate}</div>
                        </div>
                    </div>
                </section>

                <!-- Membership Section -->
                <section class="p-5 mb-12 rounded-sm shadow-sm section bg-white/90 xl:p-10">
                    <h2 class="mb-4 text-lg font-semibold">Membership</h2>
                    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <div class="form-group">
                            <label class="control-label">Membership Names</label>
                            <div class="text-sm text-gray-700">
                                <ul class="list-disc pl-6">
                                    ${thedata.membername.split(',').map(name => `<li>${name.trim()}</li>`).join('')}
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Rotary Schedule Section -->
                <section class="p-5 mb-12 rounded-sm shadow-sm section bg-white/90 xl:p-10">
                    <h2 class="mb-4 text-lg font-semibold">Rotary Schedule</h2>
                    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <div class="form-group">
                            <label class="control-label">Rotary Schedule</label>
                            <div class="text-sm text-gray-700">${thedata.rotaryschedule ?? "N/A"}</div>
                        </div>
                        <div class="form-group">
                            <label class="control-label">Repayment Frequency (Click to Decode)</label>
                            <div 
                                id="repaymentfrequencyview-${thedata.id}" 
                                onclick="codemeaning('repaymentfrequencyview-${thedata.id}', false)"
                                class="text-sm font-bold text-orange-700 cp"
                            >
                                ${thedata.frequency ?? "N/A"}
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="control-label">Frequency Number</label>
                            <div class="text-sm text-gray-700">${thedata.frequencynumber ?? "N/A"}</div>
                        </div>
                    </div>
                </section>

                <!-- Additional Information Section -->
                <section class="p-5 mb-12 rounded-sm shadow-sm section bg-white/90 xl:p-10">
                    <h2 class="mb-4 text-lg font-semibold">Additional Information</h2>
                    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <div class="form-group">
                            <label class="control-label">Created By</label>
                            <div class="text-sm text-gray-700">${thedata.productofficername}</div>
                        </div>
                    </div>
                </section>
            </div>
        `;

        // Show the SweetAlert modal with the rotary product details
        Swal.fire({
            title: 'Rotary Product Details',
            html: content,
            width: '80%',
            showCloseButton: true,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Close',
            confirmButtonColor: '#3085d6',
            customClass: {
                container: 'rotaryproduct-details-modal'
            }
        });
    } catch (error) {
        console.error("Error loading rotary product:", error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'An error occurred while loading the rotary product details.',
        });
    }
}


async function rotaryproductFormSubmitHandler() {
    if(!validateForm('rotaryproductform', getIdFromCls('comp'))) return
    
    let payload = getFormData2(
        document.querySelector("#rotaryproductform"),
        rotaryproductid
          ? [
              ["id", rotaryproductid],
              ["member", getmultivalues("membership", "||")],
            ]
          : [
              ["member", getmultivalues("membership", "||")],
            ]
      );
    
      const confirmed = await Swal.fire({
        title: rotaryproductid ? "Updating..." : "Submitting...",
        text: "Please wait while we submit your data.",
        icon: "info",
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: async () => {
          Swal.showLoading();
          let request = await httpRequest2(
            "api/v1/rotary/product",
            payload,
            document.querySelector("#rotaryproductform #submit"),
            "json",
            "POST"
          );
          Swal.close();
    
          if (request.status) {
            notification("Success!", 1);
            const form = document.querySelector("#rotaryproductform");
            form.reset();
            if (rotaryproductid)
              form
                .querySelectorAll("input, select, textarea")
                .forEach((input) => (input.value = ""));
            rotaryproductid = "";
            document.getElementsByClassName("viewer")[0].click();
            fetchrotaryproduct();
          } else {
            notification(request.message, 0);
          }
        },
      });
    }