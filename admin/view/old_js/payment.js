let paymentid
async function paymentActive() {
    recalldatalist();
    const form = document.querySelector('#paymentform');
    if(form.querySelector('#submit')) form.querySelector('#submit').addEventListener('click', paymentFormSubmitHandler);
    if(document.querySelector('#submitview')) document.querySelector('#submitview').addEventListener('click', fetchpayment);
    if(document.querySelector('#paymentmethod')) document.querySelector('#paymentmethod').addEventListener('click', checkotherbankdetails)
    // if(document.querySelector('#paidto1'))document.querySelector('#paidto1').addEventListener('change', e=>handlesalesapplytopaymentbalance());
    datasource = [];
    // await fetchpayment()
    await handlesalesapplytopayment()
}

async function handlesalesapplytopayment (){
    // if(!document.getElementById('paidto1').value)return
    let request = await httpRequest2('../controllers/fetchsupplierscript', null, null, 'json')
    if(request.status){
        did('supplierlister').innerHTML = request.data.data.map(dat=>`<option value="${dat.companyname}"></option>`).join('')
        did('supplierlisterid').innerHTML = request.data.data.map(dat=>`<option value="${dat.companyname}">${dat.id}</option>`).join('')
    }
}

async function handlesalesapplytopaymentbalance(){
    did('submit').disabled = true
    did('balance').value = ''
    if(!did('paidto').value)return notification('Paidto does not have a value yet')
    did('bal').innerHTML = 'Loading...';
    let payload = new FormData()
    payload.append('paidto', did('paidto').value)
    let request = await httpRequest2('../controllers/fetchsupplierbalance', payload, null, 'json')
    if(request.status){
        did('bal').innerHTML = formatNumber(request.data.balance);
        did('balance').value = request.data.balance;
        if(Number(request.data.balance) > 0)did('submit').disabled = false
    }else return did('bal').innerHTML = request.message;
}

function getpaymentbalance(){
    setTimeout(async()=>{
        did('bal').innerHTML = 'Nill';
        did('amountpaid').disabled = true;
        did('submit').disabled = true;
        if(!did('applyto').value)return;
        if(!did('paymentto').value)return;
        if(!did('paymentto1').value)return;
        did('bal').innerHTML = 'Loading...';
    function getparamm(){
        let paramstr = new FormData()
        paramstr.append('applyto', did('applyto').value)
        paramstr.append('paymentto', did('paymentto').value)
        return paramstr
    }
    let request = await httpRequest2('../controllers/fetchtransactionbalance', getparamm(), null, 'json')
    if(request.status){
        did('bal').innerHTML = 0;
        if(Number(request.data.balance)>0){
            did('amountpaid').disabled = false;
            did('submit').disabled = false;
            did('bal').innerHTML = formatNumber(request.data.balance);
            did('balance').value = request.data.balance;
        }
    }else{
        did('bal').innerHTML = request.message;
    }
    },1000)
}

