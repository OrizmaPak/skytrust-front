let addmemberid
let registeration
async function addmemberActive() {
    addmemberid = ''
    const form = document.querySelector('#addmemberform')
    if(form.querySelector('#submit')) form.querySelector('#submit').addEventListener('click', addmemberFormSubmitHandler)
    datasource = []
    const phone = document.querySelector("#phone");
  const iti = window.intlTelInput(phone, {
    initialCountry: "ng",
    loadUtils: () => import("https://cdn.jsdelivr.net/npm/intl-tel-input@25.2.0/build/js/utils.js"),
    // utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@25.2.0/build/js/utils.js",
  });

//   await 

  function getPhoneNumberAndCountryCode() {
    try {
      let phoneNumber = did('phone').value.replaceAll(' ', '');
      if (phoneNumber.startsWith('+')) {
          phoneNumber = '0' + phoneNumber.slice(4);
      }
      const countryCode = iti.getSelectedCountryData().dialCode;
      console.log(phoneNumber, countryCode);
      return { phoneNumber, countryCode };
    } catch (error) {
      console.error('intlTelInputUtils is undefined or another error occurred:', error);
      return { phoneNumber: null, countryCode: null };
    }
  }

  // Function to get phone number and country code separately
  
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabPanels = document.querySelectorAll('.tab-panel');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const submitBtn = document.getElementById('submit');
  const contentContainer = document.getElementById('contentcontainer');
  
  // Array of tab IDs in order
  const tabsOrder = ['personal-info-tab', 'contact-info-tab', 'address-details-tab', 'nextofkin-tab', 'additional-info-tab'];
  let currentTabIndex = 0;
  
  // Function to show a specific tab by index
  function showTab(index) {
      // Hide all panels
      tabPanels.forEach(panel => panel.classList.add('hidden'));
      // Remove active styling from all tabs
      tabButtons.forEach(btn => {
          btn.classList.remove('text-blue-600', 'border-blue-600');
          btn.classList.add('text-gray-700');
      });

      const targetTabId = tabsOrder[index];
      const targetPanel = document.getElementById(targetTabId);
      targetPanel.classList.remove('hidden');

      // Highlight the corresponding tab button
      const targetButton = [...tabButtons].find(btn => btn.getAttribute('data-target') === targetTabId);
      targetButton.classList.remove('text-gray-700');
      targetButton.classList.add('text-blue-600', 'border-blue-600');

      updateButtons();
  }

  // Update the state of Previous, Next, and Submit buttons based on currentTabIndex
  function updateButtons() {
      // If on first tab
      if (currentTabIndex === 0) {
          prevBtn.classList.add('hidden');
      } else {
          prevBtn.classList.remove('hidden');
      }

      // If on last tab
      if (currentTabIndex === tabsOrder.length - 1) {
          nextBtn.classList.add('hidden');
          submitBtn.classList.remove('hidden');
      } else {
          nextBtn.classList.remove('hidden');
          submitBtn.classList.add('hidden');
      }
  }

  prevBtn.addEventListener('click', () => {
      if (currentTabIndex > 0) {
          currentTabIndex--;
          showTab(currentTabIndex);
      }
  });

  nextBtn.addEventListener('click', () => {
      if (currentTabIndex < tabsOrder.length - 1) {
          currentTabIndex++;
          showTab(currentTabIndex);
      }
  });

  // Add click event to each tab button (if user wants to click tabs directly)
  tabButtons.forEach((button, index) => {
      button.addEventListener('click', () => {
          currentTabIndex = tabsOrder.indexOf(button.getAttribute('data-target'));
          showTab(currentTabIndex);
      });
  });

  // Example logic: Show tabs after phone is entered or as soon as the form loads
  // Here, we'll just show the tabs after the phone field is not empty.
  const phoneInput = document.getElementById('phone');
  phoneInput.addEventListener('input', () => {
      if (phoneInput.value.trim()) {
          contentContainer.classList.remove('hidden');
          showTab(currentTabIndex); // Show the first tab once the phone is entered
      } else {
          contentContainer.classList.add('hidden');
      }
  });

  // Example logic to show tabs after phone is entered (adjust as needed)
  function debounce(func, wait) {
      let timeout;
      return function(...args) {
          const context = this;
          clearTimeout(timeout);
          timeout = setTimeout(() => func.apply(context, args), wait);
      };
  }

  const emptydata = [{
    "id": '',
    "firstname": '',
    "lastname": '',
    "othernames": '',
    "email": '',
    "phone": '',
    "emailverified": '',
    "address": '',
    "permissions": '',
    "password": '',
    "dateadded": '',
    "lastupdated": '',
    "branch": '',
    "country": '',
    "state": '',
    "image": '',
    "createdby": '',
    "role": '',
    "status": '',
    "registrationpoint": '',
    "dateofbirth": '',
    "gender": '',
    "image2": '',
    "lga": '',
    "lgaofresidence": '',
    "maritalstatus": '',
    "nextofkinaddress": '',
    "nextofkinfullname": '',
    "nextofkinoccupation": '',
    "nextofkinofficeaddress": '',
    "nextofkinphone": '',
    "nextofkinrelationship": '',
    "occupation": '',
    "officeaddress": '',
    "spousename": '',
    "stateofresidence": '',
    "town": '',
    "userpermissions": ''
  }]

  const handlePhoneInput = async () => {
      const { phoneNumber } = getPhoneNumberAndCountryCode();
      if (phoneInput.value.trim() && phoneNumber.length >= 10 && phoneNumber.length <= 15) {
        notification('Loading...');
        did('email').removeAttribute('readonly');
        did('newpersonpassword').classList.remove('hidden');
        did('logoFrame').src = ``
          const request = await httpRequest2(`api/v1/auth/profile?phone=${phoneNumber.trim()}`, null, null, 'json', 'GET');
          resetInputsInDiv('tabss');
          if(request.status) {
              notification(request.message);
              document.getElementById('contentcontainer').classList.remove('hidden');
              populateData(request.data);
              if(request.data.image != '-')did('logoFrame').src = `${request.data.image}`;
              did('id').value ? did('email').setAttribute('readonly', true) : did('email').removeAttribute('readonly');
              did('newpersonpassword').classList.add('hidden');
            } else {
              document.getElementById('contentcontainer').classList.remove('hidden');
              did('email').removeAttribute('readonly');
              notification('Create new User');
              populateData(emptydata);
          }
      } else {
        did('email').removeAttribute('readonly');
          resetInputsInDiv('tabss');
          populateData(emptydata);
          document.getElementById('contentcontainer').classList.add('hidden');
          notification('Please enter a valid phone number');
      }

      function resetInputsInDiv(divId) {
          const div = document.getElementById(divId);
          const inputs = div.querySelectorAll('input');
          const selects = div.querySelectorAll('select');
          inputs.forEach(input => input.value = '');
          selects.forEach(select => select.selectedIndex = 0);
      }
  };

  phoneInput.addEventListener('keyup', debounce(handlePhoneInput, 300));
  

    // function getPhoneNumberAndCountryCode() {
    //   try {
    //     const phoneNumber = iti.getNumber(intlTelInputUtils.numberFormat.E164);
    //     const countryCode = iti.getSelectedCountryData().dialCode;
    //     if (!phoneNumber || !countryCode) {
    //       throw new Error('Invalid phone number or country code');
    //     }
    //     return { phoneNumber, countryCode };
    //   } catch (error) {
    //     console.error('Error getting phone number and country code:', error);
    //     return { phoneNumber: null, countryCode: null };
    //   }
    // }
}


