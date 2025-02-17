let loanproductid;
async function loanproductActive() {
  loanproductid = "";
  const form = document.querySelector("#loanproductform");
  if (form.querySelector("#submit"))
    form
      .querySelector("#submit")
      .addEventListener("click", loanproductFormSubmitHandler);
  datasource = [];
  await fetchloanproduct(),
    Promise.all([
      getallmemberships("membership"),
      getAllbranch(false, "excludebranch"),
      getAllUsers("productofficer", "name"),
      getfees(),
    ])
      .then(() => {
        // All promises resolved
        new TomSelect("#membership", {
          plugins: ["dropdown_input", "remove_button"],
        });
        new TomSelect("#excludebranch", {
          plugins: ["dropdown_input", "remove_button"],
        });
        new TomSelect("#productofficer", {
          plugins: ["dropdown_input"],
        });
      })
      .catch((error) => {
        console.error("Error in fetching data:", error);
      });

  const filterform = document.querySelector("#loanproductfilterform");
  if (filterform.querySelector("#filter2"))
    filterform
      .querySelector("#filter2")
      .addEventListener("click", async (e) => {
        await fetchloanproduct();
      });
  // await fetchloanproduct()
  // new TomSelect('#loanproduct', {
  //     // plugins: ['remove_button'],
  //     onInitialize: function() {
  //         console.log(checkpermission('FILTER loanproduct'))
  //         if(!checkpermission('FILTER loanproduct')) this.setValue(the_user.loanproduct);
  // if(!checkpermission('FILTER loanproduct')) this.setTextboxValue('readonly', true);
  //     }
  // });
  // await getAllUsers('useridlist', 'id')
  did("repaymentsettings").addEventListener("change", (e) => {
    if (did("repaymentsettings").value == "PRODUCT")
      did("repayment-details").classList.remove("hidden");
    else did("repayment-details").classList.add("hidden");
  });
  did("interestmethod").addEventListener("change", (e) => {
    if (did("interestmethod").value == "NO INTEREST")
      did("interestpenalty").classList.add("hidden");
    else did("interestpenalty").classList.remove("hidden");
  });
  const eligibilityCategory = document.getElementById(
    "eligibilityproductcategory"
  );
  const eligibilityProduct = document.getElementById("eligibilityproduct");

  eligibilityCategory.addEventListener("change", function () {
    // toggleEligibilityFields(this.value);
    const category = this.value;
    eligibilityProduct.innerHTML =
      '<option value="0">-- Select Eligibility Product --</option>'; // Reset options

    if (category) {
      // Fetch eligibility products from the server or define them here
      const products = getEligibilityProducts(category); // Implement this function

      products.forEach((product) => {
        const option = document.createElement("option");
        option.value = product.id;
        option.textContent = product.productname;
        eligibilityProduct.appendChild(option);
      });
    }
  });

  function getEligibilityProducts(category) {
    // Example static data; replace with actual data fetching logic
    const data = {
      LOAN: eligibilityloans,
      SAVINGS: eligibilitysavings,
    };
    return data[category] || [];
  }
}

async function getfees() {
  let request = await httpRequest2(
    `api/v1/loan/fee`,
    null,
    null,
    "json",
    "GET"
  );
  if (request.status) {
    did(
      "defaultpenaltyid"
    ).innerHTML = `<option value="">-- Select Default Penalty ID --</option>`;
    did("defaultpenaltyid").innerHTML += request.data
      .filter((data) => data.status == "ACTIVE")
      .filter((data) => data.feemethod == "PENALTY")
      .map((data) => `<option value="${data.id}">${data.feename}</option>`)
      .join("");
  } else return notification("No records on fees retrieved");
}

