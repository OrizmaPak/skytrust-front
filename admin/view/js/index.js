let the_user = JSON.parse(sessionStorage.getItem('user'))
let departmentsbybranch
let availroom
let availableroomlength
let occupiedroomlength
let receiveablelength
let payableslength
let saleslength
let userpermission
let allratecodes
const default_department = 'Main Store'
const default_branch = 'Head Quarters'
let organisationSettings



function formatCurrency(amount, dec=2) {
  // Use the Intl.NumberFormat object for currency formatting
  const formatter = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'USD',
    currencyDisplay: 'symbol', // Display currency as a symbol (e.g., $)
    minimumFractionDigits: dec,
    maximumFractionDigits: dec,
  });

  // Format the amount using the formatter
  const formattedCurrency = formatter.format(amount);

  return formattedCurrency;
}

const userlistdata = {
    data: null,
    lastfetched: null
}

async function getAllUsers(id='user', value='email', state=false, disabled=false) {
    const currentTime = new Date().getTime();
    const twentyMinutes = 2 * 60 * 1000; // 20 minutes in milliseconds

    // Check if data exists and if it was fetched more than 20 minutes ago
    if (userlistdata.data && (currentTime - userlistdata.lastfetched < twentyMinutes)) {
        populateUserOptions(userlistdata.data, id, value, state, disabled);
        return;
    }

    try {
        let request = await httpRequest2('api/v1/members/userregistration', null, null, 'json', 'GET');
        if (request.status) {
            userlistdata.data = request.data; // Save data
            userlistdata.lastfetched = currentTime; // Record the time it was saved
            populateUserOptions(request.data, id, value, state, disabled);
        } else {
            notification(request.message, 0);
        }
    } catch (error) {
        console.error('Error fetching users:', error);
        notification('Failed to fetch users', 0);
    }
}

function populateUserOptions(data, id, value, state, disabled) {
    const element = document.getElementById(id);
    if (element) {
        if(state)element.disabled = true;
        element.innerHTML = `<option value="">--SELECT USER--</option>`;
        if (value == 'email') {
            element.innerHTML += data.map(user => 
                `<option value="${user.email}" ${state ? user.id == the_user.id ? 'selected' : '' : ''} ${disabled ? 'disabled' : ''}>${user.lastname ?? ''} ${user.firstname ?? ''} ${user.othernames ?? ''}</option>`
            ).join('');
        }
        if (value == 'name') {
            element.innerHTML += data.map(user => 
                `<option value="${user.id}" ${state ? user.id == the_user.id ? 'selected' : '' : ''} ${disabled ? 'disabled' : ''}>${user.lastname ?? ''} ${user.firstname ?? ''} ${user.othernames ?? ''}</option>`
            ).join('');
        }
        if (value == 'staff') {
            element.innerHTML += data.filter(data=>data.role == 'STAFF').map(user => 
                `<option value="${user.id}" ${state ? user.id == the_user.id ? 'selected' : '' : ''} ${disabled ? 'disabled' : ''}>${user.lastname ?? ''} ${user.firstname ?? ''} ${user.othernames ?? ''}</option>`
            ).join('');
        }
        // setTimeout(() => {
            if(state)element.disabled = false;
        // },  300);
    }
}

const branchlistdata = {
    data: null,
    lastfetched: null
}

async function getAllbranch(state=false, id="branch", time=30) {
    const currentTime = new Date().getTime();
    const twentyMinutes = time * 60 * 1000; // 2 seconds in milliseconds

    // Check if data exists and if it was fetched more than 20 minutes ago
    if (branchlistdata.data && (currentTime - branchlistdata.lastfetched < twentyMinutes)) {
        populateBranchOptions(branchlistdata.data, state, id);
        return;
    }

    try {
        let request = await httpRequest2('api/v1/admin/branch', null, null, 'json', 'GET');
        if (request.status) {
            branchlistdata.data = request.data; // Save data
            branchlistdata.lastfetched = currentTime; // Record the time it was saved
            populateBranchOptions(request.data, state, id);
        } else {
            notification('No records retrieved');
        }
    } catch (error) {
        console.error('Error fetching branches:', error);
        notification('Failed to fetch branches', 0);
    }
}

function populateBranchOptions(data, state, id) {
    const element = document.getElementById(id);
    if (element) {
        if(state)element.disabled = true;
        element.innerHTML = `<option value="">--SELECT BRANCH--</option>`;
        element.innerHTML += data.map(branch => 
            `<option value="${branch.id}" ${state ? branch.id == the_user.branch ? 'selected' : '' : ''}>${branch.branch}</option>`
        ).join('');
        // setTimeout(() => {
            if(state)element.disabled = false;
        // }, 300);
    }
}


const savingsProductData = {
    data: null,
    lastfetched: null
};

async function getAllSavingsProducts(id="savingsproductid", time=30) {
    const currentTime = new Date().getTime();
    const cacheDuration = time * 60 * 1000; // Convert time to milliseconds

    // Check if data exists and if it was fetched more than the cache duration ago
    if (savingsProductData.data && (currentTime - savingsProductData.lastfetched < cacheDuration)) {
        populateSavingsProductOptions(savingsProductData.data, id);
        return;
    }

    try {
        let request = await httpRequest2('api/v1/savings/product', null, null, 'json', 'GET');
        if (request.status) {
            savingsProductData.data = request.data; // Save data
            savingsProductData.lastfetched = currentTime; // Record the time it was saved
            populateSavingsProductOptions(request.data, id);
        } else {
            notification('No records retrieved');
        }
    } catch (error) {
        console.error('Error fetching savings products:', error);
        notification('Failed to fetch savings products', 0);
    }
}

function populateSavingsProductOptions(data, id) {
    const element = document.getElementById(id);
    if (element) {
        element.innerHTML = `<option value="">--SELECT SAVINGS PRODUCT--</option>`;
        element.innerHTML += data.map(product => 
            `<option value="${product.id}">${product.productname}</option>`
        ).join('');
    }
}

const supplierData = {
    data: null,
    lastfetched: null
};

async function getAllSuppliers(id="supplierid", state="id", time=0) {
    const currentTime = new Date().getTime();
    const cacheDuration = time * 60 * 1000; // Convert time to milliseconds

    // Check if data exists and if it was fetched more than the cache duration ago
    if (supplierData.data && (currentTime - supplierData.lastfetched < cacheDuration)) {
        populateSupplierOptions(supplierData.data, id);
        return;
    }

    try {
        let request = await httpRequest2('api/v1/purchases/supplier', null, null, 'json', 'GET');
        if (request.status) {
            supplierData.data = request.data; // Save data
            supplierData.lastfetched = currentTime; // Record the time it was saved
            populateSupplierOptions(request.data, state, id);
        } else {
            notification('No records retrieved');
        }
    } catch (error) {
        console.error('Error fetching suppliers:', error);
        notification('Failed to fetch suppliers', 0);
    }
}