async function fetchaddmember(id) {
    // scrollToTop('scrolldiv')
    function getparamm() {
        let paramstr = new FormData();
        paramstr.append('id', id);
        return paramstr;
    }

    // Show loading state using SweetAlert
    const loadingAlert = Swal.fire({
        title: 'Please wait...',
        text: 'Fetching addmember data, please wait.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    let request = await httpRequest2(`api/v1/admin/addmember${id ? `?id=${id}`: ''}`,  null, null, 'json', 'GET');
    Swal.close(); // Close the loading alert once the request is complete

    if (!id) document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> No Records Retrieved </td>`;
    if (request.status) {
        if (!id) {
            if (request.data.length) {
                datasource = request.data;
                resolvePagination(datasource, onaddmemberTableDataSignal);
            }
        } else {
            document.getElementsByClassName('updater')[0].click();
            addmemberid = request.data[0].id;
            populateData(request.data[0]);
        }
    } else {
        return notification('No records retrieved');
    }
}

async function removeaddmember(id) {
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
        fetchaddmember();
        return notification(confirmed.value.message);
    }
}


async function onaddmemberTableDataSignal() {
    let rows = getSignaledDatasource().map((item, index) => `
    <tr>
        <td>${index + 1}</td>
        <td>${item.addmember}</td>
        <td>${item.useridname??item.userid}</td>
        <td>${item.country}</td>
        <td>${item.state}</td>
        <td>${item.lga}</td>
        <td>${item.address}</td>
        <td class="flex items-center gap-3 ${item.addmember == default_addmember ? 'hidden' : ''}">
            <button title="Edit row entry" onclick="fetchaddmember('${item.id}')" class="material-symbols-outlined rounded-full bg-primary-g h-8 w-8 text-white drop-shadow-md text-xs" style="font-size: 18px;">edit</button>
            <button title="Delete row entry" onclick="removeaddmember('${item.id}')" class="hidden material-symbols-outlined rounded-full bg-red-600 h-8 w-8 text-white drop-shadow-md text-xs" style="font-size: 18px;">delete</button>
        </td>
    </tr>`
    )
    .join('')
    injectPaginatatedTable(rows)
}

async function addmemberFormSubmitHandler() {
    if(!validateForm('addmemberform', getIdFromCls('comp'))) return notification('Please fill all required fields', 0)
    
    let payload = getFormData2(document.querySelector('#addmemberform'), [['phone', did('phone').value.replaceAll(' ', '')], ['password', !did('id').value && did('phone').value.replaceAll(' ', '')], ['registrationpoint', did('id').value && the_user.registrationpoint]], false);

    const confirmed = await Swal.fire({
        title: did('id').value ? 'Updating...' : 'Submitting...',
        text: 'Please wait while we submit your data.',
        icon: 'info',
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: async () => {
            Swal.showLoading();
            let request = await httpRequest2('api/v1/members/userregistration', payload, document.querySelector('#addmemberform #submit'), 'json', 'POST');
            Swal.close();

            if (request.status) {
                notification('Success!', 1);
                const form = document.querySelector('#addmemberform');
                form.reset();
                if(addmemberid)form.querySelectorAll('input, select, textarea').forEach(input => input.value = '');
                addmemberid = '';
                document.getElementsByClassName('viewer')[0].click();
                fetchaddmember();
            } else {    
                notification(request.message, 0);
            }
        }
    });
}
