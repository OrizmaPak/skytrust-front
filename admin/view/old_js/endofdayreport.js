let endofdayreportid
async function endofdayreportActive() {
    recalldatalist()
    const form = document.querySelector('#endofdayreportform')
    if(form.querySelector('#submit')) form.querySelector('#submit').addEventListener('click', e=>fetchendofdayreport())
    datasource = []
    // await getAllUsers()
}

function checksalespointforendofday(el){
        for(let i=0;i<document.getElementsByClassName('pamount').length;i++){
            if(!el.value || el.value == "Booking/Reservation"){
                document.getElementsByClassName('pamount')[i].classList.remove('!hidden')
            }else{
                document.getElementsByClassName('pamount')[i].classList.add('!hidden')
            }
    }
}

async function fetchendofdayreport(id) {
    // scrollToTop('scrolldiv')
    function getparamm(){
        let paramstr = new FormData(did('endofdayreportform'))
        // if(id)paramstr.append('id', id)
        return paramstr
    }
    let request = await httpRequest2('../controllers/fetchendofdayreport', getparamm(), document.querySelector('#endofdayreportform #submit'), 'json')
    if(!id)document.getElementById('tabledata').innerHTML = `<td colspan="100%" class="text-center opacity-70"> No Records Retrieved </td>`
    if(request.status) {
        if(!id){
            if(request.data.length) {
                datasource = request.data
                await resolvePagination(datasource, onendofdayreportTableDataSignal)
                did('tabledata').innerHTML += `
                <tr>
        <td colspan="7" class="text-right font-bold">Totals:</td>
        <td>${formatNumber(datasource.reduce((acc, item) => acc + (parseFloat(item.amount) || 0), 0))}</td>
        <td class="pamount">${formatNumber(datasource.reduce((acc, item) => acc + (parseFloat(item.planamount) || 0), 0))}</td>
        <td>${formatNumber(datasource.reduce((acc, item) => acc + (parseFloat(item.consumption) || 0), 0))}</td>
        <td>${formatNumber(datasource.reduce((acc, item) => acc + (parseFloat(item.VAT) || 0), 0))}</td>
        <td>${formatNumber(datasource.reduce((acc, item) => acc + (parseFloat(item.servicecharge) || 0), 0))}</td> 
        <td>${formatNumber(datasource.reduce((acc, item) => acc + (parseFloat(item.agencycommission) || 0), 0))}</td>
        <td>${formatNumber(datasource.reduce((acc, item) => acc + (parseFloat(item.total) || 0), 0))}</td> 
        <td>${formatNumber(datasource.reduce((acc, item) => acc + (parseFloat(item.amountrec) || 0), 0))}</td> 
        <td>${formatNumber(datasource.reduce((acc, item) => acc + (parseFloat(item.balancedue) || 0), 0))}</td> 
        <td></td> 
    </tr>`
            }
        }else{
             endofdayreportid = request.data[0].id
            populateData(request.data[0])
        }
    }
    else return notification('No records retrieved')
}

async function getendofdayreservation(ref){
    let param = new FormData()
    param.append('reference', ref)
    let request = await httpRequest2('../controllers/fetchreservationbyref', param, null, 'json')
    if(request.status){
        return request.data[0]
    }else return notification(request.message, 0)
}
async function getendofdayreservation2(ref){
    let param = new FormData()
    param.append('reference', ref)
    let request = await httpRequest2('../controllers/fetchsalesbyreference', param, null, 'json')
    if(request.status){
        return request.data[0]
    }else return notification(request.message, 0)
}


