let branchid;
async function branchActive() {
  branchid = "";
  datasource = [];

  const form = document.querySelector("#branchform");
  if (form.querySelector("#submit"))
    form
      .querySelector("#submit")
      .addEventListener("click", branchFormSubmitHandler);

  const filterform = document.querySelector("#branchfilterform");
  if (filterform.querySelector("#filter"))
    filterform.querySelector("#filter").addEventListener("click", async (e) => {
      await fetchbranch();
    });

  await fetchbranch();

  await getAllUsers("userid", "name");

  new TomSelect("#userid", {
    plugins: ["dropdown_input"],
  });
}

async function fetchbranch(id) {
  // scrollToTop('scrolldiv')
  function getparamm() {
    let paramstr = new FormData();
    paramstr.append("id", id);
    return paramstr;
  }

  // Show loading state using SweetAlert
  const loadingAlert = Swal.fire({
    title: "Please wait...",
    text: "Fetching branch data, please wait.",
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });

  let form = document.querySelector("#branchfilterform");
  let formData = new FormData(form);
  let queryParams = new URLSearchParams(formData).toString();
  console.log("Query Parameters:", queryParams);

  let request = await httpRequest2(
    `api/v1/admin/branch?${queryParams ? `${queryParams}` : ""}${
      id ? `&id=${id}` : ""
    }`,
    null,
    null,
    "json",
    "GET"
  );
  Swal.close(); // Close loading spinner

  if (!id)
    document.getElementById(
      "tabledata"
    ).innerHTML = `<td colspan="100%" class="text-center opacity-70"> No Records Retrieved </td>`;

  if (request.status) {
    if (!id) {
      if (request.data.length) {
        datasource = request.data;
        resolvePagination(datasource, onbranchTableDataSignal);
      }
    } else {
      document.getElementsByClassName("updater")[0].click();
      branchid = request.data[0].id;
      populateData(request.data[0]);
    }
  } else {
    return notification("No records retrieved");
  }
}

async function removebranch(id) {
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
    fetchbranch();
    return notification(confirmed.value.message);
  }
}

async function onbranchTableDataSignal() {
  let rows = getSignaledDatasource()
    .map(
      (item, index) => `
    <tr>
        <td>${index + 1}</td>
        <td>${item.branch}</td>
        <td>${item.useridname ?? item.userid}</td>
        <td>${item.country}</td>
        <td>${item.state}</td>
        <td>${item.lga}</td>
        <td>${item.address}</td>
        <td class="flex items-center gap-3 ${
          item.branch == default_branch ? "hidden" : ""
        }">
            <button title="Edit row entry" onclick="fetchbranch('${
              item.id
            }')" class="material-symbols-outlined ${
        item.branch == default_branch ? "hidden" : ""
      } rounded-full bg-primary-g h-8 w-8 text-white drop-shadow-md text-xs" style="font-size: 18px;">edit</button>
            <button title="Delete row entry" onclick="removebranch('${
              item.id
            }')" class="hidden material-symbols-outlined ${
        item.branch == default_branch ? "hidden" : ""
      } rounded-full bg-red-600 h-8 w-8 text-white drop-shadow-md text-xs" style="font-size: 18px;">delete</button>
        </td>
    </tr>`
    )
    .join("");
  injectPaginatatedTable(rows);
}

async function branchFormSubmitHandler() {
  if (!validateForm("branchform", getIdFromCls("comp"))) return;

  let payload = getFormData2(
    document.querySelector("#branchform"),
    branchid ? [["id", branchid]] : null
  );

  const confirmed = await Swal.fire({
    title: branchid ? "Updating..." : "Submitting...",
    text: "Please wait while we submit your data.",
    icon: "info",
    showConfirmButton: false,
    allowOutsideClick: false,
    didOpen: async () => {
      Swal.showLoading();
      let request = await httpRequest2(
        "api/v1/admin/branch",
        payload,
        document.querySelector("#branchform #submit"),
        "json",
        "POST"
      );
      Swal.close();

      if (request.status) {
        notification("Success!", 1);
        branchid = "";
        document.getElementsByClassName("viewer")[0].click();
        const form = document.querySelector("#branchform");
        form.reset();
        form
          .querySelectorAll("input, select, textarea")
          .forEach((input) => (input.value = ""));
        fetchbranch();
      } else {
        notification(request.message, 0);
      }
    },
  });
}
