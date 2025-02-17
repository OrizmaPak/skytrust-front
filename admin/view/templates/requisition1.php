       <section class="animate__animated animate__fadeIn">
                            <p class="page-title">
                                <span>REQUISITION</span>
                            </p>
                            <div id="requisitionform">
                                <div class="flex flex-col space-y-3 bg-white/90 p-5 xl:p-10 rounded-sm">
                                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 my-5">
                                        <div class="form-group">
                                            <label for="logoname" class="control-label">Source</label>
                                            <select name="locationfrom" id="salespointname" class="form-control comp !text-black !bg-white">
                                                    <option value="">Loading...</option>
                                                </select>
                                        </div>
                                        <div class="form-group">
                                            <label for="logoname" class="control-label">Destination</label>
                                            <select name="locationto" id="salespointname1" class="form-control comp !text-black !bg-white">
                                                    <option value="">Loading...</option>
                                                </select> 
                                        </div>
                                    </div>
                                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 ">
                                        <div class="form-group">
                                            <label for="logoname" class="control-label">Document No / Description (optional)</label>
                                            <input type="text" name="description" id="description" class="form-control comp" placeholder="Enter Description">
                                        </div> 
                                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 ">
                                        <div class="form-group">
                                            <label for="logoname" class="control-label">Date</label>
                                            <input type="date" name="transactiondate" id="transactiondate" class="form-control comp" placeholder="Enter Address">
                                        </div>
                                        <div class="form-group">
                                            <label for="logoname" class="control-label">Reference</label>
                                            <input type="text" readonly name="reference" id="reference" class="form-control" placeholder="Enter Description">
                                        </div>
                                        </div>
                                    </div>
                                    <!--<hr class="my-10">-->
                            
                             <div >
                                <div class="table-content mt-5">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th style="width:300px">Item</th>
                                                <th style="width:150px">Item Info</th>
                                                <th>Unit cost</th>
                                                <th>quantity</th>
                                                <th>value</th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody id="tabledata" class="">
                                            Loading...
                                           <!--<tr id="reqrow_0">-->
                                           <!--     <td class="text-center opacity-70"> -->
                                           <!--     <label class="hidden">Item</label>-->
                                           <!--         <select name="supplyfrom" id="supplyfrom_0" class="form-control comp">-->
                                           <!--             <option value=''>-- Select item --</option>-->
                                           <!--         </select>-->
                                           <!--     </td>-->
                                           <!--     <td>-->
                                           <!--         <p>Type: <span id="type_0"></span></p>-->
                                           <!--         <p>Group: <span id="group_0"></span></p>-->
                                           <!--         <p>Stock Balance: <span id="class_0"></span></p>-->
                                           <!--     </td>-->
                                           <!--     <td> -->
                                           <!--         <label class="hidden">Cost</label>-->
                                           <!--         <input onchange="requisitioncal2(this)" type="number" id="cost_0" name="cost" class="form-control comp" placeholder="Enter Cost">-->
                                           <!--     </td>-->
                                           <!--     <td>-->
                                           <!--         <label class="hidden">Quantity</label>-->
                                           <!--         <input onchange="requisitioncal2(this)" type="number" id="qty_0" name="qty" class="form-control comp" placeholder="Enter Quantity">-->
                                           <!--     </td>-->
                                           <!--     <td>-->
                                           <!--         <label class="hidden">Value</label>-->
                                           <!--         <input readonly type="text" id="val_0" name="value[]" class="form-control comp" placeholder="">-->
                                           <!--     </td>-->
                                           <!--     <td>-->
                                           <!--         <div class="flex gap-4 items-center h-full w-fit py-3">-->
                                           <!--             <button onclick="reqaddrowrequisition()" title="Edit row entry" class="material-symbols-outlined rounded-full bg-primary-g h-8 w-8 text-white drop-shadow-md text-xs" style="font-size: 18px;">add</button>-->
                                                        <!--<button onclick="reqaddrow()" title="Edit row entry" class="material-symbols-outlined rounded-full bg-[red] h-8 w-8 text-white drop-shadow-md text-xs" style="font-size: 18px;">delete</button>-->
                                           <!--         </div>-->
                                           <!--     </td>-->
                                           <!-- </tr>-->
                                        </tbody>
                                    </table>
                                </div>
                                <div class="table-status"></div>
                            </div>
                                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        
                                        <div></div>
                                        <div></div>
                                        
                                        <div class="flex justify-end mt-5">
                                             <button id="submit" type="button" class="w-full md:w-max rounded-md text-white text-sm capitalize bg-gradient-to-tr from-blue-400 via-blue-500 to-primary-g px-8 py-3 lg:py-2 shadow-md font-medium hover:opacity-75 transition duration-300 ease-in-out flex items-center justify-center gap-3">
                                                <div class="btnloader" style="display: none;"></div>
                                                <span>Send For Approval</span>
                                            </button>
                                        </div>
                                        
                                    </div> 
                        
                                </div>
                            </div>
                            
                        
                        </section>  