async function openendofdayreceipt(ref){
  let receiptdata = await getendofdayreservation(ref)
    if(!receiptdata)return callModal('Something went wrong...')
    // did('invoiceno').setAttribute('value', receiptdata.reservations.reference)
    // did('invoiceno').value = receiptdata.reservations.reference
    // did('invoicedate').setAttribute('value', specialformatDateTime(receiptdata.reservations.reservationdate))
    // did('invoicedate').value = specialformatDateTime(receiptdata.reservations.reservationdate)
    // did('rbillto').setAttribute('value', receiptdata.roomguestrow[0].guest1[0].firstname+' '+receiptdata.roomguestrow[0].guest1[0].lastname)
    // did('rbillto').value =receiptdata.roomguestrow[0].guest1[0].firstname+' '+receiptdata.roomguestrow[0].guest1[0].lastname
    // did('rroomnumber').setAttribute('value', receiptdata.roomguestrow[0].roomdata.roomnumber)
    // did('rpaymentmenthod').setAttribute('value', receiptdata.reservations.paymentmethod)
    // did('rpaymentmenthod').setAttribute('value', receiptdata.reservations.paymentmethod)
    // did('rcheckindate').textContent = specialformatDateTime(receiptdata.reservations.reservationdate)
    // did('rrroomnumber').textContent = 'Room '+receiptdata.roomguestrow[0].roomdata.roomnumber
    // // did('ramountpaid').textContent = receiptdata.guests.origin+', '+receiptdata.guests.state
    // did('rnumberofnights').textContent = formatNumber(receiptdata.reservations.numberofnights)
    // did('rbalance').textContent = formatNumber(Number(receiptdata.reservations.numberofnights)*Number(receiptdata.reservations.roomrate))
    
    did('modalreceipt').innerHTML = `
        <div id="invoicecontainer" class="w-full mx-auto border rounded shadow p-10 bg-white relative">
                                    <div class="w-full flex justify-end">
                                            <span class="material-symbols-outlined text-red-500 cp hover:scale-[1.3] transition-all" onclick="did('modalreceipt').classList.add('hidden')">close</span>
                                        </div>
                        		<div class="flex mb-8 justify-between">
                        			<div class="w-2/4">
                        				<div class="mb-2 md:mb-1 md:flex items-center">
                        					<label class="w-32 text-gray-800 block font-bold text-sm uppercase tracking-wide">Invoice No.</label>
                        					<div class="flex-1">
                        					<input value="${receiptdata.reservations.reference??''}" id="invoiceno" readonly class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-48 py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-500" id="inline-full-name" type="text" placeholder="eg. #INV-100001">
                        					</div>
                        				</div>
                        
                        				<div class="mb-2 md:mb-1 md:flex items-center">
                        					<label class="w-32 text-gray-800 block font-bold text-sm uppercase tracking-wide">Invoice Date</label>
                        					<div class="flex-1">
                        					<input id="invoicedate" value="${specialformatDateTime(receiptdata.reservations.reservationdate??'')}" readonly class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-48 py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-500 js-datepicker" type="text" id="datepicker1" placeholder="eg. 17 Feb, 2020" autocomplete="off" readonly="">
                        					</div>
                        				</div>
                        				<div class="mb-2 md:mb-1 md:flex items-center">
                        					<label class="w-32 text-gray-800 block font-bold text-sm uppercase tracking-wide">Arrival</label>
                        					<div class="flex-1">
                        					<input id="invoicedate" value="${specialformatDateTime(receiptdata.reservations.arrivaldate??'')}" readonly class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-48 py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-500 js-datepicker" type="text" id="datepicker1" placeholder="eg. 17 Feb, 2020" autocomplete="off" readonly="">
                        					</div>
                        				</div>
                        				<div class="mb-2 md:mb-1 md:flex items-center">
                        					<label class="w-32 text-gray-800 block font-bold text-sm uppercase tracking-wide">Departure</label>
                        					<div class="flex-1">
                        					<input id="invoicedate" value="${specialformatDateTime(receiptdata.reservations.departuredate??'')}" readonly class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-48 py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-500 js-datepicker" type="text" id="datepicker1" placeholder="eg. 17 Feb, 2020" autocomplete="off" readonly="">
                        					</div>
                        				</div>
                        
                        				<!--<div class="mb-2 md:mb-1 md:flex items-center">-->
                        				<!--	<label class="w-32 text-gray-800 block font-bold text-sm uppercase tracking-wide">Due date</label>-->
                        				<!--	<span class="mr-4 inline-block hidden md:block">:</span>-->
                        				<!--	<div class="flex-1">-->
                        				<!--	<input class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-48 py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-500 js-datepicker-2" id="datepicker2" type="text" placeholder="eg. 17 Mar, 2020" x-model="invoiceDueDate" x-on:change="invoiceDueDate = document.getElementById('datepicker2').value" autocomplete="off" readonly="">-->
                        				<!--	</div>-->
                        				<!--</div>-->
                        			</div>
                        			<div>
                                        <p class="flex xl:w-[400px] gap-4 py-3 pl-5">
                            				<span class="hemsnamebig">
                            				        <span class=" pb-10 font-bold text-2xl text-base block selection:bg-white uppercase font-heebo text-primary-g text-right">
                            				                He
                            				                <span class="text-gray-400">
                            				                    ms
                            				                </span>
                            				        </span>
                            				</span>
                    				                <span class="text-gray-400 pb-10 font-bold text-2xl text-base block selection:bg-white uppercase font-heebo text-primary-g text-right">
                    				                    Reservation
                    				                </span>
                        				</p>                        				<div class="flex justify-end">
                        				<div onclick="printContent('HEMS INVOICE', null, 'invoicecontainer', true)" class="relative mr-4 inline-block">
                        					<div class="text-gray-500 cursor-pointer w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-300 inline-flex items-center justify-center" onclick="printInvoice()">
                        						<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-printer" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                        							<rect x="0" y="0" width="24" height="24" stroke="none"></rect>
                        							<path d="M17 17h2a2 2 0 0 0 2 -2v-4a2 2 0 0 0 -2 -2h-14a2 2 0 0 0 -2 2v4a2 2 0 0 0 2 2h2"></path>
                        							<path d="M17 9v-4a2 2 0 0 0 -2 -2h-6a2 2 0 0 0 -2 2v4"></path>
                        							<rect x="7" y="13" width="10" height="8" rx="2"></rect>
                        						</svg>				  
                        					</div>
                        					<div  class="z-40 shadow-lg text-center w-32 block absolute right-0 top-0 p-2 mt-12 rounded-lg bg-gray-800 text-white text-xs" style="display: none;">
                        						Print this invoice!
                        					</div>
                        				</div>
                        				<div onclick="did('modalreceipt').classList.add('hidden')" class="relative inline-block">
                        					<div class="text-gray-500 cursor-pointer w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-300 inline-flex items-center justify-center" @mouseenter="showTooltip = true" @mouseleave="showTooltip = false" @click="printInvoice()">
                        						<span class="material-symbols-outlined text-red-500 cp-500">cancel</span>	  
                        					</div>
                        					<div x-show.transition="showTooltip" class="z-40 shadow-lg text-center w-32 block absolute right-0 top-0 p-2 mt-12 rounded-lg bg-gray-800 text-white text-xs" style="display: none;">
                        						cancel
                        					</div>
                        				</div>
                        				
                        			</div>
                        			</div>
  </div>
                        
                        		<div class="flex flex-wrap justify-between mb-8">
                        			<div class="w-full md:w-1/3 mb-2 md:mb-0">
                        				<label class="text-gray-800 block mb-1 font-semibold text-xs uppercase tracking-wide">Bill info:</label>
                        				<input readonly value="${receiptdata.reservations.billinginfo??''}" class="mb-1 bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-500" id="inline-full-name" type="text" placeholder="" >
                        				<label class="text-gray-800 block mb-1 font-semibold text-xs uppercase tracking-wide">Cancellation Date:</label>
                        				<input readonly value="${receiptdata.reservations.cancellationdate??''}" class="mb-1 bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-500" id="inline-full-name" type="text" placeholder="" >
                        				<label class="text-gray-800 block mb-1 font-semibold text-xs uppercase tracking-wide">Source:</label>
                        				<input readonly value="${receiptdata.reservations.source??''}" class="mb-1 bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-500" id="inline-full-name" type="text" placeholder="" >
                        				<label class="text-gray-800 block mb-1 font-semibold text-xs uppercase tracking-wide">Status:</label>
                        				<input readonly value="${receiptdata.reservations.status == 'OPEN' ? 'RESERVED' : receiptdata.reservations.status??'' }" class="mb-1 bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-500" id="inline-full-name" type="text" placeholder="" >
                        				<label class="text-gray-800 block mb-1 font-semibold text-xs uppercase tracking-wide">Total Rate:</label>
                        				<input readonly value="${formatNumber(Number(receiptdata.reservations.totalamount))}" class="mb-1 bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-500" id="inline-full-name" type="text" placeholder="" >
                        				<label class="text-gray-800 block mb-1 font-semibold text-xs uppercase tracking-wide">Total Nights:</label>
                        				<input readonly value="${formatNumber(Number(receiptdata.reservations.numberofnights))}" class="mb-1 bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-500" id="inline-full-name" type="text" placeholder="" >
                        			</div>
                        			<div class="w-full md:w-1/3">
                        				<label class="text-gray-800 block mb-1 font-semibold text-xs uppercase tracking-wide">Hotel:</label>
                        				<input value="${did('your_companyname').value}" class="mb-1 bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-500" id="inline-full-name" type="text" placeholder="Your company name" >
                        				<label class="text-gray-800 block mb-1 font-semibold text-xs uppercase tracking-wide">Group:</label>
                        				<input readonly value="${receiptdata.reservations.groupname??''}" class="mb-1 bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-500" id="inline-full-name" type="text" placeholder="" >
                        				<label class="text-gray-800 block mb-1 font-semibold text-xs uppercase tracking-wide">Company:</label>
                        				<input readonly value="${receiptdata.reservations.companyname??''}" class="mb-1 bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-500" id="inline-full-name" type="text" placeholder="" >
                        				<label class="text-gray-800 block mb-1 font-semibold text-xs uppercase tracking-wide">Travel Agent:</label>
                        				<input readonly value="${receiptdata.reservations.travelagentname??''}" class="mb-1 bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-500" id="inline-full-name" type="text" placeholder="" >
                        				<label class="text-gray-800 block mb-1 font-semibold text-xs uppercase tracking-wide">Type of Guest:</label>
                        				<input readonly value="${receiptdata.reservations.typeofguest??''}" class="mb-1 bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-500" id="inline-full-name" type="text" placeholder="" >
                        				<label class="text-gray-800 block mb-1 font-semibold text-xs uppercase tracking-wide">Number of Rooms:</label>
                        				<input readonly value="${receiptdata.roomguestrow.length}" class="mb-1 bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-500" id="inline-full-name" type="text" placeholder="" >
                                    </div>
                                </div>
                                
                                <div class="table-content">
                                    <table id="tableer" class="mx-auto">
                                        <thead>
                                            <tr>
                                                 <th style="width: 20px">s/n</th>
                                                <th class="text-center opacity-70">Room&nbsp;Category</th>
                                                <th class="text-center opacity-70">Room</th>
                                                <th class="text-center opacity-70">
                                                    <table  class="mx-auto">
                                                        <thead>
                                                            <tr  class="!bg-[#64748b] !text-white !p-0">
                                                                 <th style="width: 20px">NOP</th>
                                                                <th style="width: 60px" class="text-center opacity-70">Guest</th>
                                                                <th style="width: 60px" class="text-center opacity-70">phone&nbsp;number</th>
                                                            </tr>
                                                        </thead>
                                                    </table>
                                                </th>
                                                <th class="text-center opacity-70">rate</th>
                                                <th class="text-center opacity-70">discount</th>
                                                <th class="text-center pamount opacity-70">plan</th>
                                                <th class="text-center pamount opacity-70">plan discount</th>
                                                <th class="text-center opacity-70">total</th>
                                            </tr>
                                        </thead>
                                        <tbody id="roomtabledata">
                                            ${
                                                receiptdata.roomguestrow.map((item, index)=>{
                                                    return ` 
                                                        <tr> 
                                                            <td>${index + 1 }</td> 
                                                            <td>${item.roomdata.roomcategoryname??''}</td>
                                                            <td>${item.roomdata.roomnumber??''}</td>
                                                            <td>
                                                                <table  class="mx-auto">
                                                                        <tbody>
                                                                            ${item.guest1.length>0 ? `<tr>
                                                                                <td class="text-center opacity-70">1</td>
                                                                                <td id="rcheckindate" class="text-center opacity-70">${item.guest1[0].firstname??''}&nbsp;${item.guest1[0].lastname??''}&nbsp;${item.guest1[0].othernames??''}</td>
                                                                                <td id="rcheckindate" class="text-center opacity-70">${item.guest1[0].phone??''}</td>
                                                                            </tr>` : ''}
                                                                            ${item.guest2.length>0 ? `<tr>
                                                                                <td class="text-center opacity-70">2</td>
                                                                                <td id="rcheckindate" class="text-center opacity-70">${item.guest2[0].firstname??''}&nbsp;${item.guest2[0].lastname??''}&nbsp;${item.guest2[0].othernames??''}</td>
                                                                                <td id="rcheckindate" class="text-center opacity-70">${item.guest2[0].phone??''}</td>
                                                                            </tr>` : ''}
                                                                            ${item.guest3.length>0 ? `<tr>
                                                                                <td class="text-center opacity-70">3</td>
                                                                                <td id="rcheckindate" class="text-center opacity-70">${item.guest3[0].firstname??''}&nbsp;${item.guest3[0].lastname??''}&nbsp;${item.guest3[0].othernames??''}</td>
                                                                                <td id="rcheckindate" class="text-center opacity-70">${item.guest3[0].phone??''}</td>
                                                                            </tr>` : ''}
                                                                            ${item.guest4.length>0 ? `<tr>
                                                                                <td class="text-center opacity-70">4</td>
                                                                                <td id="rcheckindate" class="text-center opacity-70">${item.guest4[0].firstname??''}&nbsp;${item.guest4[0].lastname??''}&nbsp;${item.guest4[0].othernames??''}</td>
                                                                                <td id="rcheckindate" class="text-center opacity-70">${item.guest4[0].phone??''}</td>
                                                                            </tr>` : ''}
                                                                        </tbody>
                                                                    </table>
                                                            </td>
                                                            <td>${formatNumber((item.roomdata.roomrate??0)*Number(receiptdata.reservations.numberofnights))}</td> 
                                                            <td>${formatNumber((item.roomdata.discountamount??0)*Number(receiptdata.reservations.numberofnights))}</td> 
                                                            <td class="pamount">${item.roomdata.plan??''}</td>
                                                            <td class="pamount">${formatNumber((item.roomdata.plandiscountamount??0)*Number(receiptdata.reservations.numberofnights))}</td>
                                                            <td>
                                                              ${formatNumber(
                                                                (Number(item.roomdata.roomrate ?? 0) * Number(receiptdata.reservations.numberofnights)) - 
                                                                (Number(item.roomdata.discountamount ?? 0) * Number(receiptdata.reservations.numberofnights))
                                                              )}
                                                            </td>
                                                        </tr> `
                                                }).join('')
                                            }
                                        </tbody>
                                    </table>
                                </div>
                                
                               
                        
  <!--                      		<div class="flex -mx-1 border-b py-2 items-start">-->
  <!--                      			<div class="w-10 px-1">-->
  <!--                      				<p class="text-gray-800 uppercase tracking-wide text-sm font-bold">S/N</p>-->
  <!--                      			</div>-->
  <!--                      			<div class="w-150 px-1">-->
  <!--                      				<p class="text-gray-800 uppercase tracking-wide text-sm font-bold">Check-in Date</p>-->
  <!--                      			</div>-->
                        
  <!--                      			<div class="px-1 w-40 text-right">-->
  <!--                      				<p class="text-gray-800 uppercase tracking-wide text-sm font-bold">room no.</p>-->
  <!--                      			</div>-->
  <!--                      			<div class="px-1 w-40 text-right">-->
  <!--                      				<p class="text-gray-800 uppercase tracking-wide text-sm font-bold">no. of night</p>-->
  <!--                      			</div>-->
                        
  <!--                      			<div class="px-1 flex-1 text-right">-->
  <!--                      				<p class="leading-none">-->
  <!--                      					<span class="block uppercase tracking-wide text-sm font-bold text-gray-800">debit</span>-->
                        					<!--<span class="font-medium text-xs text-gray-500">(Incl. GST)</span>-->
  <!--                      				</p>-->
  <!--                      			</div>-->
                        
  <!--                      			<div class="px-1 flex-1 text-right">-->
  <!--                      				<p class="leading-none">-->
  <!--                      					<span class="block uppercase tracking-wide text-sm font-bold text-gray-800">Credit</span>-->
                        					<!--<span class="font-medium text-xs text-gray-500">(Incl. GST)</span>-->
  <!--                      				</p>-->
  <!--                      			</div>-->
  <!--                      			<div class="px-1 flex-1 text-right">-->
  <!--                      				<p class="leading-none">-->
  <!--                      					<span class="block uppercase tracking-wide text-sm font-bold text-gray-800">balance</span>-->
                        					<!--<span class="font-medium text-xs text-gray-500">(Incl. GST)</span>-->
  <!--                      				</p>-->
  <!--                      			</div>-->
  <!--</div>-->
                        
                        		
                        			<div class="flex hidden -mx-1 py-2 border-b">
                        				<div class="w-10 px-1">
                        					<p class="text-gray-800" >1</p>
                        				</div>
                        				<div class="w-150 px-1">
                        					<p id="rcheckindate" class="text-gray-800"></p>
                        				</div>
                        
                        				<div class="px-1 w-40 text-right">
                        					<p id="rrroomnumber" class="text-gray-800"></p>
                        				</div>
                        
                        				<div class="px-1 w-40 text-right">
                        					<p id="rnumberofnights" class="text-gray-800"></p>
                        				</div>
                        
                        				<div class="flex-1 px-1 text-right">
                        					<p id="rdebit" class="text-gray-800"></p>
                        				</div>
                        
                        				<div class="flex-1 px-1 text-right">
                        					<p id="rcredit" class="text-gray-800"></p>
                        				</div>
                        				
                        				<div class="flex-1 px-1 text-right">
                        					<p id="rbalance" class="text-gray-800"></p>
                        				</div>
                        			</div>
                        
                        		<div class="py-2 ml-auto mt-5 w-full sm:w-2/4 lg:w-1/4">
                        			<div class="flex justify-between mb-3 hidden">
                        				<div class="text-gray-800 text-right flex-1">Total&nbsp;Balance</div>
                        				<div class="text-right w-40">
                        					<div id="rtotalbalance" class="text-gray-800 font-medium"></div>
                        				</div>
                        			</div>
                        			<div class="flex justify-between mb-4 hidden">
                        				<div class="text-sm text-gray-600 text-right flex-1">VAT</div>
                        				<div class="text-right w-40">
                        					<div id="" class="text-sm text-gray-600" >0.00</div>
                        				</div>
                        			</div>
                        		
                        			<div class="py-2 border-t border-b">
                        				<div class="flex justify-between">
                        					<div class="text-xl text-gray-600 text-right flex-1">Total&nbsp;Amount</div>
                        					<div class="text-right w-40">
                        						<div id="rtotalpaid" class="text-xl text-gray-800 font-bold">${formatNumber(Number(receiptdata.reservations.totalamount))}</div>
                        					</div>
                        				</div>
                        			</div>
                                </div>
                        
                        		<div class="py-10 text-center">
                        			<p class="text-gray-600"><a class="text-blue-600 hover:text-blue-500 border-b-2 border-blue-200 hover:border-blue-300" href="">Thanks for your Patronage</a>.</p>
                                </div>
                        
                        		
                        
                        
                        
                        	</div>
    `
    
      // the first parameter is what changes the name of the firm in the design big is to know which element to use in the index designname function
    runcompanyname('hemsnamebig', 'big')
    did('modalreceipt').classList.remove('hidden')
}