async function fetchloanproduct(id) {
  // Show loading state using SweetAlert
  const loadingAlert = Swal.fire({
    title: "Please wait...",
    text: "Fetching loan product data, please wait.",
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });
  let form = document.querySelector("#loanproductfilterform");
  let formData = new FormData(form);
  let queryParams = new URLSearchParams(formData).toString();
  console.log("Query Parameters: ", queryParams);

  if (!id)
    document.getElementById(
      "tabledata"
    ).innerHTML = `<td colspan="100%" class="text-center opacity-70"> Loading... </td>`;

  let request = await httpRequest2(
    `api/v1/loan/product?${queryParams ? `${queryParams}` : ""}${
      id ? `&id=${id}` : ""
    }`,
    null,
    document.querySelector("#viewloanproductdraft #submit"),
    "json",
    "GET"
  );
  swal.close(); // Close the loading alert once the request is complete
  if (!id) {
    document.getElementById(
      "tabledata"
    ).innerHTML = `<td colspan="100%" class="text-center opacity-70"> No Records Retrieved </td>`;
    document.getElementById(
      "tabledata2"
    ).innerHTML = `<td colspan="100%" class="text-center opacity-70"> No Records Retrieved </td>`;
  }
  if (request.status) {
    if (!id) {
      eligibilityloans = request.data;
      eligibilitysavings = request.data;
      if (request.data.length) {
        datasource = request.data;
        console.log('datasource toper', datasource)
        if (datasource.filter((data) => data.status == "ACTIVE").length > 0) {
          resolvePagination(
            datasource.filter((data) => data.status == "ACTIVE"),
            onloanproductTableDataSignal
          );
        }
        console.log('datasource top', datasource)
        did("tabledata2").innerHTML = eligibilityloans
          .filter((data) => data.status != "ACTIVE")
          .map(
            (item, index) => `
             <tr>
               <td>${index + 1}</td>
                <td>${item.productname}</td>
                <td>${item.description}</td>
                <td>${
                  item.membershipnames && item.membershipnames.includes("||")
                    ? item.membershipnames.replaceAll("||", ", ")
                    : item.membershipnames ??
                      `<span class="text-red-600">No Membership</span>`
                }</td>
                <td>${item.currency}</td>
                <td>${item.repaymentsettings}</td>
                <td>${item.interestmethod}</td>
                <td>${item.interestrate}</td>
                <td>${
                  item.defaultpenaltyid ? item.penaltyDetails.feename : ""
                }</td>
                <td style="color: ${
                  item.status === "ACTIVE" ? "green" : "red"
                };">${item.status}</td>
            <td class="flex gap-3 items-center">
            <button title="Approve" onclick="approvedeclineloanproduct('${
              item.id
            }', 'ACTIVE')" class="w-8 h-8 text-xs text-white bg-green-600 rounded-full drop-shadow-md material-symbols-outlined" style="font-size: 18px;">verified</button>
            <button title="Decline" onclick="approvedeclineloanproduct('${
              item.id
            }', 'DECLINED')" class="material-symbols-outlined ${
              item.status == "PENDING APPROVAL" ? "" : "hidden"
            } h-8 w-8 rounded-full bg-red-600 text-xs text-white drop-shadow-md" style="font-size: 18px;">block</button>
        </td>
        </tr>
              `
          )
          .join("");
      }
    } else {
      document.getElementsByClassName("updater")[0].click();
      const thedata = request.data.filter((item) => item.id == id)[0];
      loanproductid = thedata.id;
      toggleEligibilityFields(thedata.eligibilityproductcategory);
      const eligibilityCategory = document.getElementById(
        "eligibilityproductcategory"
      );
      const eligibilityProduct = document.getElementById("eligibilityproduct");

      const category = thedata.eligibilityproductcategory;
      eligibilityProduct.innerHTML =
        '<option value="0">-- Select Eligibility Product --</option>'; // Reset options

      if (category) {
        // Fetch eligibility products from the server or define them here
        const products = getEligibilityProducts(category); // Implement this function

        products.forEach((product) => {
          const option = document.createElement("option");
          option.value = product.id;
          option.textContent = product.productname;
          eligibilityProduct.appendChild(option);
        });
      }
      function getEligibilityProducts(category) {
        // Example static data; replace with actual data fetching logic
        const data = {
          LOAN: eligibilityloans,
          SAVINGS: eligibilitysavings,
        };
        return data[category] || [];
      }
      populateData(thedata);
      if (thedata.membership.includes("||")) {
        did("membership").tomselect.setValue(thedata.membership.split("||"));
      } else {
        did("membership").tomselect.setValue(thedata.membership);
      }
      if (thedata.excludebranch.includes("||")) {
        did("excludebranch").tomselect.setValue(
          thedata.excludebranch.split("||")
        );
      } else {
        did("excludebranch").tomselect.setValue(thedata.excludebranch);
      }
      if (did("repaymentsettings").value == "PRODUCT")
        did("repayment-details").classList.remove("hidden");
      else did("repayment-details").classList.add("hidden");
      if (did("interestmethod").value == "NO INTEREST")
        did("interestpenalty").classList.add("hidden");
      else did("interestpenalty").classList.remove("hidden");
    }
  } else {
    return notification("No records retrieved");
  }
}

