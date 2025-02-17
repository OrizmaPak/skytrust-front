let addlevelid;
async function addlevelActive() {
    addlevelid = '';
    const form = document.querySelector('#addlevelform');
    if (form.querySelector('#submit')) form.querySelector('#submit').addEventListener('click', addlevelFormSubmitHandler);
    datasource = [];
    await fetchaddlevel();
}

async function fetchaddlevel(id) {
    const loadingAlert = Swal.fire({
        title: 'Please wait...',
        text: 'Fetching addlevel data, please wait.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    if (!id) document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> Loading... </td>`;

    let request = await httpRequest2(`api/v1/personnel/level`, null, document.querySelector('#viewrequisitionform #submit'), 'json', 'GET');
    swal.close();
    if (!id) document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> No Records Retrieved </td>`;
    if (request.status) {
        if (!id) {
            if (request.data.length) {
                datasource = request.data;
                resolvePagination(datasource, onaddlevelTableDataSignal);
            }
        } else {
            document.getElementsByClassName('updater')[0].click();
            addlevelid = id;
            console.log("Hellooo", addlevelid);
            console.log("response", request.data.find((item) => item.id == id));
            populateData(request.data.find((item) => item.id == id));
            populateAllowanceAndDeductionFields(request.data.find((item) => item.id == id));
        }
    } else {
        return notification('No records retrieved');
    }
}

async function removeaddlevel(id) {
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

            let request = await httpRequest2('api/v1/personnel/level', id ? getparamm() : null, null, 'json', "DELETE");
            return request;
        },
        allowOutsideClick: () => !Swal.isLoading()
    });

    if (confirmed.isConfirmed) {
        fetchaddlevel();
        return notification(confirmed.value.message);
    }
}

async function onaddlevelTableDataSignal() {
    let rows = getSignaledDatasource().map((item, index) => `
    <tr>
        <td>${index + 1}</td>
        <td>${item.level}</td>
        <td>${formatCurrency(item.basicsalary)}</td>
        <td>${item.allowances.length}</td>
        <td>${item.deductions.length}</td>
         <td>
            <button title="Details of row entry" onclick="showLevelDetails('${item.id}')" class="material-symbols-outlined h-8 w-8 rounded-full bg-green-500 text-xs text-white drop-shadow-md" style="font-size: 18px;">
                visibility
            </button>
            <button title="Edit row entry" onclick="fetchaddlevel('${item.id}')" class="material-symbols-outlined h-8 w-8 rounded-full bg-primary-g text-xs text-white drop-shadow-md" style="font-size: 18px;">edit</button>
            <button title="Delete row entry" onclick="removeaddlevel('${item.id}')" class="material-symbols-outlined h-8 w-8 rounded-full bg-red-600 text-xs text-white drop-shadow-md" style="font-size: 18px;">delete</button>
        </td>
        </td>
    </tr>`
    ).join('');
    injectPaginatatedTable(rows);
}

async function showLevelDetails(id) {
    let item = datasource.find(level => level.id == id);
    if (!item) return notification('No data found', 0);

    let allowancesText = item.allowances.length
        ? item.allowances.map(a => `<span class="block">▪ ${a.allowancetype === 'PERCENTAGE' ? a.allowance + '%' : formatCurrency(a.allowance)} <span class="text-sm text-gray-500">(${a.allowancetype})</span></span>`).join('')
        : '<span class="text-gray-500">None</span>';
        
    let deductionsText = item.deductions.length
        ? item.deductions.map(d => `<span class="block">▪ ${d.deductiontype === 'PERCENTAGE' ? d.deduction + '%' : formatCurrency(d.deduction)} <span class="text-sm text-gray-500">(${d.deductiontype})</span></span>`).join('')
        : '<span class="text-gray-500">None</span>';

    Swal.fire({
        title: `<h2 class="text-lg font-bold text-gray-800">${item.level}</h2>`,
        html: `
            <div class="space-y-3 text-left">
                <p class="text-gray-700"><b>Description:</b> ${item.description}</p>
                <p class="text-gray-700"><b>Basic Salary:</b> <span class="font-semibold text-green-600">${formatCurrency(item.basicsalary)}</span></p>
                
                <div class="rounded-md bg-gray-100 p-3">
                    <p class="font-medium text-gray-800">Allowances:</p>
                    ${allowancesText}
                </div>

                <div class="rounded-md bg-gray-100 p-3">
                    <p class="font-medium text-gray-800">Deductions:</p>
                    ${deductionsText}
                </div>

                <p class="text-gray-700"><b>Status:</b> 
                    <span class="${item.status === 'ACTIVE' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}">${item.status}</span>
                </p>

                <p class="text-gray-700"><b>Date Added:</b> <span class="font-medium text-blue-500">${formatDate(item.dateadded.split("T")[0])}</span></p>
            </div>
        `,
        icon: 'info',
        confirmButtonText: 'Close',
        customClass: {
            popup: 'bg-white shadow-lg rounded-xl p-6',
            confirmButton: 'bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700'
        }
    });
}

async function addlevelFormSubmitHandler() {
    if (!validateForm('addlevelform', getIdFromCls('comp'))) return notification('Please fill all required fields', 0);
    givenamebyclass('deduction');
    givenamebyclass('deductiontype');
    givenamebyclass('allowance');
    givenamebyclass('allowancetype');
    
    let formElement = document.querySelector('#addlevelform');
    let allowanceRows = formElement.querySelectorAll('.allowance-item').length;
    let deductionRows = formElement.querySelectorAll('.deduction-item').length;
    let additionalData = [['allowancerowsize', allowanceRows], ['deductionrowsize', deductionRows]];
    let payload = getFormData2(formElement, addlevelid ? [['id', addlevelid], ...additionalData] : additionalData);

    const confirmed = await Swal.fire({
        title: addlevelid ? 'Updating...' : 'Submitting...',
        text: 'Please wait while we submit your data.',
        icon: 'info',
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: async () => {
            Swal.showLoading();
            let request = await httpRequest2('api/v1/personnel/level', payload, document.querySelector('#addlevelform #submit'), 'json', 'POST');
            Swal.close();

            if (request.status) {
                notification('Success!', 1);
                const form = document.querySelector('#addlevelform');
                form.reset();
                if (addlevelid) form.querySelectorAll('input, select, textarea').forEach(input => input.value = '');
                addlevelid = '';
                document.getElementsByClassName('viewer')[0].click();
                fetchaddlevel();
            } else {    
                notification(request.message, 0);
            }
        }
    });
}

function addDeduction() {
    let deductionsList = document.getElementById("deductions-list");

    let div = document.createElement("div");
    div.classList.add("grid", "grid-cols-3", "gap-3", "deduction-item", "comp", "my-4");

    div.innerHTML = `
        <div class="form-group">
            <label for="deductiontype" class="font-semibold text-gray-700">Deduction Type</label>
            <select name="deductiontype" class="comp deductiontype w-full rounded-md border border-gray-300 p-2">
                <option value="">-- Select a type --</option>
                <option value="AMOUNT">AMOUNT</option>
                <option value="PERCENTAGE">PERCENTAGE</option>
            </select>
        </div>
        <div class="form-group">
            <label for="deduction" class="font-semibold text-gray-700">Deduction Value</label>
            <input type="number" name="deduction" placeholder="Value" class="comp deduction w-full rounded-md border border-gray-300 p-2">
        </div>
        <div class="flex w-full items-end">
            <button type="button" onclick="removeField(this.parentElement.parentElement)" class="rounded-md bg-red-500 px-3 py-2 text-white">Remove</button>
        </div>
    `;

    deductionsList.appendChild(div);

    givenamebyclass('deduction');
    givenamebyclass('deductiontype');
}

function addAllowance(allowanceData) {
    let allowancesList = document.getElementById("allowances-list");

    let div = document.createElement("div");
    div.classList.add("grid", "grid-cols-3", "gap-3", "allowance-item", "comp", "my-4");

    div.innerHTML = `
        <div class="form-group">
            <label for="allowancetype" class="font-semibold text-gray-700">Allowance Type</label>
            <select name="allowancetype" class="comp allowancetype w-full rounded-md border border-gray-300 p-2">
                <option value="">-- Select a type --</option>
                <option value="AMOUNT">AMOUNT</option>
                <option value="PERCENTAGE">PERCENTAGE</option>
            </select>
        </div>
        <div class="form-group">
            <label for="allowance" class="font-semibold text-gray-700">Allowance Value</label>
            <input type="number" name="allowance" placeholder="Value" class="comp allowance w-full rounded-md border border-gray-300 p-2">
        </div>
        <div class="flex w-full items-end">
            <button type="button" onclick="removeField(this.parentElement.parentElement)" class="rounded-md bg-red-500 px-3 py-2 text-white">Remove</button>
        </div>
    `;

    allowancesList.appendChild(div);

    givenamebyclass('allowance');
    givenamebyclass('allowancetype');
}

function populateAllowanceAndDeductionFields(data) {
    const allowancesList = document.getElementById("allowances-list");
    const deductionsList = document.getElementById("deductions-list");

    allowancesList.innerHTML = '';
    deductionsList.innerHTML = '';

    if (data.allowances && data.allowances.length > 0) {
        data.allowances.forEach((allowance) => {
            addAllowanceRow(allowance);
        });
    }

    if (data.deductions && data.deductions.length > 0) {
        data.deductions.forEach((deduction) => {
            addDeductionRow(deduction);
        });
    }

    givenamebyclass('allowance');
    givenamebyclass('allowancetype');
    givenamebyclass('deduction');
    givenamebyclass('deductiontype');
}

function addAllowanceRow(allowanceData) {
    let allowancesList = document.getElementById("allowances-list");

    let div = document.createElement("div");
    div.classList.add("grid", "grid-cols-3", "gap-3", "allowance-item", "comp", "my-4");

    div.innerHTML = `
        <div class="form-group">
            <label for="allowancetype" class="font-semibold text-gray-700">Allowance Type</label>
            <select name="allowancetype" class="comp allowancetype w-full rounded-md border border-gray-300 p-2">
                <option value="AMOUNT" ${allowanceData.allowancetype === 'AMOUNT' ? 'selected' : ''}>AMOUNT</option>
                <option value="PERCENTAGE" ${allowanceData.allowancetype === 'PERCENTAGE' ? 'selected' : ''}>PERCENTAGE</option>
            </select>
        </div>
        <div class="form-group">
            <label for="allowance" class="font-semibold text-gray-700">Allowance Value</label>
            <input type="number" name="allowance" placeholder="Value" class="comp allowance w-full rounded-md border border-gray-300 p-2" value="${allowanceData.allowance}">
        </div>
        <div class="flex w-full items-end">
            ${allowancesList.children.length === 0 ? `
                <button type="button" onclick="addAllowanceRow({allowancetype: '', allowance: ''})" class="rounded-md bg-blue-500 px-3 py-2 text-white">Add Row</button>
            ` : `
                <button type="button" onclick="removeField(this.parentElement.parentElement)" class="rounded-md bg-red-500 px-3 py-2 text-white">Remove</button>
            `}
        </div>
    `;

    allowancesList.appendChild(div);
}

function addDeductionRow(deductionData) {
    let deductionsList = document.getElementById("deductions-list");

    let div = document.createElement("div");
    div.classList.add("grid", "grid-cols-3", "gap-3", "deduction-item", "comp", "my-4");

    div.innerHTML = `
        <div class="form-group">
            <label for="deductiontype" class="font-semibold text-gray-700">Deduction Type</label>
            <select name="deductiontype" class="comp deductiontype w-full rounded-md border border-gray-300 p-2">
                <option value="AMOUNT" ${deductionData.deductiontype === 'AMOUNT' ? 'selected' : ''}>AMOUNT</option>
                <option value="PERCENTAGE" ${deductionData.deductiontype === 'PERCENTAGE' ? 'selected' : ''}>PERCENTAGE</option>
            </select>
        </div>
        <div class="form-group">
            <label for="deduction" class="font-semibold text-gray-700">Deduction Value</label>
            <input type="number" name="deduction" placeholder="Value" class="comp deduction w-full rounded-md border border-gray-300 p-2" value="${deductionData.deduction}">
        </div>
        <div class="flex w-full items-end">
            ${deductionsList.children.length === 0 ? `
                <button type="button" onclick="addDeductionRow({deductiontype: '', deduction: ''})" class="rounded-md bg-blue-500 px-3 py-2 text-white">Add Row</button>
            ` : `
                <button type="button" onclick="removeField(this.parentElement.parentElement)" class="rounded-md bg-red-500 px-3 py-2 text-white">Remove</button>
            `}
        </div>
    `;

    deductionsList.appendChild(div);
}

function removeField(element) {
    element.remove();
}