function getRoomNo(str) {
  const match = str.match(/RM:\s*(\d+)/); // Regular expression to find 'RM: <number>'
  return match ? match[1] : null; // Return the captured room number or null if not found
}


async function onendofdayreportTableDataSignal() {
    let rows = getSignaledDatasource().map((item, index) => `
   <tr>
    <td>${index + 1 }</td> 
    <td>
        <div class="w-full h-full flex items-center justify-center gap-4">
            <button title="View Reservation" onclick="${item.salespoint == 'Booking/Reservation' ? `openendofdayreceipt('${item.reservationref}')` : `modalendofdayreport('${item.reservationref}', '${item.description}')"`}" class="material-symbols-outlined ${item.salespoint == 'Booking/Reservation' ? '':'hidden'}  rounded-full bg-gray-100 h-8 w-8 text-green-400 drop-shadow-md text-xs" style="font-size: 18px;">visibility</button>
            <button title="View Room transactions" onclick="${item.salespoint == 'Booking/Reservation' ? `modalendofdayreport('${item.ref.replace('|', '-')}', getRoomNo('${item.description}'), '${item.reservationref}')` : `modalendofdayreport('${item.reservationref}', '${item.description}')"`}" class="hiddn material-symbols-outlined ${item.salespoint == 'Booking/Reservation' ? '':'hidden'}  rounded-full text-white h-8 w-8 bg-green-400 drop-shadow-md text-xs" style="font-size: 18px;">visibility</button>
            <button title="Print sales" onclick="printsalesreceipt('${item.reservationref}',  getRoomNo('${item.description}'))" class="hidden material-symbols-outlined rounded-full bg-primary-g h-8 w-8 text-white drop-shadow-md text-xs ${item.salespoint == 'Booking/Reservation' ? '':'hidden'} " style="font-size: 18px;">print</button>
            <button title="View Sale" onclick="${item.salespoint != 'Booking/Reservation' ? `modalendofdayreport('${item.ref}')` : `modalendofdayreport('${item.ref}')`}" class="material-symbols-outlined ${item.salespoint != 'Booking/Reservation' ? '':'hidden'}  rounded-full bg-gray-100 h-8 w-8 text-green-400 drop-shadow-md text-xs" style="font-size: 18px;">visibility</button>
            <button title="Print sales" onclick="printsalesreceipt('${item.ref}')" class="hidden material-symbols-outlined rounded-full bg-primary-g h-8 w-8 text-white drop-shadow-md text-xs ${item.salespoint != 'Booking/Reservation' ? '':'hidden'} " style="font-size: 18px;">print</button>
        </div>
    </td> 
    <td>${item.user ?? ''}</td> <!-- User -->
    <td>${formatDate(item.date ?? '')}</td> <!-- Date -->
    <td>${item.salespoint ?? ''}</td> <!-- Salespoint -->
    <td>${item.paymentmethod ?? ''}</td> <!-- Payment Method -->
    <td>${item.description.replace('|', '') ?? ''}</td> <!-- Description -->
    <td>${formatNumber(item.amount ?? '')}</td> <!-- Amount -->
    <td class="pamount">${formatNumber(item.planamount ?? '')}</td> <!-- Plan Amount -->
    <td>${formatNumber(item.consumption ?? '')}</td> <!-- Consumption -->
    <td>${formatNumber(item.VAT ?? '')}</td> <!-- VAT -->
    <td>${formatNumber(item.servicecharge ?? '')}</td> <!-- Service Charge -->
    <td>${formatNumber(item.agencycommission ?? '')}</td> <!-- Agency Commission -->
    <td>${formatNumber(item.total ?? '')}</td> <!-- Total -->
    <td>${formatNumber(item.amountrec ?? '')}</td> <!-- Amount Rec -->
    <td>${formatNumber(item.balancedue ?? '')}</td> <!-- Balance Due -->
    <td>${item.otherlogs ?? ''}</td> <!-- Other Logs -->
</tr>

`
    )
    .join('')
    injectPaginatatedTable(rows)
}