async function approvedeclineloanproduct(id, state) {
  const confirmed = await Swal.fire({
    title: "Are you sure you want to proceed with this action?",
    text:
      state == "ACTIVE"
        ? "This action will activate the product."
        : "This action will deactivate the product.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, change it!",
    showLoaderOnConfirm: true,
    preConfirm: async () => {
      function getParams() {
        let params = new FormData();
        params.append("id", id);
        params.append("status", state);
        return params;
      }

      let request = await httpRequest2(
        "api/v1/loan/approvedeclineproduct",
        id ? getParams() : null,
        null,
        "json"
      );
      if (request.status) {
        notification(request.message, 1);
      } else {
        notification(request.message, 0);
      }
      return fetchloanproduct();
    },
    allowOutsideClick: () => !Swal.isLoading(),
  });
}

async function removeloanproduct(id) {
  // Ask for confirmation using SweetAlert with async and loader
  const confirmed = await Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!",
    showLoaderOnConfirm: true,
    preConfirm: async () => {
      function getparamm() {
        let paramstr = new FormData();
        paramstr.append("id", id);
        return paramstr;
      }

      let request = await httpRequest2(
        "../controllers/removevisacountries",
        id ? getparamm() : null,
        null,
        "json"
      );
      return request;
    },
    allowOutsideClick: () => !Swal.isLoading(),
  });

  // Show notification based on the result
  if (confirmed.isConfirmed) {
    fetchloanproduct();
    return notification(confirmed.value.message);
  }
}

async function onloanproductTableDataSignal() {
  let rows = getSignaledDatasource()
    .map(
      (item, index) => `
     <tr>
        <td>${index + 1}</td>
        <td>${item.productname}</td>
        <td>${item.description}</td>
        <td>${
          item.membershipnames && item.membershipnames.includes("||")
            ? item.membershipnames.replaceAll("||", ", ")
            : item.membershipnames ??
              `<span class="text-red-600">No Membership</span>`
        }</td>
        <td>${item.currency}</td>
        <td>${item.repaymentsettings}</td>
        <td>${item.interestmethod}</td>
        <td>${item.interestrate}</td>
        <td>${item.defaultpenaltyid ? item.penaltyDetails.feename : ""}</td>
        <td style="color: ${item.status === "ACTIVE" ? "green" : "red"};">${
        item.status
      }</td>
        <td class="flex gap-3 items-center">
            <button title="View product" onclick="viewLoanProduct('${
              item.id
            }')" class="w-8 h-8 text-xs text-white bg-green-600 rounded-full drop-shadow-md material-symbols-outlined" style="font-size: 18px;">visibility</button>
            <button title="Edit product" onclick="fetchloanproduct('${
              item.id
            }')" class="w-8 h-8 text-xs text-white bg-blue-600 rounded-full drop-shadow-md material-symbols-outlined" style="font-size: 18px;">edit</button>
                  <button title="Decline" onclick="approvedeclineloanproduct('${
                    item.id
                  }', 'DECLINED')" class="material-symbols-outlined ${
        item.status == "PENDING APPROVAL" ? "" : ""
      } h-8 w-8 rounded-full bg-red-600 text-xs text-white drop-shadow-md" style="font-size: 18px;">block</button>
        </td>
    </tr>`
    )
    .join("");
  injectPaginatatedTable(rows);
}

