let savingsproductid
let eligibilitysavings
let eligibilityloans
async function savingsproductActive() {
    savingsproductid = '';
    eligibilitysavings = [];
    const form = document.querySelector('#savingsproductform')
    if(form.querySelector('#submit')) form.querySelector('#submit').addEventListener('click', savingsproductFormSubmitHandler)
    datasource = []
    await getallmemberships('membership')
    new TomSelect('#membership', {
        plugins: ['dropdown_input', 'remove_button']
    });
    await fetchsavingsproduct()
    // await getAllsavingsproduct(true)
    // new TomSelect('#savingsproduct', {
    //     // plugins: ['remove_button'],
    //     onInitialize: function() {
    //         console.log(checkpermission('FILTER savingsproduct'))
    //         if(!checkpermission('FILTER savingsproduct')) this.setValue(the_user.savingsproduct);
            // if(!checkpermission('FILTER savingsproduct')) this.setTextboxValue('readonly', true);
    //     }
    // });
    // await getAllUsers('useridlist', 'id')
    const compulsoryDepositToggle = document.getElementById('compulsorydeposit');
    const settings = document.getElementById('compulsory-deposit-settings');

    function toggleCompulsoryDepositSettings() {
        if (compulsoryDepositToggle.checked) {
            settings.classList.remove('hidden');
        } else {
            settings.classList.add('hidden');
        }
    }

    if (compulsoryDepositToggle) {
        compulsoryDepositToggle.addEventListener('change', toggleCompulsoryDepositSettings);
        toggleCompulsoryDepositSettings(); // Initialize on page load
    }

    const allowWithdrawalToggle = document.getElementById('allowwithdrawal');
    const withdrawalSettingsContainer = document.getElementById('withdrawal-settings-container');

    function toggleWithdrawalSettings() {
        if (allowWithdrawalToggle.checked) {
            withdrawalSettingsContainer.classList.remove('hidden');
        } else {
            withdrawalSettingsContainer.classList.add('hidden');
        }
    }

    allowWithdrawalToggle.addEventListener('change', toggleWithdrawalSettings);
    toggleWithdrawalSettings(); // Initialize on page load
    
    const allowDepositToggle = document.getElementById('allowdeposit');
    const depositSettingsContainer = document.getElementById('deposit-settings-container');

    function toggleDepositSettings() {
        if (allowDepositToggle.checked) {
            depositSettingsContainer.classList.remove('hidden');
        } else {
            depositSettingsContainer.classList.add('hidden');
        }
    }

    allowDepositToggle.addEventListener('change', toggleDepositSettings);
    toggleDepositSettings(); // Initialize on page load
       // Dynamic Eligibility Product Population
    const eligibilityCategory = document.getElementById('eligibilityproductcategory');
    const eligibilityProduct = document.getElementById('eligibilityproduct');

    eligibilityCategory.addEventListener('change', function() {
        
        const category = this.value;
        eligibilityProduct.innerHTML = '<option value="0">-- Select Eligibility Product --</option>'; // Reset options

        if(category) {
            // Fetch eligibility products from the server or define them here
            const products = getEligibilityProducts(category); // Implement this function

            products.forEach(product => {
                const option = document.createElement('option');
                option.value = product.id;
                option.textContent = product.productname;
                eligibilityProduct.appendChild(option);
            });
        }
    });

    function getEligibilityProducts(category) {
        // Example static data; replace with actual data fetching logic
        const data = {
            'LOAN': eligibilityloans,
            'SAVINGS': eligibilitysavings
        };
        return data[category] || [];
    }

}

function toggleWithdrawalControlSettings() {
    const controlSettings = document.getElementById('withdrawal-control-settings');
    const controlToggle = document.getElementById('withdrawalcontrol');
    if (controlToggle.checked) {
        controlSettings.classList.remove('hidden');
    } else {
        controlSettings.classList.add('hidden');
    }
}

function toggleEligibilityFields(value) {
    const fields = document.getElementById('eligibility-fields');
    if (value) {
        fields.classList.remove('hidden');
    } else {
        fields.classList.add('hidden');
    }
}

function resetproduct(){
   did('deposit-settings-container').classList.add('hidden');
   did('withdrawal-settings-container').classList.add('hidden');
   did('eligibility-fields').classList.add('hidden');  
   did('withdrawal-control-settings').classList.add('hidden');  
   did('interestcontainer').innerHTML = '';
}