async function modalendofdayreport(ref, room='', rmref=''){
    let rm = false
    if(room)rm = true
    if(!ref)return
    function getparamm() {
        let paramstr = new FormData();
        if(!room)paramstr.append('reference', ref);
        if(room)paramstr.append('roomnumber', room);
        if(room)paramstr.append('startdate', did('cdate').value);
        return paramstr;
    }
    let request = await httpRequest2(`../controllers/${!room ? 'fetchsalesdetailbyref' : 'fetchroomtransactionhistory'}`, getparamm(), null, 'json');
    let data1 
    if(!rm)data1 = await getendofdayreservation2(ref)
    if(rm)data1 = datasource.filter(dat=>dat.reservationref == rmref)[0]
    console.log('data1', data1)
    if(request.status){
    let data = request.data
    if(!rm){
            did('tableheader').innerHTML = `
               <th>s/n </th>
                <th> Item ID </th>
                <th> Item Name </th>
                <th> qty </th>
                <th> PRICE </th>
                <th> TOTAL </th>
            `;
            did('modaldetails').innerHTML = `
                <p class="!text-sm font-thin"><img src="../images/${did('your_companylogo').value}" class="w-[100px] h-[100px]"></p>
                <div class="col-span-2">
                    <p class="!text-sm font-semibold flex w-full justify-between">Description: <span class="uppercase !text-sm font-normal text-left" style="">${data1.description}</span></p>
                    <p class="!text-sm font-semibold flex w-full justify-between">Total Amount: <span class="uppercase !text-sm font-normal text-left" style="">${formatNumber(data1.totalamount)}</span></p>
                    <p class="!text-sm font-semibold flex w-full justify-between">Amount Paid: <span class="uppercase !text-sm font-normal text-left" style="">${formatNumber(data1.amountpaid)}</span></p>
                    <p class="!text-sm font-semibold flex w-full justify-between">Ref: <span class="uppercase !text-sm font-normal text-left" style="">${data1.reference}</span></p>
                    <p class="!text-sm font-semibold flex w-full justify-between">Payment Method: <span class="uppercase !text-sm font-normal text-left" style="">${data1.paymentmethod}</span></p>
                    <p class="!text-sm font-semibold flex w-full justify-between">T. Date: <span class="uppercase !text-sm font-normal text-left" style="">${specialformatDateTime(data1.transactiondate)}</span></p>
                    <div class="w-[150px] py-2 flex justify-center mx-8 bg-white p-5 rounded mt-2 bg-blue-400 hidden">
                        <span onclick="printDomContent('SALES REPORT', 'displaydetails')" class="cp material-symbols-outlined group-hover:text-primary-g scale-[1.5] text-white" style="font-size: 20px;">print</span>
                    </div>
                </div>
            `;
                
             did('tabledata2').innerHTML = 'No Items set for this composite item';
             if(data.length > 0 && data1.ttype != 'ROOMS')did('tabledata2').innerHTML = data.map((dat, i)=>`
                    <tr>
                        <td>${i+1}</td>
                        <td>${dat.itemid}</td>
                        <td>${dat.itemname}</td>
                        <td style="width: 20px">${formatNumber(dat.qty)}</td>
                        <td style="width: 20px">${formatNumber(dat.cost)}</td>
                        <td style="width: 20px">${formatNumber(Number(dat.qty)*Number(dat.cost))}</td>
                    </tr>
             `).join('');
             if(data.length > 0 && data1.ttype != 'ROOMS')did('tabledata2').innerHTML += `
                    <tr>
                        <td>TOTAL</td>
                        <td></td>
                        <td></td>
                        <td style="width: 20px">${formatNumber(data.reduce((sum, item)=>sum+Number(item.qty), 0))}</td>
                      <td style="width: 20px">${formatNumber(data.reduce((sum, item)=>sum+Number(item.cost), 0))}</td>
                      <td style="width: 20px">${formatNumber(data.reduce((sum, item)=>sum+(Number(item.cost)*Number(item.qty)), 0))}</td>
                    </tr>
             `
    }
    
    if(rm){
        did('tableheader').innerHTML = `
            <th style="width: 20px">s/n</th> 
            <th>date</th>
            <th>Ref</th>
            <th>item</th>
            <th>debit</th>
            <th>credit</th>
            <th>balance</th>
        `;
        did('modaldetails').innerHTML = `
                <div>
                <p class="!text-sm font-thin"><img src="../images/${did('your_companylogo').value}" class="w-[100px] h-[100px]"></p>
                </div>
                <div class="col-span-2">
                    <p class="!text-sm font-semibold flex w-full justify-between">Description: <span class="uppercase !text-sm font-normal text-left" style="">${data1.description}</span></p>
                    <p class="!text-sm font-semibold flex w-full justify-between">T. Date: <span class="uppercase !text-sm font-normal text-left" style="">${specialformatDateTime(data1.date)}</span></p>
                    ${data1.ownerid < 0 ? '' : `<p class="!text-sm font-semibold flex w-full justify-between">Room / CC: <span class="uppercase !text-sm font-normal text-left" style="">${request.data.transactions[0].ownerid}</span></p>`}
                </div>
            `;
            let tt = 0
        did('tabledata2').innerHTML = request.data.transactions.map((item, index)=>{
            tt=tt+(Number(item.debit)-Number(item.credit))
            // S/N	ITEM	DEBIT	CREDIT	BALANCE
            if(index == 0 )return`
                <tr>
                    <td colspan="6"><p class="text-bold text-md">Balance Brought Forward:</p></td>
                    <td><p class="text-bold text-xl">${formatNumber(request.data.balance)}</p></td>
                </tr>
                 <tr>
                    <td>${index + 1 }</td>
                    <td>${specialformatDateTime(item.transactiondate)}</td>
                    <td>${item.marketer}</td>
                    <td>${item.description}</td>
                    <td>${formatNumber(item.debit, 0)}</td>
                    <td>${formatNumber(item.credit, 0)}</td>
                    <td>${formatNumber(tt, 0)}</td>
                </tr>
            `
            return `
                <tr>
                    <td>${index + 1 }</td>
                    <td>${specialformatDateTime(item.transactiondate)}</td>
                    <td>${item.marketer}</td>
                    <td>${item.description}</td>
                    <td>${formatNumber(item.debit, 0)}</td>
                    <td>${formatNumber(item.credit, 0)}</td>
                    <td>${formatNumber(tt, 0)}</td>
                </tr>
            `
        }).join('')
        did('tabledata2').innerHTML += `
                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td class="text-bold">Total:</td>
                    <td>${formatNumber(tt)}</td>
                </tr>
            `
    }
    
     did('receiptsalesmodal').classList.add('hidden')
     did('endofdayreportmodal').classList.remove('hidden')
    }else{
        return notification(request.message, 0)
    }
}

