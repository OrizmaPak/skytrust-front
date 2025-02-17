async function regpointreferralsActive() {
    datasource = []
    await fetchregpointreferrals()
    // await getAllregpointreferrals(true)
    // new TomSelect('#regpointreferrals', {
    //     // plugins: ['remove_button'],
    //     onInitialize: function() {
    //         console.log(checkpermission('FILTER regpointreferrals'))
    //         if(!checkpermission('FILTER regpointreferrals')) this.setValue(the_user.regpointreferrals);
            // if(!checkpermission('FILTER regpointreferrals')) this.setTextboxValue('readonly', true);
    //     }
    // });
    // await getAllUsers('useridlist', 'id')
}

async function fetchregpointreferrals() {

    // Show loading state using SweetAlert
    const loadingAlert = Swal.fire({
        title: 'Please wait...',
        text: 'Fetching regpointreferrals data, please wait.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    let request = await httpRequest2(`api/v1/members/finduser?registrationpoint=${the_user.registrationpoint}&role=MEMBER`,  null, null, 'json', 'GET');
    Swal.close(); // Close the loading alert once the request is complete

     document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> No Records Retrieved </td>`;
    if (request.status) {
                datasource = request.data;
                resolvePagination(datasource, onregpointreferralsTableDataSignal);
    } else {
        return notification('No records retrieved');
    }
}


async function onregpointreferralsTableDataSignal() {
    let rows = getSignaledDatasource().map((item, index) => `
    <tr>
        <td>${index + 1}</td>
        <td>${formatDate(item.dateadded.split('T')[0])}</td>
        <td>${item.lastname} ${item.firstname} ${item.othernames}</td>
        <td>${item.branchname??item.branch}</td>
        <td>${item.country}</td>
        <td>${item.state}</td>
        <td>${item.address}</td>
        <td class="flex items-center gap-3 ">
            <button title="Edit row entry" onclick="fetchregpointreferralsview('${item.id}')" class="material-symbols-outlined rounded-full bg-green-400 h-8 w-8 text-white drop-shadow-md text-xs" style="font-size: 18px;">visibility</button>
            <button title="Delete row entry" onclick="removeregpointreferrals('${item.id}')" class="hidden material-symbols-outlined rounded-full bg-red-600 h-8 w-8 text-white drop-shadow-md text-xs" style="font-size: 18px;">delete</button>
        </td>
    </tr>`
    )
    .join('')
    injectPaginatatedTable(rows)
}

function fetchregpointreferralsview(id) {
    const user = datasource.find(item => item.id == id);
    
    if (!user) {
        return notification('User not found', 0);
    }

    // Function to format date
    function formatDate(dateStr) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const date = new Date(dateStr);
        return date.toLocaleDateString(undefined, options);
    }

    const content = `
    <div class="flex flex-col space-y-4">
        <!-- Profile Header -->
        <div class="flex flex-col items-center space-y-3">
            <div class="relative">
                <img src="${user.image || './images/default-avatar.png'}" alt="Profile Image" class="w-32 h-32 rounded-full object-cover shadow-lg" />
                <input type="file" name="image" id="image" class="hidden" accept="image/*" onchange="updateImage(event)">
            </div>
            <div class="text-center">
                <h2 class="text-2xl font-bold text-gray-800">${user.firstname} ${user.lastname} ${user.othernames ? user.othernames : ''}</h2>
                <p class="text-sm font-medium text-gray-500 capitalize">${user.role || 'N/A'}</p>
            </div>
        </div>
        
        <!-- Tabs Navigation -->
        <div>
            <nav class="flex border-b">
                <button class="tab-link px-4 py-2 -mb-px text-sm font-medium text-gray-600 hover:text-gray-800 focus:outline-none" data-tab="basic">Basic Details</button>
                <button class="tab-link px-4 py-2 -mb-px text-sm font-medium text-gray-600 hover:text-gray-800 focus:outline-none" data-tab="address">Address Details</button>
                <button class="tab-link px-4 py-2 -mb-px text-sm font-medium text-gray-600 hover:text-gray-800 focus:outline-none" data-tab="kin">Next of Kin</button>
                <button class="tab-link px-4 py-2 -mb-px text-sm font-medium text-gray-600 hover:text-gray-800 focus:outline-none" data-tab="additional">Additional Info</button>
            </nav>
        </div>
        
        <!-- Tabs Content -->
        <div class="tab-content mt-4">
            <!-- Basic Details Tab -->
            <div id="basic" class="tab-pane">
                <div class="bg-white rounded-lg shadow-md p-6">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">Basic Details</h3>
                    <table class="min-w-full divide-y divide-gray-200">
                        <tbody class="bg-white">
                            <tr>
                                <th class="px-6 py-4 text-left text-sm font-medium text-gray-700">Email</th>
                                <td class="px-6 py-4 !text-lg text-gray-600">${user.email || 'N/A'}</td>
                            </tr>
                            <tr>
                                <th class="px-6 py-4 text-left text-sm font-medium text-gray-700">Email Verified</th>
                                <td class="px-6 py-4 !text-lg text-gray-600">${user.emailverified ? 'Yes' : 'No'}</td>
                            </tr>
                            <tr>
                                <th class="px-6 py-4 text-left text-sm font-medium text-gray-700">Phone</th>
                                <td class="px-6 py-4 !text-lg text-gray-600">${user.phone || 'N/A'}</td>
                            </tr>
                            <tr>
                                <th class="px-6 py-4 text-left text-sm font-medium text-gray-700">Gender</th>
                                <td class="px-6 py-4 !text-lg text-gray-600">${user.gender || 'N/A'}</td>
                            </tr>
                            <tr>
                                <th class="px-6 py-4 text-left text-sm font-medium text-gray-700">Date of Birth</th>
                                <td class="px-6 py-4 !text-lg text-gray-600">${user.dateofbirth ? formatDate(user.dateofbirth.split('T')[0]) : 'N/A'}</td>
                            </tr>
                            <tr>
                                <th class="px-6 py-4 text-left text-sm font-medium text-gray-700">Marital Status</th>
                                <td class="px-6 py-4 !text-lg text-gray-600">${user.maritalstatus || 'N/A'}</td>
                            </tr>
                            <tr>
                                <th class="px-6 py-4 text-left text-sm font-medium text-gray-700">Spouse Name</th>
                                <td class="px-6 py-4 !text-lg text-gray-600">${user.spousename || 'N/A'}</td>
                            </tr>
                            <tr>
                                <th class="px-6 py-4 text-left text-sm font-medium text-gray-700">Occupation</th>
                                <td class="px-6 py-4 !text-lg text-gray-600">${user.occupation || 'N/A'}</td>
                            </tr>
                            <tr>
                                <th class="px-6 py-4 text-left text-sm font-medium text-gray-700">Role</th>
                                <td class="px-6 py-4 !text-lg text-gray-600 capitalize">${user.role || 'N/A'}</td>
                            </tr>
                            <tr>
                                <th class="px-6 py-4 text-left text-sm font-medium text-gray-700">Status</th>
                                <td class="px-6 py-4 !text-lg text-gray-600 capitalize">${user.status || 'N/A'}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            
            <!-- Address Details Tab -->
            <div id="address" class="tab-pane hidden">
                <div class="bg-white rounded-lg shadow-md p-6">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">Address Details</h3>
                    <table class="min-w-full divide-y divide-gray-200">
                        <tbody class="bg-white">
                            <tr>
                                <th class="px-6 py-4 text-left text-sm font-medium text-gray-700">Country</th>
                                <td class="px-6 py-4 !text-lg text-gray-600">${user.country || 'N/A'}</td>
                            </tr>
                            <tr>
                                <th class="px-6 py-4 text-left text-sm font-medium text-gray-700">State</th>
                                <td class="px-6 py-4 !text-lg text-gray-600">${user.state || 'N/A'}</td>
                            </tr>
                            <tr>
                                <th class="px-6 py-4 text-left text-sm font-medium text-gray-700">Town</th>
                                <td class="px-6 py-4 !text-lg text-gray-600">${user.town || 'N/A'}</td>
                            </tr>
                            <tr>
                                <th class="px-6 py-4 text-left text-sm font-medium text-gray-700">LGA</th>
                                <td class="px-6 py-4 !text-lg text-gray-600">${user.lga || 'N/A'}</td>
                            </tr>
                            <tr>
                                <th class="px-6 py-4 text-left text-sm font-medium text-gray-700">Address</th>
                                <td class="px-6 py-4 !text-lg text-gray-600">${user.address || 'N/A'}</td>
                            </tr>
                            <tr>
                                <th class="px-6 py-4 text-left text-sm font-medium text-gray-700">State of Residence</th>
                                <td class="px-6 py-4 !text-lg text-gray-600">${user.stateofresidence || 'N/A'}</td>
                            </tr>
                            <tr>
                                <th class="px-6 py-4 text-left text-sm font-medium text-gray-700">LGA of Residence</th>
                                <td class="px-6 py-4 !text-lg text-gray-600">${user.lgaofresidence || 'N/A'}</td>
                            </tr>
                            <tr>
                                <th class="px-6 py-4 text-left text-sm font-medium text-gray-700">Office Address</th>
                                <td class="px-6 py-4 !text-lg text-gray-600">${user.officeaddress || 'N/A'}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            
            <!-- Next of Kin Information Tab -->
            <div id="kin" class="tab-pane hidden">
                <div class="bg-white rounded-lg shadow-md p-6">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">Next of Kin Information</h3>
                    <table class="min-w-full divide-y divide-gray-200">
                        <tbody class="bg-white">
                            <tr>
                                <th class="px-6 py-4 text-left text-sm font-medium text-gray-700">Full Name</th>
                                <td class="px-6 py-4 !text-lg text-gray-600">${user.nextofkinfullname || 'N/A'}</td>
                            </tr>
                            <tr>
                                <th class="px-6 py-4 text-left text-sm font-medium text-gray-700">Relationship</th>
                                <td class="px-6 py-4 !text-lg text-gray-600">${user.nextofkinrelationship || 'N/A'}</td>
                            </tr>
                            <tr>
                                <th class="px-6 py-4 text-left text-sm font-medium text-gray-700">Phone</th>
                                <td class="px-6 py-4 !text-lg text-gray-600">${user.nextofkinphone || 'N/A'}</td>
                            </tr>
                            <tr>
                                <th class="px-6 py-4 text-left text-sm font-medium text-gray-700">Occupation</th>
                                <td class="px-6 py-4 !text-lg text-gray-600">${user.nextofkinoccupation || 'N/A'}</td>
                            </tr>
                            <tr>
                                <th class="px-6 py-4 text-left text-sm font-medium text-gray-700">Address</th>
                                <td class="px-6 py-4 !text-lg text-gray-600">${user.nextofkinaddress || 'N/A'}</td>
                            </tr>
                            <tr>
                                <th class="px-6 py-4 text-left text-sm font-medium text-gray-700">Office Address</th>
                                <td class="px-6 py-4 !text-lg text-gray-600">${user.nextofkinofficeaddress || 'N/A'}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            
            <!-- Additional Information Tab -->
            <div id="additional" class="tab-pane hidden">
                <div class="bg-white rounded-lg shadow-md p-6">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">Additional Information</h3>
                    <table class="min-w-full divide-y divide-gray-200">
                        <tbody class="bg-white">
                            <tr>
                                <th class="px-6 py-4 text-left text-sm font-medium text-gray-700">Registration Point</th>
                                <td class="px-6 py-4 !text-lg text-gray-600">${user.registrationpoint !== null ? user.registrationpoint : 'N/A'}</td>
                            </tr>
                            <tr>
                                <th class="px-6 py-4 text-left text-sm font-medium text-gray-700">Permissions</th>
                                <td class="px-6 py-4 !text-lg text-gray-600">${user.permissions || 'N/A'}</td>
                            </tr>
                            <tr>
                                <th class="px-6 py-4 text-left text-sm font-medium text-gray-700">User Permissions</th>
                                <td class="px-6 py-4 !text-lg text-gray-600">${user.userpermissions || 'N/A'}</td>
                            </tr>
                            <tr>
                                <th class="px-6 py-4 text-left text-sm font-medium text-gray-700">Last Updated</th>
                                <td class="px-6 py-4 !text-lg text-gray-600">${user.lastupdated ? formatDate(user.lastupdated.split('T')[0]) : 'N/A'}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
    `;

    Swal.fire({
        title: 'User Details',
        html: content,
        showCloseButton: true,
        focusConfirm: false,
        width: '80%',
        customClass: {
            popup: 'bg-white rounded-lg overflow-auto shadow-xl',
            title: 'text-2xl font-bold text-gray-800 pb-2 border-b',
            content: 'p-4'
        },
        confirmButtonColor: '#3085d6', // Set the OK button color to blue
        didOpen: () => {
            // Tab Switching Logic
            const tabs = Swal.getPopup().querySelectorAll('.tab-link');
            const panes = Swal.getPopup().querySelectorAll('.tab-pane');

            tabs.forEach(tab => {
                tab.addEventListener('click', function() {
                    // Remove active classes from all tabs
                    tabs.forEach(t => {
                        t.classList.remove('border-b-2', 'border-blue-500', 'text-gray-800');
                        t.classList.add('text-gray-600');
                    });

                    // Hide all panes
                    panes.forEach(p => p.classList.add('hidden'));

                    // Add active classes to clicked tab
                    this.classList.add('border-b-2', 'border-blue-500', 'text-gray-800');
                    this.classList.remove('text-gray-600');

                    // Show corresponding pane
                    const tabName = this.getAttribute('data-tab');
                    const activePane = Swal.getPopup().querySelector(`#${tabName}`);
                    if (activePane) {
                        activePane.classList.remove('hidden');
                    }
                });
            });

            // Activate the first tab by default
            if (tabs.length > 0) {
                tabs[0].click();
            }
        }
    });
}