async function fetchsavingsproduct(id) {
    if(id)savingsproductid = id;
    // Show loading state using SweetAlert
    const loadingAlert = Swal.fire({
        title: 'Please wait...',
        text: 'Fetching savingsproduct data, please wait.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    // let form = document.querySelector('#viewrequisitionform');
    // let formData = new FormData(form);
    // // formData.set('department', '');
    // // formData.set('savingsproduct', '');
    // let queryParams = new URLSearchParams(formData).toString();
    resetproduct();
    if(id && datasource.length) {
        document.getElementsByClassName('updater')[0].click();
        let thedata = datasource.filter(item => item.id == id)[0];
        populateData(thedata);
        if (thedata.membership.includes('||')) {
            did('membership').tomselect.setValue(thedata.membership.split('||'));
        }else{
            did('membership').tomselect.setValue(thedata.membership);
        }
        if(did('eligibilityproductcategory').value)did('eligibility-fields').classList.remove('hidden');
        if(!did('eligibilityproductcategory').value)did('eligibility-fields').classList.add('hidden');
        if(thedata.interests.length > 0)did('interestcontainer').innerHTML = thedata.interests.map((data, random)=>`<div class="table-content mb-3 shadow-md">
            <div class="table-content mb-3 shadow-md">
                 <div class="flex flex-col space-y-3 rounded-sm bg-green-50 p-5 xl:p-10">
            <div class="flex justify-between">
                <h3 class="text-md mb-3 font-semibold text-[green]">INTEREST</h3>
                <button title="Delete" onclick="this.parentElement.parentElement.parentElement.remove()" class="material-symbols-outlined h-8 w-8 rounded-full bg-red-500 text-xs text-white drop-shadow-md" style="font-size: 18px;">delete</button>
            </div>
            <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div class="form-group">
                    <label for="interestname" class="control-label">Interest Name</label>
                    <input type="text" id="interestname" value="${data.interestname}" name="interestname" class="form-control comps interestname bg-white" placeholder="Enter Interest Name">
                </div>
                <div class="form-group">
                    <label for="interestmethod" class="control-label">Interest Method</label>
                    <select id="interestmethod" value="${data.interestmethod}" name="interestmethod" class="form-control comps interestmethod bg-white">
                        <option value="LATEST BALANCE">Latest Balance</option>
                        <option value="PRO RATA BASIS">Pro Rata Basis</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="eligibilityaccountage" class="control-label">Eligibility Account Age (months)</label>
                    <input type="number" value="${data.interesteligibilityaccountage}" id="interesteligibilityaccountage" name="interesteligibilityaccountage" class="form-control comps interesteligibilityaccountage bg-white" placeholder="Enter Account Age">
                </div>
                <div class="form-group">
                    <label for="interesteligibilitybalance" class="control-label">interestEligibility Balance</label>
                    <input type="number" id="interesteligibilitybalance" value="${data.interesteligibilitybalance}" name="interesteligibilitybalance" class="form-control comps interesteligibilitybalance bg-white" placeholder="Enter Eligibility Balance">
                </div>
                <div class="form-group">
                    <label for="interestamount" class="control-label">Interest Amount</label>
                    <input type="number" id="interestamount" value="${data.interestamount}" name="interestamount" class="form-control comps interestamount bg-white" placeholder="Enter Interest Amount">
                </div>
                <div class="form-group">
                    <label for="interesttype" class="control-label">Interest Type</label>
                    <select id="interesttype" value="${data.interesttype}" name="interesttype" class="form-control comps interesttype bg-white">
                        <option value="PERCENTAGE">Percentage</option>
                        <option value="AMOUNT">Amount</option>
                    </select>
                </div>
                <div class="form-group relative">
                    <label for="interestfrequency" class="control-label">Interest Frequency</label>
                    <input type="text" class="form-control interestfrequency bg-white" value="${data.interestfrequency}" readonly name="interestfrequency" id="interestfrequency${random}" onclick="handledateai('interestfrequency${random}', 'Please describe how you would want the interest frequency to be in your language and trust us we will get it right!!')" class="form-control comps cursor-pointer" placeholder="Enter Interest Frequency (e.g., D1 for Daily)">
                    <span class="material-symbols-outlined absolute right-2 top-2 -translate-y-1/2 transform cursor-pointer text-gray-500" onclick="codemeaning('interestfrequency${random}')" style="font-size: 18px;">
                        visibility
                    </span>
                </div>
                <div class="form-group">
                    <label class="control-label">Go for Approval</label>
                    <label class="relative mb-[1px] inline-flex cursor-pointer items-center bg-[#1d68e305] p-2 pl-1">
                        <input type="checkbox" id="interestgoforapproval" ${data.interestgoforapproval ? 'checked' : ''} name="interestgoforapproval" class="accesscontroller interestgoforapproval peer sr-only">
                        <div class="peer h-6 w-11 scale-[0.8] rounded-full bg-gray-400 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-blue-300 rtl:peer-checked:after:-translate-x-full"></div>
                        <span class="ms-2 text-xs font-medium text-blue-900">Toggle Go for Approval</span>
                    </label>
                </div>
                <div class="form-group">
                    <label for="status" class="control-label">Status</label>
                    <select id="intereststatus" valueq="${data.intereststatus}" name="intereststatus" class="form-control intereststatus comps bg-white">
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                    </select>
                </div>
            </div>
        </div>
        </div>
            `).join('')
        if(thedata.deductions.length > 0)did('deductioncontainer').innerHTML = thedata.deductions.map((data, random)=>`
        <div class="table-content mb-3 shadow-md">
             <div class="flex flex-col space-y-3 rounded-sm bg-red-50 p-5 xl:p-10">
            <div class="flex justify-between">
                <h3 class="text-md mb-3 font-semibold text-[red]">DEDUCTION</h3>
                <button title="Delete" onclick="this.parentElement.parentElement.parentElement.remove()" class="material-symbols-outlined h-8 w-8 rounded-full bg-red-500 text-xs text-white drop-shadow-md" style="font-size: 18px;">delete</button>
            </div>
            <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div class="form-group">
                    <label for="deductionname" class="control-label">Deduction Name</label>
                    <input type="text" id="deductionname" value="${data.deductionname}" name="deductionname" class="form-control comps deductionname bg-white" placeholder="Enter Deduction Name">
                </div>
                <div class="form-group">
                    <label for="deductionmethod" class="control-label">Deduction Method</label>
                    <select id="deductionmethod" value="${data.deductionmethod}" name="deductionmethod" class="form-control comps deductionmethod bg-white">
                        <option value="LATEST BALANCE">Latest Balance</option>
                        <option value="PRO RATA BASIS">Pro Rata Basis</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="eligibilityaccountagededuction" class="control-label">Eligibility Account Age (months)</label>
                    <input type="number" value="${data.deductioneligibilityaccountagededuction}" id="deductioneligibilityaccountagededuction" name="deductioneligibilityaccountagededuction" class="form-control comps deductioneligibilityaccountagededuction bg-white" placeholder="Enter Account Age">
                </div>
                <div class="form-group">
                    <label for="deductioneligibilitybalancededuction" class="control-label">Deduction Eligibility Balance</label>
                    <input type="number" value="${data.deductioneligibilitybalancededuction}" id="deductioneligibilitybalancededuction" name="deductioneligibilitybalancededuction" class="form-control comps deductioneligibilitybalancededuction bg-white" placeholder="Enter Eligibility Balance">
                </div>
                <div class="form-group">
                    <label for="deductionamount" class="control-label">Deduction Amount</label>
                    <input type="number" value="${data.deductionamount}" id="deductionamount" name="deductionamount" class="form-control comps deductionamount bg-white" placeholder="Enter Deduction Amount">
                </div>
                <div class="form-group">
                    <label for="deductiontype" class="control-label">Deduction Type</label>
                    <select id="deductiontype" value="${data.deductiontype}" name="deductiontype" class="form-control comps deductiontype bg-white">
                        <option value="PERCENTAGE">Percentage</option>
                        <option value="AMOUNT">Amount</option>
                    </select>
                </div>
                <div class="form-group relative">
                    <label for="deductionfrequency" class="control-label">Deduction Frequency</label>
                    <input type="text" class="deductionfrequency" value="${data.deductionfrequency}" readonly name="deductionfrequency" id="deductionfrequency${random}" onclick="handledateai('deductionfrequency${random}', 'Please describe how you would want the deduction frequency to be in your language and trust us we will get it right!!')" class="form-control comps cursor-pointer bg-white" placeholder="Enter Deduction Frequency">
                    <span class="material-symbols-outlined absolute right-2 top-2 -translate-y-1/2 transform cursor-pointer text-gray-500" onclick="codemeaning('deductionfrequency${random}')" style="font-size: 18px;">
                        visibility
                    </span>
                </div>
                <div class="form-group">
                    <label class="control-label">Go for Approval</label>
                    <label class="relative mb-[1px] inline-flex cursor-pointer items-center bg-[#1d68e305] p-2 pl-1">
                        <input type="checkbox" ${data.deductiongoforapproval ? 'checked' : ''} id="deductiongoforapproval" name="deductiongoforapproval" class="accesscontroller deductiongoforapproval peer sr-only">
                        <div class="peer h-6 w-11 scale-[0.8] rounded-full bg-gray-400 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-blue-300 rtl:peer-checked:after:-translate-x-full"></div>
                        <span class="ms-2 text-xs font-medium text-blue-900">Toggle Go for Approval</span>
                    </label>
                </div>
                <div class="form-group">
                    <label for="deductionstatus" class="control-label">Status</label>
                    <select id="deductionstatus" value="${data.deductionstatus}" name="deductionstatus" class="form-control comps deductionstatus bg-white">
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                    </select>
                </div>
            </div>
        </div>
        </div>
        `).join('');
        return swal.close(); // Close the loading alert once the request is complete
    }

    if(!id)document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> Loading... </td>`

    let request = await httpRequest2(`api/v1/savings/product`, null, document.querySelector('#viewrequisitionform #submit'), 'json', 'GET');
    let requestloan = await httpRequest2(`api/v1/loan/product`, null, document.querySelector('#viewrequisitionform #submit'), 'json', 'GET');
    swal.close(); // Close the loading alert once the request is complete
    if(!id)document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> No Records Retrieved </td>`
    if(request.status) {
        if(!id){
            eligibilityloans = requestloan.data;
            eligibilitysavings = request.data;
            if(request.data.length) {
                did('compulsorydepositpenaltyfrom').innerHTML = `<option value="">-- Select Eligibility Product --</option>`;
                did('compulsorydepositpenaltyfrom').innerHTML += request.data.map(data=>`<option value="${data.id}">${data.productname}</option>`).join('')
                did('compulsorydepositpenaltyfallbackfrom').innerHTML = `<option value="">-- Select Eligibility Product --</option>`;
                did('compulsorydepositpenaltyfallbackfrom').innerHTML += request.data.map(data=>`<option value="${data.id}">${data.productname}</option>`).join('')
                datasource = request.data
                resolvePagination(datasource, onsavingsproductTableDataSignal);
            }
        } else {
            document.getElementsByClassName('updater')[0].click();
            const thedata = request.data.filter(item => item.id == id)[0];
            populateData(thedata);
            if (thedata.membership.includes('||')) {
                did('membership').tomselect.setValue(thedata.membership.split('||'));
            }else{
                did('membership').tomselect.setValue(thedata.membership);
            }
        }
    } else {
        return notification('No records retrieved');
    }
}

async function handledateai(id, instructions='Enter your input') {
    // Open a modal with an input field using SweetAlert
    const { value: userInput } = await Swal.fire({
        title: 'Lets do some computation!!',
        text: instructions,
        input: 'text',
        inputPlaceholder: 'Feel free to Express yourself, We will understand',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Submit',
        showLoaderOnConfirm: true,
        preConfirm: async (inputValue) => {
            if (!inputValue) {
                Swal.showValidationMessage('Input cannot be empty');
                return false;   
            }
            let paramstr = new FormData();
            paramstr.append('sentence', inputValue);

            let request = await httpRequest2('api/v1/ai/generatedatecode', paramstr, null, 'json', 'POST');
            if(request.status) {    
                return did(id).value = request.data.dateCode;
            }else{
                return notification(request.message, 0);
            }
        },
        allowOutsideClick: () => !Swal.isLoading()
    });

    // Show notification based on the result
    if (userInput) {
        return notification(userInput.message);
    }
}

async function handledateai2(id, instructions='Enter your input', freq) {
    // Open a modal with an input field using SweetAlert
    const { value: userInput } = await Swal.fire({
        title: 'Lets do some computation!!',
        text: instructions,
        input: 'text',
        inputPlaceholder: 'Feel free to Express yourself, We will understand',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Submit',
        showLoaderOnConfirm: true,
        preConfirm: async (inputValue) => {
            if (!inputValue) {
                Swal.showValidationMessage('Input cannot be empty');
                return false;   
            }
            let paramstr = new FormData();
            paramstr.append('sentence', inputValue);

            let request = await httpRequest2('api/v1/ai/generatedatecode', paramstr, null, 'json', 'POST');
            if(request.status) {    
                let params = new FormData();
                params.append('savingsproductid', freq);
                params.append('compulsorydepositfrequency', request.data.dateCode);
                params.append('branch', id)
                let request2 = await httpRequest2(`api/v1/savings/overridefrequency`, params, null, 'json', 'POST');
                if(request2.status) {
                    manageoverridefrequency(freq)
                    return notification('Frequency override updated successfully', 1);
                }else{
                    manageoverridefrequency(freq)
                    return notification(request2.message, 0);
                }
            }else{
                return notification(request.message, 0);
            }
        },
        allowOutsideClick: () => !Swal.isLoading()
    });

    // Show notification based on the result
    if (userInput) {
        return notification(userInput.message);
    }
}

async function codemeaning(id, state=true) {
    
    const element = document.getElementById(id);
    if(state){
        if (!element.value) {
            return notification('No Code found', 0);
        }
    }else{
        if (!element.innerHTML) {
            return notification('No Code found', 0);
        }
    }

    // Show loading alert
    if(state)Swal.fire({
        title: 'Loading...',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    let holdvalue = state ? element.value : element.innerHTML;
    if(!state){
        element.innerHTML = 'Loading...'
    }
    

    try {
        // Make the API request
        const response = await httpRequest2(`api/v1/ai/generatesentence?code=${encodeURIComponent(holdvalue)}`, null, null, 'json', 'GET');
        // Close the loading alert
        if(state)Swal.close();

        if (response.status) {
            // Show the result in a SweetAlert
            if(state)Swal.fire({
                title: 'Code Meaning',
                html: response.data.sentence || 'No meaning available.',
                icon: 'success',
                confirmButtonText: 'GREAT',
                confirmButtonColor: '#3085d6',
                showCancelButton: true,
                cancelButtonText: 'POORLY',
                cancelButtonColor: '#d33',
            }).then((result) => {
                if (result.dismiss === Swal.DismissReason.cancel) {
                    notification('Please try refining your statement for better understanding.', 0);
                }
            });
            else{
                element.innerHTML = response.data.sentence.split('😊')[0] || 'No meaning available.';
                element.setAttribute('onclick', '');
            }
        
        } else {
            // Show error notification
            if(state)Swal.fire({
                title: 'Error',
                text: response.message || 'Unable to retrieve code meaning.',
                icon: 'error',
                confirmButtonText: 'OK',
                confirmButtonColor: '#3085d6',
            });
        }
    } catch (error) {
        // Close the loading alert and show error
        if(state)Swal.close();
        if(state)Swal.fire({
            title: 'Error',
            text: 'An unexpected error occurred.',
            icon: 'error',
            confirmButtonText: 'OK',
            confirmButtonColor: '#3085d6',
        });
        console.error('Error fetching code meaning:', error);
    }
}

function addInterest(e) {
    e.preventDefault();
    let random = Math.floor(Math.random() * 100);
    const interestContainer = document.getElementById('interestcontainer');
    const interestDiv = document.createElement('div');
    interestDiv.className = 'table-content mb-3 shadow-md';
    interestDiv.innerHTML = `
        <div class="flex flex-col space-y-3 rounded-sm bg-green-50 p-5 xl:p-10">
            <div class="flex justify-between">
                <h3 class="text-md mb-3 font-semibold text-[green]">INTEREST</h3>
                <button title="Delete" onclick="this.parentElement.parentElement.parentElement.remove()" class="material-symbols-outlined h-8 w-8 rounded-full bg-red-500 text-xs text-white drop-shadow-md" style="font-size: 18px;">delete</button>
            </div>
            <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div class="form-group">
                    <label for="interestname" class="control-label">Interest Name</label>
                    <input type="text" id="interestname" name="interestname" class="form-control comps interestname bg-white" placeholder="Enter Interest Name">
                </div>
                <div class="form-group">
                    <label for="interestmethod" class="control-label">Interest Method</label>
                    <select id="interestmethod" name="interestmethod" class="form-control comps interestmethod bg-white">
                        <option value="LATEST BALANCE">Latest Balance</option>
                        <option value="PRO RATA BASIS">Pro Rata Basis</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="eligibilityaccountage" class="control-label">Eligibility Account Age (months)</label>
                    <input type="number" id="interesteligibilityaccountage" name="interesteligibilityaccountage" class="form-control comps interesteligibilityaccountage bg-white" placeholder="Enter Account Age">
                </div>
                <div class="form-group">
                    <label for="interesteligibilitybalance" class="control-label">interestEligibility Balance</label>
                    <input type="number" id="interesteligibilitybalance" name="interesteligibilitybalance" class="form-control comps interesteligibilitybalance bg-white" placeholder="Enter Eligibility Balance">
                </div>
                <div class="form-group">
                    <label for="interestamount" class="control-label">Interest Amount</label>
                    <input type="number" id="interestamount" name="interestamount" class="form-control comps interestamount bg-white" placeholder="Enter Interest Amount">
                </div>
                <div class="form-group">
                    <label for="interesttype" class="control-label">Interest Type</label>
                    <select id="interesttype" name="interesttype" class="form-control comps interesttype bg-white">
                        <option value="PERCENTAGE">Percentage</option>
                        <option value="AMOUNT">Amount</option>
                    </select>
                </div>
                <div class="form-group relative">
                    <label for="interestfrequency" class="control-label">Interest Frequency</label>
                    <input type="text" class="form-control interestfrequency bg-white" readonly name="interestfrequency" id="interestfrequency${random}" onclick="handledateai('interestfrequency${random}', 'Please describe how you would want the interest frequency to be in your language and trust us we will get it right!!')" class="form-control comps cursor-pointer" placeholder="Enter Interest Frequency (e.g., D1 for Daily)">
                    <span class="material-symbols-outlined absolute right-2 top-2 -translate-y-1/2 transform cursor-pointer text-gray-500" onclick="codemeaning('interestfrequency${random}')" style="font-size: 18px;">
                        visibility
                    </span>
                </div>
                <div class="form-group">
                    <label class="control-label">Go for Approval</label>
                    <label class="relative mb-[1px] inline-flex cursor-pointer items-center bg-[#1d68e305] p-2 pl-1">
                        <input type="checkbox" id="interestgoforapproval" name="interestgoforapproval" class="accesscontroller interestgoforapproval peer sr-only">
                        <div class="peer h-6 w-11 scale-[0.8] rounded-full bg-gray-400 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-blue-300 rtl:peer-checked:after:-translate-x-full"></div>
                        <span class="ms-2 text-xs font-medium text-blue-900">Toggle Go for Approval</span>
                    </label>
                </div>
                <div class="form-group">
                    <label for="status" class="control-label">Status</label>
                    <select id="intereststatus" name="intereststatus" class="form-control intereststatus comps bg-white">
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                    </select>
                </div>
            </div>
        </div>
    `;
    interestContainer.appendChild(interestDiv);
}

function addDeduction(e) {
    e.preventDefault();
    let random = Math.floor(Math.random() * 100);
    const deductionContainer = document.getElementById('deductioncontainer');
    const deductionDiv = document.createElement('div');
    deductionDiv.className = 'table-content mb-3 shadow-md';
    deductionDiv.innerHTML = `
        <div class="flex flex-col space-y-3 rounded-sm bg-red-50 p-5 xl:p-10">
            <div class="flex justify-between">
                <h3 class="text-md mb-3 font-semibold text-[red]">DEDUCTION</h3>
                <button title="Delete" onclick="this.parentElement.parentElement.parentElement.remove()" class="material-symbols-outlined h-8 w-8 rounded-full bg-red-500 text-xs text-white drop-shadow-md" style="font-size: 18px;">delete</button>
            </div>
            <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div class="form-group">
                    <label for="deductionname" class="control-label">Deduction Name</label>
                    <input type="text" id="deductionname" name="deductionname" class="form-control comps deductionname bg-white" placeholder="Enter Deduction Name">
                </div>
                <div class="form-group">
                    <label for="deductionmethod" class="control-label">Deduction Method</label>
                    <select id="deductionmethod" name="deductionmethod" class="form-control comps deductionmethod bg-white">
                        <option value="LATEST BALANCE">Latest Balance</option>
                        <option value="PRO RATA BASIS">Pro Rata Basis</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="eligibilityaccountagededuction" class="control-label">Eligibility Account Age (months)</label>
                    <input type="number" id="deductioneligibilityaccountagededuction" name="deductioneligibilityaccountagededuction" class="form-control comps deductioneligibilityaccountagededuction bg-white" placeholder="Enter Account Age">
                </div>
                <div class="form-group">
                    <label for="deductioneligibilitybalancededuction" class="control-label">Deduction Eligibility Balance</label>
                    <input type="number" id="deductioneligibilitybalancededuction" name="deductioneligibilitybalancededuction" class="form-control comps deductioneligibilitybalancededuction bg-white" placeholder="Enter Eligibility Balance">
                </div>
                <div class="form-group">
                    <label for="deductionamount" class="control-label">Deduction Amount</label>
                    <input type="number" id="deductionamount" name="deductionamount" class="form-control comps deductionamount bg-white" placeholder="Enter Deduction Amount">
                </div>
                <div class="form-group">
                    <label for="deductiontype" class="control-label">Deduction Type</label>
                    <select id="deductiontype" name="deductiontype" class="form-control comps deductiontype bg-white">
                        <option value="PERCENTAGE">Percentage</option>
                        <option value="AMOUNT">Amount</option>
                    </select>
                </div>
                <div class="form-group relative">
                    <label for="deductionfrequency" class="control-label">Deduction Frequency</label>
                    <input type="text" class="form-control deductionfrequency" readonly name="deductionfrequency" id="deductionfrequency${random}" onclick="handledateai('deductionfrequency${random}', 'Please describe how you would want the deduction frequency to be in your language and trust us we will get it right!!')" class="form-control comps cursor-pointer" placeholder="Enter Deduction Frequency">
                    <span class="material-symbols-outlined absolute right-2 top-2 -translate-y-1/2 transform cursor-pointer text-gray-500" onclick="codemeaning('deductionfrequency${random}')" style="font-size: 18px;">
                        visibility
                    </span>
                </div>
                <div class="form-group">
                    <label class="control-label">Go for Approval</label>
                    <label class="relative mb-[1px] inline-flex cursor-pointer items-center bg-[#1d68e305] p-2 pl-1">
                        <input type="checkbox" id="deductiongoforapproval" name="deductiongoforapproval" class="accesscontroller deductiongoforapproval peer sr-only">
                        <div class="peer h-6 w-11 scale-[0.8] rounded-full bg-gray-400 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-blue-300 rtl:peer-checked:after:-translate-x-full"></div>
                        <span class="ms-2 text-xs font-medium text-blue-900">Toggle Go for Approval</span>
                    </label>
                </div>
                <div class="form-group">
                    <label for="deductionstatus" class="control-label">Status</label>
                    <select id="deductionstatus" name="deductionstatus" class="form-control comps deductionstatus bg-white">
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                    </select>
                </div>
            </div>
        </div>
    `;
    deductionContainer.appendChild(deductionDiv);
}

async function manageoverridefrequency(id) {
    try {
        // Show loading state using SweetAlert
        const loadingAlert = Swal.fire({
            title: 'Please wait...',
            text: 'Fetching frequency overrides, please wait.',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        // const branches = await returnAllbranch();
        const frequency = await returnAllfrequencyoverride(id);
        Swal.close(); // Close the loading alert once the branches are fetched

        const rows = frequency.map((item, index) => `
            <tr>
                <td style="text-align: left;">${index + 1}</td>
                <td style="text-align: left;">${item.branch}</td>
                <td style="position: relative;">
                    <input type="text" value="${item.compulsorydepositfrequency??''}" readonly name="frequencyoverride" id="thisoken-${item.branchid}" onclick="handledateai2('${item.branchid}', 'Please describe how you would want the frequency override to be in your language and trust us we will get it right!!', ${id})" class="form-control comps cursor-pointer" placeholder="Enter Frequency Override">
                    <span class="material-symbols-outlined absolute right-6 top-8 -translate-y-1/2 transform cursor-pointer text-gray-500" onclick="codemeaning('thisoken-${item.branchid}')" style="font-size: 18px;">
                        visibility
                    </span>
                </td>
            </tr>
        `).join('');

        const tableHTML = `
            <div class="table-content">
                <table>
                    <thead>
                        <tr>
                            <th style="width:50px">s/n</th>
                            <th>Branch Name</th>
                            <th>Frequency Override</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                    </tbody>
                </table>
            </div>
        `;

        Swal.fire({
            title: 'Branches and Frequency Overrides',
            html: tableHTML,
            confirmButtonText: 'OK',
            confirmButtonColor: '#3085d6',
        });
    } catch (error) {
        console.error(error);
        notification('An error occurred while fetching branches', 0);
    }
}

async function returnAllfrequencyoverride(id) {
    try {
        let request = await httpRequest2(`api/v1/savings/overridefrequency?savingsproductid=${id}`, null, null, 'json', 'GET');
        if (request.status) {
            return request.data;
        } else {
            return []
        }
    } catch (error) {
        console.error('Error fetching branches:', error);
        notification('Failed to fetch branches', 0);
        return []
    }
}


async function onsavingsproductTableDataSignal() {
    let rows = getSignaledDatasource().map((item, index) => `
    <tr>
        <td>${index + 1}</td>
        <td>${item.productname}</td>
        <td>${item.membership??item.membervalues.includes('||') ? item.membervalues.replaceAll('||', ', ') : item.membervalues??'No Membership'}</td>
        <td>${item.currency}</td>
        <td style="color: ${item.allowdeposit ? 'green' : 'red'};">${item.allowdeposit ? 'ALLOWED' : 'NOT ALLOWED'}</td>
        <td style="color: ${item.allowwithdrawal ? 'green' : 'red'};">${item.allowwithdrawal ? 'ALLOWED' : 'NOT ALLOWED'}</td>
        <td>${formatNumber(item.minimumaccountbalance)}</td>
        <td>${item.interests.length}</td>
        <td>${item.deductions.length}</td> 
        <td class="flex items-center gap-3">
            <button title="View product" onclick="viewSavingsProduct('${item.id}')" class="material-symbols-outlined h-8 w-8 rounded-full bg-green-600 text-xs text-white drop-shadow-md" style="font-size: 18px;">visibility</button>
            <button title="Override Frequencies" onclick="manageoverridefrequency('${item.id}')" class="${item.compulsorydeposit ? '' : 'hidden'} material-symbols-outlined rounded-full bg-orange-600 h-8 w-8 text-white drop-shadow-md text-xs" style="font-size: 18px;">manage_accounts</button>
            <button title="Edit product" onclick="fetchsavingsproduct('${item.id}')" class="material-symbols-outlined h-8 w-8 rounded-full bg-blue-600 text-xs text-white drop-shadow-md" style="font-size: 18px;">edit</button>
        </td>
    </tr>`
    )
    .join('')
    injectPaginatatedTable(rows)
}

async function viewSavingsProduct(id) {
    // Filter the datasource to find the product with the given id
    const product = datasource.find(item => item.id == id);

    if (!product) {
        return Swal.fire({
            title: 'Error',
            text: 'Product not found.',
            icon: 'error',
            confirmButtonText: 'OK',
            confirmButtonColor: '#3085d6'
        });
    }

    try {
        // Fetch frequency overrides
        const frequencyOverrides = await returnAllfrequencyoverride(id);

        // Construct the HTML content for the SweetAlert modal
        const productDetails = `
            <div class="min-h-screen bg-gray-50 p-6">
                <h1 class="mb-8 text-3xl font-bold text-gray-800">${product.productname}</h1>
                
                <!-- General Information Section -->
                <section class="section mb-12 rounded-sm bg-white/90 p-5 shadow-sm xl:p-10">
                    <h2 class="mb-4 text-lg font-semibold">General Information</h2>
                    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <!-- Displaying all general info fields -->
                        <div class="form-group">
                            <label class="control-label">Product ID</label>
                            <div class="text-sm text-gray-700">${product.id}</div>
                        </div>
                        <div class="form-group">
                            <label class="control-label">Product Name</label>
                            <div class="text-sm text-gray-700">${product.productname}</div>
                        </div>
                        <!-- Add other general information fields similarly -->
                        <!-- ... -->
                    </div>
                </section>
                
                <!-- Deposit Settings Section -->
                <section class="section mb-12 rounded-sm bg-white/90 p-5 shadow-sm xl:p-10">
                    <h2 class="mb-4 text-lg font-semibold">Deposit Settings</h2>
                    <div class="form-group mb-4">
                        <label class="control-label">Allow Deposit</label>
                        <div class="text-sm text-gray-700">${product.allowdeposit ? 'Yes' : 'No'}</div>
                    </div>
                    
                    ${product.allowdeposit ? `
                        <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
                            <!-- Deposit Details -->
                            <div class="form-group">
                                <label class="control-label">Deposit Charge</label>
                                <div class="text-sm text-gray-700">${product.depositcharge} (${product.depositechargetype})</div>
                            </div>
                            <!-- Compulsory Deposit Settings -->
                            <div class="col-span-1 mt-4 rounded-md bg-gray-50 p-4 lg:col-span-2">
                                <h3 class="text-md mb-3 font-semibold">Compulsory Deposit Settings</h3>
                                <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                    <div class="form-group">
                                        <label class="control-label">Compulsory Deposit</label>
                                        <div class="text-sm text-gray-700">${product.compulsorydeposit ? 'Yes' : 'No'}</div>
                                    </div>
                                    ${product.compulsorydeposit ? `
                                        <div class="form-group">
                                            <label class="control-label">Frequency Amount</label>
                                            <div class="text-sm text-gray-700">${product.compulsorydepositfrequencyamount ?? 'N/A'}</div>
                                        </div>
                                        <!-- Add other compulsory deposit fields similarly -->
                                        <!-- ... -->
                                        <div class="form-group">
                                            <label class="control-label">Deposit Frequency (Click to Decode)</label>
                                            <div id="compulsorydepositfrequencyview-${product.id}" onclick="codemeaning('compulsorydepositfrequencyview-${product.id}', false)" class="cp text-sm font-bold text-orange-700">${product.compulsorydepositfrequency}</div>
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                        </div>
                    ` : ''}
                </section>
            
                <!-- Withdrawal Settings Section -->
                <section class="section mb-12 rounded-sm bg-white/90 p-5 shadow-sm xl:p-10">
                    <h2 class="mb-4 text-lg font-semibold">Withdrawal Settings</h2>
                    <div class="form-group mb-4">
                        <label class="control-label">Allow Withdrawal</label>
                        <div class="text-sm text-gray-700">${product.allowwithdrawal ? 'Yes' : 'No'}</div>
                    </div>
                    
                    ${product.allowwithdrawal ? `
                        <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
                            <!-- Withdrawal Details -->
                            <div class="form-group">
                                <label class="control-label">Withdrawal Limit</label>
                                <div class="text-sm text-gray-700">${product.withdrawallimit} (${product.withdrawallimittype ?? 'N/A'})</div>
                            </div>
                            <!-- Add other withdrawal fields similarly -->
                            <div class="form-group">
                                <label class="control-label">Withdrawal Charges</label>
                                <div class="text-sm text-gray-700">${product.withdrawalcharges ?? 'N/A'} (${product.withdrawalchargetype ?? 'N/A'})</div>
                            </div>
                            <!-- ... -->
                            <div class="form-group">
                                <label class="control-label">Withdrawal Charge Interval (Click to Decode)</label>
                                <div id="withdrawalchargeintervalview-${product.id}" onclick="codemeaning('withdrawalchargeintervalview-${product.id}', false)" class="cp text-sm font-bold text-orange-700">${product.withdrawalchargeinterval}</div>
                            </div>
                            ${product.withdrawalcontrol ? `
                                <div class="col-span-1 mt-4 rounded-md bg-gray-50 p-4 lg:col-span-2">
                                    <h3 class="text-md mb-3 font-semibold">Withdrawal Control</h3>
                                    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                        <div class="form-group">
                                            <label class="control-label">Withdrawal Control</label>
                                            <div class="text-sm text-gray-700">${product.withdrawalcontrol ? 'Yes' : 'No'}</div>
                                        </div>
                                        <div class="form-group">
                                            <label class="control-label">Control Window (Click to Decode)</label>
                                            <div id="withdrawalcontrolwindowview-${product.id}" onclick="codemeaning('withdrawalcontrolwindowview-${product.id}', false)" class="cp text-sm font-bold text-orange-700">${product.withdrawalcontrolwindow ?? 'N/A'}</div>
                                        </div>
                                        <!-- Add other withdrawal control fields similarly -->
                                        <div class="form-group">
                                            <label class="control-label">Withdrawal Control Amount</label>
                                            <div class="text-sm text-gray-700">${product.withdrawalcontrolamount ?? 'N/A'}</div>
                                        </div>
                                        <div class="form-group">
                                            <label class="control-label">Withdrawal Control Type</label>
                                            <div class="text-sm text-gray-700">${product.withdrawalcontroltype ?? 'N/A'}</div>
                                        </div>
                                        <div class="form-group">
                                            <label class="control-label">Withdrawal Control Size</label>
                                            <div class="text-sm text-gray-700">${product.withdrawalcontrolsize ?? 'N/A'}</div>
                                        </div>
                                        <!-- ... -->
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                    ` : ''}
                </section>
            
                <!-- Eligibility Criteria Section -->
                <section class="section mb-12 rounded-sm bg-white/90 p-5 shadow-sm xl:p-10">
                    <h2 class="mb-4 text-lg font-semibold">Eligibility Criteria</h2>
                    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <div class="form-group">
                            <label class="control-label">Product Category</label>
                            <div class="text-sm text-gray-700">${product.eligibilityproductcategory ?? 'N/A'}</div>
                        </div>
                        <div class="form-group">
                            <label class="control-label">Eligibility Product</label>
                            <div class="text-sm text-gray-700">${product.eligibilityproduct ?? 0}</div>
                        </div>
                        <div class="form-group">
                            <label class="control-label">Account Age (Months)</label>
                            <div class="text-sm text-gray-700">${product.eligibilityaccountage ?? 'N/A'}</div>
                        </div>
                        <div class="form-group">
                            <label class="control-label">Minimum Balance</label>
                            <div class="text-sm text-gray-700">${product.eligibilityminbalance ?? 'N/A'}</div>
                        </div>
                        <div class="form-group">
                            <label class="control-label">Minimum Credit</label>
                            <div class="text-sm text-gray-700">${product.eligibilitymincredit ?? 'N/A'}</div>
                        </div>
                        <div class="form-group">
                            <label class="control-label">Minimum Debit</label>
                            <div class="text-sm text-gray-700">${product.eligibilitymindebit ?? 'N/A'}</div>
                        </div>
                        <div class="form-group">
                            <label class="control-label">Minimum Closed Accounts</label>
                            <div class="text-sm text-gray-700">${product.eligibilityminimumclosedaccounts ?? 'N/A'}</div>
                        </div>
                        <div class="form-group">
                            <label class="control-label">Minimum Loan</label>
                            <div class="text-sm text-gray-700">${product.eligibilityminimumloan ?? 'N/A'}</div>
                        </div>
                    </div>
                </section>
            
                <!-- Deductions Section -->
                <section class="section mb-12">
                    <h2 class="mb-4 text-2xl font-semibold text-gray-800">Deductions</h2>
                    <div class="grid grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-2">
                        ${product.deductions.map(d => `
                            <div class="table-content mb-3 rounded-sm border-l-4 border-red-500 bg-white shadow-md">
                                <div class="flex flex-col space-y-4 rounded-sm p-5 xl:p-6">
                                    <div class="flex items-center justify-between">
                                        <h3 class="text-lg font-semibold text-red-700">${d.deductionname}</h3>
                                    </div>
                                    <dl class="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                                        <div>
                                            <dt class="font-medium text-gray-600">ID</dt>
                                            <dd class="text-gray-800">${d.id}</dd>
                                        </div>
                                        <div>
                                            <dt class="font-medium text-gray-600">Savings Product ID</dt>
                                            <dd class="text-gray-800">${d.savingsproductid}</dd>
                                        </div>
                                        <!-- Add other deduction fields similarly -->
                                        <!-- ... -->
                                        <div class="form-group">
                                            <label class="control-label">Frequency (Click to Decode)</label>
                                            <div id="deductionfrequencyview-${d.id}" onclick="codemeaning('deductionfrequencyview-${d.id}', false)" class="cp text-sm font-bold text-orange-700">${d.deductionfrequency}</div>
                                        </div>
                                    </dl>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </section>
            
                <!-- Interests Section -->
                <section class="section">
                    <h2 class="mb-4 text-2xl font-semibold text-gray-800">Interests</h2>
                    <div class="grid grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-2">
                        ${product.interests.map(i => `
                            <div class="table-content mb-3 rounded-sm border-l-4 border-green-500 bg-white shadow-md">
                                <div class="flex flex-col space-y-4 rounded-sm p-5 xl:p-6">
                                    <div class="flex items-center justify-between">
                                        <h3 class="text-lg font-semibold text-green-700">${i.interestname}</h3>
                                    </div>
                                    <dl class="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                                        <div>
                                            <dt class="font-medium text-gray-600">ID</dt>
                                            <dd class="text-gray-800">${i.id}</dd>
                                        </div>
                                        <div>
                                            <dt class="font-medium text-gray-600">Savings Product ID</dt>
                                            <dd class="text-gray-800">${i.savingsproductid}</dd>
                                        </div>
                                        <!-- Add other interest fields similarly -->
                                        <!-- ... -->
                                        <div>
                                            <label class="control-label">Interest Frequency (Click to Decode)</label>
                                            <div id="interestfrequencyview-${i.id}" onclick="codemeaning('interestfrequencyview-${i.id}', false)" class="cp text-sm font-bold text-orange-700">${i.interestfrequency}</div>
                                        </div>
                                    </dl>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </section>

                <!-- Frequency Overrides Section -->
                <section class="section mb-12 rounded-sm bg-white/90 p-5 shadow-sm xl:p-10">
                    <h2 class="mb-4 text-lg font-semibold">Frequency Overrides</h2>
                    ${frequencyOverrides.length > 0 ? `
                        <div class="table-content">
                            <table class="min-w-full divide-y divide-gray-200">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Branch Name</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Frequency Override</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-200 bg-white">
                                    ${frequencyOverrides.map(f => `
                                        <tr>
                                            <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-700">${f.branch}</td>
                                            <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                                                <div id="frequencyoverride-${f.branchid}" onclick="codemeaning('frequencyoverride-${f.branchid}', false)" class="cp text-sm font-bold text-orange-700">${f.compulsorydepositfrequency ?? 'N/A'}</div>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    ` : `
                        <div class="text-sm text-gray-700">No Frequency Overrides available.</div>
                    `}
                </section>
            </div>
        `;

        // Show the SweetAlert modal with the product details
        Swal.fire({
            html: productDetails,
            confirmButtonText: '<span style="color: blue;">Close</span>',
            width: '95%',
            closeButton: true,
            showCancelButton: true,
            cancelButtonText: '<span style="color: green;" onclick="fetchsavingsproduct(\'' + id + '\')">Edit</span>',
            showDenyButton: true,
            denyButtonText: '<span style="color: red;" onclick="manageoverridefrequency(\'' + id + '\')">Manage Account</span>'
        });
    } catch (error) {
        console.error('Error fetching frequency overrides:', error);
        Swal.fire({
            title: 'Error',
            text: 'An error occurred while fetching frequency overrides.',
            icon: 'error',
            confirmButtonText: 'OK',
            confirmButtonColor: '#3085d6'
        });
    }
}






async function savingsproductFormSubmitHandler() {
    if(!validateForm('savingsproductform', getIdFromCls('comp'))) return

    givenamebyclass('interestname');
    givenamebyclass('interestmethod');
    givenamebyclass('interesteligibilityaccountage');
    givenamebyclass('interesteligibilitybalance');
    givenamebyclass('interestamount');
    givenamebyclass('interesttype');
    givenamebyclass('interestfrequency');
    givenamebyclass('interestgoforapproval');
    givenamebyclass('intereststatus');
    givenamebyclass('deductionname');
    givenamebyclass('deductionmethod');
    givenamebyclass('deductioneligibilityaccountagededuction');
    givenamebyclass('deductioneligibilitybalancededuction');
    givenamebyclass('deductionamount');
    givenamebyclass('deductiontype');
    givenamebyclass('deductionfrequency');
    givenamebyclass('deductiongoforapproval');
    givenamebyclass('deductionstatus');

    let payload = new FormData(document.querySelector('#savingsproductform'));
    if(savingsproductid)payload.set('id', savingsproductid);
    payload.set('interestrowsize', document.querySelector('#interestcontainer').children.length);
    payload.set('deductionrowsize', document.querySelector('#deductioncontainer').children.length);
    payload.set('membership', document.querySelector('#membership').tomselect.getValue().join('||'));
    
    // return console.log('Payload:', Array.from(payload.entries()).reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {}));


    const confirmed = await Swal.fire({
        title: savingsproductid ? 'Updating...' : 'Submitting...',
        text: 'Please wait while we submit your data.',
        icon: 'info',
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: async () => {
            Swal.showLoading();
            let request = await httpRequest2('api/v1/savings/product', payload, document.querySelector('#savingsproductform #submit'), 'json', 'POST');
            Swal.close();

            if (request.status) {
                notification('Success!', 1);
                const form = document.querySelector('#savingsproductform');
                form.reset();
                if(savingsproductid)form.querySelectorAll('input, select, textarea').forEach(input => input.value = '');
                savingsproductid = '';
                document.getElementsByClassName('viewer')[0].click();
                fetchsavingsproduct();
            } else {    
                notification(request.message, 0);
            }
        }
    });
}