async function printsalesreceipt(ref, room=''){
    let rm = false
    if(room)rm = true
    if(!ref)return
    let tt = 0;
    let html = '';
    if(rm){
        function getparamm() {
            let paramstr = new FormData();
            if(!room)paramstr.append('reference', ref);
            if(room)paramstr.append('roomnumber', room);
            if(room)paramstr.append('startdate', did('cdate').value);
            return paramstr;
        }
        let request = await httpRequest2(`../controllers/${!room ? 'fetchsalesdetailbyref' : 'fetchroomtransactionhistory'}`, getparamm(), null, 'json');
        if(request.status){
           html =  request.data.transactions.map((item, index)=>{
                                                            tt=tt+(Number(item.debit)-Number(item.credit))
                                                            // S/N	ITEM	DEBIT	CREDIT	BALANCE
                                                            if(index == 0 )return`
                                                                <tr>
                                                                    <td colspan="3"><p class="text-bold text-md">Balance Brought Forward:</p></td>
                                                                    <td><p class="text-bold text-xl">${formatNumber(request.data.balance)}</p></td>
                                                                </tr>
                                                            `
                                                            return `
                                                                <tr>
                                                                    <td class="!text-xs">${item.description}</td>
                                                                    <td class="!text-xs">${formatNumber(item.debit, 0)}</td>
                                                                    <td class="!text-xs">${formatNumber(item.credit, 0)}</td>
                                                                    <td class="!text-xs">${formatNumber(tt, 0)}</td>
                                                                </tr>
                                                            `
                                                        }).join('')
          html += `
                    <tr>
                        <td></td>
                        <td></td>
                        <td class="text-bold">Total:</td>
                        <td>${formatNumber(tt)}</td>
                    </tr>
                `
        }
    }
        let data = datasource.filter(dat=>dat.reference == ref)[0]
        did('displaydetails').innerHTML = `<img src="../images/${did('your_companylogo').value}" alt="chippz" style="width: 70px" class="mx-auto w-16 py-4" />
                                    <div class="flex flex-col justify-center items-center gap-2">
                                        <h4 class="font-semibold">${did('your_companyname').value}</h4>
                                        <p class="text-xs">${did('your_companyaddress').value}</p>
                                    </div>
                                    <div class="flex flex-col gap-3 border-b py-6 text-xs">
                                      <p class="flex justify-between">
                                        <span class="text-gray-400">Receipt No.:</span>
                                        <span>${data.reference}</span>
                                      </p>
                                      ${data.ownerid < 0 ? '' : `<p class="flex justify-between">
                                        <span clas="text-gray-400">Room / CC::</span>
                                        <span>${data.ownerid}</span>
                                      </p>`}
                                      <p class="flex justify-between">
                                        <span class="text-gray-400">Total Amount:</span>
                                        <span>${formatNumber(data.totalamount)}</span>
                                      </p>
                                      <p class="flex justify-between">
                                        <span class="text-gray-400">Amount Paid:</span>
                                        <span>${formatNumber(data.amountreceived)}</span>
                                      </p>
                                      <p class="flex justify-between">
                                        <span class="text-gray-400">Payment Method:</span>
                                        <span>${data.paymentmethod}</span>
                                      </p>
                                      <p class="flex justify-between">
                                        <span class="text-gray-400">T. Date:</span>
                                        <span>${specialformatDateTime(data.transactiondate)}</span>
                                      </p>
                                    </div>
                                    <div class="flex flex-col gap-3 pb-6 pt-2 text-xs w-full">
                                      <table class="w-full text-left">
                                        <thead>
                                          ${!rm ? `<tr>
                                            <th class="min-w-[14px] py-2">s/n</th>
                                            <th class="min-w-[64px] py-2">Product</th>
                                            <th class="min-w-[14px] py-2">QTY</th>
                                            <th class="min-w-[44px] py-2">Price</th>
                                            <th class="min-w-[44px] py-2">Total</th>
                                          </tr>` : `<tr>
                                                <th>item</th>
                                                <th>debit</th>
                                                <th>credit</th>
                                                <th>balance</th>
                                          </tr>`}
                                        </thead>
                                        <tbody>
                                            ${!rm && data.saledetail.length > 0 && data.ttype != 'ROOMS' 
                                              ? data.saledetail.map((dat, i) => `
                                                  <tr>
                                                      <td class="min-w-[44px] py-2">${i+1}</td>
                                                      <td class="min-w-[44px] py-2">${dat.itemname}</td>
                                                      <td class="min-w-[44px] py-2">${formatNumber(dat.qty)}</td>
                                                      <td class="min-w-[44px] py-2">${formatNumber(dat.cost)}</td>
                                                      <td class="min-w-[44px] py-2">${formatNumber(Number(dat.qty) * Number(dat.cost))}</td>
                                                  </tr>
                                                `).join('') 
                                              : ''}
                                            
                                            ${!rm && data.saledetail.length > 0 && data.ttype != 'ROOMS'
                                              ? `
                                                  <tr>
                                                      <td></td>
                                                      <td>TOTAL</td>
                                                      <td style="width: 20px">${formatNumber(data.saledetail.reduce((sum, item)=>sum+Number(item.qty), 0))}</td>
                                                      <td style="width: 20px">${formatNumber(data.saledetail.reduce((sum, item)=>sum+Number(item.cost), 0))}</td>
                                                      <td style="width: 20px">${formatNumber(data.saledetail.reduce((sum, item)=>sum+(Number(item.cost)*Number(item.qty)), 0))}</td>
                                                  </tr>
                                                `
                                              : ''}
                                              
                                              ${
                                                  rm ? `${
                                                    html
                                                  }` : ''
                                              }

                                        </tbody>
                                      </table>
                                      <div class=" border-b border border-dashed"></div>
                                      <div class="py-4 justify-center items-center flex flex-col gap-2">
                                        <p class="flex gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M21.3 12.23h-3.48c-.98 0-1.85.54-2.29 1.42l-.84 1.66c-.2.4-.6.65-1.04.65h-3.28c-.31 0-.75-.07-1.04-.65l-.84-1.65a2.567 2.567 0 0 0-2.29-1.42H2.7c-.39 0-.7.31-.7.7v3.26C2 19.83 4.18 22 7.82 22h8.38c3.43 0 5.54-1.88 5.8-5.22v-3.85c0-.38-.31-.7-.7-.7ZM12.75 2c0-.41-.34-.75-.75-.75s-.75.34-.75.75v2h1.5V2Z" fill="#000"></path><path d="M22 9.81v1.04a2.06 2.06 0 0 0-.7-.12h-3.48c-1.55 0-2.94.86-3.63 2.24l-.75 1.48h-2.86l-.75-1.47a4.026 4.026 0 0 0-3.63-2.25H2.7c-.24 0-.48.04-.7.12V9.81C2 6.17 4.17 4 7.81 4h3.44v3.19l-.72-.72a.754.754 0 0 0-1.06 0c-.29.29-.29.77 0 1.06l2 2c.01.01.02.01.02.02a.753.753 0 0 0 .51.2c.1 0 .19-.02.28-.06.09-.03.18-.09.25-.16l2-2c.29-.29.29-.77 0-1.06a.754.754 0 0 0-1.06 0l-.72.72V4h3.44C19.83 4 22 6.17 22 9.81Z" fill="#000"></path></svg>${did('your_companyemail').value}</p>
                                        <p class="flex gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"><path fill="#000" d="M11.05 14.95L9.2 16.8c-.39.39-1.01.39-1.41.01-.11-.11-.22-.21-.33-.32a28.414 28.414 0 01-2.79-3.27c-.82-1.14-1.48-2.28-1.96-3.41C2.24 8.67 2 7.58 2 6.54c0-.68.12-1.33.36-1.93.24-.61.62-1.17 1.15-1.67C4.15 2.31 4.85 2 5.59 2c.28 0 .56.06.81.18.26.12.49.3.67.56l2.32 3.27c.18.25.31.48.4.7.09.21.14.42.14.61 0 .24-.07.48-.21.71-.13.23-.32.47-.56.71l-.76.79c-.11.11-.16.24-.16.4 0 .08.01.15.03.23.03.08.06.14.08.2.18.33.49.76.93 1.28.45.52.93 1.05 1.45 1.58.1.1.21.2.31.3.4.39.41 1.03.01 1.43zM21.97 18.33a2.54 2.54 0 01-.25 1.09c-.17.36-.39.7-.68 1.02-.49.54-1.03.93-1.64 1.18-.01 0-.02.01-.03.01-.59.24-1.23.37-1.92.37-1.02 0-2.11-.24-3.26-.73s-2.3-1.15-3.44-1.98c-.39-.29-.78-.58-1.15-.89l3.27-3.27c.28.21.53.37.74.48.05.02.11.05.18.08.08.03.16.04.25.04.17 0 .3-.06.41-.17l.76-.75c.25-.25.49-.44.72-.56.23-.14.46-.21.71-.21.19 0 .39.04.61.13.22.09.45.22.7.39l3.31 2.35c.26.18.44.39.55.64.1.25.16.5.16.78z"></path></svg>${did('your_companyphone').value}</p>
                                      </div>
                                    </div>`
        did('endofdayreportmodal').classList.add('hidden')
        did('receiptsalesmodal').classList.remove('hidden')
    // }else{
        
    // }
}