async function fetchpayment(id) {
    function getparamm(){
        let paramstr = new FormData(did('paymentviewform'))
        return paramstr
    }
    let request = await httpRequest2('../controllers/fetchpayments', getparamm(), document.querySelector('#submitview'), 'json')
    if(!id)document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> No Records Retrieved </td>`
    if(request.status) {
         datasource = request.data
        resolvePagination(datasource, onpaymentTableDataSignal)
    }
    else return notification('No records retrieved')
}

async function fetchpaymenter(ref) {
    did('viewformtoeditpayment').innerHTML = `
            <div class="flex flex-col justify-center items-center gap-2" >
                                    <div>
                        				<div class="flex justify-end phide">
                        				<div onclick="printContent('HEMS payment', null, 'viewformtoeditpayment', true)" class="relative mr-4 inline-block">
                        					<div class="text-gray-500 cursor-pointer w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-300 inline-flex items-center justify-center" >
                        						<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-printer" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                        							<rect x="0" y="0" width="24" height="24" stroke="none"></rect>
                        							<path d="M17 17h2a2 2 0 0 0 2 -2v-4a2 2 0 0 0 -2 -2h-14a2 2 0 0 0 -2 2v4a2 2 0 0 0 2 2h2"></path>
                        							<path d="M17 9v-4a2 2 0 0 0 -2 -2h-6a2 2 0 0 0 -2 2v4"></path>
                        							<rect x="7" y="13" width="10" height="8" rx="2"></rect>
                        						</svg>				  
                        					</div>
                        					<div onclick="exportToPDF('viewformtoeditpayment')" class="z-40 shadow-lg text-center w-32 block absolute right-0 top-0 p-2 mt-12 rounded-lg bg-gray-800 text-white text-xs" style="display: none;">
                        						Print this Invoice!
                        					</div>
                        				</div>
                        				<div onclick="printContent('HEMS payment', null, 'viewformtoeditpayment', true)" class="relative mr-4 inline-block">
                        					<div class="text-gray-500 cursor-pointer w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-300 inline-flex items-center justify-center" onclick="printInvoice()">
                        						<span class="material-symbols-outlined">picture_as_pdf</span>			  
                        					</div>
                        					<div  class="z-40 shadow-lg text-center w-32 block absolute right-0 top-0 p-2 mt-12 rounded-lg bg-gray-800 text-white text-xs" style="display: none;">
                        						Print this Invoice!
                        					</div>
                        				</div>
                        				<div onclick="did('modalpayment').classList.add('hidden');did('payment').click()" class="relative inline-block">
                        					<div class="text-gray-500 cursor-pointer w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-300 inline-flex items-center justify-center" @mouseenter="showTooltip = true" @mouseleave="showTooltip = false" @click="printInvoice()">
                        						<span class="material-symbols-outlined text-red-500 cp-500">cancel</span>	  
                        					</div>
                        					<div x-show.transition="showTooltip" class="z-40 shadow-lg text-center w-32 block absolute right-0 top-0 p-2 mt-12 rounded-lg bg-gray-800 text-white text-xs" style="display: none;">
                        						cancel
                        					</div>
                        				</div>
                        				
                        			</div>
                        			</div>
                                    <h4 class="font-semibold">${did('your_companyname').value}</h4>
                                    <p class="text-xs">${did('your_companyaddress').value}</p>
                                </div>
                                <div class="flex flex-col gap-3 border-b py-6 text-xs">
                                  <p class="flex justify-between">
                                    <span class="text-gray-600 font-semibold capitalize text-right">reference:</span>
                                    <span>${ref}</span>
                                  </p>
                                  <p class="flex justify-between">
                                    <span class="text-gray-600 font-semibold capitalize text-right">Paid to:</span>
                                    <span>${did('paidto1').value}</span>
                                  </p>
                                  <p class="flex justify-between hidden">
                                    <span class="text-gray-600 font-semibold capitalize text-right">Amout paid:</span>
                                    <span>${formatNumber(Number(did('amountpaid').value))}</span>
                                  </p>
                                  <p class="flex justify-between">
                                    <span class="text-gray-600 font-semibold capitalize text-right">Payment method:</span>
                                    <span>${did('paymentmethod').value}</span>
                                  </p>
                                  <p class="flex justify-between">
                                    <span class="text-gray-600 font-semibold capitalize text-right">other details:</span>
                                    <span>${did('otherdetail').value}</span>
                                  </p>
                                  <p class="flex justify-between">
                                    <span class="text-gray-600 font-semibold capitalize text-right">balance:</span>
                                    <span>${formatNumber(Number(did('balance').value)-Number(did('amountpaid').value))}</span>
                                  </p>
                                </div>
                                <div class="flex flex-col gap-3 pb-6 pt-2 text-xs">
                                  <div class=" border-b border border-dashed">
                                   <table class="w-full text-left">
                                        <thead>
                                          <tr class="flex">
                                            <th class="w-full py-2">Item</th>
                                            <th class="min-w-[64px] py-2">Amt&nbsp;Paid</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          <tr class="flex">
                                            <td class="flex-1 py-1">Deposit</td>
                                            <td class="min-w-[64px] text-semibold">${formatNumber(Number(did('amountpaid').value))}</td>
                                          </tr>
                                        </tbody>
                                      </table>
                                  </div>
                                  <div class="py-4 justify-center items-center flex flex-col gap-2">
                                    <p class="flex gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M21.3 12.23h-3.48c-.98 0-1.85.54-2.29 1.42l-.84 1.66c-.2.4-.6.65-1.04.65h-3.28c-.31 0-.75-.07-1.04-.65l-.84-1.65a2.567 2.567 0 0 0-2.29-1.42H2.7c-.39 0-.7.31-.7.7v3.26C2 19.83 4.18 22 7.82 22h8.38c3.43 0 5.54-1.88 5.8-5.22v-3.85c0-.38-.31-.7-.7-.7ZM12.75 2c0-.41-.34-.75-.75-.75s-.75.34-.75.75v2h1.5V2Z" fill="#000"></path><path d="M22 9.81v1.04a2.06 2.06 0 0 0-.7-.12h-3.48c-1.55 0-2.94.86-3.63 2.24l-.75 1.48h-2.86l-.75-1.47a4.026 4.026 0 0 0-3.63-2.25H2.7c-.24 0-.48.04-.7.12V9.81C2 6.17 4.17 4 7.81 4h3.44v3.19l-.72-.72a.754.754 0 0 0-1.06 0c-.29.29-.29.77 0 1.06l2 2c.01.01.02.01.02.02a.753.753 0 0 0 .51.2c.1 0 .19-.02.28-.06.09-.03.18-.09.25-.16l2-2c.29-.29.29-.77 0-1.06a.754.754 0 0 0-1.06 0l-.72.72V4h3.44C19.83 4 22 6.17 22 9.81Z" fill="#000"></path></svg>${did('your_companyemail').value}</p>
                                    <p class="flex gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"><path fill="#000" d="M11.05 14.95L9.2 16.8c-.39.39-1.01.39-1.41.01-.11-.11-.22-.21-.33-.32a28.414 28.414 0 01-2.79-3.27c-.82-1.14-1.48-2.28-1.96-3.41C2.24 8.67 2 7.58 2 6.54c0-.68.12-1.33.36-1.93.24-.61.62-1.17 1.15-1.67C4.15 2.31 4.85 2 5.59 2c.28 0 .56.06.81.18.26.12.49.3.67.56l2.32 3.27c.18.25.31.48.4.7.09.21.14.42.14.61 0 .24-.07.48-.21.71-.13.23-.32.47-.56.71l-.76.79c-.11.11-.16.24-.16.4 0 .08.01.15.03.23.03.08.06.14.08.2.18.33.49.76.93 1.28.45.52.93 1.05 1.45 1.58.1.1.21.2.31.3.4.39.41 1.03.01 1.43zM21.97 18.33a2.54 2.54 0 01-.25 1.09c-.17.36-.39.7-.68 1.02-.49.54-1.03.93-1.64 1.18-.01 0-.02.01-.03.01-.59.24-1.23.37-1.92.37-1.02 0-2.11-.24-3.26-.73s-2.3-1.15-3.44-1.98c-.39-.29-.78-.58-1.15-.89l3.27-3.27c.28.21.53.37.74.48.05.02.11.05.18.08.08.03.16.04.25.04.17 0 .3-.06.41-.17l.76-.75c.25-.25.49-.44.72-.56.23-.14.46-.21.71-.21.19 0 .39.04.61.13.22.09.45.22.7.39l3.31 2.35c.26.18.44.39.55.64.1.25.16.5.16.78z"></path></svg>${did('your_companyphone').value}</p>
                                  </div>
                                </div>
                                <div class="w-full flex justify-center p-2">
                               <p>We appreciate your stay with us</p>
                              </div>
        `
        did('modalpayment').classList.remove('hidden')
}

async function removepayment(id) {
    // Ask for confirmation
    const confirmed = window.confirm("Are you sure you want to remove this payment?");

    // If not confirmed, do nothing
    if (!confirmed) {
        return;
    }

    function getparamm() {
        let paramstr = new FormData();
        paramstr.append('id', id);
        return paramstr;
    }

    let request = await httpRequest2('../controllers/removevisacountries', id ? getparamm() : null, null, 'json');
    
    // Show notification based on the result
    fetchpayment()
    return notification(request.message);
    
}


async function onpaymentTableDataSignal() {
    let rows = getSignaledDatasource().map((item, index) => `
    <tr>
        <td>${item.index + 1 }</td>
        <td>${item.productname}</td>
        <td>${item.productdescription}</td>
        <td class="flex items-center gap-3">
            <button title="Edit row entry" onclick="fetchpayment('${item.id}')" class="material-symbols-outlined rounded-full bg-primary-g h-8 w-8 text-white drop-shadow-md text-xs" style="font-size: 18px;">edit</button>
            <button title="Delete row entry"s onclick="removepayment('${item.id}')" class="material-symbols-outlined rounded-full bg-red-600 h-8 w-8 text-white drop-shadow-md text-xs" style="font-size: 18px;">delete</button>
        </td>
    </tr>`
    )
    .join('')
    injectPaginatatedTable(rows)
}

async function paymentFormSubmitHandler() {
    if(!validateForm('paymentform', getIdFromCls('comp'))) return notification('Please enter all compulsory fields')
    
    let payload

    payload = getFormData2(document.querySelector('#paymentform'))
    let request = await httpRequest2('../controllers/payments', payload, document.querySelector('#paymentform #submit'))
    if(request.status) {
        notification('Success!', 1);
        // document.querySelector('#payment').click();
        fetchpaymenter(request.reference)
        return
    }
    document.querySelector('#payment').click();
    return notification(request.message, 0);
}


// function runAdpaymentFormValidations() {
//     let form = document.getElementById('paymentform')
//     let errorElements = form.querySelectorAll('.control-error')
//     let controls = []

//     if(controlHasValue(form, '#paymentto'))  controls.push([form.querySelector('#paymentto'), 'Select an paymentto'])
//     if(controlHasValue(form, '#paymentname'))  controls.push([form.querySelector('#paymentname'), 'payment name is required'])
//     if(controlHasValue(form, '#statusme'))  controls.push([form.querySelector('#itemname'), 'item name is required'])
//     if(controlHasValue(form, '#urlge'))  controls.push([form.querySelector('#image'), 'image is required'])
//     if(controlHasValue(form, '#urlition'))  controls.push([form.querySelector('#position'), 'position is required'])
//     if(controlHasValue(form, '#url'))  controls.push([form.querySelector('#url'), 'url is required'])
//     parentidurl
//     return mapValidationErrors(errorElements, controls)   

// }