let propertytransactionreportid
async function propertytransactionreportActive() {
    propertytransactionreportid = ''
    const form2 = document.querySelector('#propertytransactionreportfilterform')
    if(form2 && form2.querySelector('#submit')) {
        form2.querySelector('#submit').addEventListener('click', e => fetchpropertytransactionreport())
    }
    datasource = []
    await fetchpropertytransactionreport()
   
    await getAllUsers('userid', 'name');
    await getAllbranch(true);
    
    if (document.querySelector('#userid')) {
        new TomSelect('#userid', {
            plugins: ['dropdown_input'],
        });
    }
    if (document.querySelector('#branch')) {
        new TomSelect('#branch', {
            plugins: ['dropdown_input'],
            onInitialize: function() {
                console.log(checkpermission('FILTER BRANCH'))
                if(!checkpermission('FILTER BRANCH')) this.setValue(the_user.branch);
                if(!checkpermission('FILTER BRANCH')) this.setTextboxValue('readonly', true);
            }
        });
    }
}

async function fetchpropertytransactionreport(id) {
    // Show loading state using SweetAlert
    const loadingAlert = Swal.fire({
        title: 'Please wait...',
        text: 'Fetching propertytransactionreport data, please wait.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    let form = document.querySelector('#propertytransactionreportfilterform');
    let formData = new FormData(form);
    formData.set('branch', the_user.branch)
    let queryParams = new URLSearchParams(formData).toString();

    if(!id)document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> Loading... </td>`

    let request = await httpRequest2(`api/v1/transactions?whichaccount=PROPERTY&${queryParams ? `${queryParams}` : ''}${id ? `&id=${id}` : ''}`, null, document.querySelector('#viewrequisitionform #submit'), 'json', 'GET');
    swal.close(); // Close the loading alert once the request is complete
    if(!id)document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> No Records Retrieved </td>`
    if(request.status) {
        if(!id){
            if(request.data.length) {
                datasource = request.data
                resolvePagination(datasource, onpropertytransactionreportTableDataSignal);
            }
        } else {
            propertytransactionreportid = request.data[0].id;
            populateData(request.data[0]);
        }
    } else {
        return notification('No records retrieved');
    }
}

async function removepropertytransactionreport(id) {
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
        fetchpropertytransactionreport();
        return notification(confirmed.value.message);
    }
}
async function onpropertytransactionreportTableDataSignal() {
    let rows = getSignaledDatasource().map((item, index) => `
    <tr>
        <td>${index + 1}</td>
        <td>${formatDate(item.transactiondate.split("T")[0])}</td>
        <td>${item.accountname}</td>
        <td>${item.accountnumber}</td>
        <td>${item.tfrom == "CASH" ? item.cashref : item.transactionref}</td>
        <td>${item.description}</td>
        <td>${item.ttype}</td>
        <td>${item.ttype == "CREDIT" ? item.credit : item.debit}</td>
    </tr>`
    )
    .join('')
    injectPaginatatedTable(rows)
}