async function endofdayreportFormSubmitHandler() {
    if(!validateForm('endofdayreportform', [`productname`, `productdescription`])) return
    
    let payload

    payload = getFormData2(document.querySelector('#endofdayreportform'), endofdayreportid ? [['id', endofdayreportid]] : null)
    let request = await httpRequest2('../controllers/endofdayreportcript', payload, document.querySelector('#endofdayreportform #submit'))
    if(request.status) {
        notification('Success!', 1);
        document.querySelector('#endofdayreportform').reset();
        fetchendofdayreport();
        return
    }
    document.querySelector('#endofdayreportform').reset();
    fetchendofdayreport();
    return notification(request.message, 0);
}


// function runAdendofdayreportFormValidations() {
//     let form = document.getElementById('endofdayreportform')
//     let errorElements = form.querySelectorAll('.control-error')
//     let controls = []

//     if(controlHasValue(form, '#owner'))  controls.push([form.querySelector('#owner'), 'Select an owner'])
//     if(controlHasValue(form, '#endofdayreportname'))  controls.push([form.querySelector('#endofdayreportname'), 'endofdayreport name is required'])
//     if(controlHasValue(form, '#statusme'))  controls.push([form.querySelector('#itemname'), 'item name is required'])
//     if(controlHasValue(form, '#urlge'))  controls.push([form.querySelector('#image'), 'image is required'])
//     if(controlHasValue(form, '#urlition'))  controls.push([form.querySelector('#position'), 'position is required'])
//     if(controlHasValue(form, '#url'))  controls.push([form.querySelector('#url'), 'url is required'])
//     parentidurl
//     return mapValidationErrors(errorElements, controls)   

// }