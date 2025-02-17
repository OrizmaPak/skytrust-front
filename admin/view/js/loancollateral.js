let loancollateralid;
async function loancollateralActive() {
  loancollateralid = "";
  datasource = [];

  const form = document.querySelector("#loancollateralform");
  if (form.querySelector("#submit"))
    form
      .querySelector("#submit")
      .addEventListener("click", loancollateralFormSubmitHandler);

  const filterform = document.querySelector("#loancollateralfilterform");
  if (filterform.querySelector("#filter"))
    filterform.querySelector("#filter").addEventListener("click", async (e) => {
      await fetchloancollateral();
    });
  if (filterform.querySelector("#filter2"))
    filterform
      .querySelector("#filter2")
      .addEventListener("click", async (e) => {
        await fetchloancollateral();
      });

  await fetchaccounts();
  await fetchloancollateral();

  new TomSelect("#accountnumber", {
    plugins: ["dropdown_input"],
  });
  // await getAllloancollateral(true);
  // new TomSelect('#loancollateral', {
  //     // plugins: ['remove_button'],
  //     onInitialize: function() {
  //         console.log(checkpermission('FILTER COLLATERAL'))
  //         if(!checkpermission('FILTER COLLATERAL')) this.setValue(the_user.loancollateral);
  // if(!checkpermission('FILTER COLLATERAL')) this.setTextboxValue('readonly', true);
  //     }
  // });
  // await getAllUsers("useridlist", "id");
}

async function fetchloancollateral(id) {
  // Show loading state using SweetAlert
  const loadingAlert = Swal.fire({
    title: "Please wait...",
    text: "Fetching loancollateral data, please wait.",
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });
  let form = document.querySelector("#loancollateralfilterform");
  let formData = new FormData(form);
  // formData.set('department', '');
  // formData.set('loancollateral', '');
  let queryParams = new URLSearchParams(formData).toString();
  console.log("Query Parameters:", queryParams);

  if (!id)
    document.getElementById(
      "tabledata"
    ).innerHTML = `<td colspan="100%" class="text-center opacity-70"> Loading... </td>`;

  let request = await httpRequest2(
    `api/v1/loan/collateral?${queryParams ? `&${queryParams}` : ""}${
      id ? `&id=${id}` : ""
    }`,
    null,
    document.querySelector("#viewcollateralform #submit"),
    "json",
    "GET"
  );
  swal.close(); // Close the loading alert once the request is complete
  if (!id)
    document.getElementById(
      "tabledata"
    ).innerHTML = `<td colspan="100%" class="text-center opacity-70"> No Records Retrieved </td>`;
  document.getElementById(
    "tabledata2"
  ).innerHTML = `<td colspan="100%" class="text-center opacity-70"> No Records Retrieved </td>`;
  if (request.status) {
    if (!id) {
      if (request.data.length) {
        datasource = request.data;
        if (datasource.filter((data) => data.status == "ACTIVE").length > 0) {
          resolvePagination(
            datasource.filter((data) => data.status == "ACTIVE"),
            onloancollateralTableDataSignal
          );
        }
        did("tabledata2").innerHTML = datasource
          .filter((data) => data.status != "ACTIVE")
          .map(
            (item, index) => `
            <tr>
        <td>${index + 1}</td>
        <td>${item.accountnumber}</td>
        <td>${item.documenttitle}</td>
        <td>${item.documentnumber}</td>
        <td>${item.description}</td>
        <td>${item.docposition}</td>
        <td>${item.worth}</td>
        <td style="color: ${item.status === "ACTIVE" ? "green" : "red"};">${
              item.status
            }</td>
        <td class="flex items-center gap-3">
            <button title="Approve" onclick="approvedeclineloancollateral('${
              item.id
            }', 'ACTIVE')" class="material-symbols-outlined h-8 w-8 rounded-full bg-green-600 text-xs text-white drop-shadow-md" style="font-size: 18px;">verified</button>
            <button title="Decline" onclick="approvedeclineloancollateral('${
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
      loancollateralid = request.data[0].id;
      populateData(request.data[0]);
    }
  } else {
    return notification("No records retrieved");
  }
}

async function approvedeclineloancollateral(id, state) {
  const confirmed = await Swal.fire({
    title: "Are you sure you want to proceed with this action?",
    text:
      state == "ACTIVE"
        ? "This action will activate the collateral."
        : "This action will deactivate the collateral.",
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
        "api/v1/loan/approvedeclinecollateral",
        id ? getParams() : null,
        null,
        "json"
      );
      if (request.status) {
        notification(request.message, 1);
      } else {
        notification(request.message, 0);
      }
      return fetchloancollateral();
    },
    allowOutsideClick: () => !Swal.isLoading(),
  });
}

async function removeloancollateral(id) {
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
    fetchloancollateral();
    return notification(confirmed.value.message);
  }
}

async function onloancollateralTableDataSignal() {
  let rows = getSignaledDatasource()
    .map(
      (item, index) => `
    <tr>
        <td>${index + 1}</td>
        <td>${item.accountnumber}</td>
        <td>${item.documenttitle}</td>
        <td>${item.documentnumber}</td>
        <td>${item.description}</td>
        <td>${item.docposition}</td>
        <td>${item.worth}</td>
        <td style="color: ${item.status === "ACTIVE" ? "green" : "red"};">${
        item.status
      }</td>
        <td class="flex items-center gap-3">
            <button title="Edit row entry" onclick="fetchloancollateral('${
              item.id
            }')" class="material-symbols-outlined h-8 w-8 rounded-full bg-primary-g text-xs text-white drop-shadow-md" style="font-size: 18px;">edit</button>
            <button title="Delete row entry" onclick="removeloancollateral('${
              item.id
            }')" class="material-symbols-outlined hidden h-8 w-8 rounded-full bg-red-600 text-xs text-white drop-shadow-md" style="font-size: 18px;">delete</button>
        </td>
    </tr>`
    )
    .join("");
  injectPaginatatedTable(rows);
}

async function loancollateralFormSubmitHandler() {
  if (!validateForm("loancollateralform", getIdFromCls("comp"))) return;

  let payload = getFormData2(
    document.querySelector("#loancollateralform"),
    loancollateralid ? [["id", loancollateralid]] : null
  );

  const confirmed = await Swal.fire({
    title: loancollateralid ? "Updating..." : "Submitting...",
    text: "Please wait while we submit your data.",
    icon: "info",
    showConfirmButton: false,
    allowOutsideClick: false,
    didOpen: async () => {
      Swal.showLoading();
      let request = await httpRequest2(
        "api/v1/loan/collateral",
        payload,
        document.querySelector("#loancollateralform #submit"),
        "json",
        "POST"
      );
      Swal.close();

      if (request.status) {
        notification("Success!", 1);
        const form = document.querySelector("#loancollateralform");
        form.reset();
        if (loancollateralid)
          form
            .querySelectorAll("input, select, textarea")
            .forEach((input) => (input.value = ""));
        loancollateralid = "";
        document.getElementsByClassName("viewer")[0].click();
        fetchloancollateral();
      } else {
        notification(request.message, 0);
      }
    },
  });
}