function populateSupplierOptions(data, state, id) {
    const element = document.getElementById(id);
    if (element) {
       if(state=="id"){ element.innerHTML = `<option value="">--SELECT SUPPLIER--</option>`;
        element.innerHTML += data.map(supplier => 
            `<option value="${supplier.id}">${supplier.supplier}</option>`
        ).join('')};
        if(state == "phone"){
            element.innerHTML = `<option value="">--SELECT SUPPLIER--</option>`;
            element.innerHTML += data.map(supplier => 
                `<option value="${organisationSettings.personal_account_prefix}${supplier.contactpersonphone}">${supplier.supplier}</option>`
            ).join('');
        }
    }
}

function copyText(element) {
    const text = element.innerText;
    navigator.clipboard.writeText(text).then(() => {
        notification('Copied to clipboard: ' + text);
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
}


async function getAndVerifyOTP() {
    const request = await httpRequest2(`api/v1/auth/sendotp`, null, null, 'json', 'GET');
    if (request.status) {
        return Swal.fire({
            title: 'Enter OTP',
            text: 'Please enter the OTP sent to your email or phone number.',
            input: 'text',
            inputAttributes: {
                maxlength: 6,
                autocapitalize: 'off',
                autocorrect: 'off'
            },
            showCancelButton: true,
            confirmButtonText: 'Submit',
            showLoaderOnConfirm: true,
            confirmButtonColor: '#3085d6',
            allowOutsideClick: false,
            cancelButtonColor: '#d33',
            preConfirm: async (otp) => {
                if (otp.length !== 6) {
                    Swal.showValidationMessage('Please enter a 6-digit OTP.');
                    return false;
                }
                try {
                    const params = new FormData();
                    params.append('otp', otp);
                    const verifyRequest = await httpRequest2(`api/v1/auth/verifyotp`, params, null, 'json', 'POST');
                    if (!verifyRequest.status) {
                        Swal.showValidationMessage('Invalid OTP. Please try again.');
                        return false;
                    }
                    return true;
                } catch (error) {
                    Swal.showValidationMessage('An error occurred while verifying OTP. Please try again.');
                    console.error('Error verifying OTP:', error);
                    return false;
                }
            },
            allowOutsideClick: () => !Swal.isLoading()
        }).then((result) => {
            return result.isConfirmed ? true : false;
        });
    }
    return false;
}

async function getAndVerifyPin() {
    const result = await Swal.fire({
        html: `
            <section id="pinSection" class="atm-interface max-w-md mx-auto bg-gradient-to-br from-gray-200 to-gray-400 rounded-lg shadow-2xl overflow-hidden">
                <div class="atm-screen bg-gradient-to-br from-gray-900 to-gray-700 text-white py-8 px-6 text-center rounded-t-lg">
                    <h2 id="pinheader" class="text-3xl font-bold">Enter PIN</h2>
                    <p id="redwarning" class="text-sm text-red-400 mt-2 hidden">Enter Current PIN to change your pin</p>
                    <p id="lostpin" class="text-sm text-gray-400 mt-2 hidden">If you have lost your PIN, <a href="#" class="text-blue-500 underline">Click here</a></p>
                    <input 
                        type="password" 
                        id="pinInput" 
                        class="w-3/4 mt-6 p-3 text-center text-xl border border-gray-600 rounded-lg bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-yellow-500" 
                        maxlength="4" 
                        placeholder="****" 
                        readonly
                    >
                </div>
                <div class="atm-keypad bg-white p-6 grid grid-cols-3 gap-4">
                    <button class="keypad-button bg-gradient-to-t from-gray-300 to-gray-100 text-gray-500 font-bold py-4 rounded-lg shadow-lg hover:shadow-xl active:shadow-md focus:outline-none focus:ring-4 focus:ring-gray-400" onclick="enterDigit(1)">1<br><span class="text-xs">.</span></button>
                    <button class="keypad-button bg-gradient-to-t from-gray-300 to-gray-100 text-gray-500 font-bold py-4 rounded-lg shadow-lg hover:shadow-xl active:shadow-md focus:outline-none focus:ring-4 focus:ring-gray-400" onclick="enterDigit(2)">2<br><span class="text-xs">ABC</span></button>
                    <button class="keypad-button bg-gradient-to-t from-gray-300 to-gray-100 text-gray-500 font-bold py-4 rounded-lg shadow-lg hover:shadow-xl active:shadow-md focus:outline-none focus:ring-4 focus:ring-gray-400" onclick="enterDigit(3)">3<br><span class="text-xs">DEF</span></button>
                    <button class="keypad-button bg-gradient-to-t from-gray-300 to-gray-100 text-gray-500 font-bold py-4 rounded-lg shadow-lg hover:shadow-xl active:shadow-md focus:outline-none focus:ring-4 focus:ring-gray-400" onclick="enterDigit(4)">4<br><span class="text-xs">GHI</span></button>
                    <button class="keypad-button bg-gradient-to-t from-gray-300 to-gray-100 text-gray-500 font-bold py-4 rounded-lg shadow-lg hover:shadow-xl active:shadow-md focus:outline-none focus:ring-4 focus:ring-gray-400" onclick="enterDigit(5)">5<br><span class="text-xs">JKL</span></button>
                    <button class="keypad-button bg-gradient-to-t from-gray-300 to-gray-100 text-gray-500 font-bold py-4 rounded-lg shadow-lg hover:shadow-xl active:shadow-md focus:outline-none focus:ring-4 focus:ring-gray-400" onclick="enterDigit(6)">6<br><span class="text-xs">MNO</span></button>
                    <button class="keypad-button bg-gradient-to-t from-gray-300 to-gray-100 text-gray-500 font-bold py-4 rounded-lg shadow-lg hover:shadow-xl active:shadow-md focus:outline-none focus:ring-4 focus:ring-gray-400" onclick="enterDigit(7)">7<br><span class="text-xs">PQRS</span></button>
                    <button class="keypad-button bg-gradient-to-t from-gray-300 to-gray-100 text-gray-500 font-bold py-4 rounded-lg shadow-lg hover:shadow-xl active:shadow-md focus:outline-none focus:ring-4 focus:ring-gray-400" onclick="enterDigit(8)">8<br><span class="text-xs">TUV</span></button>
                    <button class="keypad-button bg-gradient-to-t from-gray-300 to-gray-100 text-gray-500 font-bold py-4 rounded-lg shadow-lg hover:shadow-xl active:shadow-md focus:outline-none focus:ring-4 focus:ring-gray-400" onclick="enterDigit(9)">9<br><span class="text-xs">WXYZ</span></button>
                    <button class="keypad-button bg-gradient-to-t from-red-600 to-red-400 text-white font-bold py-4 rounded-lg shadow-lg hover:shadow-xl active:shadow-md focus:outline-none focus:ring-4 focus:ring-red-400" onclick="clearPin()">C</button>
                    <button class="keypad-button bg-gradient-to-t from-gray-300 to-gray-100 text-gray-500 font-bold py-4 rounded-lg shadow-lg hover:shadow-xl active:shadow-md focus:outline-none focus:ring-4 focus:ring-gray-400" onclick="enterDigit(0)">0<br><span class="text-xs"> </span></button>
                    <button class="keypad-button bg-gradient-to-t from-green-600 to-green-400 text-white font-bold py-4 rounded-lg shadow-lg hover:shadow-xl active:shadow-md focus:outline-none focus:ring-4 focus:ring-green-400" onclick="Swal.clickConfirm()">OK</button>
                </div>
            </section>
        `,
        showCancelButton: true,
        showLoaderOnConfirm: true,
        allowOutsideClick: false,
        cancelButtonColor: '#d33',
        background: 'rgba(0, 0, 0, 0)',
        preConfirm: async () => {
            const pinInput = document.getElementById('pinInput');
            if (pinInput.value.length === 4) {
                Swal.fire({
                    title: 'Verifying PIN...',
                    text: 'Please wait while we verify your PIN.',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });

                const params = new FormData();
                params.append('pin', pinInput.value);
                params.append('id', the_user.id);
                const request = await httpRequest2(`api/v1/admin/verifypin`, params, null, 'json', 'POST');

                Swal.close();

                if (request.status) {
                    notification('PIN submitted successfully!', 1);
                    notification('Authorized', 1);
                    sessionStorage.removeItem('pinTrialCount');
                    return true;
                } else {
                    if(request.message.includes('blocked')){
                        notification(request.message, 0);
                        return false;
                    }
                    let pinTrialCount = parseInt(sessionStorage.getItem('pinTrialCount') || '0', 10);
                    pinTrialCount += 1;
                    sessionStorage.setItem('pinTrialCount', pinTrialCount);

                    if (pinTrialCount >= 3) {
                        await httpRequest2(`api/v1/admin/blockpin`, params, null, 'json', 'POST');
                        notification('PIN blocked due to multiple failed attempts.', 0);
                        sessionStorage.removeItem('pinTrialCount');
                    } else {
                        notification(`Invalid PIN. You have ${3 - pinTrialCount} attempts left.`, 0);
                    }
                    return false;
                }
            } else {
                notification('Please enter a 4-digit PIN.', 0);
                return false;
            }
        }
    });

    return result.isConfirmed ? result.value : false;
}



async function returnAllbranch(time=30) {
    const currentTime = new Date().getTime();
    const twentyMinutes = time * 60 * 1000; // 2 seconds in milliseconds

    // Check if data exists and if it was fetched more than 20 minutes ago
    if (branchlistdata.data && (currentTime - branchlistdata.lastfetched < twentyMinutes)) {
        return branchlistdata.data;
    }

    try {
        let request = await httpRequest2('api/v1/admin/branch', null, null, 'json', 'GET');
        if (request.status) {
            branchlistdata.data = request.data; // Save data
            branchlistdata.lastfetched = currentTime; // Record the time it was saved
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

async function handleBranchChange(branch, department = 'departmentsearch') {
    // Initialize cache if it doesn't exist
    if (!handleBranchChange.cache) {
        handleBranchChange.cache = {};
    }

    const cacheDuration = 30 * 60 * 1000; // 30 minutes in milliseconds
    const currentTime = Date.now();

    // Check if departments for the branch are cached and still valid
    if (
        handleBranchChange.cache[branch] &&
        currentTime - handleBranchChange.cache[branch].lastFetched < cacheDuration
    ) {
        populateDepartments(handleBranchChange.cache[branch].data, department);
        return;
    }

    try {
        let request = await httpRequest2(
            `api/v1/admin/department${branch ? `?branch=${branch}` : ''}`,
            null,
            null,
            'json',
            'GET'
        );
        if (request.status) {
            if (request.data.length) {
                // Store fetched departments in cache
                handleBranchChange.cache[branch] = {
                    data: request.data,
                    lastFetched: currentTime
                };
                populateDepartments(request.data, department);
            } else {
                document.getElementById(department).innerHTML = `<option value="">No departments found</option>`;
            }
        } else {
            return notification('No records retrieved');
        }
    } catch (error) {
        console.error('Error fetching departments:', error);
        notification('Failed to fetch departments', 0);
    }
}

function populateDepartments(data, department) {
    const departmentElement = document.getElementById(department);
    if (departmentElement) {
        departmentElement.innerHTML = `<option value="">-- SEARCH DEPARTMENT --</option>`;
        departmentElement.innerHTML += data
            .map(item => `<option value="${item.id}">${item.department}</option>`)
            .join('');
    }
}

function getmultivalues(id, pattern=',') {
    const assignedToSelect = document.getElementById(id);
    const selectedOptions = Array.from(assignedToSelect.selectedOptions);
    const assignedToValues = selectedOptions.map(option => option.value);
    // console.log(assignedToValues);
    return assignedToValues.join(pattern);
}

async function getAllmembership(id="member"){
    let request = await httpRequest2('api/v1/admin/organizationmembership', null, null, 'json', 'GET')
    if(request.status) {
        if(request.data.length) {
            document.getElementById(id).innerHTML = `<option value="">SELECT MEMBER</option>`
            document.getElementById(id).innerHTML += request.data.map(data => `<option value="${data.id}">${data.member}</option>`).join('')
        } else {
            document.getElementById(id).innerHTML = `<option value="">No Membership found</option>`
        }
    } else {
        return notification('No records retrieved')
    }
}

async function getAllcompanyAccounts(id="member", cls=""){
    let request = await httpRequest2('api/v1/admin/organizationmembership', null, null, 'json', 'GET')
    if(request.status) {
        if(id){if(request.data.length) {
            document.getElementById(id).innerHTML += request.data.map(data => `<option value="${data.id}">${data.member}</option>`).join('')
        } else {
            document.getElementById(id).innerHTML = `<option value="">No Membership found</option>`
        }}
        if(cls){
            for(let i=0;i<document.getElementsByClassName(cls).length;i++){
                document.getElementsByClassName(cls)[i].innerHTML = `<option value="">--SELECT ACCOUNT--</option>`
                document.getElementsByClassName(cls)[i].innerHTML += request.data.map(data => `<option value="${data.accountnumber}">${data.accounttype}</option>`).join('')
            }
        }
    } else {
        return notification('No records retrieved')
    }
}

function toggleBalance(event, id, permission="VIEW COMPANY BALANCE", state=true) {
    const element = document.getElementById(id);
    if (!state || (checkpermission(permission) && state)) {
        element.classList.toggle('blur-sm');
    } else {
        notification('You do not have permission to view the amount.');
    }
}

function checkpermission(permission){
    let result = false;
    if(the_user.role == 'SUPERADMIN')return true
    if (the_user.permissions) {
        if (the_user.permissions.includes('|')) {
            the_user.permissions.split('|').forEach(perm => {
                if (perm == permission) result = true;
            });
        } else {
            if (the_user.permissions == permission) result = true;
        }
    }
    return result
}

function designName(name, state="") {
    if(!name)name=document.getElementById('your_companyname').value
    // Calculate half length while considering spaces
    const half = Math.ceil(name.length / 2);

    // Split the string into two parts without removing spaces
    const firstHalf = name.slice(0, half);
    const secondHalf = name.slice(half);

    // Return the formatted result with both parts styled correctly
    let result 
    if(!state)result = `
    <span class="xl:w-[250px] font-bold text-base block py-3 pl-5 selection:bg-white uppercase font-heebo text-primary-g">
        ${firstHalf}<span class="text-gray-400">${secondHalf}</span>
    </span>
    `;
    if(state == 'big')result = `
        <span class="flex pb-10 font-bold text-2xl text-base block selection:bg-white uppercase font-heebo text-primary-g text-right">
                ${firstHalf}
                <span class="text-gray-400">
                    ${secondHalf}
                </span>
        </span>
    `
    
    return result;
}

async function indexbranch(branch) {
    let request = await httpRequest2('api/v1/admin/branch', null, null, 'json', 'GET')
    if(request.status) {
        if(request.data.length) {
            console.log('branch', request.data)
            let elements = document.getElementsByName('branch1');
            for(let i = 0; i < elements.length; i++) {
                elements[i].innerHTML = request.data.map(data => 
                    `<option class="text-center" value="${data.id}" ${data.id == branch ? 'selected' : ''}>${data.branch}</option>`
                ).join('');
            }
        } else {
            let elements = document.getElementsByName('branch1');
            for(let i = 0; i < elements.length; i++) {
                elements[i].innerHTML = `<option class="text-center" value="">No branches found</option>`;
            }
        }
    } else {
        return notification('No records retrieved')
    }
}

async function resolvepermission(){
    let user = JSON.parse(sessionStorage.getItem('user'));
    if(!user)return windows.location.href = '/login.html';
    if(user.role == 'SUPERADMIN')return;
    let request = await httpRequest2(`api/v1/admin/manageroles?role=${user.role}`, null, null, 'json', 'GET')
    if(request.status){
        user.permissions = request.data.permissions;
    }
    // Start Generation Here
    if (user.userpermissions) {
        let permissionsArray = user.permissions ? (user.permissions.includes('|') ? user.permissions.split('|') : [user.permissions]) : [];
        let userPermissionsArray = user.userpermissions ? (user.userpermissions.includes('|') ? user.userpermissions.split('|') : [user.userpermissions]) : [];

        userPermissionsArray.forEach(permission => {
            if (permission.startsWith('__')) {
                let permName = permission.slice(2);
                let index = permissionsArray.indexOf(permName);
                if (index !== -1) {
                    permissionsArray.splice(index, 1);
                }
            } else {
                if (!permissionsArray.includes(permission)) {
                    permissionsArray.push(permission);
                }
            }
        });

        user.permissions = permissionsArray.join('|');
        sessionStorage.setItem('user', JSON.stringify(user));
    }

}

async function refreshprofile(data) {
    entername()
    function getparamm() {
        let paramstr = new FormData();
        paramstr.append('email', JSON.parse(sessionStorage.getItem('user')).email);
        return paramstr;
    }

        if(!data){ 
            let request = await httpRequest2('api/v1/auth/profile', getparamm(), null, 'json', 'GET');
            if (request.status) {
                if (request) {
                    sessionStorage.setItem('user', JSON.stringify(request.data))
                    await resolvepermission() //this is to resolve permission with user specific permissions 
                    the_user = JSON.parse(sessionStorage.getItem('user'))
                    entername()
                }
            } else {
                notification('No records retrieved', 0);
            }
        }else{
            sessionStorage.setItem('user', JSON.stringify(data));
            await resolvepermission() //this is to resolve permission with user specific permissions 
            entername();
        }
}

async function updateuserlocation(branch){
        
        let payload
    
        payload = getFormData2(document.querySelector('#changelocationfly'), [['id', the_user.id], ['branch', branch]])
        let request = await httpRequest2('api/v1/auth/updateprofile', payload, document.querySelector('#profilesform #submit'), 'json')
        if(request.status) {
            notification('You have successfully changed your location', 1);
            the_user.branch = branch;
            if(document.getElementById('profilesform')){fetchprofile()}else{refreshprofile()} 
            return resolveUrlPage()
        }
        refreshprofile();
        return notification(request.message, 0);
}

window.onload = async function() {
    if (!sessionStorage.getItem('user') || !JSON.parse(sessionStorage.getItem('user')).firstname) {
        console.log('redirecting to login', JSON.parse(sessionStorage.getItem('user')))
        window.location.href = './login.html';
    }
    // rundashboard()
    // runavailablerooms()
    // we first refresh the profile to get the user permissions
    refreshprofile()
    // we then run the permissions
    runPermissions()
    // we then index the branch
    await indexbranch(the_user.branch)
    // we then enter the user name and details
    // entername()
    // we then resolve the url page
    resolveUrlPage() 
    // recalldatalist()
    // checkAccountForVerification()
    // runpermissioncheck('state')
    window.addEventListener('popstate', resolveUrlPage);

    if(document.getElementById('branch1'))document.getElementById('branch1').addEventListener('change', e=>{
        updateuserlocation(e.target.value)
    })

    const toggler = document.getElementById('toggler')
    if(toggler) toggler.addEventListener('click', toggleNavigation)

    if(!isDeviceMobile()) {
        const navigation =  document.getElementById('navigation')
        navigation.classList.add('show')
    }

    Array.from(document.querySelectorAll('#navigation .nav-item > span')).forEach( nav => {
        nav.addEventListener('click', () => {
            // Close any open nav items
            document.querySelectorAll('#navigation .nav-item.expand').forEach(openNav => {
                if (openNav !== nav.parentElement) {
                    openNav.style.maxHeight = '36px';
                    openNav.classList.remove('expand');
                    openNav.querySelectorAll('.material-symbols-outlined')[1].style.transform = 'rotate(0deg)';
                }
            });

            // Toggle the clicked nav item
            if(nav.nextElementSibling?.tagName.toLocaleLowerCase() == 'ul') {
                if(nav.parentElement.classList.contains('expand')) {
                    nav.parentElement.style.maxHeight = '36px';
                    nav.parentElement.classList.remove('expand');
                    nav.querySelectorAll('.material-symbols-outlined')[1].style.transform = 'rotate(0deg)';
                }
                else {
                    nav.parentElement.style.maxHeight = '1000px';
                    nav.parentElement.classList.add('expand');
                    nav.querySelectorAll('.material-symbols-outlined')[1].style.transform = 'rotate(90deg)';
                }
            }
        });
    });

    Object.keys(routerTree).forEach( route => {
        if(route && !!document.getElementById(route)) {
            document.getElementById(route)?.addEventListener('click', () => {
                routerEvent(route)
                showActiveRoute()
            })
        }
    })

    const scriptsResource = Object.keys(routerTree).map( route => {
        return { url: routerTree[route].scriptName, controller: routerTree[route].startingFunction}
    })

    scriptsResource.filter( item => item.url !== '').forEach( resource => {
        loadScript(resource)
    })
    
    // NOTIFICATION FUNCTION
    // approverequisitionActive()
    
    document.getElementById('searchavailableroom').addEventListener('keyup', e=>{for (var i = 0; i < document.getElementById('availableroomcontainer').children.length; i++) {
        var label = document.getElementById('availableroomcontainer').children[i].querySelector('label');
        var email = label.textContent.trim().toLowerCase();
        if (email.includes(document.getElementById('searchavailableroom').value.toLowerCase())) {
            document.getElementById('availableroomcontainer').children[i].style.display = 'block'; // Show the matching child
        } else {
            document.getElementById('availableroomcontainer').children[i].style.display = 'none'; // Hide non-matching children
        }
    }})
    
   runcompanyname()

}


function runcompanyname(name="hemsname", state=""){
     if(document.getElementById('your_companyname').value){
        for(let i=0;i<document.getElementsByClassName(name).length;i++){
            document.getElementsByClassName(name)[i].innerHTML = designName(document.getElementById('your_companyname').value, state)
        }
    }
}

async function runPermissions(){
    let permission_switch = 'OFF' // 'ON or OFF'
    document.getElementById('navigationcontainer').style.visibility = 'hidden';
    let request = the_user
    if(request.status) {
        userpermission = request.permissions
        let subitems = document.getElementsByClassName('navitem-child')
        if(request.role == 'SUPERADMIN'){ 
            for(i=0; i<subitems.length; i++){
                    subitems[i].classList.remove('hidden');
            }}
        if(request.role != 'SUPERADMIN' && userpermission){ 
            for(i=0; i<subitems.length; i++){
              if(userpermission && userpermission.includes('|') ? userpermission.split('|').includes(subitems[i].textContent.toUpperCase().trim()) : userpermission.includes(subitems[i].textContent.toUpperCase().trim())){
                    if(permission_switch === 'ON')subitems[i].classList.remove('hidden');
                }else{
                    if(permission_switch === 'ON')subitems[i].classList.add('hidden');
                }  
                    if(permission_switch === 'OFF')subitems[i].classList.remove('hidden');
            }
            let x =  document.getElementsByClassName('navitem-title')
            for(let i=0;i<x.length;i++){
                if(x[i].nextElementSibling){
                    let y = x[i].nextElementSibling.children
                    let m = false
                    for(let j=0;j<y.length;j++){
                        if(!y[j].classList.contains('hidden'))m = true
                    }
                    if(!m)x[i].classList.add('hidden')
                    if(m)x[i].classList.remove('hidden')
                }
            }
        }
        document.getElementById('navigationcontainer').style.visibility = 'visible';
    }
    else return notification('No records retrieved')
}


function rundashboard(){
    getoccupiedroom()
    gettotalsales()
    getreceiveable()
    getinventory()
    getpayabless()
}


async function gettotalsales() {
    let request = await httpRequest2('../controllers/gettotalsalesfortheday', null, null, 'json')
    if(request.status) {
        saleslength = formatCurrency(request.totalsalesfortoday)
        if(document.getElementById('dashsales'))document.getElementById('dashsales').textContent = saleslength
    }
    else return notification('No records retrieved')
}

async function getpayabless() {
    let request = await httpRequest2('../controllers/getpayables', null, null, 'json')
    if(request.status) {
        payableslength = formatNumber(request.data.length)
        if(document.getElementById('dashpayables'))document.getElementById('dashpayables').textContent = payableslength
    }
    else return notification('No records retrieved')
}

async function getinventory() {
    let request = await httpRequest2('../controllers/fetchinventorylist', null, null, 'json')
    if(request.status) {
        receiveablelength = formatNumber(request.data.length)
        if(document.getElementById('dashinventory'))document.getElementById('dashinventory').textContent = receiveablelength
    }
    else return notification('No records retrieved')
}

async function getreceiveable() {
    let request = await httpRequest2('../controllers/fetchreceivablesbyrooms', null, null, 'json')
    if(request.status) {
        receiveablelength = formatCurrency(request.data.reduce((accumulator, currentValue) => accumulator + (Number(currentValue.debit) - Number(currentValue.credit)), 0))
        if(document.getElementById('dashreceiveable'))document.getElementById('dashreceiveable').textContent = receiveablelength
    }
    else return notification('No records retrieved')
}

async function getoccupiedroom(){
    function param(){
        let par = new FormData()
        par.append('roomstatus', 'OCCUPIED')
        return par
    }
     let request = await httpRequest2('../controllers/getallroomstatus', param(), null, 'json')
    // request = JSON.parse(request)
    if(request.status) {
        if(request.data.length) { 
            occupiedroomlength = request.data.length
            if(document.getElementById('dashoccupiedrooms'))document.getElementById('dashoccupiedrooms').textContent = request.data.length
           
        }
    }
    else return notification('No records for available rooms retrieved')
}

document.getElementById('aropener').addEventListener('click', e=>{document.getElementById('arcontainer').classList.add('!left-[0%]');runavailablerooms()})
document.getElementById('arremover').addEventListener('click', e=>document.getElementById('arcontainer').classList.remove('!left-[0%]'))
document.getElementById('arcontainer').addEventListener('click', e=>{e.stopPropagation();if(e.target.id === 'arcontainer')document.getElementById('arcontainer').classList.remove('!left-[0%]')})

function recalldatalist(stock=''){
    hemsuserlist()
    hemsdepartment(stock)
    hemsroomcategories()
    hemsroomnumber()
    hemsavailableroomnumber()
    hemsitemslist()
    hemscostcenter()
    hemsratecode()
}

async function runavailablerooms(){
     let request = await httpRequest('../controllers/getallroomstatus')
    request = JSON.parse(request)
    if(request.status) {
        if(request.data.length) { 
            availableroomlength = request.data.length
            if(document.getElementById('dashavailablerooms'))document.getElementById('dashavailablerooms').textContent = request.data.length
            did('availableroomcontainer').innerHTML = request.data.map((data, i)=>`
                <div x-data="{ open: false }" class="my-1 min-h-fit flex flex-col bg-transparent items-center justify-center relative overflow-hidden ">
                  <div  @click="open = ! open" class="p-2 !bg-[#64748b] cp w-full rounded rounded-b-none flex justify-between items-center">
                    <div class="flex items-center gap-2">
                        <span class="material-symbols-outlined text-[white]">meeting_room</span>
                        <h4 class="font-normal text-xs text-white">${data.roomnumber} ${data.roomname}</h4>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  <div x-show="open" @click.outside="open = false"  x-transition:enter="transition ease-out duration-300"
                        x-transition:enter-start="opacity-0 translate-y-0"
                        x-transition:enter-end="opacity-100 translate-y-0"
                        x-transition:leave="transition ease-in duration-300"
                        x-transition:leave-start="opacity-100 translate-y-10"
                        x-transition:leave-end="opacity-0 translate-y-0" class="w-full">
                    <h4 class="text-sm text-slate-400">
                         <div class="table-content !w-full">
                                    <label class="hidden">${data.roomname} ${data.roomnumber} ${data.roomcategory} ${data.roomstatus} ${data.building}</label>
                                    <table class="flex">
                                        <tbody id="">
                                           <tr class="flex flex-col !bg-[#64748b] text-white items-start ">
                                                <td class="opacity-90"> Room&nbsp;Name</td>
                                                <td class="opacity-90"> Room&nbsp;Number</td>
                                                <td class="opacity-90"> Building</td>
                                                <td class="opacity-90"> Room&nbsp;Category</td>
                                                <td class="opacity-90"> Room&nbsp;Status</td>
                                                <td class="opacity-90"> Status&nbsp;Desc.</td>
                                            </tr>
                                        </tbody>
                                        <tbody id="">
                                           <tr class="flex flex-col bg-white text-black w-[135%]">
                                                <td class="opacity-90"> ${data.roomname.toUpperCase()} </td>
                                                <td class="opacity-90"> ${data.roomnumber} </td>
                                                <td class="opacity-90"> ${data.building} </td>
                                                <td class="opacity-90"> ${data.roomcategory} </td>
                                                <td class="opacity-90"> ${data.roomstatus} </td>
                                                <td class="opacity-90"> ${data.roomstatusdescription} </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <img class="w-full" src="../images/${data.imageurl1}" />
                                    <img class="w-full" src="../images/${data.imageurl1}" />
                                    <button class="!bg-[#64748b] p-1 text-xs text-white hidden rounded mt-4">More Info</button>
                                </div>
                    </h4>
                    
                  </div>
                </div>
            `).join('')
        }
    }
    else return notification('No records for available rooms retrieved')
}

function checkotherbankdetails(comp='comp'){
    if(document.getElementById('paymentmethod')){
        if(document.getElementById('paymentmethod').value == 'TRANSFER' || document.getElementById('paymentmethod').value == 'POS'){
            document.getElementById('bankdetails').innerHTML = `<div class="form-group mt-2">
                                                     <label for="logoname" class="control-label">Bank Name</label>
                                                    <input type="number" name="bankname" id="bankname" placeholder="Enter bank name" class="form-control ${comp} bg-white" >
                                                </div>
                                                <div class="form-group mt-2">
                                                    <label for="logoname" class="control-label">Other Details</label>
                                                    <textarea type="number" name="otherdetails" id="otherdetails" placeholder="Enter account name, transaction reference and other relevant details" class="form-control ${comp} bg-white"></textarea>
                                                </div>`
        }else{
            document.getElementById('bankdetails').innerHTML = '';
        }
    }
    
}

async function hemscostcenter(id="") {
    let request = await httpRequest('../controllers/fetchcostcenter')
    request = JSON.parse(request)
    if(request.status) {
        if(request.data.length) {
                document.getElementById('hems_cost_center').innerHTML = request.data.map(data=>`<option value="${data.costcenter}">${data.id}</option>`).join('')
        }
    }
    else return notification('No records retrieved')
}
async function hemsratecode(id="") {
    let request = await httpRequest('../controllers/fetchratecode')
    request = JSON.parse(request)
    if(request.status) {
            allratecodes = request.data;
        if(request.data.length) {
                document.getElementById('hems_rate_code').innerHTML = request.data.map(data=>`<option value="${data.ratecode}"></option>`).join('')
                document.getElementById('hems_rate_code_id').innerHTML = request.data.map(data=>`<option value="${data.ratecode}">${data.id}</option>`).join('')
        }
    }
    else return notification('No records retrieved')
}
async function hemsroomnumber(id="") {
    let request = await httpRequest('../controllers/fetchrooms')
    request = JSON.parse(request)
    if(request.status) {
        if(request.data.length) {
            if(id){
                document.getElementById('hems_roomnumber').innerHTML = request.data.filter(data=>data.categoryid == id).map(data=>`<option value="${data.roomnumber}">${data.roomname} ${data.categoryid}</option>`).join('')
                document.getElementById('hems_roomnumber_id').innerHTML = request.data.filter(data=>data.categoryid == id).map(data=>`<option value="${data.roomnumber}">${data.roomname} ${data.categoryid} || ${data.roomnumber}</option>`).join('')
                document.getElementById('hems_roomnumber_id1').innerHTML = request.data.filter(data=>data.categoryid == id).map(data=>`<option value="${data.roomname} ${data.categoryid} || ${data.roomnumber}">${data.roomnumber}</option>`).join('')
            }else{
                document.getElementById('hems_roomnumber').innerHTML = request.data.map(data=>`<option value="${data.roomnumber}">${data.roomname} ${data.categoryid}</option>`).join('')
                document.getElementById('hems_roomnumber_id').innerHTML = request.data.map(data=>`<option value="${data.roomnumber}">${data.roomname} ${data.categoryid} || ${data.roomnumber}</option>`).join('')
                document.getElementById('hems_roomnumber_id1').innerHTML = request.data.map(data=>`<option value="${data.roomname} ${data.categoryid} || ${data.roomnumber}">${data.roomnumber}</option>`).join('')
            }
        }
    }
    else return notification('No records retrieved')
}
async function hemsavailableroomnumber(id="") {
    let request = await httpRequest('../controllers/getallroomstatus')
    request = JSON.parse(request)
    if(request.status) {
        if(request.data.length) {
            availroom = request.data
            if(id){
                document.getElementById('hems_roomnumber').innerHTML = request.data.filter(data=>data.categoryid == id).map(data=>`<option value="${data.roomnumber}">${data.roomname} ${data.categoryid}</option>`).join('')
                document.getElementById('hems_roomnumber_id').innerHTML = request.data.filter(data=>data.categoryid == id).map(data=>`<option value="${data.roomnumber}">${data.roomname} ${data.categoryid} || ${data.roomnumber}</option>`).join('')
                document.getElementById('hems_roomnumber_id1').innerHTML = request.data.filter(data=>data.categoryid == id).map(data=>`<option value="${data.roomname} ${data.categoryid} || ${data.roomnumber}">${data.roomnumber}</option>`).join('')
                document.getElementById('hems_available_roomnumber').innerHTML = request.data.filter(data=>data.categoryid == id).map(data=>`<option value="${data.roomnumber}">${data.roomname} ${data.categoryid}</option>`).join('')
                document.getElementById('hems_available_roomnumber_id').innerHTML = request.data.filter(data=>data.categoryid == id).map(data=>`<option value="${data.roomnumber}">${data.roomname} ${data.categoryid} || ${data.roomnumber}</option>`).join('')
            }else{
                document.getElementById('hems_roomnumber').innerHTML = request.data.map(data=>`<option value="${data.roomnumber}">${data.roomname} ${data.categoryid}</option>`).join('')
                document.getElementById('hems_roomnumber_id').innerHTML = request.data.map(data=>`<option value="${data.roomnumber}">${data.roomname} ${data.categoryid} || ${data.roomnumber}</option>`).join('')
                document.getElementById('hems_roomnumber_id1').innerHTML = request.data.map(data=>`<option value="${data.roomname} ${data.categoryid} || ${data.roomnumber}">${data.roomnumber}</option>`).join('')
                document.getElementById('hems_available_roomnumber').innerHTML = request.data.map(data=>`<option value="${data.roomnumber}">${data.roomname} ${data.categoryid}</option>`).join('')
                document.getElementById('hems_available_roomnumber_id').innerHTML = request.data.map(data=>`<option value="${data.roomnumber}">${data.roomname} ${data.categoryid} || ${data.roomnumber}</option>`).join('')
            }
        }
    }
    else return notification('No records retrieved')
}
async function hemsuserlist() {
    let request = await httpRequest('../controllers/fetchusers')
    request = JSON.parse(request)
    if(request.status) {
        if(request.data.length) {
            document.getElementById('hems_userlist_id').innerHTML = request.data.map(data=>`<option>${data.firstname} ${data.lastname} || ${data.id}</option>`).join('')
            document.getElementById('hems_userlist_email').innerHTML = request.data.map(data=>`<option>${data.firstname} ${data.lastname} || ${data.email}</option>`).join('')
        }
    }
    else return notification('No records retrieved')
}

// async function hemsdepartment() {
//     let request = await httpRequest('../controllers/fetchlocation')
//     request = JSON.parse(request)
//     if(request.status) {
//         if(request.data.length) {
//             document.getElementById('hems_departmentlist').innerHTML = request.data.filter(data=>data.locationtype == 'DEPARTMENT').map(data=>`<option>${data.location} || ${data.id}</option>`).join('')
//         }
//     }
//     else return notification('No records retrieved')
// }
async function hemsroomcategories() {
    let request = await httpRequest('../controllers/fetchroomcategories')
    request = JSON.parse(request)
    if(request.status) {
        if(request.data.length) {
            rumcat = request.data
            document.getElementById('hems_roomcategories').innerHTML = request.data.map(data=>`<option>${data.category} || ${data.id}</option>`).join('')
            for(let i=0;i<document.getElementsByClassName('roomcategory').length;i++){
                // console.log(document.getElementsByClassName('roomcategory')[i], document.getElementsByClassName('room-type')[i])
                if(document.getElementsByClassName('roomcategory')[i] && document.getElementsByClassName('roomcategory')[i].children.length < 2){
                    if(document.getElementsByClassName('roomcategory')[i])document.getElementsByClassName('roomcategory')[i].innerHTML = `<option value="">-- Select Room Type --</option>`
                    if(document.getElementsByClassName('roomcategory')[i])document.getElementsByClassName('roomcategory')[i].innerHTML += request.data.map(data=>`<option value="${data.id}">${data.category}</option>`).join('')
                }
                if(document.getElementsByClassName('room-type')[i] && document.getElementsByClassName('room-type')[i].children.length < 2){
                    if(document.getElementsByClassName('room-type')[i])document.getElementsByClassName('room-type')[i].innerHTML = `<option value="">-- Select Room Type --</option>`
                    if(document.getElementsByClassName('room-type')[i])document.getElementsByClassName('room-type')[i].innerHTML += request.data.map(data=>`<option value="${data.id}">${data.category}</option>`).join('')
                }
            }
        }
    }
    else return notification('No records retrieved')
}
async function hemsitemslist() {
    let request = await httpRequest('../controllers/fetchinventorylist')
    request = JSON.parse(request)
    if(request.status) {
        if(request.data.length) {
            // rumcat = request.data
            document.getElementById('hems_itemslist').innerHTML = request.data.map(data=>`<option>${data.itemname.trim()}</option>`).join('')
            document.getElementById('hems_itemslist_getid').innerHTML = request.data.map(data=>`<option value="${data.itemname.trim()}">${data.itemid.trim()}</option>`).join('')
            document.getElementById('hems_itemslist_getname').innerHTML = request.data.map(data=>`<option value="${data.itemid.trim()}">${data.itemname.trim()}</option>`).join('')
        }
    }
    else return notification('No records retrieved')
}
async function hemsdepartment(stock='stock') {
    let request = await httpRequest('../controllers/fetchdepartments')
    request = JSON.parse(request)
    if(request.status) {
        if(request.data.length) {
            // rumcat = request.data
            let res
            // if(stock)res= request.data.filter(dat=>dat.applyforsales == 'STOCK' || dat.applysales == 'NON STOCK')
            // if(!stock)res= request.data 
            res= request.data
            document.getElementById('hems_department').innerHTML = res.map(data=>`<option value="${data.department}">${data.id}</option>`).join('')
            if(document.getElementById('salespointname'))document.getElementById('salespointname').innerHTML = `<option value="">-- Select Sales Point --</option>`
            if(document.getElementById('salespointname'))document.getElementById('salespointname').innerHTML += res.filter(dat=>dat.applyforsales == 'NON STOCK' || dat.applyforsales == 'STOCK').map(data=>`<option ${data.department == default_department ? 'selected' : ''}>${data.department == 'FRONT-DESK/BOOKING' ? 'Booking/Reservation' : data.department}</option>`).join('')
            if(document.getElementById('salespointname1'))document.getElementById('salespointname1').innerHTML = `<option value="">-- Select Sales Point --</option>`
            if(document.getElementById('salespointname1'))document.getElementById('salespointname1').innerHTML += res.filter(dat=>dat.applyforsales == 'NON STOCK' || dat.applyforsales == 'STOCK').map(data=>`<option>${data.department == 'FRONT-DESK/BOOKING' ? 'Booking/Reservation' : data.department}</option>`).join('')
            if(document.getElementById('salespointname2'))document.getElementById('salespointname2').innerHTML = `<option value="">-- Select Sales Point --</option><option>ALL</option><option>Booking/Reservation</option>`
            if(document.getElementById('salespointname2'))document.getElementById('salespointname2').innerHTML += res.filter(dat=>dat.applyforsales == 'NON STOCK' || dat.applyforsales == 'STOCK').map(data=>`<option>${data.department == 'FRONT-DESK/BOOKING' ? 'Booking/Reservation' : data.department}</option>`).join('')
            if(document.getElementById('salespointnamemainstore'))document.getElementById('salespointnamemainstore').innerHTML = res.filter(dat=>dat.department == default_department).map(data=>`<option>${data.department == 'FRONT-DESK/BOOKING' ? 'Booking/Reservation' : data.department}</option>`).join('')
        }
    }
    else return notification('No records retrieved')
}
async function hemsdepartment2(stock='') {
    let request = await httpRequest('../controllers/fetchdepartments')
    request = JSON.parse(request)
    if(request.status) {
        if(request.data.length) {
            // rumcat = request.data
            let res
            // if(stock)res= request.data.filter(dat=>dat.applyforsales == 'STOCK' || dat.applysales == 'NON STOCK')
            // if(!stock)res= request.data 
            res= request.data
            document.getElementById('hems_department').innerHTML = res.map(data=>`<option value="${data.department}">${data.id}</option>`).join('')
            if(stock == 'STOCK'){
                if(document.getElementById('salespointname'))document.getElementById('salespointname').innerHTML = `<option value="">-- Select Sales Point --</option>`
                if(document.getElementById('salespointname'))document.getElementById('salespointname').innerHTML += res.filter(dat=>dat.applyforsales == 'STOCK').map(data=>`<option ${data.department == default_department ? 'selected' : ''}>${data.department}</option>`).join('')
                if(document.getElementById('salespointname1'))document.getElementById('salespointname1').innerHTML = `<option value="">-- Select Sales Point --</option>`
                if(document.getElementById('salespointname1'))document.getElementById('salespointname1').innerHTML += res.filter(dat=>dat.applyforsales == 'STOCK').map(data=>`<option>${data.department}</option>`).join('')
            }
            if(stock == 'NON STOCK'){
                if(document.getElementById('salespointname'))document.getElementById('salespointname').innerHTML = `<option value="">-- Select Sales Point --</option>`
                if(document.getElementById('salespointname'))document.getElementById('salespointname').innerHTML += res.filter(dat=>dat.applyforsales == 'NON STOCK').map(data=>`<option ${data.department == default_department ? 'selected' : ''}>${data.department}</option>`).join('')
                if(document.getElementById('salespointname1'))document.getElementById('salespointname1').innerHTML = `<option value="">-- Select Sales Point --</option>`
                if(document.getElementById('salespointname1'))document.getElementById('salespointname1').innerHTML += res.filter(dat=>dat.applyforsales == 'NON STOCK').map(data=>`<option>${data.department}</option>`).join('')
            }
            if(stock == ''){
                if(document.getElementById('salespointname'))document.getElementById('salespointname').innerHTML = `<option value="">-- Select Sales Point --</option>`
                if(document.getElementById('salespointname'))document.getElementById('salespointname').innerHTML += res.map(data=>`<option ${data.department == default_department ? 'selected' : ''}>${data.department}</option>`).join('')
                if(document.getElementById('salespointname1'))document.getElementById('salespointname1').innerHTML = `<option value="">-- Select Sales Point --</option>`
                if(document.getElementById('salespointname1'))document.getElementById('salespointname1').innerHTML += res.map(data=>`<option>${data.department}</option>`).join('')
            }
        }
    }
    else return notification('No records retrieved')
}


async function entername(){
    // if(!sessionStorage.getItem('user'))return window.location.href = './login.html'
    let x = JSON.parse(sessionStorage.getItem('user'))
    for(let i=0;i<document.getElementsByName('user_name').length;i++){
        if(document.getElementsByName('user_name')[i])document.getElementsByName('user_name')[i].innerHTML = `<span class="capitalize">${x.firstname}&nbsp;${x.lastname}</span>`
    }
    for(let i=0;i<document.getElementsByName('user_role').length;i++){
        if(document.getElementsByName('user_role')[i])document.getElementsByName('user_role')[i].innerHTML = `<span>${x.role}</span>`
    }
    for(let i=0;i<document.getElementsByName('user_email').length;i++){
        if(document.getElementsByName('user_email')[i])document.getElementsByName('user_email')[i].innerHTML = `<span class="capitalize">${x.email}</span>`
    }
    for(let i=0;i<document.getElementsByName('user_image').length;i++){
        if(document.getElementsByName('user_image')[i] && x.image)document.getElementsByName('user_image')[i].src = x.image
    }
    async function fetchOrganisationData() {
        let request = await httpRequest2('api/v1/admin/organizationsettings', null, null, 'json', 'GET');
        if (request.status) {
            let data = request.data[0];
            organisationSettings = data;
            document.getElementById('your_companyname').value = data.company_name;
            document.getElementById('your_companyphone').value = data.phone;
            document.getElementById('your_companyaddress').value = data.address;
            document.getElementById('your_companylogo').value = data.logo;
            document.getElementById('your_companyemail').value = data.email;
        } else {
            notification('Failed to fetch organisation data', 0);
        }
    }

    async function fetchProfileData() {
        let request = await httpRequest2('api/v1/auth/profile', null, null, 'json', 'GET');
        if (request.status) {
            let data = request.data;
            if(document.getElementById('branch'))document.getElementById('branch').value = data.branch;
            if(document.getElementById('your_role'))document.getElementById('your_role').value = data.role;
        } else {
            notification('Failed to fetch profile data', 0);
        }
    }

    fetchOrganisationData();
    fetchProfileData();
}

async function verifyemail() {
    let request = await httpRequest2('../../framework/controllers/verifyemail', null, null, 'json')
    if(request.status) {
        return notification('Email sent!', 1);
        
    }
    return notification(request.message, 0);
}

function getLabelFromValue(selectedValue, id) {
  const datalist = document.getElementById(id);
  const options = datalist.querySelectorAll('option');
  
  for (const option of options) {
    if (option.value == selectedValue) {
        console.log('value option', option.textContent)
      return option.textContent;
    }
  }
  
  return ''; // Return null if value not found
}


function checkAccountForVerification() {
    let user = JSON.parse(sessionStorage.getItem('user'))
    if(user?.status === 'NOT VERIFIED') {
        let div = document.createElement('div')
        div.className = 'bg-rose-400 text-white/90 text-xs p-1.5 px-5 flex items-center gap-3 font-heebo animate__animated animate__fadeInDown'
        div.innerHTML = `<span>Your account is not verified.</span><button onclick="verifyemail()" class="cursor-pointer underline underline-offset-4 hover:no-underline">Click to verify</button>`
        
        let domElement = document.querySelector('main')
        domElement.firstElementChild.insertBefore(div, domElement.firstElementChild.firstElementChild)
    }
}

function toggleNavigation() {
    const navigation =  document.getElementById('navigation')
    if(navigation){
        if(navigation.classList.contains('show')) {
            navigation.style.width = isDeviceMobile() ? '250px' : (80/100 * screen.availWidth ) + 'px'
            navigation.classList.remove('show')
        }
        else {
            navigation.style.width = '0'
            navigation.classList.add('show')
        }
    }
}

function isDeviceMobile() {
    let matches = window.matchMedia('(min-width: 1280px)').matches
    return matches
}


function notificationpanel(action){
        if(!action)document.getElementById('notificationpanel').classList.toggle('!h-[0px]')
        if(action == 'OPEN')document.getElementById('notificationpanel').classList.remove('!h-[0px]')
        if(action == 'CLOSE')document.getElementById('notificationpanel').classList.add('!h-[0px]')
}


window.addEventListener('click', e=>{
    if(!e.target.classList.contains('qq'))notificationpanel('CLOSE')
})


async function getdatecode(sentence) {
    let request = await httpRequest2(`api/v1/inventory/requisition/view?${queryParams ? `${queryParams}` : ''}`, null, null, 'json', 'GET');
    swal.close(); // Close the loading alert once the request is complete
    if(!id)document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> No Records Retrieved </td>`
    if(request.status) {
        if(!id){
            if(request.data.length) {
                datasource = request.data
                resolvePagination(datasource, onsavingsproductTableDataSignal);
            }
        } else {
            document.getElementsByClassName('updater')[0].click();
            savingsproductid = request.data[0].id;
            populateData(request.data[0]);
        }
    } else {
        return notification('No records retrieved');
    }
}


