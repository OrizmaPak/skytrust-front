let taskmanagementid
let subtaskmanagementid
async function taskmanagementActive() {
    taskmanagementid = ''
    subtaskmanagementid = ''
    await fetchtaskmanagement()
    await getAllUsers('assignedto', 'name')
    await getAllbranch(true)
    await getAllbranch(true, 'branchFilter')
    new TomSelect('#assignedto', {
        plugins: ['remove_button', 'dropdown_input'],
        
    });
    new TomSelect('#branch', {
        plugins: ['dropdown_input'],
        onInitialize: function() {
            console.log(checkpermission('FILTER BRANCH'))
            if(!checkpermission('FILTER BRANCH')) this.setValue(the_user.branch);
            if(!checkpermission('FILTER BRANCH')) this.setTextboxValue('readonly', true);
        }
    });
    new TomSelect('#branchFilter', {
        plugins: ['dropdown_input'],
        onInitialize: function() {
            console.log(checkpermission('FILTER BRANCH'))
            if(!checkpermission('FILTER BRANCH')) this.setValue(the_user.branch);
            if(!checkpermission('FILTER BRANCH')) this.setTextboxValue('readonly', true);
        }
    });
    const form = document.querySelector('#taskmanagementform')
    const filterform = document.querySelector('#taskfilterForm')
    if(form.querySelector('#submit')) form.querySelector('#submit').addEventListener('click', taskmanagementFormSubmitHandler)
    if(filterform.querySelector('#submit')) filterform.querySelector('#submit').addEventListener('click', e=>{
        e.preventDefault()
        fetchtaskmanagement()
    })
    datasource = []

     // Initialize Tom Select with Custom Rendering
    new TomSelect('#priority', {
        render: {
        item: function (data, escape) {
            return `<div style="color: ${data.color}; font-weight: bold;">${escape(data.text)}</div>`;
        },
        option: function (data, escape) {
            return `<div style="color: ${data.color}; font-weight: bold;">${escape(data.text)}</div>`;
        }
        }
    });
}


