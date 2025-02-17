let categoryvaluetimelineid
async function categoryvaluetimelineActive() {
  // categoryvaluetimelineid = ''
  const form = document.querySelector('#categoryvaluetimelineform')
  // if(form.querySelector('#submit')) form.querySelector('#submit').addEventListener('click', categoryvaluetimelineFormSubmitHandler)
  if(form.querySelector('#submit')) form.querySelector('#submit').addEventListener('click',  function(event) {
    event.preventDefault();
    categoryvaluetimelineFormSubmitHandler();
});
  datasource = []
  await fetchcategoryvaluetimeline()
  // await getAllcategoryvaluetimeline(true)
}

async function fetchcategoryvaluetimeline(id) {
  // Show loading state using SweetAlert
  const loadingAlert = Swal.fire({
    title: "Please wait...",
    text: "Fetching categoryvaluetimeline data, please wait.",
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });

  if (!id)
    document.getElementById(
      "tabledata"
    ).innerHTML = `<td colspan="100%" class="text-center opacity-70"> Loading... </td>`;

  let request = await httpRequest2(
    `api/v1/property/categorytimeline?${
      id ? `&id=${id}` : ""
    }`,
    null,
    document.querySelector("#viewrequisitionform #submit"),
    "json",
    "GET"
  );
  swal.close(); // Close the loading alert once the request is complete
  if (!id)
    document.getElementById(
      "tabledata"
    ).innerHTML = `<td colspan="100%" class="text-center opacity-70"> No Records Retrieved </td>`;
  if (request.status) {
    if (!id) {
      if (request.data.length) {
        datasource = request.data;
        resolvePagination(datasource, oncategoryvaluetimelineTableDataSignal);
      }
    } else {
      categoryvaluetimelineid = request.data[0].id;
      populateData(request.data[0]);
      // Update form fields with the data
      document.querySelector("#valuefrom").value = request.data[0].valuefrom;
      document.querySelector("#valueto").value = request.data[0].valueto;
      document.querySelector("#numberofdays").value = request.data[0].numberofdays;
      // Change button text to "Update Property Account"
      document.querySelector("#submit span").textContent = "Update Property Account";
    }
  } else {
    return notification("No records retrieved");
  }
}

async function removecategoryvaluetimeline(id) {
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
        "api/v1/property/categorytimeline",
        id ? getparamm() : null,
        null,
        "json",
        "DELETE"
      );
      return request;
    },
    allowOutsideClick: () => !Swal.isLoading(),
  });

  // Show notification based on the result
  if (confirmed.isConfirmed) {
    fetchcategoryvaluetimeline();
    return notification(confirmed.value.message);
  }
}

async function oncategoryvaluetimelineTableDataSignal() {
  let rows = getSignaledDatasource()
    .map(
      (item, index) => `
    <tr>
        <td>${index + 1}</td>
        <td>${item.valuefrom}</td>
        <td>${item.valueto}</td>
        <td>${item.numberofdays}</td>
        <td class="flex gap-3 items-center">
            <button title="Edit row entry" onclick="fetchcategoryvaluetimeline('${
              item.id
            }')" class="w-8 h-8 text-xs text-white rounded-full drop-shadow-md material-symbols-outlined bg-primary-g" style="font-size: 18px;">edit</button>
            <button title="Delete row entry" onclick="removecategoryvaluetimeline('${
              item.id
            }')" class="w-8 h-8 text-xs text-white bg-red-600 rounded-full drop-shadow-md material-symbols-outlined" style="font-size: 18px;">delete</button>
        </td>
    </tr>`
    )
    .join("");
  injectPaginatatedTable(rows);
}

async function categoryvaluetimelineFormSubmitHandler() {
  if (!validateForm("categoryvaluetimelineform", getIdFromCls("comp"))) return;

  let payload = getFormData2(
    document.querySelector("#categoryvaluetimelineform"),
    categoryvaluetimelineid ? [["id", categoryvaluetimelineid]] : null
  );

  const confirmed = await Swal.fire({
    title: categoryvaluetimelineid ? "Updating..." : "Submitting...",
    text: "Please wait while we submit your data.",
    icon: "info",
    showConfirmButton: false,
    allowOutsideClick: false,
    didOpen: async () => {
      Swal.showLoading();
      let request = await httpRequest2(
        "api/v1/property/categorytimeline",
        payload,
        document.querySelector("#categoryvaluetimelineform #submit"),
        "json",
        "POST"
      );
      Swal.close();

      if (request.status) {
        notification("Success!", 1);
        const form = document.querySelector("#categoryvaluetimelineform");
        form.reset();
        if (categoryvaluetimelineid)
          form
            .querySelectorAll("input, select, textarea")
            .forEach((input) => (input.value = ""));
        categoryvaluetimelineid = "";
        // Reset button text to "Save Property Account"
        document.querySelector("#submit span").textContent = "Save Property Account";
        fetchcategoryvaluetimeline();
      } else {
        notification(request.message, 0);
      }
    },
  });
}