async function viewLoanProduct(id) {
  // Filter the datasource to find the product with the given id
  const product = datasource.find((item) => item.id == id);

  if (!product) {
    return Swal.fire({
      title: "Error",
      text: "Product not found.",
      icon: "error",
      confirmButtonText: "OK",
      confirmButtonColor: "#3085d6",
    });
  }

  try {
    // If you need to fetch additional info, do it here. For demonstration, we assume
    // everything needed is in `product` including the `penaltyDetails`.

    // Construct the HTML content for the SweetAlert modal
    const productDetails = `
            <div class="p-6 min-h-screen bg-gray-50">
                <h1 class="mb-8 text-3xl font-bold text-gray-800">${
                  product.productname
                }</h1>
                
                <!-- General Information Section -->
                <section class="p-5 mb-12 rounded-sm shadow-sm section bg-white/90 xl:p-10">
                    <h2 class="mb-4 text-lg font-semibold">General Information</h2>
                    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <div class="form-group">
                            <label class="control-label">Product ID</label>
                            <div class="text-sm text-gray-700">${
                              product.id
                            }</div>
                        </div>
                        <div class="form-group">
                            <label class="control-label">Product Name</label>
                            <div class="text-sm text-gray-700">${
                              product.productname
                            }</div>
                        </div>
                        <div class="form-group">
                            <label class="control-label">Description</label>
                            <div class="text-sm text-gray-700">${
                              product.description ?? "N/A"
                            }</div>
                        </div>
                        <div class="form-group">
                            <label class="control-label">Registration Charge</label>
                            <div class="text-sm text-gray-700">${
                              product.registrationcharge ?? "N/A"
                            }</div>
                        </div>
                        <div class="form-group">
                            <label class="control-label">Status</label>
                            <div class="text-sm text-gray-700">${
                              product.status ?? "N/A"
                            }</div>
                        </div>
                        <div class="form-group">
                            <label class="control-label">Currency</label>
                            <div class="text-sm text-gray-700">${
                              product.currency ?? "N/A"
                            }</div>
                        </div>
                        <div class="form-group">
                            <label class="control-label">Minimum Loan</label>
                            <div class="text-sm text-gray-700">${
                              product.minimumloan ?? "N/A"
                            }</div>
                        </div>
                        <div class="form-group">
                            <label class="control-label">Maximum Loan</label>
                            <div class="text-sm text-gray-700">${
                              product.maximumloan ?? "N/A"
                            }</div>
                        </div>
                    </div>
                </section>
                
                <!-- Repayment Settings Section -->
                <section class="p-5 mb-12 rounded-sm shadow-sm section bg-white/90 xl:p-10">
                    <h2 class="mb-4 text-lg font-semibold">Repayment Settings</h2>
                    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <div class="form-group">
                            <label class="control-label">Repayment Settings</label>
                            <div class="text-sm text-gray-700">${
                              product.repaymentsettings
                            }</div>
                        </div>
                        <div class="form-group">
                            <label class="control-label">Repayment Frequency (Click to Decode)</label>
                            <div 
                                id="repaymentfrequencyview-${product.id}" 
                                onclick="codemeaning('repaymentfrequencyview-${
                                  product.id
                                }', false)"
                                class="text-sm font-bold text-orange-700 cp"
                            >
                                ${product.repaymentfrequency}
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="control-label">Number of Repayments</label>
                            <div class="text-sm text-gray-700">${
                              product.numberofrepayments ?? "N/A"
                            }</div>
                        </div>
                        <div class="form-group">
                            <label class="control-label">Duration</label>
                            <div class="text-sm text-gray-700">${
                              product.duration ?? "N/A"
                            } ${product.durationcategory ?? ""}</div>
                        </div>
                        <div class="form-group">
                            <label class="control-label">Interest Method</label>
                            <div class="text-sm text-gray-700">${
                              product.interestmethod
                            }</div>
                        </div>
                        <div class="form-group">
                            <label class="control-label">Interest Rate</label>
                            <div class="text-sm text-gray-700">${
                              product.interestrate ?? "N/A"
                            }</div>
                        </div>
                        <div class="form-group">
                            <label class="control-label">Interest Rate Type</label>
                            <div class="text-sm text-gray-700">${
                              product.interestratetype ?? "N/A"
                            }</div>
                        </div>
                        <div class="form-group">
                            <label class="control-label">Separate Interest?</label>
                            <div class="text-sm text-gray-700">${
                              product.seperateinterest ? "Yes" : "No"
                            }</div>
                        </div>
                    </div>
                </section>

                <!-- Eligibility Criteria Section -->
                <section class="p-5 mb-12 rounded-sm shadow-sm section bg-white/90 xl:p-10">
                    <h2 class="mb-4 text-lg font-semibold">Eligibility Criteria</h2>
                    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <div class="form-group">
                            <label class="control-label">Product Category</label>
                            <div class="text-sm text-gray-700">${
                              product.eligibilityproductcategory ?? "N/A"
                            }</div>
                        </div>
                        <div class="form-group">
                            <label class="control-label">Eligibility Product</label>
                            <div class="text-sm text-gray-700">${
                              product.eligibilityproduct ?? "N/A"
                            }</div>
                        </div>
                        <div class="form-group">
                            <label class="control-label">Eligibility Min. Balance</label>
                            <div class="text-sm text-gray-700">${
                              product.eligibilityminbalance ?? "N/A"
                            }</div>
                        </div>
                        <div class="form-group">
                            <label class="control-label">Eligibility Type</label>
                            <div class="text-sm text-gray-700">${
                              product.eligibilitytype ?? "N/A"
                            }</div>
                        </div>
                    </div>
                </section>

                <!-- Penalty Details Section -->
                ${
                  product.penaltyDetails
                    ? `
                            <section class="p-5 mb-12 rounded-sm shadow-sm section bg-white/90 xl:p-10">
                                <h2 class="mb-4 text-lg font-semibold">Penalty Details</h2>
                                <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                    <div class="form-group">
                                        <label class="control-label">Fee Name</label>
                                        <div class="text-sm text-gray-700">${
                                          product.penaltyDetails.feename ??
                                          "N/A"
                                        }</div>
                                    </div>
                                    <div class="form-group">
                                        <label class="control-label">Fee Method</label>
                                        <div class="text-sm text-gray-700">${
                                          product.penaltyDetails.feemethod ??
                                          "N/A"
                                        }</div>
                                    </div>
                                    <div class="form-group">
                                        <label class="control-label">Charges Based On</label>
                                        <div class="text-sm text-gray-700">${
                                          product.penaltyDetails
                                            .chargesbasedon ?? "N/A"
                                        }</div>
                                    </div>
                                    <div class="form-group">
                                        <label class="control-label">GL Account</label>
                                        <div class="text-sm text-gray-700">${
                                          product.penaltyDetails.glaccount ??
                                          "N/A"
                                        }</div>
                                    </div>
                                    <div class="form-group">
                                        <label class="control-label">Charge Amount</label>
                                        <div class="text-sm text-gray-700">${
                                          product.penaltyDetails.chargeamount ??
                                          "N/A"
                                        }</div>
                                    </div>
                                    <div class="form-group">
                                        <label class="control-label">Charge Type</label>
                                        <div class="text-sm text-gray-700">${
                                          product.penaltyDetails.chargetype ??
                                          "N/A"
                                        }</div>
                                    </div>
                                    <div class="form-group">
                                        <label class="control-label">Status</label>
                                        <div class="text-sm text-gray-700">${
                                          product.penaltyDetails.status ?? "N/A"
                                        }</div>
                                    </div>
                                    <div class="form-group">
                                        <label class="control-label">Date Added</label>
                                        <div class="text-sm text-gray-700">
                                            ${
                                              product.penaltyDetails.dateadded
                                                ? new Date(
                                                    product.penaltyDetails.dateadded
                                                  ).toLocaleString()
                                                : "N/A"
                                            }
                                        </div>
                                    </div>
                                </div>
                            </section>
                        `
                    : ""
                }

                <!-- Additional Information Section -->
                <section class="p-5 mb-12 rounded-sm shadow-sm section bg-white/90 xl:p-10">
                    <h2 class="mb-4 text-lg font-semibold">Additional Information</h2>
                    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <div class="form-group">
                            <label class="control-label">Default Penalty ID</label>
                            <div class="text-sm text-gray-700">${
                              product.defaultpenaltyid ?? "N/A"
                            }</div>
                        </div>
                        <div class="form-group">
                            <label class="control-label">Membership Names</label>
                            <div class="text-sm text-gray-700">${
                              product.membershipnames ?? "N/A"
                            }</div>
                        </div>
                        <div class="form-group">
                            <label class="control-label">Excluded Branches</label>
                            <div class="text-sm text-gray-700">${
                              product.excludebranch ?? "N/A"
                            }</div>
                        </div>
                        <div class="form-group">
                            <label class="control-label">Product Officer</label>
                            <div class="text-sm text-gray-700">${
                              product.productofficer ?? "N/A"
                            }</div>
                        </div>
                        <div class="form-group">
                            <label class="control-label">Date Added</label>
                            <div class="text-sm text-gray-700">
                                ${
                                  product.dateadded
                                    ? new Date(
                                        product.dateadded
                                      ).toLocaleString()
                                    : "N/A"
                                }
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        `;

    // Show the SweetAlert modal with the product details
    Swal.fire({
      html: productDetails,
      confirmButtonText: '<span style="color: blue;">Close</span>',
      width: "95%",
      closeButton: true,
      showCancelButton: true,
      cancelButtonText:
        '<span style="color: green;" onclick="fetchloanproduct(\'' +
        id +
        "')\">Edit</span>",
    });
  } catch (error) {
    console.error("Error loading loan product:", error);
    Swal.fire({
      title: "Error",
      text: "An error occurred while loading the loan product details.",
      icon: "error",
      confirmButtonText: "OK",
      confirmButtonColor: "#3085d6",
    });
  }
}