async function fetchtaskmanagement(id) {

    // Show loading state using SweetAlert
    const loadingAlert = Swal.fire({
        title: 'Please wait...',
        text: 'Fetching task management data, please wait.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    let form = document.querySelector('#taskfilterForm');
    let formData = new FormData(form);
    let queryParams = new URLSearchParams(formData).toString();

    let request = await httpRequest2(`api/v1/admin/taskschedule?${queryParams ? `&${queryParams}` : ''}${id ? `&id=${id}` : ''}`, null, null, 'json', 'GET');
    Swal.close(); // Close the loading alert once the request is complete

    if (!id) document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> No Records Retrieved </td>`;
    if (request.status) {
        if (!id) {
            if (request.data.length) {
                datasource = request.data;
                resolvePagination(datasource, ontaskmanagementTableDataSignal);
            }
        } else {
            document.getElementsByClassName('updater')[0].click();
            taskmanagementid = request.data[0].id;
            populateData(request.data[0]);
        }
    } else {
        return notification('No records retrieved');
    }
}

async function removetaskmanagement(id) {
    const thedata = datasource.find(item => item.id == id);
    let isConfirmed = false;
    try {
        // Ask for confirmation using SweetAlert with async and loader
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!',
            showLoaderOnConfirm: true,
            preConfirm: async () => {
                const paramstr = new FormData();
                for (const key in thedata) {
                    if (thedata.hasOwnProperty(key)) {
                        paramstr.set(key, thedata[key]);
                    }
                }
                paramstr.set('id', id);
                paramstr.set('status', 'DELETED');

                const request = await httpRequest2('api/v1/admin/taskschedule', paramstr, null, 'json', 'POST');
                if (!request.status) {
                    throw new Error('Failed to delete task');
                }
                return request;
            },
            allowOutsideClick: () => !Swal.isLoading()
        });

        // If the user confirmed the deletion
        if (result.isConfirmed) {
            isConfirmed = true;
            if (result.value && result.value.status) {
                notification('Task deleted successfully!', 1);
            } else {
                notification(result.value ? result.value.message : 'Failed to delete task', 0);
            }
        }
    } catch (error) {
        notification(error.message || 'An error occurred', 0);
    } finally {
        if (isConfirmed) {
            fetchtaskmanagement();
        }
    }
}


async function ontaskmanagementTableDataSignal() {
    let rows = getSignaledDatasource().map((item, index) => `
    <tr>
        <td>${index + 1}</td>
        <td>${item.title}</td>
        <td>${item.description}</td>
        <td style="color: ${
            item.priority === 'URGENT' ? '#ff0000' :
            item.priority === 'HIGH' ? '#ff4d4d' :
            item.priority === 'MEDIUM' ? '#ffa500' :
            '#28a745'
        }; font-weight: bold;">${item.priority}</td>
        <td>${item.assignedtonames}</td>
        <td>${formatDate(item.startdate)}</td>
        <td>${formatDate(item.enddate)}</td>
        <td>${item.branchname}</td>
        <td style="width:175px">
            <select onchange="updateStatus('${item.id}', this.value)" class="form-controls comp status-select" style="caret-color: pink !important;">
                <option value="NOT STARTED" ${item.taskstatus === 'NOT STARTED' ? 'selected' : ''}>Not&nbsp;Started</option>
                <option value="PENDING" ${item.taskstatus === 'PENDING' ? 'selected' : ''}>Pending</option>
                <option value="IN PROGRESS" ${item.taskstatus === 'IN PROGRESS' ? 'selected' : ''}>In&nbsp;Progress</option>
                <option value="COMPLETED" ${item.taskstatus === 'COMPLETED' ? 'selected' : ''}>Completed</option>
            </select>
        </td>
        <td class="flex items-center gap-3">
            <button title="Edit task" onclick="fetchtaskmanagement('${item.id}')" class="material-symbols-outlined rounded-full bg-primary-g h-8 w-8 text-white drop-shadow-md text-xs" style="font-size: 18px;">edit</button>
            <button title="View task" onclick="viewtaskmanagement('${item.id}')" class="material-symbols-outlined rounded-full bg-green-600 h-8 w-8 text-white drop-shadow-md text-xs" style="font-size: 18px;">visibility</button>
            <button title="Delete task" onclick="removetaskmanagement('${item.id}')" class="material-symbols-outlined rounded-full bg-red-600 h-8 w-8 text-white drop-shadow-md text-xs" style="font-size: 18px;">delete</button>
        </td>
    </tr>`
    ).join('');

    injectPaginatatedTable(rows);

    // Initialize TomSelect with advanced rendering
    document.querySelectorAll('.status-select').forEach(function(select) {
        new TomSelect(select, {
            create: false,
            sortField: {
                field: "select",
                direction: "asc"
            },
            render: {
                option: function(data, escape) {
                    let color = getStatusColor(data.value);
                    let icon = getStatusIcon(data.value);
                    return `<div class="flex items-center px-3 py-2 border-none rounded-md shadow-sm" style="background: linear-gradient(135deg, ${color.light}, ${color.dark}); color: white;border: none">
                                <i class="${icon} mr-2"></i>
                                <span>${escape(data.text)}</span>
                            </div>`;
                },
                item: function(data, escape) {
                    let color = getStatusColor(data.value);
                    let icon = getStatusIcon(data.value);
                    return `<div class="flex items-center px-3 py-2 border-none rounded-md shadow-md" style="background: linear-gradient(135deg, ${color.light}, ${color.dark}); color: white;border: none">
                                <i class="${icon} mr-2"></i>
                                <span>${escape(data.text)}</span>
                            </div>`;
                }
            }
        });
    });

    // Helper function to get status color gradients
    function getStatusColor(status) {
        switch (status) {
            case 'NOT STARTED':
                return { light: '#7a7a7a', dark: '#4a4a4a' }; // Gray gradient
            case 'PENDING':
                return { light: '#ffb347', dark: '#ff8000' }; // Orange gradient
            case 'IN PROGRESS':
                return { light: '#5dade2', dark: '#2874a6' }; // Blue gradient
            case 'COMPLETED':
                return { light: '#58d68d', dark: '#28a745' }; // Green gradient
            default:
                return { light: '#7a7a7a', dark: '#4a4a4a' }; // Default Gray gradient
        }
    }

    // Helper function to get status icons
    function getStatusIcon(status) {
        switch (status) {
            case 'NOT STARTED':
                return 'fas fa-circle-notch'; // Spinning circle
            case 'PENDING':
                return 'fas fa-clock'; // Clock
            case 'IN PROGRESS':
                return 'fas fa-spinner'; // Spinner
            case 'COMPLETED':
                return 'fas fa-check-circle'; // Check circle
            default:
                return 'fas fa-circle'; // Default circle
        }
    }
}




async function updateStatus(id, status) {
// Show loading state using SweetAlert
const loadingAlert = Swal.fire({
    title: 'Please wait...',
    text: 'Updating task status...',
    allowOutsideClick: false,
    didOpen: () => {
        Swal.showLoading();
    }
});

const formData = new FormData();
formData.append('id', id);
formData.append('taskstatus', status);

const response = await fetch(`${baseurl}/api/v1/admin/taskschedule`, {
    method: 'POST',
    body: formData,
    headers: {
        'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`
    }
});

