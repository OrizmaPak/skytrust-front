let departmentid;
async function departmentActive() {
  departmentid = "";
  datasource = [];

  const form = document.querySelector("#departmentform");
  if (form.querySelector("#submit"))
    form
      .querySelector("#submit")
      .addEventListener("click", departmentFormSubmitHandler);

  await fetchdepartment();
  await getAllbranch(true);
  await getAllbranch(true, "filter-branch");
  await getAllUsers("userid", "name");
  await getAllUsers("filteruserid", "name");

  new TomSelect("#branch", {
    plugins: ["dropdown_input"],

    onInitialize: function () {
      console.log(checkpermission("CHANGE department"));
      if (!checkpermission("CHANGE department")) this.disable();
    },
  });

  new TomSelect("#filter-branch", {
    plugins: ["dropdown_input"],
    onInitialize: function () {
      console.log(checkpermission("FILTER BRANCH"));
      if (!checkpermission("FILTER BRANCH")) {
        this.setValue(the_user.branch);
        this.setTextboxValue("readonly", true);
      }
    },
  });

  new TomSelect("#userid", {
    plugins: ["dropdown_input"],
  });

  new TomSelect("#filteruserid", {
    plugins: ["dropdown_input"],
  });

  const filterform = document.querySelector("#departmentfilterform");
  if (filterform.querySelector("#filter"))
    filterform.querySelector("#filter").addEventListener("click", async (e) => {
      await fetchdepartment();
    });
}

async function fetchdepartment(id) {
  // scrollToTop('scrolldiv')
  function getparamm() {
    let paramstr = new FormData();
    paramstr.append("id", id);
    return paramstr;
  }

  // Show loading state using SweetAlert
  const loadingAlert = Swal.fire({
    title: "Please wait...",
    text: "Fetching department data, please wait.",
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });

  let form = document.querySelector("#departmentfilterform");
  let formData = new FormData(form);
  let queryParams = new URLSearchParams(formData).toString();
  console.log("Query Parameters:", queryParams);

  let request = await httpRequest2(
    `api/v1/admin/department?${queryParams ? `${queryParams}` : ""}${
      id ? `&id=${id}` : ""
    }`,
    null,
    null,
    "json",
    "GET"
  );
  Swal.close(); // Close the loading alert once the request is complete

  if (!id)
    document.getElementById(
      "tabledata"
    ).innerHTML = `<td colspan="100%" class="text-center opacity-70"> No Records Retrieved </td>`;
  if (request.status) {
    if (!id) {
      if (request.data.length) {
        datasource = request.data;
        resolvePagination(datasource, ondepartmentTableDataSignal);
      }
    } else {
      document.getElementsByClassName("updater")[0].click();
      departmentid = request.data[0].id;
      populateData(request.data[0]);
    }
  } else {
    return notification("No records retrieved");
  }
}

async function removedepartment(id) {
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
    fetchdepartment();
    return notification(confirmed.value.message);
  }
}

async function ondepartmentTableDataSignal() {
  let rows = getSignaledDatasource()
    .map(
      (item, index) => `
    <tr>
        <td>${index + 1}</td>
        <td>${item.department}</td>
        <td>${item.category}</td>
        <td>${item.applyforsales}</td>
        <td>${item.branchname}</td>
        <td>${item.useridname}n</td>
       
        <td class="flex items-center gap-3">
            <button title="Edit row entry" onclick="fetchdepartment('${
              item.id
            }')" class="material-symbols-outlined h-8 w-8 rounded-full bg-primary-g text-xs text-white drop-shadow-md" style="font-size: 18px;">edit</button>
            <button title="Delete row entry" onclick="removedepartment('${
              item.id
            }')" class="material-symbols-outlined hidden h-8 w-8 rounded-full bg-red-600 text-xs text-white drop-shadow-md" style="font-size: 18px;">delete</button>
        </td>
    </tr>`
    )
    .join("");
  injectPaginatatedTable(rows);
}

async function departmentFormSubmitHandler() {
  if (!validateForm("departmentform", getIdFromCls("comp"))) return;

  let payload = getFormData2(
    document.querySelector("#departmentform"),
    departmentid ? [["id", departmentid]] : null
  );

  const confirmed = await Swal.fire({
    title: departmentid ? "Updating..." : "Submitting...",
    text: "Please wait while we submit your data.",
    icon: "info",
    showConfirmButton: false,
    allowOutsideClick: false,
    didOpen: async () => {
      Swal.showLoading();
      let request = await httpRequest2(
        "api/v1/admin/department",
        payload,
        document.querySelector("#departmentform #submit"),
        "json",
        "POST"
      );
      Swal.close();

      if (request.status) {
        notification("Success!", 1);
        const form = document.querySelector("#departmentform");
        form.reset();
        if (departmentid)
          form
            .querySelectorAll("input, select, textarea")
            .forEach((input) => (input.value = ""));
        departmentid = "";
        document.getElementsByClassName("viewer")[0].click();
        fetchdepartment();
      } else {
        notification(request.message, 0);
      }
    },
  });
}