async function loanproductFormSubmitHandler() {
  if (!validateForm("loanproductform", getIdFromCls("comp"))) return;

  let payload = getFormData2(
    document.querySelector("#loanproductform"),
    loanproductid
      ? [
          ["id", loanproductid],
          ["membership", getmultivalues("membership", "||")],
          ["excludebranch", getmultivalues("excludebranch", "||")],
        ]
      : [
          ["membership", getmultivalues("membership", "||")],
          ["excludebranch", getmultivalues("excludebranch", "||")],
        ]
  );

  const confirmed = await Swal.fire({
    title: loanproductid ? "Updating..." : "Submitting...",
    text: "Please wait while we submit your data.",
    icon: "info",
    showConfirmButton: false,
    allowOutsideClick: false,
    didOpen: async () => {
      Swal.showLoading();
      let request = await httpRequest2(
        "api/v1/loan/product",
        payload,
        document.querySelector("#loanproductform #submit"),
        "json",
        "POST"
      );
      Swal.close();

      if (request.status) {
        notification("Success!", 1);
        const form = document.querySelector("#loanproductform");
        form.reset();
        if (loanproductid)
          form
            .querySelectorAll("input, select, textarea")
            .forEach((input) => (input.value = ""));
        loanproductid = "";
        document.getElementsByClassName("viewer")[0].click();
        fetchloanproduct();
      } else {
        notification(request.message, 0);
      }
    },
  });
}