Swal.close();

let request = await response.json();

if (!request.status) {
    fetchtaskmanagement();
    notification(request.message, 0);
} else {
    notification(request.message, 1);
}
}

async function updateSubtaskStatus(id, status, task) {
// Show loading state using SweetAlert
const loadingAlert = Swal.fire({
    title: 'Please wait...',
    text: 'Updating task status...',
    allowOutsideClick: false,
    didOpen: () => {
        Swal.showLoading();
    }
});

const formData = new FormData();
formData.append('id', id);
formData.append('taskstatus', status);

const response = await fetch(`${baseurl}/api/v1/admin/subtaskschedule`, {
    method: 'POST',
    body: formData,
    headers: {
        'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`
    }
});

Swal.close();

let request = await response.json();

if (!request.status) {
    notification(request.message, 0);
} else {
    viewtaskmanagement(task);
    notification(request.message, 1);
}
}


async function viewtaskmanagement(id) {
    subtaskmanagementid = '';
    // Show loading state using SweetAlert
    const loadingAlert = Swal.fire({
        title: 'Please wait...',
        text: 'Fetching task details...',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    let request = await httpRequest2(`api/v1/admin/taskschedule?id=${id}`, null, null, 'json', 'GET');
    Swal.close();

    if (request.status && request.data.length > 0) {
        const task = request.data[0];
        
            // Start of Selection
            Swal.fire({
                title: '',
                html: `
                    <div class="text-left p-4">
                        <div class="mb-4 bg-white/50 p-4 rounded-lg shadow-sm">
                            <h3 class="font-bold text-lg mb-2 text-gray-800">${task.title}</h3>
                            <p class="text-gray-600 text-sm leading-relaxed">${task.description}</p>
                        </div>
                        
                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm bg-white/50 p-4 rounded-lg shadow-sm">
                            <div class="flex flex-col space-y-1">
                                <span class="font-semibold text-gray-700">Priority</span>
                                <span class="px-3 py-1 rounded-full text-xs font-medium w-fit" style="color: ${
                                    task.priority === 'URGENT' ? '#ff0000' :
                                    task.priority === 'HIGH' ? '#ff4d4d' :
                                    task.priority === 'MEDIUM' ? '#ffa500' :
                                    '#28a745'
                                }; background-color: ${
                                    task.priority === 'URGENT' ? 'rgba(255,0,0,0.1)' :
                                    task.priority === 'HIGH' ? 'rgba(255,77,77,0.1)' :
                                    task.priority === 'MEDIUM' ? 'rgba(255,165,0,0.1)' :
                                    'rgba(40,167,69,0.1)'
                                }">${task.priority}</span>
                            </div>
                            <div class="flex flex-col space-y-1">
                                <span class="font-semibold text-gray-700">Assigned To</span>
                                <span class="text-gray-600">${task.assignedtonames}</span>
                            </div>
                            <div class="flex flex-col space-y-1">
                                <span class="font-semibold text-gray-700">Branch</span>
                                <span class="text-gray-600">${task.branchname}</span>
                            </div>
                            <div class="flex flex-col space-y-1">
                                <span class="font-semibold text-gray-700">Start Date</span>
                                <span class="text-gray-600">${formatDate(task.startdate)}</span>
                            </div>
                            <div class="flex flex-col space-y-1">
                                <span class="font-semibold text-gray-700">End Date</span>
                                <span class="text-gray-600">${formatDate(task.enddate)}</span>
                            </div>
                            <div class="flex flex-col space-y-1">
                                <span class="font-semibold text-gray-700">Status</span>
                                <span class="px-3 py-1 rounded-full text-xs font-medium w-fit" style="color: ${
                                    task.taskstatus === 'COMPLETED' ? '#28a745' :
                                    task.taskstatus === 'IN PROGRESS' ? '#ffa500' :
                                    task.taskstatus === 'PENDING' ? '#ff4d4d' :
                                    task.taskstatus === 'NOT STARTED' ? '#6c757d' :
                                    '#000000'
                                }; background-color: ${
                                    task.taskstatus === 'COMPLETED' ? 'rgba(40, 167, 69, 0.1)' :
                                    task.taskstatus === 'IN PROGRESS' ? 'rgba(255, 165, 0, 0.1)' :
                                    task.taskstatus === 'PENDING' ? 'rgba(255, 77, 77, 0.1)' :
                                    task.taskstatus === 'NOT STARTED' ? 'rgba(108, 117, 125, 0.1)' :
                                    'rgba(0, 0, 0, 0.1)'
                                }">${task.taskstatus || 'PENDING'}</span>
                            </div>
                        </div>
    
    <div class="mt-6">
        <ul class="flex text-sm font-medium text-center text-gray-500 border-b border-gray-200">
            <li class="me-2 cp viewer option !text-blue-600 active w-full sm:w-auto" name="viewsubtasks" onclick="runSubtaskOptioner('viewsubtasks', this)">
                <p class="inline-block p-4 rounded-t-lg hover:text-gray-600 hover:bg-gray-50 capitalize w-full text-center">View Subtasks</p>
            </li>
            <li class="me-2 cp updater optioner w-full sm:w-auto" name="subtaskform" onclick="runSubtaskOptioner('subtaskform', this)"> 
                <p class="inline-block p-4 rounded-t-lg hover:text-gray-600 hover:bg-gray-50 capitalize w-full text-center">Manage Subtask</p>
            </li>
        </ul>
    
        <form id="subtaskform" class="hidden mt-4">
            <div class="flex flex-col space-y-3 bg-white/90 p-5 rounded-sm">
                <div class="form-group">
                    <label for="subtask_title" class="control-label">Title</label>
                    <input type="text" name="title" id="subtask_title" class="form-control comp w-full" placeholder="Enter Title">
                </div>
                <div class="form-group">
                    <label for="subtask_description" class="control-label">Description</label>
                    <textarea name="description" id="subtask_description" class="form-control comp w-full" placeholder="Enter Description"></textarea>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="form-group">
                        <label for="subtask_startdate" class="control-label">Start Date</label>
                        <input type="date" name="startdate" id="subtask_startdate" class="form-control comp w-full" min="${task.startdate.split('T')[0]}" max="${task.enddate.split('T')[0]}">
                    </div>
                    <div class="form-group">
                        <label for="subtask_enddate" class="control-label">End Date</label>
                        <input type="date" name="enddate" id="subtask_enddate" class="form-control comp w-full" min="${task.startdate.split('T')[0]}" max="${task.enddate.split('T')[0]}">
                    </div>
                </div>
                <div class="form-group">
                    <label for="subtask_assignedto" class="control-label">Assigned To</label>
                    <select name="assignedto" id="subtask_assignedto" class="form-controls comp w-full" multiple>
                        <option value="">-- Select Assignee --</option>
                    </select>
                </div>
                <div class="flex justify-end mt-5">
                    <input type="hidden" name="task" id="task" class="form-control comp" value="${id}">
                    <button id="subtask_reset" onclick="viewtaskmanagement('${id}')" type="button" class="btn !bg-red-600 flex items-center justify-center px-4 py-2 mr-2"> 
                        <span>Reset</span>
                    </button>
                    <button id="subtask_submit" onclick="submitSubtaskForm('${id}')" type="button" class="btn flex items-center justify-center px-4 py-2"> 
                        <div class="btnloader mr-2" style="display: none;"></div>
                        <span>Submit</span>
                    </button>
                </div>
            </div>
        </form>
    
        <div id="viewsubtasks" class="mt-4">
            <div class="table-content overflow-auto min-w-[500px]">
                <table class="table-auto">
                    <thead>
                        <tr>
                            <th class="px-4 py-2">s/n</th>
                            <th class="px-4 py-2">Title</th>
                            <th class="px-4 py-2">Description</th>
                            <th class="px-4 py-2">Assigned To</th>
                            <th class="px-4 py-2">Start Date</th>
                            <th class="px-4 py-2">End Date</th>
                            <th class="px-4 py-2">Status</th>
                            <th class="px-4 py-2">Action</th>
                        </tr>
                    </thead>
                    <tbody id="subtasksTable">
                        ${task.subtasks ? task.subtasks.map((subtask, index) => `
                            <tr class="hover:bg-gray-100">
                                <td class="border px-4 py-2">${index + 1}</td>
                                <td class="border px-4 py-2">${subtask.title}</td>
                                <td class="border px-4 py-2">${subtask.description || '-'}</td>
                                <td class="border px-4 py-2">${subtask.assignedtonames}</td>
                                <td class="border px-4 py-2">${formatDate(subtask.startdate)}</td>
                                <td class="border px-4 py-2">${formatDate(subtask.enddate)}</td>
                                <td class="border px-4 py-2" style="width:175px">
                                    <select onchange="updateSubtaskStatus('${subtask.id}', this.value, '${id}')" class="form-controls comp status-select-sub" style="caret-color: pink !important;">
                                        <option value="NOT STARTED" ${subtask.taskstatus === 'NOT STARTED' ? 'selected' : ''}>Not&nbsp;Started</option>
                                        <option value="PENDING" ${subtask.taskstatus === 'PENDING' ? 'selected' : ''}>Pending</option>
                                        <option value="IN PROGRESS" ${subtask.taskstatus === 'IN PROGRESS' ? 'selected' : ''}>In&nbsp;Progress</option>
                                        <option value="COMPLETED" ${subtask.taskstatus === 'COMPLETED' ? 'selected' : ''}>Completed</option>
                                    </select>
                                </td>
                                <td class="border px-4 py-2 flex items-center gap-3 justify-center">
                                    <button onclick='editSubtask("${subtask.id}", ${JSON.stringify(subtask)})' class="material-symbols-outlined rounded-full bg-primary-g h-8 w-8 text-white drop-shadow-md text-xs flex items-center justify-center" style="font-size: 18px;">edit</button>
                                    <button onclick="deleteSubtask('${subtask.id}')" class="material-symbols-outlined rounded-full bg-red-600 h-8 w-8 text-white drop-shadow-md text-xs flex items-center justify-center" style="font-size: 18px;">delete</button>
                                </td>
                            </tr>
                        `).join('') : '<tr><td colspan="8" class="text-center opacity-70">No subtasks found</td></tr>'}
                    </tbody>
                </table>
            </div>
        </div>
        </div>
        
        </div>
        `,
                width: '90%',
                maxWidth: '800px',
                showCloseButton: true,
                showConfirmButton: false,
                customClass: {
                    container: 'task-details-modal'
                }
            });
        await getAllUsers('subtask_assignedto', 'name')
    new TomSelect('#subtask_assignedto', {
        plugins: ['remove_button'],
        render: {
            item: function (data, escape) {
                return `<div style="color: ${data.color}; font-weight: bold;">${escape(data.text)}</div>`;
            },
            option: function (data, escape) {
                return `<div style="color: ${data.color}; font-weight: bold;">${escape(data.text)}</div>`;
            }
        }
    });
    document.querySelectorAll('.status-select-sub').forEach(function(select) {
        new TomSelect(select, {
            create: false,
            sortField: {
                field: "select",
                direction: "asc"
            },
            render: {
                option: function(data, escape) {
                    let color = getStatusColor(data.value);
                    let icon = getStatusIcon(data.value);
                    return `<div class="flex items-center px-3 py-2 border-none rounded-md shadow-sm" style="background: linear-gradient(135deg, ${color.light}, ${color.dark}); color: white;border: none">
                                <i class="${icon} mr-2"></i>
                                <span>${escape(data.text)}</span>
                            </div>`;
                },
                item: function(data, escape) {
                    let color = getStatusColor(data.value);
                    let icon = getStatusIcon(data.value);
                    return `<div class="flex items-center px-3 py-2 border-none rounded-md shadow-md" style="background: linear-gradient(135deg, ${color.light}, ${color.dark}); color: white;border: none">
                                <i class="${icon} mr-2"></i>
                                <span>${escape(data.text)}</span>
                            </div>`;
                }
            }
        });
    });
    // Helper function to get status color gradients
    function getStatusColor(status) {
        switch (status) {
            case 'NOT STARTED':
                return { light: '#7a7a7a', dark: '#4a4a4a' }; // Gray gradient
            case 'PENDING':
                return { light: '#ffb347', dark: '#ff8000' }; // Orange gradient
            case 'IN PROGRESS':
                return { light: '#5dade2', dark: '#2874a6' }; // Blue gradient
            case 'COMPLETED':
                return { light: '#58d68d', dark: '#28a745' }; // Green gradient
            default:
                return { light: '#7a7a7a', dark: '#4a4a4a' }; // Default Gray gradient
        }
    }

    // Helper function to get status icons
    function getStatusIcon(status) {
        switch (status) {
            case 'NOT STARTED':
                return 'fas fa-circle-notch'; // Spinning circle
            case 'PENDING':
                return 'fas fa-clock'; // Clock
            case 'IN PROGRESS':
                return 'fas fa-spinner'; // Spinner
            case 'COMPLETED':
                return 'fas fa-check-circle'; // Check circle
            default:
                return 'fas fa-circle'; // Default circle
        }
    }
    } else {
        notification('Failed to fetch task details', 0);
    }
}

async function submitSubtaskForm(id) {
    const taskid = subtaskmanagementid;
    const form = document.getElementById('subtaskform');
    let payload = getFormData2(form, taskid ? [['id', taskid], ['assignedto', getmultivalues('subtask_assignedto', '||')]] : [['assignedto', getmultivalues('subtask_assignedto', '||')]]);

    // Show loading state using SweetAlert with higher z-index
    const loadingAlert = Swal.fire({
        title: 'Please wait...',
        text: taskid ? 'Updating subtask...' : 'Submitting subtask...',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
            // Increase z-index to ensure the modal is on top
            document.querySelector('.swal2-container').style.zIndex = '1060';
        }
    });

    const result = await httpRequest2(`api/v1/admin/subtaskschedule`, payload, null, 'json', 'POST');

    Swal.close(); // Close the loading alert once the request is complete

    if (result.status) {
        notification('Subtask saved successfully!', 1);
        viewtaskmanagement(id); // Refresh the task details
        subtaskmanagementid = ''
    } else {
        notification(result.message, 0);
    }
}

async function editSubtask(subtaskId, subtask) {
    document.getElementsByName('subtaskform')[0].click();
    subtaskmanagementid = subtaskId;
    populateData(subtask, [], [], 'subtaskform', true);
    setTimeout(() => {
        populateData(subtask, [], [], 'subtaskform', true);
    }, 1000);
}



function runSubtaskOptioner(targetId, element) {
    // Remove active class from all tabs
    const tabs = element.parentElement.parentElement.querySelectorAll('li');
    tabs.forEach(tab => tab.classList.remove('!text-blue-600', 'active'));

    // Add active class to the clicked tab
    element.classList.add('!text-blue-600', 'active');

    // Hide all tab contents
    const contents = document.querySelectorAll('#viewsubtasks, #subtaskform');
    contents.forEach(content => content.classList.add('hidden'));

    // Show the targeted tab content
    const target = document.getElementById(targetId);
    if (target) {
        target.classList.remove('hidden');
    }
}

async function taskmanagementFormSubmitHandler() {
    if(!validateForm('taskmanagementform', getIdFromCls('comp'))) return


    let payload = getFormData2(document.querySelector('#taskmanagementform'), taskmanagementid ? [['id', taskmanagementid], ['assignedto', getmultivalues('assignedto', '||')]] : [['assignedto', getmultivalues('assignedto', '||')]]);

    const confirmed = await Swal.fire({
        title: taskmanagementid ? 'Updating...' : 'Submitting...',
        text: 'Please wait while we submit your data.',
        icon: 'info',
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: async () => {
            Swal.showLoading();
            let request = await httpRequest2('api/v1/admin/taskschedule', payload, document.querySelector('#taskmanagementform #submit'), 'json', 'POST');
            Swal.close();

            if (request.status) {
                notification('Success!', 1);
                const form = document.querySelector('#taskmanagementform');
                form.reset();
                if(taskmanagementid)form.querySelectorAll('input, select, textarea').forEach(input => input.value = '');
                const assignedToSelect = document.querySelector('#assignedto');
                if (assignedToSelect.tomselect) {
                    assignedToSelect.tomselect.clear();
                }
                taskmanagementid = '';
                document.getElementsByClassName('viewer')[0].click();
                fetchtaskmanagement();
            } else {    
                notification(request.message, 0);
            }
        }
    });
}
